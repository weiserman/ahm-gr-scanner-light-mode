/**
 * odata.js — SAP S/4HANA OData v4 Transport Layer
 *
 * All outbound SAP requests are routed through the AHM native proxy broker
 * at /api/net/request to bypass browser CORS restrictions. This module handles:
 *   - HTTP Basic Authentication header injection
 *   - X-CSRF-Token fetch / cache / refresh lifecycle
 *   - $format=json query parameter enforcement
 *   - Session cookie persistence across broker calls
 *   - Automatic single-retry on HTTP 403 (expired CSRF token)
 */

import { store } from './store.js';

// ---------------------------------------------------------------------------
// Module-scoped state
// ---------------------------------------------------------------------------

/** In-memory cache for the current X-CSRF-Token. Null until first handshake. */
let cachedCsrfToken = null;

/**
 * Accumulates Set-Cookie values returned by SAP through the broker.
 * The broker bypasses the browser cookie jar, so we manually capture and
 * replay these cookies on subsequent requests to maintain session affinity.
 */
let stableSessionCookies = "";

/** Local AHM native proxy endpoint — all SAP traffic is POSTed here as a JSON envelope. */
const BROKER_URL = "/api/net/request";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Derives the SAP Gateway service-root URL from a full request path.
 * Strips trailing path segments to find the common origin + base path,
 * which is the correct endpoint for the CSRF token handshake.
 *
 * Example:
 *   "https://host/sap/opu/odata4/sap/ZSRV/0001/SomeEntity"
 *   → "https://host/sap/opu/odata4/sap/ZSRV/"
 */
const getCsrfUrl = (str, u = new URL(str)) =>
  `${u.origin}${u.pathname.slice(0, u.pathname.lastIndexOf('/', u.pathname.length - 2) + 1)}`;

/**
 * Wraps an outbound HTTP request into the JSON envelope expected by the
 * AHM native proxy broker, dispatches it, and normalizes the broker's
 * response into a mock Response-like object.
 *
 * The broker performs the actual HTTP call server-side (no CORS), then
 * returns { status, headers, body } which we reshape for transparent
 * consumption by the rest of the OData layer.
 *
 * Side-effect: captures any Set-Cookie headers from the response into
 *              stableSessionCookies for replay on future requests.
 *
 * @param {string}   absoluteUrl   Fully-qualified SAP endpoint URL
 * @param {object}   configOptions Fetch-like config { method, headers (Headers instance), body }
 * @returns {Promise<object>}      Mock Response with .ok, .status, .json(), .text(), .headers.get()
 */
async function executeBrokerRequest(absoluteUrl, configOptions) {
  // Build a plain-object header map from the Headers instance,
  // extracting only the headers the broker needs to forward.
  const normalizedHeaders = {
    "Accept": configOptions.headers.get('Accept') || "application/json"
  };

  if (configOptions.headers.has('Authorization')) {
    normalizedHeaders["Authorization"] = configOptions.headers.get('Authorization');
  }
  if (configOptions.headers.has('X-CSRF-Token')) {
    normalizedHeaders["X-CSRF-Token"] = configOptions.headers.get('X-CSRF-Token');
  }
  if (configOptions.headers.has('Content-Type')) {
    normalizedHeaders["Content-Type"] = configOptions.headers.get('Content-Type');
  }

  // Replay any SAP session cookies captured from prior responses.
  // Strip cookie attributes (path=/, secure, etc.) — only name=value pairs are needed.
  if (stableSessionCookies) {
    const cleanCookies = stableSessionCookies.split(',')
      .map(c => c.split(';')[0].trim())
      .join('; ');
    normalizedHeaders["Cookie"] = cleanCookies;
  }

  // Assemble the broker JSON envelope
  const envelope = {
    "timeout_ms": store.config.networkTimeoutMs || 15000,
    "request": {
      "url": absoluteUrl,
      "method": (configOptions.method || 'GET').toUpperCase(),
      "headers": normalizedHeaders
    }
  };

  if (configOptions.body) {
    envelope.request.body = typeof configOptions.body === 'string'
      ? configOptions.body
      : JSON.stringify(configOptions.body);
  }

  // Dispatch to the same-origin broker endpoint
  const brokerResponse = await fetch(BROKER_URL, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(envelope)
  });

  if (!brokerResponse.ok) {
    throw new Error(`Local Proxy Broker unavailable: HTTP ${brokerResponse.status}`);
  }

  const resultWrapper = await brokerResponse.json();

  // Normalize response header keys to lowercase for case-insensitive lookup
  if (resultWrapper.headers) {
    const lowerCaseResponseHeaders = {};
    for (const [k, v] of Object.entries(resultWrapper.headers)) {
      lowerCaseResponseHeaders[k.toLowerCase()] = v;
    }
    resultWrapper.headers = lowerCaseResponseHeaders;

    // Persist Set-Cookie values for session continuity across broker calls
    if (lowerCaseResponseHeaders["set-cookie"]) {
      stableSessionCookies = lowerCaseResponseHeaders["set-cookie"];
    }
  }

  // Return a mock Response object so callers can use .ok, .json(), .text(), etc.
  return {
    status: resultWrapper.status,
    ok: resultWrapper.status >= 200 && resultWrapper.status < 300,
    statusText: resultWrapper.status === 403 ? "Forbidden" : "OK",
    headers: {
      get: (headerName) => resultWrapper.headers ? resultWrapper.headers[headerName.toLowerCase()] : null
    },
    json: async () => JSON.parse(resultWrapper.body),
    text: async () => resultWrapper.body
  };
}

