---
kind: configuration_system
name: Runtime Configuration via Reactive LocalStorage Store
category: configuration_system
scope:
    - '**'
source_files:
    - src/util/store.js
    - src/views/config/index.vue
    - src/util/entities.js
    - vite.config.js
---

This SPA has no build-time configuration system. There are no .env files, import.meta.env usage, or Vite defineConfig variables consumed at runtime. All application configuration is runtime-only, persisted in the browser's localStorage, and exposed through a single reactive global store.

### What system/approach is used
- A Vue 3 reactive object (window.__GLOBAL_APP_STORE__) acts as the single source of truth for all mutable app settings.
- A deep watch persists every mutation to localStorage under the key vue_sfc_template_store.
- The store is attached to window so non-Vue modules (e.g., OData transport, service worker) can read/write it without importing Vue composables.
- A dedicated /config page lets users edit SAP connection parameters, test connectivity, and share/import settings via QR code — all operating on the same store.

### Key files and packages
- src/util/store.js — singleton factory, default schema, migration logic, and mutating actions (saveODataConfig, resetStore, …).
- src/views/config/index.vue — UI for Basic/Advanced modes: host URL, separate PO/GR OData paths, Basic Auth username/password, network timeout, SAP client number, dummy-data toggle; includes metadata $metadata probe against both endpoints and QR-based import/export.
- src/util/entities.js — consumes store.config.baseHost, poPath, grPath, sapClient to build absolute OData URLs.
- vite.config.js — only build/dev-server options (port, WSL IP detection, HTML rename); no runtime config injection.

### Architecture and conventions
- Schema-first defaults: defaultState in store.js defines the canonical shape (user, appPin, config, cache, simulatedOffline). On first load or parse failure the app falls back to these defaults.
- Backward-compatible migrations: getInitialState() detects older schemas (e.g., legacy single odataUrl field) and rewrites them into the current baseHost + poPath + grPath layout, then immediately re-persists the migrated blob.
- Immutable-by-convention mutations: consumers never assign directly to store.config.*; they call storeActions.saveODataConfig(...) which normalizes values (trims trailing slashes, coerces numbers, booleans) before writing.
- Dual-path OData model: unlike earlier single-endpoint apps, the config now carries two distinct service roots (poPath for PurchaseOrder, grPath for GoodsReceipt), with optional sapClient appended as a query parameter.
- QR sharing contract: the Advanced mode serializes { baseHost, poPath, grPath, username, password, networkTimeoutMs, useDummyData, sapClient } to JSON, renders it as a QR, and accepts the same shape (plus legacy odataUrl) when scanning.

### Rules developers should follow
1. Never hard-code SAP endpoints in components or utilities — always read from store.config.*.
2. Mutate via storeActions methods so normalization and persistence happen consistently.
3. When adding new config fields, update defaultState, the migration block in getInitialState(), the /config form fields, and the QR share payload computed property.
4. Treat credentials as sensitive: the store keeps them in plaintext in localStorage; avoid logging full values and consider clearing them on logout/reset.
5. Do not rely on build-time env vars for runtime behavior — this repo does not define any, and none are consumed by the app.