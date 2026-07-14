<template>
  <div class="app-layout register-delivery-view">
    <!--Reusable Top Navigation Bar Component-->
    <MenuTop title="REGISTER DELIVERY" />

    <!--Main Entry Form Container Workspace-->
    <main class="app-content content-workspace">
      <form class="delivery-form" @submit.prevent="handleSubmit">
        
        <!--Field 1:Storage Location Selection Group-->
        <div class="form-group">
          <label class="form-label">Storage Location<span class="required-indicator">*</span></label>
          <div class="input-container select-wrapper">
            <select v-model="formData.storageLocation" class="form-input custom-select" :disabled="isLoading">
              <option value="0001">0001 - Standard SLoc</option>
              <option value="0002">0002 - Secondary SLoc</option>
            </select>
          </div>
        </div>

        <!--Field 2:PO/STO/DC Tracking Field-->
        <div class="form-group">
          <label class="form-label">PO / STO / DC Delivery Number<span class="required-indicator">*</span></label>
          <div class="input-container scan-input-container">
            <input 
              type="text" 
              v-model="formData.deliveryNumber" 
              placeholder="Enter or scan a PO, STO, or DC delivery number" 
              class="form-input form-input-with-action"
              :disabled="isLoading"
              required
            />
            <button
              type="button"
              class="input-action-btn"
              :disabled="isLoading"
              aria-label="Scan PO, STO, or DC delivery number"
              @click="openScannerAction"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M4 7V5a1 1 0 0 1 1-1h2"></path>
                <path d="M20 7V5a1 1 0 0 0-1-1h-2"></path>
                <path d="M4 17v2a1 1 0 0 0 1 1h2"></path>
                <path d="M20 17v2a1 1 0 0 1-1 1h-2"></path>
                <path d="M7 12h10"></path>
                <path d="M9 9h6"></path>
                <path d="M9 15h6"></path>
              </svg>
            </button>
          </div>
          <p class="field-hint">Type it in manually or tap the scan icon to use the phone camera.</p>
        </div>

        <!--Field 3:Optional Delivery Reference Notes-->
        <div class="form-group">
          <label class="form-label">Delivery reference<span class="required-indicator">*</span></label>
          <div class="input-container">
            <input 
              type="text" 
              v-model="formData.deliveryReference" 
              placeholder="Enter or scan the delivery reference" 
              class="form-input"
              :disabled="isLoading"
              required
            />
          </div>
          <p class="field-hint">You can type this in or scan the barcode with your phone camera.</p>
        </div>

        <!-- Feedback Error Panel Banner -->
        <div v-if="errorMessage" class="status-banner failed">
          {{ errorMessage }}
        </div>

        <!--Submission Trigger Action Module Button-->
        <button type="submit" class="receipt-submit-btn" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-icon"></span>
          <!--Centralized Box Delivery Vector Icon matching your design wireframe-->
          <svg v-else class="btn-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
            <polyline points="21 8 21 21 3 21 3 8"></polyline>
            <rect x="1" y="3" width="22" height="5"></rect>
            <line x1="10" y1="12" x2="14" y2="12"></line>
          </svg>
          {{ isLoading ? 'Fetching Delivery...' : 'Receipt' }}
        </button>
      </form>
    </main>

    <QrCodeScanner v-if="isQrScannerOpen" @close="closeScanner" @scanned="handleScan" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import MenuTop from '../../components/menutop/index.vue';
import QrCodeScanner from '../../components/qrcode/scanner/index.vue';
import { isWebcamScannerOpen } from '../../util/barcodeScanner.js';
import { store } from '../../util/store.js';
import { EntityService } from '../../util/entities.js';

const router = useRouter();

const isLoading = ref(false);
const errorMessage = ref(null);
const isQrScannerOpen = ref(false);

const formData = ref({
  storageLocation: '0001',
  deliveryNumber: '',
  deliveryReference: ''
});

const openScannerAction = () => {
  errorMessage.value = null;
  isWebcamScannerOpen.value = true;
  isQrScannerOpen.value = true;
};

const closeScanner = () => {
  isWebcamScannerOpen.value = false;
  isQrScannerOpen.value = false;
};

