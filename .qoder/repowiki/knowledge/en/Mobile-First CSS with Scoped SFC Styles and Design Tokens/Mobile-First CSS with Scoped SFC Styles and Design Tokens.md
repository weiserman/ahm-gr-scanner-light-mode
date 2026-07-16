---
kind: frontend_style
name: Mobile-First CSS with Scoped SFC Styles and Design Tokens
category: frontend_style
scope:
    - '**'
source_files:
    - src/style.css
    - src/Main.vue
    - src/components/dialog/CustomDialog.vue
---

The app uses a lightweight, mobile-first CSS approach built on top of Vue 3 Single File Components (SFCs) without any CSS framework or preprocessor. All styling is authored in plain CSS files and `<style>` blocks inside `.vue` components.

**Design tokens via CSS custom properties**
All visual tokens live in `src/style.css` under the `:root` selector — background/surface colors (`--bg-color`, `--surface-color`, `--surface-alt`), text colors (`--text-main`, `--text-muted`), accent and semantic colors (`--accent-color`, `--warning-color`, `--danger-color`) with matching RGB variants for opacity usage, focus ring, border color, header height, and shadow values. Components consume these variables rather than hard-coding hex values, enabling consistent theming across the SPA.

**Global layout and reset**
`src/style.css` provides the application-wide reset and shell: `border-box` box-sizing, hidden horizontal overflow, a fixed `.app-header` bar whose height derives from `--header-height` plus `env(safe-area-inset-top)` for notched phones, and a scrollable `.app-content` area that fills remaining viewport space using `100vh`/`100dvh`. It also normalizes form inputs, buttons, links, and hides scrollbars cross-browser for a native-app feel.

**Component-level scoped styles**
Every component and view ships its own `<style scoped>` block (e.g. `CustomDialog.vue`, `PinMobile.vue`, `menutop/index.vue`, all views under `src/views/`). There are no shared utility classes beyond the global layout helpers; each component owns its presentation. The one exception is `Main.vue`, which adds an unscoped `.minimal-container` rule to reach child views.

**Responsive strategy**
The stylesheet is breakpoint-driven with two media queries: `max-width: 480px` (mobile-only centering) and `min-width: 481px` (desktop padding). Layouts rely on Flexbox and CSS Grid (see dialog action buttons) rather than a grid system. Touch targets are sized to at least 44px minimum height for accessibility on small screens.

**No build-time CSS tooling**
There is no Tailwind, Sass, PostCSS, or CSS-in-JS library in `package.json`; Vite's default CSS pipeline is used as-is. Fonts reference a local "72" font family alongside standard sans-serif fallbacks.