---
kind: configuration_system
name: Runtime Configuration via LocalStorage Store
category: configuration_system
scope:
    - '**'
source_files:
    - src/util/store.js
    - src/views/config/index.vue
    - src/util/odata.js
    - src/util/entities.js
---

The application uses a simple in-memory reactive store backed by localStorage for runtime configuration. There is no build-time config system (no .env, no Vite import.meta.env usage, no YAML/TOML/JSON config files). All configuration is user-driven and persisted client-side.

Core storage layer — src/util/store.js defines a single global reactive object (window.__GLOBAL_APP_STORE__) with a deep watcher that serializes the entire state to localStorage under key vue_sfc_template_store. The default state includes: config.baseHost (SAP host URL), config.poPath/config.grPath (separate OData service paths for Purchase Order registration and Goods Receipt), config.username/config.password (Basic Auth credentials), config.networkTimeoutMs (request timeout), config.useDummyData (flag to route through the service-worker mock layer), and config.sapClient (optional SAP client code).

On load, the store performs schema migration from an older flat odataUrl field into the new split baseHost + dual-path structure, ensuring backward compatibility.

## On-Device Credential Storage

SAP username and password are stored as **plain-text strings** inside the reactive store at `store.config.username` and `store.config.password`. The Vue deep `watch` on the entire store object serializes the full state (including credentials) via `JSON.stringify` and writes it to `localStorage` under the key `vue_sfc_template_store` on every mutation. There is no encryption, obfuscation, or use of platform secure storage (e.g. Android Keystore, Web Crypto API). The credentials survive app restarts because localStorage persists across WebView sessions.

Write path: The Config view (src/views/config/index.vue) collects credentials from the user and calls `storeActions.saveODataConfig(baseHost, poPath, grPath, user, pass, timeoutMs, useDummyData, sapClient)`. This assigns the values directly onto the reactive store object, which triggers the deep watcher to persist the entire state to localStorage automatically.

Read path: On app startup, `getInitialState()` reads `localStorage.getItem('vue_sfc_template_store')`, parses the JSON, applies schema migrations for legacy formats, and hydrates the reactive store. The credentials are then available in-memory for `odata.js` to read on every outbound request.

Credential validation: `hasConfiguredUser()` is an exported helper that checks whether both `store.config.username` and `store.config.password` are non-empty trimmed strings. The `odataFetch` function in `odata.js` independently guards by throwing if either field is missing before any network call.

Wipe / reset: `storeActions.resetStore()` sets `username` and `password` to empty strings, resets all other config fields to defaults, and explicitly calls `localStorage.setItem(...)` to persist the wiped state immediately.

Security implication: Anyone with access to the device's browser storage (e.g. via DevTools on a connected WebView, or physical device access) can read the SAP credentials in plain text. This is an accepted trade-off for the lightweight offline-first architecture targeting managed Android scanner devices.

Configuration UI — src/views/config/index.vue exposes a Basic/Advanced mode form where users edit these fields, test connectivity against $metadata via the local proxy broker at /api/net/request, generate/import settings as QR codes (JSON payload), and reset all data. Saving calls storeActions.saveODataConfig(...), which normalizes and persists values.

Consumption — Network layer src/util/odata.js reads store.config to construct absolute URLs, inject Basic Auth headers, apply CSRF token handling, and set timeouts. Entity helpers in src/util/entities.js compose endpoints using store.config.poPath and grPath.

No environment or build-time overrides exist. The app ships with hardcoded defaults in defaultState and expects end-users to configure it on first run.