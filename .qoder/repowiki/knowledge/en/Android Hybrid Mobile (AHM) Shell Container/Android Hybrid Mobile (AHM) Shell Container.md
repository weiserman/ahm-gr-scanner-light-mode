---
kind: external_dependency
name: Android Hybrid Mobile (AHM) Shell Container
slug: android-hybrid-mobile
category: external_dependency
category_hints:
    - vendor_identity
    - client_constraint
scope:
    - '**'
---

### Identity & Role
The app is a lightweight mobile asset consumed by the Android Hybrid Mobile shell (`https://github.com/otvnvs/android-hybrid-mobile`). It is installed into AHM via the `ahm-app://deploy?package_url=...` deep link and rendered natively inside the AHM WebView.

### Integration Points
- **Installation**: `ahm-app://deploy?package_url=<zip>` in README; production package must be zipped and hosted on GitHub Releases or an accessible repo for AHM's maintenance screen to pull down.
- **Network proxy**: All outbound HTTP calls go through the native broker endpoint `/api/net/request` (a local bridge provided by AHM) rather than direct `fetch`, which also bypasses CORS restrictions against SAP Gateway.
- **Session cookies**: The broker response's `set-cookie` header is captured in-memory and re-injected as a `Cookie` header on subsequent requests — session state is maintained across calls without browser cookie sharing.

### Client Constraint
- Runs inside an Android WebView that does not share standard browser cookies with the page context; all cross-origin network access must route through the AHM broker.
- Service Worker support depends on the underlying WebView/container; the app exposes a Configuration page that reports RUNNING / DEACTIVATED / NO SUPPORT states.