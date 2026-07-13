<template>
  <div class="app-layout about-view">
    <!-- Reusable Top Navigation Bar Component -->
    <MenuTop title="ABOUT SYSTEM" />

    <!-- Main Workspace Area -->
    <main class="app-content content-workspace">
      <div class="about-container">
        
        <!-- Section 1: Brand Hero Branding Block -->
        <div class="hero-card">
          <div class="brand-logo-wrapper">
            <!-- Modern geometric tracking & inventory box icon vector -->
            <svg viewBox="0 0 24 24" width="48" height="48" stroke="var(--accent-color)" stroke-width="1.5" fill="none">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <h2 class="app-name">Goods Receipting</h2>
          <p class="app-purpose">Warehouse Inventory Logistics Hub</p>
        </div>

        <!-- Section 2: Application Specifications & Info Logs -->
        <div class="info-group">
          <div class="group-title">Software Specifications</div>
          <div class="info-card">
            <div class="info-row">
              <span class="info-label">App Version</span>
              <span class="info-value text-accent">v2.4.0-build.86</span>
            </div>
            <div class="info-row">
              <span class="info-label">Framework Engine</span>
              <span class="info-value">Vue.js 3 (Setup)</span>
            </div>
            <div class="info-row">
              <span class="info-label">Runtime Interface</span>
              <span class="info-value">Android WebView Wrapper</span>
            </div>
          </div>
        </div>

        <!-- Section 3: Connected Hardware Device Diagnostics -->
        <div class="info-group">
          <div class="group-title">Device Diagnostic Telemetry</div>
          <div class="info-card">
            <div class="info-row">
              <span class="info-label">Hardware Profile</span>
              <span class="info-value">Samsung SM-A245F</span>
            </div>
            <div class="info-row">
              <span class="info-label">Scanner Driver</span>
              <span class="info-value">Integrated Camera Hook API</span>
            </div>
            <div class="info-row">
              <span class="info-label">Local Host Port</span>
              <span class="info-value font-mono">localhost:8000</span>
            </div>
          </div>
        </div>

        <!-- Section 4: Operational Environment State Metrics -->
        <div class="info-group">
          <div class="group-title">Session State</div>
          <div class="info-card">
            <div class="info-row">
              <span class="info-label">Connection Status</span>
              <span class="info-value status-online">ONLINE</span>
            </div>
          </div>
        </div>

        <!-- Footer Copyright Notation Label -->
        <div class="about-footer">
          &copy; 2026 Enterprise Warehouse Logistics Solutions. All Rights Reserved.
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import MenuTop from '../../components/menutop/index.vue';
</script>

<style scoped>
.about-view {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  box-sizing: border-box;
}

.content-workspace {
  padding-left: 1.25rem;
  padding-right: 1.25rem;
  padding-bottom: 2rem;
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
}

/* Base stack layout manager boundary width properties */
.about-container {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 0 auto;
}

/* Hero Branding block module styling card */
.hero-card {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 2rem 1rem;
  text-align: center;
  box-sizing: border-box;
}

.brand-logo-wrapper {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.app-name {
  font-size: 1.35rem;
  font-weight: bold;
  color: var(--text-main);
  margin: 0 0 0.35rem 0;
}

.app-purpose {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0;
  letter-spacing: 0.5px;
}

/* Categorized informational card groups framework structural setup */
.info-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.group-title {
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
  text-align: left;
  padding-left: 0.25rem;
}

.info-card {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* Information Row Striping line layouts details formatting properties */
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1.15rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
}

.info-row:last-child {
  border-bottom: none; /* Strip off bottom separation border track line on final matrix segment row */
}

.info-label {
  color: var(--text-muted);
}

.info-value {
  color: var(--text-main);
  font-weight: 500;
  text-align: right;
}

/* Accent state text colored triggers mapping rules tokens */
.text-accent {
  color: var(--accent-color);
}

.font-mono {
  font-family: monospace;
}

/* Status state diagnostic visualization label indicators */
.status-online {
  color: var(--accent-color); /* Vibrant validation diagnostic active state green color */
  font-weight: bold;
  font-family: monospace;
  letter-spacing: 0.5px;
}

/* Footer layout legal typography formatting specifications labels */
.about-footer {
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.4;
  text-align: center;
  padding: 0 1rem;
}
</style>

