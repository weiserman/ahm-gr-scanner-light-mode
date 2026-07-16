---
kind: logging_system
name: Console-based ad-hoc logging with no centralized logger
category: logging_system
scope:
    - '**'
source_files:
    - src/util/odata.js
    - src/util/store.js
    - src/util/entities.js
    - public/sw.js
    - public/mock-sw.js
    - mock-sw.js
    - src/main.sfc.js
---

This repository does not implement a structured or centralized logging system. All diagnostic output is produced via direct calls to the browser `console` API scattered across application modules, with no shared logger abstraction, log-level configuration, or sink routing.

**What is used**
- Plain `console.log`, `console.warn`, and `console.error` calls throughout the codebase.
- No logging framework (e.g., Winston, pino, bunyan) and no custom logger module exists.
- No global error handler or Vue `errorHandler` is configured in `src/main.js`.
- Service workers and mock SWs also emit via `console.log`.

**Where logs appear**
- `src/util/odata.js` — SAP CSRF handshake, request URLs, 403 retry, and failure messages (`[SAP CSRF ENGINE]`, `[SAP ODATA]`).
- `src/util/store.js` — store initialization, config updates, cache operations, and reset actions (`[STORE INIT]`, `[STORE ACTION]`, `[CACHE STORE]`, `[SIMULATOR]`).
- `src/util/entities.js` — Purchase Order fetch, goods receipt commit, batch post, document creation, and draft pipeline steps (`[SAP ENTITY SERVICE]`, `[SAP PATCH]`, `[SAP POST]`, `[SAP PIPELINE]`).
- `public/sw.js`, `public/mock-sw.js`, `mock-sw.js` — service worker lifecycle and mock interception events (`[SERVICE WORKER]`, `[MOCK SW]`).
- `src/main.sfc.js` — app bootstrap failure (`App initialization failed:`).
- Vendored third-party libraries (`src/lib/vue-router/vue-router.esm-browser.js`) emit their own warnings/errors.

**Conventions developers follow**
- Prefix every console message with an uppercase bracketed tag identifying the subsystem (e.g., `[SAP ODATA]`, `[STORE ACTION]`, `[MOCK SW]`) so messages can be filtered in the browser DevTools.
- Use `console.log` for informational flow, `console.warn` for recoverable conditions (expired CSRF token, missing headers), and `console.error` for failures that bubble up as thrown errors.
- There is no runtime log-level switch; all calls are always emitted.
- No structured payload shape is enforced — arguments are passed directly to `console.*`.

**Rules developers should follow**
- Do not introduce a new logging framework without first removing existing bare `console.*` calls from the same module.
- If a central logger is introduced later, keep the existing bracketed tag convention as the `module` field of structured entries.
- Avoid logging sensitive data (passwords, tokens) — current code already avoids this, but it is worth stating explicitly since there is no redaction layer.