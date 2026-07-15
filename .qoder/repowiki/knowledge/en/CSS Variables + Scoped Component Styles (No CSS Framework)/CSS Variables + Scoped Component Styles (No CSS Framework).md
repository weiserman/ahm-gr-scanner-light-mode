---
kind: frontend_style
name: CSS Variables + Scoped Component Styles (No CSS Framework)
category: frontend_style
scope:
    - '**'
source_files:
    - src/style.css
    - src/main.js
    - src/Main.vue
    - src/components/dialog/CustomDialog.vue
    - src/components/menutop/index.vue
    - src/components/pinmobile/PinMobile.vue
---

The app uses a lightweight, framework-free styling approach built on vanilla CSS with CSS custom properties and per-component `<style scoped>` blocks. There is no Tailwind, Bootstrap, or other UI library — styles are hand-authored to keep the bundle small for Android WebView deployment.

**Design tokens via `:root` variables**
All colors, spacing, and layout constants live in `src/style.css` under `--bg-color`, `--surface-color`, `--accent-color`, `--danger-color`, `--header-height`, etc. Components reference these tokens rather than hard-coding values, giving a single source of truth for theming.

**Global application shell**
`src/style.css` defines the root layout (`html/body` reset, `box-sizing: border-box`, mobile-safe scrolling, hidden scrollbars) and shared layout classes `.app-layout`, `.app-header`, `.app-content`, `.minimal-container`, plus global input/button focus rings and touch-friendly minimum hit areas (44px).

**Component-scoped styles**
Every Vue component and view ships its own `<style scoped>` block (confirmed across all files in `src/components/` and `src/views/`). This avoids class-name collisions and keeps each feature's visual rules co-located with its logic.

**Responsive strategy**
- Mobile-first viewport sizing using `100dvh`, `env(safe-area-inset-top)` for notched devices, and `@media (max-width: 480px)` / `min-width: 481px` breakpoints.
- Touch targets sized ≥ 44px; buttons use grid layouts that collapse to single-column on very narrow screens.
- Scrollbars intentionally hidden on mobile via vendor-prefixed scrollbar rules.

**Naming conventions**
- BEM-like flat class names (e.g., `custom-dialog-overlay`, `custom-dialog-card`, `pin-screen`, `pin-dots`, `header-menu-popover`) without nesting selectors.
- Semantic role attributes (`role="dialog"`, `aria-modal="true"`) paired with styled overlays for accessibility.
- Utility classes like `.badge`, `.form-input`, `.search-input`, `.action-btn-save` provide reusable micro-styles.

**What is NOT used**
No CSS preprocessors (SCSS/Less), no CSS-in-JS, no design-token build step, no component library (MUI/Vuetify/Tailwind). Inline `:style` bindings are used sparingly (e.g., dynamic QR code size) but not as a primary styling mechanism.