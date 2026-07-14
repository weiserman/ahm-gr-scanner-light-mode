<template>
  <div class="app-layout config-view">
    <MenuTop title="SERVER CONFIG" />

    <main class="app-content content-workspace">
      <form class="config-form" @submit.prevent="handleSaveConfig">
        <header class="page-header">
          <h2 class="page-title">SAP Connection Setup</h2>
          <p class="page-subtitle">Use Basic for quick onboarding, or Advanced for full endpoint control and sharing.</p>
        </header>

        <div class="mode-switch" role="tablist" aria-label="Configuration mode">
          <button
            type="button"
            class="mode-btn"
            :class="{ active: activeMode === 'basic' }"
            @click="activeMode = 'basic'"
          >
            Basic
          </button>
          <button
            type="button"
            class="mode-btn"
            :class="{ active: activeMode === 'advanced' }"
            @click="activeMode = 'advanced'"
          >
            Advanced
          </button>
        </div>

        <section v-if="activeMode === 'basic'" class="mode-panel">
          <div class="field-group">
            <label class="form-label">SAP Host URL<span class="required-indicator">*</span></label>
            <input
              v-model.trim="localConfig.baseHost"
              type="url"
              class="form-input"
              placeholder="https://s4hana.example.com:44300"
              required
            />
          </div>

          <div class="field-group">
            <label class="form-label">Basic Auth Username</label>
            <input
              v-model.trim="localConfig.username"
              type="text"
              class="form-input"
              placeholder="Enter username"
              autocomplete="username"
            />
          </div>

          <div class="field-group">
            <label class="form-label">Basic Auth Password</label>
            <input
              v-model="localConfig.password"
              type="password"
              class="form-input"
              placeholder="Enter password"
              autocomplete="current-password"
            />
          </div>

          <div class="action-row">
            <button type="button" class="secondary-btn" :disabled="isTesting" @click="runDiagnostics">
              <svg v-if="!isTesting" class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2L3 14h8l-1 8 11-12h-8l0-8z"></path>
              </svg>
              <span v-if="isTesting" class="spinner-icon"></span>
              {{ isTesting ? 'Testing...' : 'Test connection' }}
            </button>

            <button type="button" class="secondary-btn" @click="openScannerAction">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h5M4 4v5M20 4h-5M20 4v5M4 20h5M4 20v-5M20 20h-5M20 20v-5"></path>
                <path d="M8 12h8"></path>
              </svg>
              Scan QR
            </button>
          </div>

          <p class="mode-hint">Need custom service paths, timeout, SAP client, or QR sharing? Switch to Advanced.</p>
        </section>

        <section v-else class="mode-panel">
          <div class="field-group">
            <label class="form-label">SAP Host URL<span class="required-indicator">*</span></label>
            <input
              v-model.trim="localConfig.baseHost"
              type="url"
              class="form-input"
              placeholder="https://s4hana.example.com:44300"
              required
            />
          </div>

          <div class="field-group">
            <label class="form-label">Register Delivery Service Path<span class="required-indicator">*</span></label>
            <input
              v-model.trim="localConfig.poPath"
              type="text"
              class="form-input"
              placeholder="/sap/opu/odata4/sap/zgr_ui_poscan_o4/..."
              required
            />
          </div>

          <div class="field-group">
            <label class="form-label">Goods Receipt Service Path<span class="required-indicator">*</span></label>
            <input
              v-model.trim="localConfig.grPath"
              type="text"
              class="form-input"
              placeholder="/sap/opu/odata4/sap/zgr_grdoc_api/..."
              required
            />
          </div>

          <div class="field-group">
            <label class="form-label">SAP Client</label>
            <input v-model.trim="localConfig.sapClient" type="text" class="form-input" placeholder="100" />
          </div>

          <div class="field-group">
            <label class="form-label">Basic Auth Username</label>
            <input
              v-model.trim="localConfig.username"
              type="text"
              class="form-input"
              placeholder="Enter username"
              autocomplete="username"
            />
          </div>

          <div class="field-group">
            <label class="form-label">Basic Auth Password</label>
            <input
              v-model="localConfig.password"
              type="password"
              class="form-input"
              placeholder="Enter password"
              autocomplete="current-password"
            />
          </div>

          <div class="field-group">
            <label class="form-label">Network Timeout (ms)</label>
            <input
              v-model.number="localConfig.networkTimeoutMs"
              type="number"
              class="form-input"
              placeholder="5000"
              min="500"
              step="500"
              required
            />
          </div>

          <div class="action-row">
            <button type="button" class="secondary-btn" :disabled="isTesting" @click="runDiagnostics">
              <svg v-if="!isTesting" class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2L3 14h8l-1 8 11-12h-8l0-8z"></path>
              </svg>
              <span v-if="isTesting" class="spinner-icon"></span>
              {{ isTesting ? 'Testing...' : 'Test connection' }}
            </button>

            <button type="button" class="secondary-btn" @click="openScannerAction">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h5M4 4v5M20 4h-5M20 4v5M4 20h5M4 20v-5M20 20h-5M20 20v-5"></path>
                <path d="M8 12h8"></path>
              </svg>
              Scan QR
            </button>
          </div>

          <div class="share-card">
            <h3 class="share-title">Share configuration</h3>
            <p class="share-description">Generate a QR code so another device can import these settings instantly.</p>

            <div class="action-row">
              <button type="button" class="secondary-btn" @click="showQrCode = !showQrCode">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4z"></path>
                  <path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z"></path>
                </svg>
                {{ showQrCode ? 'Hide QR code' : 'Show QR code' }}
              </button>
              <button type="button" class="secondary-btn" @click="copySharePayload">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="11" height="11" rx="2"></rect>
                  <path d="M5 15V6a2 2 0 0 1 2-2h9"></path>
                </svg>
                Copy JSON
              </button>
            </div>

            <div v-if="showQrCode" class="qr-block">
              <div class="qr-frame">
                <QrCode :text="qrCodeValue" :size="220" color="#111827" />
              </div>
              <p class="qr-caption">Scan to import settings</p>
            </div>
          </div>

          <button type="button" class="danger-btn" @click="isResetDialogOpen = true">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"></path>
              <path d="M8 6V4h8v2"></path>
              <path d="M19 6l-1 14H6L5 6"></path>
              <path d="M10 11v6M14 11v6"></path>
            </svg>
            Reset onboarding
          </button>
        </section>

        <div v-if="testResult" class="status-banner" :class="testResult.status">{{ testResult.message }}</div>
        <div v-if="copyStatus" class="status-banner success">{{ copyStatus }}</div>

        <button type="submit" class="save-config-btn">
          <svg class="btn-icon save-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <path d="M17 21v-8H7v8"></path>
            <path d="M7 3v5h8"></path>
          </svg>
          Save configuration
        </button>
      </form>
    </main>

    <QrCodeScanner v-if="isQrScannerOpen" @close="closeScanner" @scanned="handleScan" />

    <div v-if="isResetDialogOpen" class="reset-dialog-overlay" @click.self="isResetDialogOpen = false">
      <div class="reset-dialog-card">
        <h3 class="reset-dialog-title">Reset onboarding?</h3>
        <p class="reset-dialog-message">
          This will permanently delete all app data on this device, including server configuration, credentials, PIN, and cached delivery data.
        </p>
        <div class="reset-dialog-actions">
          <button type="button" class="secondary-btn" @click="isResetDialogOpen = false">Cancel</button>
          <button type="button" class="danger-btn reset-confirm-btn" @click="resetOnboarding">Delete all data</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import MenuTop from '../../components/menutop/index.vue';
