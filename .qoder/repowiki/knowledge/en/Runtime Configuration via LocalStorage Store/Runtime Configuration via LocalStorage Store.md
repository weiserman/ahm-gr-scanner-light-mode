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

Configuration UI — src/views/config/index.vue exposes a Basic/Advanced mode form where users edit these fields, test connectivity against $metadata via the local proxy broker at /api/net/request, generate/import settings as QR codes (JSON payload), and reset all data. Saving calls storeActions.saveODataConfig(...), which normalizes and persists values.

Consumption — Network layer src/util/odata.js reads store.config to construct absolute URLs, inject Basic Auth headers, apply CSRF token handling, and set timeouts. Entity helpers in src/util/entities.js compose endpoints using store.config.poPath and grPath.

No environment or build-time overrides exist. The app ships with hardcoded defaults in defaultState and expects end-users to configure it on first run.