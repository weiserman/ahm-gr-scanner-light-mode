---
kind: logging_system
name: No Centralized Logging System — Ad-hoc console.log Usage
category: logging_system
scope:
    - '**'
source_files:
    - package.json
    - public/sw.js
    - mock-sw.js
    - src/components/qrcode/scanner/index.vue
    - src/components/qrcode/generator/index.vue
    - src/Main.vue
---

This repository does not implement a centralized logging system. There is no dedicated logger module, no logging framework dependency (no winston, pino, bunyan, debug, etc.), and no structured log configuration in package.json or vite.config.js.

Instead, the codebase uses ad-hoc `console.log`, `console.warn`, and `console.error` calls scattered across components and service workers:
- Service workers (`public/sw.js`, `mock-sw.js`) use `console.log('[SERVICE WORKER] ...')` / `'[MOCK SW] ...'` prefixed messages for lifecycle events.
- The QR scanner component (`src/components/qrcode/scanner/index.vue`) contains many `console.log`/`console.warn`/`console.error` calls with human-readable prefixes like `[SCANNER]`, `[SCANNER-FAST-PATH]`, and `►` markers for tracing camera permission flow and decoded payloads.
- `src/Main.vue` has commented-out `console.warn`/`console.log` lines for Zebra hardware scan debugging.
- `src/components/qrcode/generator/index.vue` uses `console.error` for QR generation failures.

There is no log-level strategy, no sink abstraction, no structured fields, and no way to toggle verbosity at runtime. All output goes directly to the browser/devtools console.