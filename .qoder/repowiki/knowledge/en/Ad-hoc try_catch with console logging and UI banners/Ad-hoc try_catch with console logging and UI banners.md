---
kind: error_handling
name: Ad-hoc try/catch with console logging and UI banners
category: error_handling
scope:
    - '**'
source_files:
    - src/components/qrcode/scanner/index.vue
    - src/views/config/index.vue
    - src/views/scanned_goods/index.vue
    - src/views/register_delivery/index.vue
    - src/router/index.js
---

This Vue 3 application has no centralized error-handling system. Errors are handled locally in each component using ad-hoc try/catch blocks, `console.error`/`console.warn`, and user-facing status banners stored in reactive refs. There is no global `Vue.config.errorHandler`, no custom error types, no sentinel errors, and no middleware or router-level error hooks configured by the app code.

Key patterns observed:
- Each async operation (camera permission acquisition, QR scanning, SAP network calls, config validation) wraps its body in a try/catch that logs via `console.error` and sets a local banner/ref like `statusBanner.value = { status: 'failed', message: ... }`.
- Some functions rethrow `new Error(...)` to signal failure up the call stack (e.g., camera permission polling, metadata checks), which is then caught by the caller's catch block.
- The scanner component uses `console.warn` for non-fatal permission denials and `console.error` for hardware failures; it returns boolean flags (`false`) instead of throwing in some paths.
- The router guard in `src/router/index.js` performs state-based redirects but does not handle navigation errors — any thrown error from guards would be unhandled since no `router.onError` is registered.
- No `onErrorCaptured` is used at the component level, so component render errors bubble up to Vue's default handler (which prints to console).
- Third-party libraries (vue-router, vue runtime) throw their own `Error`s for configuration mistakes, but the app never catches or transforms them.

There is no consistent convention for error shapes, no domain-specific error classes, and no unified presentation layer — every view decides independently how to surface an error to the user.