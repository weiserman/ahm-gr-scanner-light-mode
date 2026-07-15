<template>
  <div class="app-layout scanned-goods-view">
    <!--Reusable Top Navigation Bar Component-->
    <MenuTop title="GOODS TO RECEIPT"/>

    <!--Main Workspace Scroll Track-->
    <main class="app-content content-workspace">
      <!--Empty State:Displayed when no captured goods exist in the active store cache-->
      <div v-if="scannedItems.length === 0" class="empty-state-card">
        <svg viewBox="0 0 24 24" width="36" height="36" stroke="var(--text-muted)" stroke-width="1.5" fill="none">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <p class="empty-text">No scanned items with captured quantities found.</p>
        <router-link to="/po_items" class="return-link">View PO Items List</router-link>
      </div>

      <div v-else class="scanned-list">
        <!--Loopable Scanned Goods Entry Card-->
        <div 
          v-for="item in scannedItems" 
          :key="item.id" 
          class="scanned-card" 
          @click="inspectItem(item.code)"
        >
          <!--Left Layout Column:Status indicator check box-->
          <div class="card-status-indicator" :class="{ 'has-exceptions': hasExceptions(item.flags) }">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="3" fill="none">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>

          <!--Middle Layout Column:Detailed Product Data Specifications-->
          <div class="card-body-details">
            <div class="item-article-code">{{ item.code }}</div>
            <div class="item-description-text">{{ item.description }}</div>
            <div class="item-sub-meta">PO Delivery: {{ activeDocNumber }}</div>
            <div class="item-sub-meta font-exceptions" v-if="hasExceptions(item.flags)">
              Flags: {{ compileExceptionString(item.flags) }}
            </div>
          </div>

          <!--Right Layout Column:Bright Green Logged Quantities Metric Counter-->
          <div class="card-qty-metric">
            <span class="qty-label">Qty:</span>
            <span class="qty-value">{{ item.recptQty }}</span>
          </div>
        </div>
      </div>

      <!--Action feedback banners panel indicator-->
      <div v-if="statusBanner" class="status-banner" :class="statusBanner.status">
        {{ statusBanner.message }}
      </div>

      <!--Bottom System Process Form Control Action Button Row-->
      <div class="form-actions-row">
        <!--Clear captured receipt entries while keeping active delivery-->
        <button 
          type="button" 
          class="action-btn-delete" 
          @click="handleClearReceiptItems" 
          :disabled="isSubmitting || scannedItems.length === 0"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
          Reset
        </button>

        <!--Save Server/Post Transaction Sync Module Button Trigger-->
        <button 
          type="button" 
          class="action-btn-save-server" 
          @click="handleSaveServer" 
          :disabled="isSubmitting || scannedItems.length === 0"
        >
          <span v-if="isSubmitting" class="spinner-icon"></span>
          <svg v-else viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          {{ isSubmitting ? 'Saving...' : 'Submit' }}
        </button>
      </div>
    </main>

    <!-- Confirmation dialog for resetting captured receipt items -->
    <div v-if="isResetDialogOpen" class="reset-dialog-overlay" @click.self="isResetDialogOpen = false">
      <div class="reset-dialog-card">
        <h3 class="reset-dialog-title">Reset receipt items?</h3>
        <p class="reset-dialog-message">
          This will delete all captured receipt quantities for this delivery. The delivery details will be kept.
        </p>
        <div class="reset-dialog-actions">
          <button type="button" class="secondary-btn" @click="isResetDialogOpen = false">Cancel</button>
          <button type="button" class="danger-btn reset-confirm-btn" @click="confirmReset">Reset</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import MenuTop from '../../components/menutop/index.vue';
import { store, storeActions } from '../../util/store.js';
import { EntityService } from '../../util/entities.js';

const router = useRouter();
const isSubmitting = ref(false);
const statusBanner = ref(null);
const isResetDialogOpen = ref(false);

const activeDeliveryDoc = computed(() => {
  const cachedData = store.cache.entityLists['ActiveDelivery'];
  if (!cachedData) return null;
  return Array.isArray(cachedData) ? cachedData[0] : cachedData;
});

