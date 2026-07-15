---
kind: build_system
name: Vite-based SPA Build & Android WebView Deployment
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - vite.config.js
    - serve.sh
    - scripts/push.sh
    - scripts/start.sh
    - scripts/zip.sh
---

The project is a Vue 3 single-page application built with Vite and packaged for distribution into an Android WebView via shell scripts rather than a formal CI pipeline or Docker image.

**Build toolchain**
- `vite` (dev server, preview, production build) configured in `vite.config.js`. The entry point is `index.vite.html`, which is renamed to `index.html` at build time by a custom plugin hook.
- `@vitejs/plugin-vue` compiles `.vue` SFCs; no TypeScript or CSS preprocessors are declared.
- `base: './'` makes the app work as a relative-path static site suitable for direct file serving or WebView loading.
- Dev server listens on `0.0.0.0:3000` so it is reachable from mobile devices on the same LAN.
- A WSL-aware host-IP resolver (`getWslHostIp`) prints a terminal QR code of the dev URL using the native `qrencode` utility, with a fallback IP if detection fails.

**NPM scripts** (`package.json`)
- `npm start` — runs `vite` dev server.
- `npm run dist` — builds to `dist/`.
- `npm run serve:dist` / `serve:sfc` — lightweight Python HTTP servers used only for local verification of the built artifacts.

**Static serving helpers**
- `serve.sh` serves the repo root with `darkhttpd` on port 4321 with basic security headers.
- `scripts/zip.sh` watches `./src` for changes, rebuilds `zip/main.zip` (excluding `node_modules` and `dist`), serves it via `darkhttpd` on port 8080, and prints a centered ANSI QR code of the download URL for quick mobile access.

**Android WebView deployment flow**
- `scripts/push.sh` uses ADB (`/mnt/c/usr/bin/adb.exe`) to push `src/`, `public/`, `dist/`, and selected root files into `/sdcard/Documents/MyHybridMobile/www`, then copies them into the target app sandbox (`run-as com.example.app cp -r ... files/`) and triggers a reload broadcast (`com.example.app.ACTION_RELOAD_WEBVIEW`).
- `scripts/start.sh` launches the WebView app via `monkey` on all attached devices or a specific device passed as `$1`.
- Other helper scripts (`chrome.sh`, `restart.sh`, `stop.sh`, `watch.sh`) round out the local development loop but are not part of a remote CI system.

**Conventions & constraints**
- Third-party runtime libraries (Vue 3, Vue Router, html5-qrcode, qr-code-generator, vue3-sfc-loader, petite-vue) are vendored under `src/lib/` and consumed directly; they are not installed through npm except for the build-time tooling.
- There is no Makefile, Dockerfile, or CI configuration — artifact generation and device delivery are entirely script-driven and intended for local developer workflows on Windows/WSL.
- Versioning is flat (`1.0.0` in `package.json`) with no release tagging or changelog automation.