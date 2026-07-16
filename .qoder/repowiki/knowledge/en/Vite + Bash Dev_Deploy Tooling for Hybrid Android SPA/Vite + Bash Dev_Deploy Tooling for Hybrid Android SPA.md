---
kind: build_system
name: Vite + Bash Dev/Deploy Tooling for Hybrid Android SPA
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - vite.config.js
    - scripts/start.sh
    - scripts/push.sh
    - scripts/watch.sh
    - scripts/zip.sh
---

The project uses Vite as the sole build system, configured to treat index.vite.html as the Rollup input and emit a standard dist/index.html. A custom Vite plugin rewrites the dev server root / to serve that file, renames the built HTML output at bundle close, and prints a terminal QR code (via native qrencode) pointing at the WSL host IP so a mobile device can reach the dev server. The preview server mirrors the dev server's host/port settings.

Build and development are driven by npm scripts in package.json:
- npm start runs vite (dev server on port 3000, host 0.0.0.0, CORS enabled)
- npm run dist runs vite build into dist/
- npm run preview serves the production bundle locally
- npm run serve:dist and serve:sfc use Python HTTP servers only for quick static serving during debugging

There is no Makefile or Dockerfile; packaging and deployment are handled by Bash utilities under scripts/ tailored for an Android hybrid WebView app (com.example.app):
- scripts/start.sh launches the installed Android app via ADB Monkey on all attached devices or a specific one.
- scripts/push.sh clears a staging area on the device (/sdcard/Documents/MyHybridMobile/www), pushes selected root files plus src/, public/, and dist/, then copies them into the app sandbox (files/www) via run-as and broadcasts ACTION_RELOAD_WEBVIEW to force a WebView refresh.
- scripts/watch.sh is a live-sync daemon that polls the project tree (excluding node_modules and .git), detects creates/updates/deletes by mtime, and mirrors each change to both the public staging directory and the app sandbox, followed by the reload broadcast.
- scripts/zip.sh watches ./src for changes, rebuilds zip/main.zip (excluding zip/, hidden files, node_modules, dist), serves it over a local darkhttpd instance, and prints a centered ANSI QR code linking to the zip URL.
- scripts/chrome.sh, scripts/restart.sh, scripts/stop.sh are companion helpers for launching Chrome with flags, restarting the app, and stopping processes.

Conventions and constraints:
- The entry point is index.vite.html; do not rename it without updating vite.config.js' Rollup input and the dev-server rewrite middleware.
- Production artifacts must be placed in dist/ (the default Vite output); push.sh expects this layout.
- Device-side paths are hardcoded (/sdcard/Documents/MyHybridMobile/www and files/www) and the app package name com.example.app appears across multiple scripts — any change requires editing every script.
- The toolchain assumes a Windows-hosted WSL environment: ADB is invoked through /mnt/c/usr/bin/adb.exe, and IP discovery relies on cmd.exe /c ipconfig and qrencode being available on PATH.
- No CI pipeline, artifact versioning strategy, or containerization is present; builds are purely local/npm-script-driven.