import QrCode from '../../components/qrcode/generator/index.vue';
import QrCodeScanner from '../../components/qrcode/scanner/index.vue';
import { isWebcamScannerOpen } from '../../util/barcodeScanner.js';
import { store, storeActions } from '../../util/store.js';

const router = useRouter();
const activeMode = ref('basic');
const isTesting = ref(false);
const testResult = ref(null);
const copyStatus = ref('');
const showQrCode = ref(false);
const isQrScannerOpen = ref(false);
const isResetDialogOpen = ref(false);

const localConfig = ref({
  baseHost: store.config.baseHost,
  poPath: store.config.poPath,
  grPath: store.config.grPath,
  username: store.config.username,
  password: store.config.password,
  networkTimeoutMs: store.config.networkTimeoutMs,
  useDummyData: store.config.useDummyData,
  sapClient: store.config.sapClient || ''
});

const normalizeHost = (host) => (host || '').trim().replace(/\/+$/, '');
const normalizePath = (path) => {
  const cleaned = (path || '').trim();
  if (!cleaned) return '/';
  return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
};

const sharePayload = computed(() => ({
  baseHost: normalizeHost(localConfig.value.baseHost),
  poPath: normalizePath(localConfig.value.poPath),
  grPath: normalizePath(localConfig.value.grPath),
  username: localConfig.value.username || '',
  password: localConfig.value.password || '',
  networkTimeoutMs: Number(localConfig.value.networkTimeoutMs) || 5000,
  useDummyData: !!localConfig.value.useDummyData,
  sapClient: localConfig.value.sapClient || ''
}));

const qrCodeValue = computed(() => JSON.stringify(sharePayload.value));

const openScannerAction = () => {
  isWebcamScannerOpen.value = true;
  isQrScannerOpen.value = true;
};

const closeScanner = () => {
  isWebcamScannerOpen.value = false;
  isQrScannerOpen.value = false;
};

