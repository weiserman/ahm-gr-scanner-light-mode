Children are thin utility modules consumed by the top-level entry rather than by each other. The wiring contract is `store.js`, which exposes a single `window.__GLOBAL_APP_STORE__` reactive object plus `storeActions`; every other child reads configuration from it (`baseHost`, `poPath`, `grPath`, `username`, `password`, `useDummyData`, `sapClient`) and writes back via its actions.

- `sfcBootstrap.js` bootstraps the in-browser Vue SFC loader, injects `window.Vue` / `window.VueRouter`, and returns `{ createApp, Main, router }` for the entry file to mount.
- `odata.js` is the sole HTTP boundary: it wraps `fetch` through the local `/api/net/request` broker (bypassing CORS), handles Basic Auth, CSRF token fetch/retry, `$format=json` injection, and cookie persistence; consumers never call `fetch` directly.
- `entities.js` depends on `odataFetch` + `store.config` to normalize SAP PO/GoodsReceipt payloads into a flat UI schema and to drive both legacy PATCH and RAP draft pipelines.
- `serviceWorker/serviceWorker.js` registers the real worker and exposes `registerServiceWorker` / `sendWorkerMessage` / `listenForWorkerMessages`; `sw.js` toggles between the real `/sw.js` and a mock `mock-sw.js` based on `store.config.useDummyData`.
- `barcodeScanner.js` and `keyboard.js` publish shared ref state (`isGlobalScanningActive`, `isWebcamScannerOpen`) and a dev-only Alt+R reload hook, respectively.

There is no central orchestrator file inside this scope — the parent entry imports these modules and wires them together, with `store.js` as the de-facto shared state contract.