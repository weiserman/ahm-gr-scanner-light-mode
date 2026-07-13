<template>
  <div class="app-layout config-view">
    <MenuTop title="SERVER CONFIG" />
    <main class="app-content content-workspace">
      <form class="config-form" @submit.prevent="handleSaveConfig">
	      <!--
        <div class="form-group">
          <label class="form-label">OData Catalog Endpoint URL</label>
          <div class="input-container">
            <input type="url" v-model="localConfig.odataUrl" placeholder="http://localhost:4004/odata/v4/catalog" class="form-input" required />
          </div>
        </div>
	      -->
<!-- REPLACE the existing "OData Catalog Endpoint URL" form-group with these three: -->

<!-- Field 1: Base Host -->
<div class="form-group">
  <label class="form-label">SAP Host URL<span class="required-indicator">*</span></label>
  <div class="input-container">
    <input 
      type="url" 
      v-model="localConfig.baseHost" 
      placeholder="https://s4hana.example.com:44300" 
      class="form-input" 
      required 
    />
  </div>
</div>

<!-- Field 2: Register Service Path -->
<div class="form-group">
  <label class="form-label">Register Delivery Service Path<span class="required-indicator">*</span></label>
  <div class="input-container">
    <input 
      type="text" 
      v-model="localConfig.poPath" 
      placeholder="/sap/opu/odata4/sap/zgr_ui_poscan_o4/..." 
      class="form-input" 
      required 
    />
  </div>
</div>

<!-- Field 3: Goods Receipt Service Path -->
<div class="form-group">
  <label class="form-label">Goods Receipt Service Path<span class="required-indicator">*</span></label>
  <div class="input-container">
    <input 
      type="text" 
      v-model="localConfig.grPath" 
      placeholder="/sap/opu/odata4/sap/zgr_grdoc_api/..." 
      class="form-input" 
      required 
    />
  </div>
</div>

<!-- ADD this field for SAP Client (Optional but recommended) -->
<div class="form-group">
  <label class="form-label">SAP Client</label>
  <div class="input-container">
    <input 
      type="text" 
      v-model="localConfig.sapClient" 
      placeholder="100" 
      class="form-input" 
    />
  </div>