const activeDocNumber = computed(() => {
  return activeDeliveryDoc.value ? activeDeliveryDoc.value.deliveryNumber : 'N/A';
});

const scannedItems = computed(() => {
  if (!activeDeliveryDoc.value || !activeDeliveryDoc.value.items) return [];
  return activeDeliveryDoc.value.items.filter(item => item.recptQty > 0);
});

const inspectItem = (code) => {
  console.log(`[OUTBOX] Navigating to edit view for item article code: ${code}`);
  router.push({ path: '/outbox_item', query: { articleCode: code } });
};

const handleClearReceiptItems = () => {
  isResetDialogOpen.value = true;
};

const confirmReset = () => {
  isResetDialogOpen.value = false;
  console.log('[UI ACTION] Clearing captured receipt items while preserving delivery context.');
  storeActions.clearCapturedReceiptItems();
  statusBanner.value = {
    status: 'success',
    message: 'Captured receipt items were cleared. Delivery details were kept.'
  };
};

//const handleSaveServer = async () => {
//  if (!activeDeliveryDoc.value) return;
//
//  isSubmitting.value = true;
//  statusBanner.value = null;
//
//  try {
//	window.activeDeliveryDoc=activeDeliveryDoc//sq
//	window.scannedItems=scannedItems.value//sq
//    console.log("Posting local verification cache arrays downstream via Entity Service...");
//    
//    // Dispatches the sanitized parameters safely to your Node.js CAP backend
//    await EntityService.submitGoodsReceiptTransaction(
//      activeDeliveryDoc.value.id, 
//      scannedItems.value
//    );
//
//    console.log("[SERVER SUCCESS] Server save confirmed. Purging delivery data from localstorage...");
//    
//    // Clears the cache node array value dynamically from localstorage
//    storeActions.clearActiveDeliveryCache();
//    
//    statusBanner.value = {
//      status: 'success',
//      message: 'Transaction saved to server! Cache cleared.'
//    };
//
//    setTimeout(() => {
//      router.push('/home');
//    }, 1000);
//
//  } catch (error) {
//    console.error("[SAVE FAILED] Transaction aborted:", error);
//    statusBanner.value = {
//      status: 'failed',
//      message: `Failed to save to server: ${error.message}`
//    };
//  } finally {
//    isSubmitting.value = false;
//  }
//};
// --- UPDATE INSIDE ./src/views/scanned_goods/index.vue ---
const handleSaveServer = async () => {
  if (!activeDeliveryDoc.value) return;
  
  isSubmitting.value = true;
  statusBanner.value = null;

  try {
    // Debug hooks requested in original source
    window.activeDeliveryDoc = activeDeliveryDoc;
    window.scannedItems = scannedItems.value;

    console.log("[UI WORKFLOW] Invoking transaction state machine execution framework...");
    
    // Fire the entire sequence cleanly: Header -> Lines -> Activation
    await EntityService.executeDraftGoodsReceiptPipeline(
      activeDeliveryDoc.value.id, 
      scannedItems.value,
      "2026-06-22" // Use the date required by your business criteria
    );

    console.log("[SERVER SUCCESS] Entire RAP processing sequence completed without errors. Flushing UI workspace state...");
    storeActions.clearActiveDeliveryCache();
    
    statusBanner.value = { 
      status: 'success', 
      message: 'Goods Receipt Document activated on SAP successfully!' 
    };

    setTimeout(() => {
      router.push('/home');
    }, 1000);

  } catch (error) {
    console.error("[UI WORKFLOW ERROR] Pipeline collapsed:", error);
    statusBanner.value = { 
      status: 'failed', 
      message: `Failed to commit to SAP: ${error.message}` 
    };
  } finally {
    isSubmitting.value = false;
  }
};

const hasExceptions = (flags) => {
  if (!flags) return false;
  return flags.damages || flags.noBarcode || flags.invalidBarcode;
};

const compileExceptionString = (flags) => {
  const list = [];
  if (flags.damages) list.push('Damaged');
  if (flags.noBarcode) list.push('No Barcode');
  if (flags.invalidBarcode) list.push('Invalid Barcode');
  return list.join(', ');
};
</script>

<style scoped>
.scanned-goods-view {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  box-sizing: border-box;
}