const applyLegacyOdataUrl = (odataUrl) => {
  try {
    const parsed = new URL(odataUrl);
    localConfig.value.baseHost = `${parsed.protocol}//${parsed.host}`;
    if (parsed.pathname) {
      localConfig.value.poPath = parsed.pathname;
      localConfig.value.grPath = parsed.pathname;
    }
  } catch (error) {
    localConfig.value.baseHost = odataUrl;
  }
};

const handleScan = (scanData) => {
  if (!scanData || typeof scanData !== 'object') {
    closeScanner();
    return;
  }

  if (scanData.odataUrl && !scanData.baseHost) {
    applyLegacyOdataUrl(scanData.odataUrl);
  }

  if (scanData.baseHost) localConfig.value.baseHost = String(scanData.baseHost);
  if (scanData.poPath) localConfig.value.poPath = String(scanData.poPath);
  if (scanData.grPath) localConfig.value.grPath = String(scanData.grPath);
  if (scanData.username !== undefined) localConfig.value.username = String(scanData.username || '');
  if (scanData.password !== undefined) localConfig.value.password = String(scanData.password || '');
  if (scanData.networkTimeoutMs !== undefined) localConfig.value.networkTimeoutMs = Number(scanData.networkTimeoutMs) || 5000;
  if (scanData.sapClient !== undefined) localConfig.value.sapClient = String(scanData.sapClient || '');
  if (scanData.useDummyData !== undefined) localConfig.value.useDummyData = !!scanData.useDummyData;

  closeScanner();
};

const getNormalizedConfig = () => ({
  baseHost: normalizeHost(localConfig.value.baseHost),
  poPath: normalizePath(localConfig.value.poPath),
  grPath: normalizePath(localConfig.value.grPath),
  username: (localConfig.value.username || '').trim(),
  password: localConfig.value.password || '',
  networkTimeoutMs: Number(localConfig.value.networkTimeoutMs) || 5000,
  useDummyData: !!localConfig.value.useDummyData,
  sapClient: (localConfig.value.sapClient || '').trim()
});

const testServiceMetadata = async (baseUrl, username, password, timeoutMs) => {
  const brokerUrl = '/api/net/request';
  const endpoint = `${baseUrl}/$metadata`;
  const normalizedHeaders = { Accept: 'application/xml, text/xml' };

  if (username) {
    const encoded = btoa(`${username}:${password || ''}`);
    normalizedHeaders.Authorization = `Basic ${encoded}`;
  }

  const proxyEnvelope = {
    timeout_ms: timeoutMs || 15000,
    request: {
      url: endpoint,
      method: 'GET',
      headers: normalizedHeaders
    }
  };

  const brokerResponse = await fetch(brokerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(proxyEnvelope)
  });

  if (!brokerResponse.ok) return false;

  const resultWrapper = await brokerResponse.json();
  if (resultWrapper.status !== 200) return false;

  const text = resultWrapper.body || '';
  return text.includes('Edmx');
};

const runDiagnostics = async () => {
  const config = getNormalizedConfig();

  isTesting.value = true;
  testResult.value = null;

  storeActions.saveODataConfig(
    config.baseHost,
    config.poPath,
    config.grPath,
    config.username,
    config.password,
    config.networkTimeoutMs,
    config.useDummyData,
    config.sapClient
  );

  try {
    const registerUrl = `${config.baseHost}${config.poPath}`;
    const goodsReceiptUrl = `${config.baseHost}${config.grPath}`;

    const registerOk = await testServiceMetadata(
      registerUrl,
      config.username,
      config.password,
      config.networkTimeoutMs
    );

    const goodsReceiptOk = await testServiceMetadata(
      goodsReceiptUrl,
      config.username,
      config.password,
      config.networkTimeoutMs
    );

    if (registerOk && goodsReceiptOk) {
      testResult.value = {
        status: 'success',
        message: 'Connected to both Register Delivery and Goods Receipt services.'
      };
    } else {
      const failedService = !registerOk ? 'Register Delivery service' : 'Goods Receipt service';
      throw new Error(`${failedService} metadata check failed.`);
    }
  } catch (error) {
    testResult.value = {
      status: 'failed',
      message: `Connection failed: ${error.message}`
    };
  } finally {
    isTesting.value = false;
  }
};

const copySharePayload = async () => {
  try {
    await navigator.clipboard.writeText(qrCodeValue.value);
    copyStatus.value = 'Configuration JSON copied to clipboard.';
    setTimeout(() => {
      copyStatus.value = '';
    }, 1500);
  } catch (error) {
    copyStatus.value = 'Clipboard is not available on this device/browser.';
  }
};