</div>   
        <div class="form-group">
          <label class="form-label">Basic Auth Username</label>
          <div class="input-container">
            <input type="text" v-model="localConfig.username" placeholder="Enter username" class="form-input" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Basic Auth Password</label>
          <div class="input-container">
            <input type="password" v-model="localConfig.password" placeholder="Enter password" class="form-input" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Network Timeout(ms)</label>
          <div class="input-container">
            <input type="number" v-model.number="localConfig.networkTimeoutMs" placeholder="5000" class="form-input" required />
          </div>
        </div>

        <!--Field 5:Development Mock Data Toggle-->
	<!--
        <div class="form-group toggle-field-row">
          <label class="form-label check-label">
            <input type="checkbox" v-model="localConfig.useDummyData" class="form-checkbox" />
            Activate Offline Development Mode(Use Dummy Data)
          </label>
        </div>
	-->

        <!--Connection Diagnostics Feedback Banner Panel-->
        <div v-if="testResult" class="status-banner" :class="testResult.status">{{ testResult.message }}</div>
        <div v-if="saveSuccess" class="status-banner success">Configuration parameters updated and locked successfully!</div>

        <!--Diagnostic Testing Control Trigger-->
        <button type="button" class="connectivity-test-btn" :disabled="isTesting" @click="runDiagnostics">
		<svg v-if="!isTesting" class="btn-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
		  <!-- Main Lightning Bolt -->
		  <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polyline>
		  
		  <!-- Spark Accents -->
		  <line x1="3" y1="3" x2="5" y2="5"></line>
		  <line x1="21" y1="3" x2="19" y2="5"></line>
		</svg>
          <span v-if="isTesting" class="spinner-icon"></span>
          {{ isTesting ? 'Pinging...' : 'Test' }}
        </button>

        <!-- Share Configuration Action -->
        <button type="button" class="share-qr-btn" @click="toggleQrCode">
          <svg class="btn-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
            <polygon points="14 14 17 14 17 17 14 17"></polygon>
            <polygon points="17 17 21 17 21 21 17 21"></polygon>
            <polygon points="14 19 17 19 17 21 14 21"></polygon>
            <polygon points="19 14 21 14 21 17 19 17"></polygon>
          </svg>
          Share
        </button>

        <!-- Scan QR Configuration -->
        <button type="button" class="share-qr-btn" @click="isQrScannerOpen = true">
          <svg class="btn-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
            <polygon points="14 14 17 14 17 17 14 17"></polygon>
            <polygon points="17 17 21 17 21 21 17 21"></polygon>
            <polygon points="14 19 17 19 17 21 14 21"></polygon>
            <polygon points="19 14 21 14 21 17 19 17"></polygon>
          </svg>
          Scan
        </button>

        <button type="submit" class="save-config-btn">
          <svg class="btn-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          Save
        </button>



      </form>
    </main>

    <!-- Full-Screen Interactive Overlay Panel -->
    <div v-if="showQrCode" class="qr-overlay" @click="toggleQrCode">
      <div class="qr-modal-card">
        <div class="qr-wrapper">
          <QrCode :text="qrCodeValue" :size="260" color="#FFFFFF" />
        </div>
        <p class="qr-caption">Scan to transfer settings</p>
        <p class="qr-sub-caption">Click anywhere to close</p>
      </div>
    </div>

    <QrCodeScanner 
      v-if="isQrScannerOpen" 
      @close="closeScanner"
      @scanned="handleScan"
    />

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import MenuTop from '../../components/menutop/index.vue';
import QrCode from '../../components/qrcode/generator/index.vue';
import QrCodeScanner from '../../components/qrcode/scanner/index.vue';
import { store, storeActions } from '../../util/store.js';
import { testODataConnection } from '../../util/odata.js';
import { isWebcamScannerOpen } from '../../util/barcodeScanner.js';

const router = useRouter();
const saveSuccess = ref(false);
const isTesting = ref(false);
const testResult = ref(null);
const showQrCode = ref(false);
const isQrScannerOpen = ref(false);
//const closeScanner = () => {
//	isQrScannerOpen.value = false;
//};
//const handleScan = (scanData) => {
//  console.log("Applying scanned parameters to local config form:", scanData);
//
//  // Safely guard against empty or corrupted scan payloads
//  if (scanData) {
//    // Direct mapping to update your form's reactive input elements
//    if (scanData.odataUrl) localConfig.value.odataUrl = scanData.odataUrl;
//    if (scanData.username) localConfig.value.username = scanData.username;
//    if (scanData.password) localConfig.value.password = scanData.password;
//    if (scanData.networkTimeoutMs) localConfig.value.networkTimeoutMs = Number(scanData.networkTimeoutMs);
//    
//    // Explicitly handle Boolean state updates
//    if (typeof scanData.useDummyData !== 'undefined') {
//      localConfig.value.useDummyData = !!scanData.useDummyData;
//    }
//  }
//
//  // Dismiss the fullscreen camera scanner overlay
//  isQrScannerOpen.value = false;
//};
// 3. Update handleScan to read new fields from QR
//const handleScan = (scanData) => {
//  if (scanData) {
//    if (scanData.baseHost) localConfig.value.baseHost = scanData.baseHost;
//    if (scanData.poPath) localConfig.value.poPath = scanData.poPath;
//    if (scanData.grPath) localConfig.value.grPath = scanData.grPath;
//    if (scanData.username) localConfig.value.username = scanData.username;
//    if (scanData.password) localConfig.value.password = scanData.password;
//    if (scanData.networkTimeoutMs) localConfig.value.networkTimeoutMs = Number(scanData.networkTimeoutMs);
//    if (scanData.sapClient) localConfig.value.sapClient = String(scanData.sapClient);
//    if (typeof scanData.useDummyData !== 'undefined') {
//      localConfig.value.useDummyData = !!scanData.useDummyData;
//    }
//  }
//  isQrScannerOpen.value = false;
//};