const handleScan = (scanData) => {
  const scannedValue = typeof scanData === 'string'
    ? scanData
    : scanData && typeof scanData === 'object'
      ? (scanData.rawText || scanData.odataUrl || '')
      : '';

  if (scannedValue) {
    formData.value.deliveryNumber = String(scannedValue).trim();
  }

  closeScanner();
};

const handleSubmit = async () => {
  if (!formData.value.deliveryNumber || !formData.value.deliveryReference) return;

  isLoading.value = true;
  errorMessage.value = null;
  console.log("Querying OData backend infrastructure via Entity abstraction layer for:", formData.value.deliveryNumber);

  try {
    // 1. Invoke the abstracted entity service layer
    const matchingDeliveries = await EntityService.getDeliveriesList(formData.value.deliveryNumber);

    if (matchingDeliveries && matchingDeliveries.length > 0) {
      const targetedDelivery = matchingDeliveries[0];
      
      // 2. Cache the active delivery and deep-nested items directly into the global reactive schema
      store.cache.entityLists['ActiveDelivery'] = targetedDelivery;
      
      console.log("[REGISTER SUCCESS] Delivery found and parsed into application storage cache. Routing to deliveries list.");
      
      // 3. Move forward seamlessly into the list view workspace screen track
      router.push('/goods_to_scan');
    } else {
      errorMessage.value = `No active deliveries found matching document reference number "${formData.value.deliveryNumber}".`;
    }
  } catch (error) {
    console.error("[REGISTER ERROR] Abstraction layer trace crash:", error);
    errorMessage.value = error.message || 'Network lookup failure: check connection configuration endpoints.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.register-delivery-view {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  box-sizing: border-box;
}

.content-workspace {
  padding-top: 5.5rem !important;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
  width: 100%;
  box-sizing: border-box;
}

.delivery-form {
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
  font-family: system-ui, -apple-system, sans-serif;
  text-align: left;
}

.required-indicator {
  color: var(--danger-color);
  margin-left: 0.15rem;
}

.field-hint {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-muted, #6b7280);
  line-height: 1.4;
}

.input-container {
  width: 100%;
  position: relative;
}

.scan-input-container {
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  background-color: var(--surface-color, #ffffff);
  border: 1px solid var(--border-color, #d1d5db);
  color: var(--text-main, #111827);
  border-radius: 6px;
  padding: 0.85rem 1rem;
  font-size: 0.95rem;
  box-sizing: border-box;
  outline: none;
  font-family: system-ui, -apple-system, sans-serif;
  transition: border-color 0.15s ease;
}

.form-input-with-action {
  padding-right: 3.75rem;
}

.form-input:focus {
  border-color: var(--accent-color, #16a34a);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.custom-select {
  appearance: none;
  cursor: pointer;
}

.input-action-btn {
  position: absolute;
  top: 50%;
  right: 0.5rem;
  transform: translateY(-50%);
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 0.65rem;
  background-color: rgba(var(--accent-rgb), 0.1);
  color: var(--accent-color);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.input-action-btn:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.input-action-btn:not(:disabled):active {
  background-color: rgba(var(--accent-rgb), 0.18);
}

.input-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.select-wrapper::after {
  content: "";
  position: absolute;
  right: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid var(--text-muted, #6b7280);
  pointer-events: none;
}

.form-input::placeholder {
  color: var(--text-muted);
  opacity: 1;
}

/* Feedback message panel styling */
.status-banner {
  padding: 0.85rem;
  border-radius: 6px;
  font-size: 0.85rem;
  text-align: center;
  line-height: 1.4;
  box-sizing: border-box;
}

.status-banner.failed {
  background-color: rgba(var(--danger-rgb), 0.08);
  border: 1px solid rgba(var(--danger-rgb), 0.32);
  color: var(--danger-color);
}

.receipt-submit-btn {
  background-color: var(--accent-color); 
  color: var(--accent-contrast);
  border: none;
  border-radius: 6px;
  padding: 0.9rem;
  font-size: 1.05rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  width: 100%;
  margin-top: 1rem;
  box-sizing: border-box;
  box-shadow: var(--accent-shadow);
  transition: opacity 0.15s ease;
}

.receipt-submit-btn:not(:disabled):active {
  opacity: 0.9;
}

.receipt-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  display: inline-block;
  flex-shrink: 0;
}

/* Inline Loading Animation icon tracker assets */
.spinner-icon {
  width: 16px;
  height: 16px;
  border: 2px solid var(--text-main);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
