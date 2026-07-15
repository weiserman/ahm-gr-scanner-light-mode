---
kind: error_handling
name: Ad-hoc JavaScript Error Handling in Vue Components
category: error_handling
scope:
    - '**'
source_files:
    - src/components/qrcode/scanner/index.vue
---

This repository does not implement a centralized or structured error handling system. Errors are handled locally within individual components using plain `throw new Error(...)` statements and `try/catch` blocks, with no shared error types, middleware, or global handlers.

Key observations:
- **Component-level throws**: The QR scanner component (`src/components/qrcode/scanner/index.vue`) throws a descriptive `Error` when the native permissions event bus returns an unexpected HTTP status (line 207).
- **Promise `.catch()` usage**: Third-party libraries bundled under `src/lib/` (Vue runtime, Vue Router) contain their own internal error handling via `.catch()`, but these are library internals, not application-wide patterns.
- **No global handler**: There is no `app.config.errorHandler`, `window.onerror`, or `unhandledrejection` listener configured anywhere in the source code to centralize uncaught errors.
- **No custom error classes**: No dedicated error type hierarchy or sentinel errors exist; all errors are generic `Error` instances constructed inline.
- **Silent failures**: Some async flows swallow errors (e.g., `onScanTickFailure` is a no-op callback), relying on console logging rather than structured error propagation.

In short, error handling is entirely ad-hoc — each component decides how to surface or suppress its own failures, with no cross-cutting conventions enforced.