// Update your open scanner logic:
const openScannerAction = () => {
  isWebcamScannerOpen.value = true;
  isQrScannerOpen.value = true;
};

// Update your existing close scanner function:
const closeScanner = () => {
  isWebcamScannerOpen.value = false;
  isQrScannerOpen.value = false;
};

// Update your existing handleScan success callback:
const handleScan = (scanData) => {
  if (scanData) {
    if (scanData.baseHost) localConfig.value.baseHost = scanData.baseHost;
    if (scanData.poPath) localConfig.value.poPath = scanData.poPath;
    if (scanData.grPath) localConfig.value.grPath = scanData.grPath;
    if (scanData.username) localConfig.value.username = scanData.username;
    if (scanData.password) localConfig.value.password = scanData.password;
    if (scanData.networkTimeoutMs) localConfig.value.networkTimeoutMs = Number(scanData.networkTimeoutMs);
    if (scanData.sapClient) localConfig.value.sapClient = String(scanData.sapClient);
    if (typeof scanData.useDummyData !== 'undefined') {
      localConfig.value.useDummyData = !!scanData.useDummyData;
    }
  }
  
  // Release focus control back to the global guardian component
  isWebcamScannerOpen.value = false;
  isQrScannerOpen.value = false;
};

//const localConfig = ref({
//  odataUrl: store.config.odataUrl,
//  username: store.config.username,
//  password: store.config.password,
//  networkTimeoutMs: store.config.networkTimeoutMs,
//  useDummyData: store.config.useDummyData
//});
// 1. Update localConfig initialization to match new store structure
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

//const qrCodeValue = computed(() => {
//  return JSON.stringify(localConfig.value);
//});
// 2. Update QR Code generation to include new fields
const qrCodeValue = computed(() => {
  return JSON.stringify({
    baseHost: localConfig.value.baseHost,
    poPath: localConfig.value.poPath,
    grPath: localConfig.value.grPath,
    username: localConfig.value.username,
    password: localConfig.value.password,
    networkTimeoutMs: localConfig.value.networkTimeoutMs,
    useDummyData: localConfig.value.useDummyData,
    sapClient: localConfig.value.sapClient
  });
});

const toggleQrCode = () => {
  showQrCode.value = !showQrCode.value;
};

//const runDiagnostics = async () => {
//  isTesting.value = true;
//  testResult.value = null;
//  storeActions.saveODataConfig(localConfig.value.odataUrl, localConfig.value.username, localConfig.value.password, localConfig.value.networkTimeoutMs);
//  try {
//    const res = await testODataConnection();
//    testResult.value = { status: 'success', message: res.message };
//  } catch (error) {
//    testResult.value = { status: 'failed', message: `Connection Failed:${error.message}` };
//  } finally {
//    isTesting.value = false;
//  }
//};
// 4. Update runDiagnostics to test BOTH services
const runDiagnostics = async () => {
  isTesting.value = true;
  testResult.value = null;

  // Save temp config to store so odata.js can access it
  storeActions.saveODataConfig(
    localConfig.value.baseHost,
    localConfig.value.poPath,
    localConfig.value.grPath,
    localConfig.value.username,
    localConfig.value.password,
    localConfig.value.networkTimeoutMs,
    localConfig.value.useDummyData,
    localConfig.value.sapClient
  );

  try {
    // Construct full URLs for testing
    const registerUrl = `${localConfig.value.baseHost.replace(/\/$/, '')}${localConfig.value.poPath}`;
    const grUrl = `${localConfig.value.baseHost.replace(/\/$/, '')}${localConfig.value.grPath}`;
    
    // Test Register Service Metadata
    console.log(`[DIAGNOSTIC] Testing Register Service: ${registerUrl}/$metadata`);
    // Note: You may need to update testODataConnection in odata.js to accept a URL argument
    // For now, we assume odataFetch uses the store config which we just updated.
    // A robust way is to fetch manually here or update testODataConnection.
    
    // Simplified approach: Call a modified testODataConnection that returns details
    // OR manually fetch metadata using a helper if testODataConnection is rigid.
    // Assuming we update odata.js to allow passing a specific URL to test:
   
//todo: sort out webview concurrent request interference 
//    const results = await Promise.all([
//      testServiceMetadata(registerUrl),
//      testServiceMetadata(grUrl)
//    ]);
    let results=[];
    results.push(await testServiceMetadata(registerUrl))
    results.push(await testServiceMetadata(grUrl))

    if (results[0] && results[1]) {
      testResult.value = { 
        status: 'success', 
        message: 'Connected to BOTH Register and Goods Receipt services successfully!' 
      };
    } else {
      throw new Error(!results[0] ? 'Register Service failed' : 'Goods Receipt Service failed');
    }

  } catch (error) {
    testResult.value = { 
      status: 'failed', 
      message: `Connection Failed: ${error.message}` 
    };
  } finally {
    isTesting.value = false;
  }
};

