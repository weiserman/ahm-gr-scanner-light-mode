---
kind: dependency_management
name: Dual npm + Vendored Runtime Dependency Strategy
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - package-lock.json
    - src/util/sfcBootstrap.js
    - src/router/index.js
    - src/components/qrcode/generator/index.vue
    - src/components/qrcode/scanner/index.vue
---

This Vue 3 SPA uses a hybrid dependency strategy that combines two distinct approaches:

1. npm-managed build-time dependencies (package.json)
- devDependencies: Vite 8, @vitejs/plugin-vue, vite-plugin-qrcode, and Vue 3 — used only during development/build
- dependencies: html5-qrcode and vue-router declared at runtime via npm, but the app actually bypasses these in production by loading vendored copies directly

2. Git-checked-in vendored runtime libraries (src/lib/)
The app ships with pre-built, browser-ready copies of key runtime libraries checked into source control under src/lib/:
- vue/vue.esm-browser.prod.js — Vue 3 runtime
- vue-router/ — full distribution bundle (global, ESM, CJS variants)
- qr-code-generator/qr-code-generator-lib.mjs — QR generation library
- html5-qrcode/html5-qrcode.min.js — barcode/QR scanning engine
- petite-vue/ and vue3-sfc-loader/ — SFC loading support

Runtime resolution pattern:
The bootstrap (src/util/sfcBootstrap.js) dynamically fetches vue and vue-router from src/lib/ via HTTP and injects them into the module loader's alias map, so SFC imports of vue and vue-router resolve to the vendored files rather than node_modules. Components import qr-code-generator directly from its vendored .mjs file.

Lockfile & reproducibility:
package-lock.json (lockfileVersion 3) pins exact transitive versions for npm-installed packages, ensuring deterministic builds. The vendored libs are pinned by virtue of being committed to git history.

Key implications:
- Runtime behavior is decoupled from npm install — swapping a vendored lib requires editing source, not updating package.json
- No private registry or proxy configuration exists; all npm installs pull from the public registry
- No automated update tooling (Dependabot, Renovate) is present; updates require manual replacement of both package.json entries and src/lib/ files