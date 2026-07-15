---
kind: security_architecture
name: OData Authentication, CSRF Tokens & Broker Proxy Security
category: security_architecture
scope:
    - '**'
source_files:
    - src/util/odata.js
    - src/util/store.js
---

## Overview

All SAP S/4HANA OData v4 communication flows through a single transport module — `src/util/odata.js`. This module implements a three-layer security model: Basic Authentication for identity, X-CSRF-Token handshaking for write-protection, and a local native proxy broker to bypass browser CORS restrictions. Credentials are stored in a client-side reactive store (`src/util/store.js`) and injected at request time.

## Authentication — HTTP Basic Auth

User credentials are configured at runtime via the Config screen and persisted in `store.config` (keys: `username`, `password`). On every outbound request, `odataFetch` constructs a Base64-encoded `Authorization: Basic <b64>` header from `store.config.username` and `store.config.password`. There is no server-side session or cookie-based login — every request carries full credentials. The credentials are validated eagerly: `odataFetch` throws immediately if `baseHost`, `username`, or `password` are missing from the store before any network call is made.

## CSRF Token Lifecycle

SAP Gateway requires a valid X-CSRF-Token on all state-changing (non-GET/HEAD) requests. The token management follows a fetch-on-demand, cache-in-memory pattern:

1. **Lazy Fetch** — The in-memory variable `cachedCsrfToken` starts as `null`. The first modifying request triggers `fetchSAPCsrfToken()`, which issues a GET handshake against the SAP Gateway service root with the header `X-CSRF-Token: Fetch`. The server responds with the token in the `x-csrf-token` response header.

2. **Token Caching** — The returned token is stored in the module-scoped `cachedCsrfToken` variable. All subsequent modifying requests reuse this cached value without additional handshakes, minimizing round-trips.

3. **CSRF URL Derivation** — The handshake URL is derived from the request URL via `getCsrfUrl()`, which strips the path down to the service root (everything up to and including the segment before the last path component), ensuring the token is fetched from the correct SAP service namespace.

4. **Header Injection** — Before dispatch, if the request is modifying and the cache holds a token, `X-CSRF-Token: <value>` is set on the outbound headers.

## 403 Retry Mechanism (Expired Token Recovery)

If a modifying request receives an HTTP 403 response, the system assumes the cached CSRF token has expired or been invalidated by the server:

1. `cachedCsrfToken` is immediately set to `null`, discarding the stale token.
2. `fetchSAPCsrfToken()` is called again to obtain a fresh token via a new GET handshake.
3. If a fresh token is successfully retrieved, it is injected into the request headers.
4. The exact same request (same URL, method, body) is retried transparently — the caller of `odataFetch` is unaware of the retry.
5. If the retry also fails, the error propagates normally to the caller.

This is a single-retry mechanism — there is no infinite retry loop.

## Local Proxy Broker — CORS Bypass Layer

Because the app runs inside an Android WebView (or browser) and SAP Gateway does not send permissive CORS headers, all OData requests are routed through a local native proxy broker at `/api/net/request` rather than sent directly to SAP:

- **`executeBrokerRequest(absoluteUrl, configOptions)`** wraps each request into a JSON envelope containing `timeout_ms`, the target `url`, `method`, `headers`, and optional `body`, then POSTs it to the broker endpoint.
- The broker (part of the AHM native shell) performs the actual HTTP call to SAP server-side, where CORS does not apply, and returns a JSON wrapper with `status`, `headers`, and `body`.
- The response is normalized into a mock `Response`-like object (with `.ok`, `.status`, `.json()`, `.text()`, `.headers.get()`) so the rest of the codebase treats broker responses identically to native `fetch` responses.

## Session Cookie Persistence

The broker proxy returns `Set-Cookie` headers from SAP in the response. The module captures these into a module-scoped `stableSessionCookies` string. On subsequent requests, any cached cookies are cleaned (stripping path/secure metadata attributes) and injected as a `Cookie` header in the broker envelope, maintaining SAP session affinity across requests without relying on browser cookie jars (which the broker bypasses).

## OData Format Rules

- `$format=json` is appended to all query paths unless the path already contains `$metadata`, `$format`, or a bound-action namespace segment matching `v0001.` (SAP RAP draft actions).
- `$metadata` endpoints use `Accept: application/xml, text/xml, */*` and return raw XML text.
- All other endpoints use `Accept: application/json` and set `Content-Type: application/json` for modifying requests.

## Legacy Direct-Fetch Implementation

The file retains the original direct `fetch(...)` implementation (lines 1–207, fully commented out) that performed CORS-mode requests without the broker. This serves as a reference and fallback documentation trail. The active implementation (lines 208+) exclusively uses `executeBrokerRequest`.

## Security Summary

| Concern | Mechanism |
|---|---|
| Identity verification | HTTP Basic Auth on every request |
| Write-protection | X-CSRF-Token fetch/cache/refresh cycle |
| CORS restriction | Native local proxy broker at `/api/net/request` |
| Session continuity | In-memory `Set-Cookie` capture and replay |
| Credential storage | Client-side `store.config` (localStorage-backed) |
| Timeout protection | Configurable `networkTimeoutMs` (default 15 000 ms via broker) |
| Stale token recovery | Automatic single-retry on HTTP 403 |