// Helper to test a specific URL's metadata
//const testServiceMetadata = async (baseUrl) => {
//  try {
//    // Re-using internal logic similar to odataFetch but strictly for testing metadata
//    const endpoint = `${baseUrl}/$metadata`;
//    const headers = new Headers();
//    headers.set('Accept', 'application/xml, text/xml');
//    if (localConfig.value.username) {
//      const encoded = btoa(`${localConfig.value.username}:${localConfig.value.password || ''}`);
//      headers.set('Authorization', `Basic ${encoded}`);
//    }
//    if (localConfig.value.sapClient) {
//       // Append client if needed for metadata
//       // Note: fetch doesn't auto append query params, must be in URL string if needed
//       // Usually metadata works without client, but safe to add if strict.
//    }
//    
//    const controller = new AbortController();
//    setTimeout(() => controller.abort(), localConfig.value.networkTimeoutMs);
//
//    const response = await fetch(endpoint, { 
//      method: 'GET', 
//      headers, 
//      signal: controller.signal,
//      mode: 'cors'
//    });
//
//    if (!response.ok) return false;
//    const text = await response.text();
//    return text.includes('Edmx'); // Basic validation
//  } catch (e) {
//    console.error(`Test failed for ${baseUrl}:`, e);
//    return false;
//  }
//};
const testServiceMetadata = async (baseUrl) => {
  try {
    const BROKER_URL = "/api/net/request";
    const endpoint = `${baseUrl}/$metadata`;
    
    // 1. Establish the clean, case-normalized headers dictionary context map
    const normalizedHeaders = {
      "Accept": "application/xml, text/xml"
    };

    if (localConfig.value.username) {
      const encoded = btoa(`${localConfig.value.username}:${localConfig.value.password || ''}`);
      normalizedHeaders["Authorization"] = `Basic ${encoded}`;
    }

    // 2. Package everything explicitly into your native orchestration request envelope structure
    const proxyEnvelope = {
      "timeout_ms": localConfig.value.networkTimeoutMs || 15000,
      "request": {
        "url": endpoint,
        "method": "GET",
        "headers": normalizedHeaders
      }
    };

    // 3. Dispatch standard Same-Origin fetch payload directly to your local proxy broker endpoint
    const brokerResponse = await fetch(BROKER_URL, {
      method: 'POST',
      headers: {
        //'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(proxyEnvelope)
    });

    if (!brokerResponse.ok) {
      console.error(`Local Proxy Broker channel unreachable during diagnostics metadata sweep.`);
      return false;
    }

    // 4. Unpack your inner wrapper envelope return payload body string text array
    const resultWrapper = await brokerResponse.json();
    
    // A standard operational response code of 200 OK from the downstream target means delivery cleared safely
    if (resultWrapper.status !== 200) {
      console.warn(`Downstream diagnostic metadata target failed with remote status code: ${resultWrapper.status}`);
      return false;
    }

    const text = resultWrapper.body || "";
    console.log(text);
    return text.includes('Edmx'); // Standard basic schema structure validation check pass criteria
  } catch (e) {
    console.error(`Test failed for ${baseUrl}:`, e);
    return false;
  }
};


//const handleSaveConfig = () => {
//  storeActions.saveODataConfig(localConfig.value.odataUrl, localConfig.value.username, localConfig.value.password, localConfig.value.networkTimeoutMs, localConfig.value.useDummyData);
//  saveSuccess.value = true;
//  setTimeout(() => {
//    saveSuccess.value = false;
//    router.push('/home');
//  }, 1200);
//};
// 5. Update handleSaveConfig
const handleSaveConfig = () => {
  storeActions.saveODataConfig(
    localConfig.value.baseHost,
    localConfig.value.poPath,
    localConfig.value.grPath,
    localConfig.value.username,
    localConfig.value.password,
    localConfig.value.networkTimeoutMs,
    localConfig.value.useDummyData,
    localConfig.value.sapClient
  );
  saveSuccess.value = true;
  router.push('/home');
};
</script>

<style scoped>
.config-view {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  box-sizing: border-box;
  position: relative;
}
.content-workspace {
  padding-top: 5.5rem !important;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
  width: 100%;
  box-sizing: border-box;
}
.config-form {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin: 0 auto;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-muted, #6b7280);
  text-align: left;
}
.input-container {
  width: 100%;
}
.form-input {
  width: 100%;
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  border-radius: 6px;
  padding: 0.85rem 1rem;
  font-size: 0.95rem;
  box-sizing: border-box;
  outline: none;
}
.form-input:focus {
  border-color: var(--accent-color);
}
.status-banner {
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  text-align: center;
  line-height: 1.3;
}
.status-banner.success {
  background-color: rgba(22, 163, 74, 0.1);
  border: 1px solid rgba(22, 163, 74, 0.3);
  color: var(--accent-color);
}
.status-banner.failed {
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
}
.connectivity-test-btn {
  background-color: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  font-size: 0.95rem;
  font-weight: bold;
  padding: 0.85rem;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-sizing: border-box;
}
.connectivity-test-btn:active {
  background-color: var(--border-color);
}
.save-config-btn {
  background-color: var(--accent-color);
  color: var(--text-main);
  border: none;
  border-radius: 6px;
  padding: 0.9rem;
  font-size: 1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.15);
}

