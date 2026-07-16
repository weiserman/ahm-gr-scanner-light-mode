---
kind: external_dependency
name: Vite Build System and Development Server
slug: vite
category: external_dependency
category_hints:
    - framework_behavior
scope:
    - '**'
---

### Vite Development and Build Toolchain
- **Role**: Modern build tool providing development server, hot module replacement, and production bundling
- **Development**: Runs on port 3000 by default with automatic network interface detection for mobile device testing
- **Build Output**: Production bundles generated to `dist/` directory for deployment to AHM shell
- **Plugin Ecosystem**: Uses `@vitejs/plugin-vue` for Vue 3 single-file component support and `vite-plugin-qrcode` for QR code generation during development