.content-workspace {
  padding-top: 5.5rem !important;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-bottom: 1.5rem;
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  align-items: center;
}

.scanned-list {
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.scanned-card {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  box-sizing: border-box;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.scanned-card:active {
  transform: scale(0.99);
}

.card-status-indicator {
  background-color: var(--accent-color); 
  color: var(--text-main);
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 0.15rem;
}

.card-status-indicator.has-exceptions {
  background-color: var(--warning-color);
}

.card-body-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: left;
}

.item-article-code {
  font-size: 1.05rem;
  font-weight: bold;
  color: var(--text-main);
  font-family: monospace;
}

.item-description-text {
  font-size: 0.85rem;
  line-height: 1.3;
  color: var(--text-muted);
}

.item-sub-meta {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-family: monospace;
}

.font-exceptions {
  color: var(--danger-color);
  font-weight: 500;
}

.card-qty-metric {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-family: monospace;
  line-height: 1.1;
  min-width: max-content;
}

.qty-label {
  font-size: 0.85rem;
  font-weight: bold;
  color: var(--accent-color);
}

.qty-value {
  font-size: 1.35rem;
  font-weight: bold;
  color: var(--accent-color);
}

.status-banner {
  width: 100%;
  max-width: 440px;
  padding: 0.85rem;
  border-radius: 6px;
  font-size: 0.85rem;
  text-align: center;
  line-height: 1.4;
  box-sizing: border-box;
}

.status-banner.success {
  background-color: rgba(var(--accent-rgb), 0.1);
  border: 1px solid rgba(var(--accent-rgb), 0.3);
  color: var(--accent-color);
}

.status-banner.failed {
  background-color: rgba(var(--danger-rgb), 0.08);
  border: 1px solid rgba(var(--danger-rgb), 0.3);
  color: var(--danger-color);
}

.form-actions-row {
  width: 100%;
  max-width: 440px;
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 1rem;
}

.action-btn-delete {
  background-color: transparent;
  border: 1px solid rgba(var(--danger-rgb), 0.32);
  color: var(--danger-color);
  border-radius: 6px;
  padding: 0.85rem 0;
  font-size: 0.95rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  cursor: pointer;
}

.action-btn-delete:not(:disabled):active {
  background-color: rgba(var(--danger-rgb), 0.08);
}

.action-btn-save-server {
  background-color: var(--accent-color);
  color: var(--accent-contrast);
  border: none;
  border-radius: 6px;
  padding: 0.85rem 0;
  font-size: 0.95rem;
  font-weight: bold;
display: flex;align-items: center;justify-content: center;gap: 0.4rem;cursor: pointer;box-shadow: var(--accent-shadow);}.action-btn-save-server:not(:disabled):active {opacity: 0.9;}.action-btn-delete:disabled,.action-btn-save-server:disabled {opacity: 0.4;cursor: not-allowed;}.spinner-icon {width: 14px;height: 14px;border: 2px solid var(--accent-contrast);border-top-color: transparent;border-radius: 50%;animation: spin 0.8s linear infinite;display: inline-block;}@keyframes spin {to { transform: rotate(360deg); }}.empty-state-card {width: 100%;max-width: 440px;background-color: var(--surface-color);border: 1px solid var(--border-color);border-radius: 8px;padding: 3rem 1.5rem;box-sizing: border-box;display: flex;flex-direction: column;align-items: center;gap: 1rem;}.empty-text {font-size: 0.95rem;color: var(--text-muted);margin: 0;}.return-link {color: var(--accent-color);font-size: 0.9rem;font-weight: bold;text-decoration: underline;}

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

.secondary-btn {
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-main);
  border-radius: 6px;
  padding: 0.72rem 0;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
}

.danger-btn {
  border: 1px solid rgba(209, 67, 67, 0.4);
  background-color: rgba(209, 67, 67, 0.08);
  color: #ba2f2f;
  border-radius: 6px;
  padding: 0.72rem 0;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
}

.danger-btn:active {
  background-color: rgba(209, 67, 67, 0.18);
}

.reset-confirm-btn {
  padding-top: 0.72rem;
  padding-bottom: 0.72rem;
}
</style>