.connectivity-test-btn{
  background-color: transparent;
  border: 1px solid var(--accent-color, #16a34a);
  color: var(--accent-color, #16a34a);
  font-size: 0.95rem;
  font-weight: bold;
  padding: 0.85rem;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-sizing: border-box;
  margin-top: 0.5rem;

}

.connectivity-test-btn:active {
  background-color: rgba(22, 163, 74, 0.12);
}

.share-qr-btn {
  background-color: transparent;
  border: 1px solid var(--accent-color, #16a34a);
  color: var(--accent-color, #16a34a);
  font-size: 0.95rem;
  font-weight: bold;
  padding: 0.85rem;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-sizing: border-box;
  margin-top: 0.5rem;
}
.share-qr-btn:active {
  background-color: rgba(22, 163, 74, 0.12);
}

/* Full-Screen Semi-Transparent Overlay */
.qr-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(17, 24, 39, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1.5rem;
  box-sizing: border-box;
  cursor: pointer;
}

/* Centered Layout Card with Minor Padding */
.qr-modal-card {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 320px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(17, 24, 39, 0.12);
  box-sizing: border-box;
}

.qr-wrapper {
  padding: 0.5rem;
  background-color: transparent;
}

.qr-caption {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
  text-align: center;
}

.qr-sub-caption {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
  text-align: center;
}

.spinner-icon {
  width: 14px;
  height: 14px;
  border: 2px solid var(--text-muted);
  border-top-color: var(--text-main);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

