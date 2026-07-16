---
kind: dependency_management
name: 'Dual-Strategy Dependency Management: npm + Vendored Browser Artifacts'
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - package-lock.json
    - vite.config.js
    - src/main.js
    - src/lib/vue/vue.esm-browser.prod.js
    - src/lib/vue-router/vue-router.esm-browser.js
---

This Vue 3 SPA uses a hybrid dependency strategy combining standard npm resolution with in-tree vendoring of browser-ready artifacts, enabling both Vite-powered development and zero-build runtime execution.

**npm-managed dependencies (package.json)**
- Runtime deps: `vue` (^3.5.38), `vue-router` (^4.6.4), `html5-qrcode` (^2.3.8)
- Dev-only deps: `vite` (^8.0.16), `@vitejs/plugin-vue` (^6.0.7), `vite-plugin-qrcode` (^0.4.1)
- Lockfile: `package-lock.json` (lockfileVersion 3) is committed, pinning exact transitive versions for reproducible installs
- No private registry or `.npmrc` overrides are present; all packages resolve from the public npm registry
- The project name is a placeholder (`tmp`) and has no `engines` field constraining Node.js versions

**Vendored browser artifacts (src/lib/)**
The app ships prebuilt browser bundles of several libraries directly under `src/lib/`, bypassing npm entirely at runtime:
- `src/lib/vue/vue.esm-browser.prod.js` — Vue 3 runtime ESM build
- `src/lib/vue-router/` — full vue-router distribution (CJS, ESM, global, prod variants)
- `src/lib/html5-qrcode/` — html5-qrcode browser bundle
- `src/lib/petite-vue/`, `src/lib/vue3-sfc-loader/`, `src/lib/qr-code-generator/` — additional runtime libs

These files are imported via relative paths rather than through `import 'vue'`, allowing the app to run as a pure static site without any bundler. The Vite dev server still resolves `vue` and `vue-router` from `node_modules` for hot-reload builds, so there are two parallel copies of these libraries in play during development.

**Build-time vs runtime split**
- Development: Vite resolves `vue`, `vue-router`, and other deps from `node_modules`; `index.vite.html` bootstraps `src/main.js` which imports from npm packages
- Production: The build output ships alongside the vendored `src/lib/*` artifacts; the final HTML entry can load them directly without a bundler
- `vite.config.js` contains custom plugins that rename the build output from `index.vite.html` → `index.html` and print a QR code linking to the dev server on the host LAN IP

**Conventions & constraints**
- New runtime libraries should be added as vendored browser artifacts under `src/lib/<name>/` if they must work without a bundler
- Build/dev tooling stays in `devDependencies` only; runtime-only packages go in `dependencies`
- Version bumps should update both `package.json` and the corresponding vendored artifact under `src/lib/` when the library is used by both Vite and the zero-build path
- There is no automated lockfile sync beyond committing `package-lock.json`; no CI step was found that runs `npm ci` or `npm audit`