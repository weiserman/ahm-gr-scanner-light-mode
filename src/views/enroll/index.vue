<template>
  <div class="view-wrapper enroll-wrapper">
    <p class="enroll-kicker">Onboarding</p>
    <h1 class="view-header">Welcome to GR App</h1>
    <p class="enroll-subtitle">
      Please provide your SAP Username and Password,<br>
      this will be secured by a PIN.
    </p>

    <div class="quick-action-row">
      <button type="button" class="scan-btn" @click="openScannerAction">
        <svg class="scan-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h5M4 4v5M20 4h-5M20 4v5M4 20h5M4 20v-5M20 20h-5M20 20v-5"></path>
          <path d="M8 12h8"></path>
        </svg>
        Scan config QR code
      </button>
    </div>

    <div class="enroll-panel">
      <form class="enroll-form" @submit.prevent="handleEnroll">
        <div class="form-group">
          <label class="form-label" for="enroll-username">SAP Username</label>
          <input
            id="enroll-username"
            v-model.trim="localConfig.username"
            class="form-input"
            type="text"
            autocomplete="username"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="enroll-password">SAP Password</label>
          <input
            id="enroll-password"
            v-model="localConfig.password"
            class="form-input"
            type="password"
            autocomplete="current-password"
            required
          />
        </div>

        <button type="submit" class="submit-btn">Continue to PIN setup</button>
      </form>
    </div>

    <div v-if="scanStatus" class="scan-status">{{ scanStatus }}</div>
  </div>

  <QrCodeScanner v-if="isQrScannerOpen" @close="closeScanner" @scanned="handleScan" />
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import QrCodeScanner from '../../components/qrcode/scanner/index.vue';
import { isWebcamScannerOpen } from '../../util/barcodeScanner.js';
import { store, storeActions } from '../../util/store.js';

const router = useRouter();
const isQrScannerOpen = ref(false);
const scanStatus = ref('');

const localConfig = reactive({
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

const proceedAfterConfigSave = () => {
  const pinExists = store.appPin !== null && store.appPin !== undefined && store.appPin !== '';
  router.push(pinExists ? '/enter' : '/setup');
};

const handleEnroll = () => {
  storeActions.saveODataConfig(
    normalizeHost(localConfig.baseHost),
    normalizePath(localConfig.poPath),
    normalizePath(localConfig.grPath),
    localConfig.username,
    localConfig.password,
    localConfig.networkTimeoutMs,
    localConfig.useDummyData,
    localConfig.sapClient
  );

  proceedAfterConfigSave();
};

const openScannerAction = () => {
  scanStatus.value = '';
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
    localConfig.baseHost = `${parsed.protocol}//${parsed.host}`;
    if (parsed.pathname) {
      localConfig.poPath = parsed.pathname;
      localConfig.grPath = parsed.pathname;
    }
  } catch (error) {
    localConfig.baseHost = odataUrl;
  }
};

const handleScan = (scanData) => {
  if (!scanData || typeof scanData !== 'object') {
    closeScanner();
    scanStatus.value = 'Scanned QR code is not a valid configuration payload.';
    return;
  }

  if (scanData.odataUrl && !scanData.baseHost) {
    applyLegacyOdataUrl(scanData.odataUrl);
  }

  if (scanData.baseHost) localConfig.baseHost = String(scanData.baseHost);
  if (scanData.poPath) localConfig.poPath = String(scanData.poPath);
  if (scanData.grPath) localConfig.grPath = String(scanData.grPath);
  if (scanData.username !== undefined) localConfig.username = String(scanData.username || '');
  if (scanData.password !== undefined) localConfig.password = String(scanData.password || '');
  if (scanData.networkTimeoutMs !== undefined) localConfig.networkTimeoutMs = Number(scanData.networkTimeoutMs) || 5000;
  if (scanData.sapClient !== undefined) localConfig.sapClient = String(scanData.sapClient || '');
  if (scanData.useDummyData !== undefined) localConfig.useDummyData = !!scanData.useDummyData;

  closeScanner();

  const username = (localConfig.username || '').trim();
  const password = localConfig.password || '';
  if (!username || !password) {
    scanStatus.value = 'Config imported. Add SAP username and password to continue.';
    return;
  }

  storeActions.saveODataConfig(
    normalizeHost(localConfig.baseHost),
    normalizePath(localConfig.poPath),
    normalizePath(localConfig.grPath),
    username,
    password,
    Number(localConfig.networkTimeoutMs) || 5000,
    !!localConfig.useDummyData,
    (localConfig.sapClient || '').trim()
  );
  scanStatus.value = 'Configuration imported from QR code.';
  proceedAfterConfigSave();
};
</script>

<style scoped>
.enroll-wrapper {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.25rem 1rem 1.75rem;
  box-sizing: border-box;
}

.enroll-kicker {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
}

.view-header {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  color: #0f172a;
}

.enroll-subtitle {
  margin: 0.35rem 0 0;
  text-align: center;
  color: #475569;
  font-size: 0.9rem;
}

.enroll-panel {
  margin-top: 1rem;
  width: 100%;
  max-width: 340px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border: 1px solid #dbe3ec;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
  padding: 1rem;
}

.quick-action-row {
  margin-top: 0.9rem;
  width: 100%;
  max-width: 340px;
}

.scan-btn {
  width: 100%;
  border: 1px solid #dbe3ec;
  background: #ffffff;
  color: #0f172a;
  border-radius: 10px;
  padding: 0.72rem 0.9rem;
  font-size: 0.88rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.42rem;
}

.scan-icon {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
}

.enroll-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.form-label {
  font-size: 0.82rem;
  color: #64748b;
  font-weight: 600;
}

.form-input {
  width: 100%;
  border: 1px solid #dbe3ec;
  border-radius: 10px;
  padding: 0.72rem 0.8rem;
  background-color: #ffffff;
  color: #0f172a;
  box-sizing: border-box;
  font-size: 0.9rem;
}

.form-input:focus {
  outline: none;
  border-color: #0a6ed1;
  box-shadow: 0 0 0 2px rgba(10, 110, 209, 0.2);
}

.submit-btn {
  margin-top: 0.5rem;
  border: none;
  border-radius: 10px;
  padding: 0.8rem 0.95rem;
  cursor: pointer;
  background-color: #0a6ed1;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.92rem;
  transition: background-color 0.15s ease;
}

.submit-btn:hover {
  background-color: #0854a0;
}

.scan-status {
  margin-top: 0.75rem;
  width: 100%;
  max-width: 340px;
  border-radius: 10px;
  background-color: rgba(18, 141, 84, 0.08);
  border: 1px solid rgba(18, 141, 84, 0.25);
  color: #0a8f56;
  padding: 0.7rem 0.8rem;
  font-size: 0.82rem;
  line-height: 1.35;
  box-sizing: border-box;
}

@media (max-width: 380px) {
  .view-header {
    font-size: 1.45rem;
  }

  .enroll-subtitle {
    font-size: 0.82rem;
  }

  .enroll-panel {
    padding: 0.9rem;
  }
}
</style>