/**
 * Performs a GET handshake against the SAP Gateway service root to obtain
 * a fresh X-CSRF-Token. The token is cached in module-scoped state and
 * reused for all subsequent modifying (POST/PATCH/PUT/DELETE) requests.
 *
 * The handshake URL is derived by stripping the entity-specific path
 * segments via getCsrfUrl(), targeting the service namespace root.
 *
 * @param {string} absoluteBaseUrl  A full SAP OData URL (used to derive the service root)
 * @returns {Promise<string|null>}  The CSRF token string, or null on failure
 */
async function fetchSAPCsrfToken(absoluteBaseUrl) {
  console.log('[SAP CSRF ENGINE] Handshaking with Gateway via GET to fetch a fresh token...');
  absoluteBaseUrl = getCsrfUrl(absoluteBaseUrl);

  const headers = new Headers();
  headers.set('X-CSRF-Token', 'Fetch');
  headers.set('Accept', 'application/json');

  // Authenticate the handshake request with the same Basic Auth credentials
  if (store.config.username) {
    const encodedCredentials = btoa(`${store.config.username}:${store.config.password || ''}`);
    headers.set('Authorization', `Basic ${encodedCredentials}`);
  }

  try {
    const response = await executeBrokerRequest(absoluteBaseUrl, { method: 'GET', headers });
    const token = response.headers.get('x-csrf-token');

    if (!token) {
      console.warn('[SAP CSRF ENGINE] Handshake succeeded but no X-CSRF-Token header was returned.');
      return null;
    }

    cachedCsrfToken = token;
    console.log('[SAP CSRF ENGINE] Token fetched and cached successfully.');
    return cachedCsrfToken;
  } catch (error) {
    console.error('[SAP CSRF ENGINE] GET handshake for CSRF token failed:', error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Primary OData fetch function. All SAP data access flows through here.
 *
 * Responsibilities:
 *   1. Validates that required config (baseHost, username, password) is present
 *   2. Constructs the absolute URL, appending $format=json where required
 *   3. Sets Accept / Content-Type headers based on endpoint type
 *   4. Injects Basic Auth credentials
 *   5. Lazily fetches and caches a CSRF token for modifying requests
 *   6. Dispatches via the local proxy broker
 *   7. On HTTP 403 for modifying requests: clears the stale token, fetches a
 *      fresh one, and transparently retries the exact same request once
 *
 * @param {string}  endpointPath  OData path relative to the service root (e.g. "/PurchaseOrder")
 * @param {object}  [options]     Fetch-like options: { method, headers, body }
 * @returns {Promise<object|string>}  Parsed JSON for data endpoints, raw XML text for $metadata
 */
export async function odataFetch(endpointPath, options = {}) {
  const { baseHost, username, password, useDummyData } = store.config;

  // Guard: require all connection parameters before attempting any network call
  if (!baseHost) throw new Error('OData Endpoint missing in system settings.');
  if (!username) throw new Error('OData Username missing in system settings.');
  if (!password) throw new Error('OData Password missing in system settings.');

  if (useDummyData) {
    console.warn(`[SW INTERCEPT ACTIVE] Request passing through to worker layer proxy.`);
  }

  // Build absolute URL — normalize trailing slashes and leading slashes
  const cleanBase = baseHost.endsWith('/') ? baseHost.slice(0, -1) : baseHost;
  let cleanPath = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;

  // SAP OData v4 requires explicit $format=json on queries, except for:
  //   - $metadata requests (which return XML)
  //   - Paths already containing $format
  //   - Bound-action namespaces (contain "v0001.") which use their own content negotiation
  if (!cleanPath.includes('$metadata') && !cleanPath.includes('$format') && !cleanPath.includes('v0001.')) {
    const separator = cleanPath.includes('?') ? '&' : '?';
    cleanPath = `${cleanPath}${separator}$format=json`;
  }

  const absoluteUrl = `${cleanBase}${cleanPath}`;
  console.log('[SAP ODATA] Request URL:', absoluteUrl);

  // Set Accept/Content-Type based on endpoint type
  const headers = new Headers(options.headers || {});
  if (cleanPath.includes('$metadata')) {
    // $metadata returns EDMX XML — must accept XML content types
    headers.set('Accept', 'application/xml, text/xml, */*');
  } else {
    headers.set('Accept', 'application/json');
    if (options.method && options.method !== 'GET') {
      headers.set('Content-Type', 'application/json');
    }
  }

  // Inject HTTP Basic Auth credentials on every request
  if (username) {
    const encodedCredentials = btoa(`${username}:${password || ''}`);
    headers.set('Authorization', `Basic ${encodedCredentials}`);
  }

  // CSRF token: required for all state-changing requests (POST, PATCH, PUT, DELETE).
  // Fetch lazily on first use, then cache for the session.
  const isModifyingRequest = options.method && options.method !== 'GET' && options.method !== 'HEAD';

  if (isModifyingRequest && !useDummyData) {
    if (!cachedCsrfToken) {
      await fetchSAPCsrfToken(absoluteUrl);
    }
    if (cachedCsrfToken) {
      headers.set('X-CSRF-Token', cachedCsrfToken);
    }
  }

  let fetchConfig = { ...options, headers };

  try {
    let response = await executeBrokerRequest(absoluteUrl, fetchConfig);

    // 403 on a modifying request likely means the CSRF token expired.
    // Clear the stale token, fetch a fresh one, and retry once transparently.
    if (response.status === 403 && isModifyingRequest && !useDummyData) {
      console.warn('[SAP CSRF ENGINE] HTTP 403 — CSRF token may have expired. Retrying with a fresh token...');
      cachedCsrfToken = null;
      const freshToken = await fetchSAPCsrfToken(absoluteUrl);
      if (freshToken) {
        headers.set('X-CSRF-Token', freshToken);
        fetchConfig.headers = headers;
        response = await executeBrokerRequest(absoluteUrl, fetchConfig);
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText || 'SAP Gateway Error'}`);
    }

    // $metadata returns raw XML text; all other endpoints return parsed JSON
    if (cleanPath.includes('$metadata')) {
      return await response.text();
    }
    return await response.json();
  } catch (error) {
    console.error('[SAP ODATA] Request failed:', error.message);
    throw error;
  }
}

/**
 * Diagnostic connectivity test. Pings the SAP $metadata endpoint and
 * verifies that the response contains an EDMX schema marker.
 *
 * @returns {Promise<{success: boolean, message: string}>}
 * @throws {Error} If the metadata response is invalid or the connection fails
 */
export async function testODataConnection() {
  console.log(`[SAP DIAGNOSTIC] Pinging $metadata endpoint...`);
  const xmlPayload = await odataFetch('/$metadata', { method: 'GET' });
  if (xmlPayload && xmlPayload.includes('Edmx')) {
    return { success: true, message: 'Connected to SAP S/4HANA successfully! Metadata schema loaded.' };
  }
  throw new Error('Invalid metadata format returned from SAP server gateway.');
}