const handleSaveConfig = () => {
  const config = getNormalizedConfig();

  storeActions.saveODataConfig(
    config.baseHost,
    config.poPath,
    config.grPath,
    config.username,
    config.password,
    config.networkTimeoutMs,
    config.useDummyData,
    config.sapClient
  );

  router.push('/home');
};

const resetOnboarding = () => {
  isResetDialogOpen.value = false;

  storeActions.resetStore();
  localConfig.value = {
    baseHost: store.config.baseHost,
    poPath: store.config.poPath,
    grPath: store.config.grPath,
    username: store.config.username,
    password: store.config.password,
    networkTimeoutMs: store.config.networkTimeoutMs,
    useDummyData: store.config.useDummyData,
    sapClient: store.config.sapClient || ''
  };
  activeMode.value = 'basic';
  showQrCode.value = false;
  testResult.value = null;
  copyStatus.value = '';
  router.replace('/enroll');
};
</script>

<style scoped>
.config-view {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  box-sizing: border-box;
}

.content-workspace {
  padding-top: 5.25rem !important;
  padding-left: 1rem;
  padding-right: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.config-form {
  width: 100%;
  max-width: 460px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 1.5rem;
}

.page-header {
  border: 1px solid var(--border-color);
  background-color: var(--surface-color);
  border-radius: 10px;
  padding: 0.95rem 1rem;
}

.page-title {
  margin: 0;
  font-size: 1rem;
  color: var(--text-main);
}

.page-subtitle {
  margin: 0.35rem 0 0;
  color: var(--text-muted);
  font-size: 0.86rem;
  line-height: 1.35;
}

.mode-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.mode-btn {
  border: 1px solid var(--border-color);
  background: var(--surface-color);
  color: var(--text-main);
  padding: 0.72rem 0.9rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
}

.mode-btn.active {
  border-color: var(--accent-color);
  color: var(--accent-color);
  box-shadow: inset 0 0 0 1px var(--accent-color);
}

.mode-panel {
  border: 1px solid var(--border-color);
  background-color: var(--surface-color);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--text-muted);
}

.required-indicator {
  color: #d14343;
  margin-left: 0.2rem;
}

.form-input {
  width: 100%;
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  border-radius: 8px;
  padding: 0.78rem 0.92rem;
  font-size: 0.92rem;
  box-sizing: border-box;
  outline: none;
}

.form-input:focus {
  border-color: var(--accent-color);
}

.mode-hint {
  margin: 0.15rem 0 0;
  color: var(--text-muted);
  font-size: 0.78rem;
}

.action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}

.secondary-btn {
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-main);
  padding: 0.72rem 0.78rem;
  border-radius: 8px;
  font-size: 0.86rem;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.42rem;
}

.secondary-btn:disabled {
  opacity: 0.6;
}

.btn-icon {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
}

.share-card {
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.95rem;
  background: linear-gradient(180deg, #ffffff 0%, var(--surface-alt) 100%);
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.share-title {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-main);
}

.share-description {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.8rem;
  line-height: 1.35;
}

.qr-block {
  border: 1px dashed var(--border-color);
  border-radius: 10px;
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background: #f8fbff;
}

.qr-frame {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #d9e5f3;
  padding: 0.5rem;
}

.qr-caption {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.status-banner {
  padding: 0.7rem 0.8rem;
  border-radius: 8px;
  font-size: 0.82rem;
  text-align: center;
  line-height: 1.35;
}

.status-banner.success {
  background-color: rgba(18, 141, 84, 0.1);
  border: 1px solid rgba(18, 141, 84, 0.3);
  color: #0a8f56;
}

.status-banner.failed {
  background-color: rgba(209, 67, 67, 0.1);
  border: 1px solid rgba(209, 67, 67, 0.3);
  color: #ba2f2f;
}

.save-config-btn {
  border: none;
  background-color: var(--accent-color);
  color: var(--accent-contrast);
  padding: 0.92rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.48rem;
}

.danger-btn {
  border: 1px solid rgba(209, 67, 67, 0.4);
  background-color: rgba(209, 67, 67, 0.08);
  color: #ba2f2f;
  padding: 0.75rem 0.8rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
}

.reset-dialog-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(17, 24, 39, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  box-sizing: border-box;
}

.reset-dialog-card {
  width: 100%;
  max-width: 400px;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.reset-dialog-title {
  margin: 0;
  font-size: 1rem;
  color: var(--text-main);
}

.reset-dialog-message {
  margin: 0;
  font-size: 0.84rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.reset-dialog-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.55rem;
}

.reset-confirm-btn {
  padding-top: 0.72rem;
  padding-bottom: 0.72rem;
}

.save-icon {
  width: 17px;
  height: 17px;
  flex-basis: 17px;
}

.spinner-icon {
  width: 13px;
  height: 13px;
  border: 2px solid var(--text-muted);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
