<template>
  <div class="app-layout home-view">
    <!--Topbar locked at the absolute top of the viewport-->
    <MenuTop title="Home" />

    <!--Main Workspace with dynamic viewport-height constraints to eliminate scroll-->
    <main class="app-content content-workspace">
      <div class="dashboard-grid">
        
        <!--Tile 1:Register Delivery-->
        <router-link to="/register_delivery" class="tile-card" @click.prevent="handleRegisterDeliveryClick">
          <div class="tile-top">
            <div class="tile-icon-container">
              <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </div>
          </div>
          <div class="tile-label">Register Delivery</div>
        </router-link>

        <!--Tile 2:Goods to Scan-->
        <router-link to="/goods_to_scan" class="tile-card">
          <div class="tile-top">
            <div class="tile-icon-container">
              <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round">
                <!--Barcode Vertical Slats(Varied Widths and Offsets)-->
                <path d="M3 6h1v12H3zm3 0h2v12H6zm4 0h1v12h-1zm3 0h3v12h-3zm5 0h1v12h-1zm3 0h1v12h-1z" fill="currentColor" stroke="none"/>
                <!--Laser Target Line Overlay-->
                <line x1="1" y1="12" x2="23" y2="12" stroke="var(--accent-color)" stroke-width="1.5"/>
              </svg>
            </div>
            <!-- Computes unreceived warehouse product rows remaining -->
            <div class="badge-count-wrapper" aria-label="Pending items">
              <span class="badge-number">{{ pendingScanCount }}</span>
              <span class="badge-text">PEND.</span>
            </div>
          </div>
          <div class="tile-label">Goods to Scan</div>
        </router-link>

        <!--Tile 3:Scanned Goods-->
        <router-link to="/scanned_goods" class="tile-card">
          <div class="tile-top">
            <div class="tile-icon-container">
              <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="9"></line>
                <line x1="9" y1="13" x2="15" y2="13"></line>
                <line x1="9" y1="17" x2="15" y2="17"></line>
              </svg>
            </div>
            <!-- Computes local active queue counts ready to submit to server -->
            <div class="badge-count-wrapper" aria-label="Pending items">
              <span class="badge-number">{{ capturedGoodsCount }}</span>
              <span class="badge-text">PEND.</span>
            </div>
          </div>
          <div class="tile-label">Scanned Goods</div>
        </router-link>

        <!--Tile 4:System Server Engine Settings Profile Configuration-->
        <router-link to="/config" class="tile-card">
          <div class="tile-top">
            <div class="tile-icon-container">
              <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1-2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </div>
          </div>
          <div class="tile-label">Configuration</div>
        </router-link>

        <!--Tile 5:Lock Application System Hook-->
        <div class="tile-card interactive-action lock-tile" @click="handleLock">
          <div class="tile-top">
            <div class="tile-icon-container">
              <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
          </div>
          <div class="tile-label">Lock</div>
        </div>

      </div>
    </main>
  </div>

  <!-- Confirmation dialog teleported to body to escape any CSS containment -->
  <Teleport to="body">
    <div v-if="isDiscardDialogOpen" class="home-discard-dialog-overlay" @click.self="isDiscardDialogOpen = false">
      <div class="home-discard-dialog-card">
        <h3 class="home-discard-dialog-title">Discard current delivery?</h3>
        <p class="home-discard-dialog-message">
          PO {{ currentPoNumber }} is being processed. Do you want to discard it?
        </p>
        <div class="home-discard-dialog-actions">
          <button type="button" class="home-discard-btn-secondary" @click="isDiscardDialogOpen = false">Keep Working</button>
          <button type="button" class="home-discard-btn-danger" @click="confirmDiscard">Discard</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { store, storeActions } from '../../util/store.js';
import MenuTop from '../../components/menutop/index.vue';

const router = useRouter();
const isDiscardDialogOpen = ref(false);
const currentPoNumber = ref('');

const handleLock = () => {
  storeActions.logout();
  router.push('/enter');
};

const activeDeliveryDoc = computed(() => {
  const cachedData = store.cache.entityLists['ActiveDelivery'];
  if (!cachedData) return null;
  return Array.isArray(cachedData) ? cachedData[0] : cachedData;
});

const handleRegisterDeliveryClick = () => {
  const currentDoc = activeDeliveryDoc.value;
  
  // Debug: Show what's in the cache
  const debugInfo = {
    currentDoc: currentDoc,
    cacheKeys: Object.keys(store.cache.entityLists),
    activeDeliveryRaw: store.cache.entityLists['ActiveDelivery']
  };
  console.log('[HOME] Register Delivery clicked. Debug info:', debugInfo);
  
  // Temporary alert for device debugging
  alert('DEBUG: ActiveDelivery in cache = ' + (currentDoc ? 'YES' : 'NO') + 
        '\nCache keys: ' + Object.keys(store.cache.entityLists).join(', '));

  if (currentDoc) {
    // Use deliveryNumber, fall back to id if deliveryNumber is empty
    const poNumber = currentDoc.deliveryNumber || currentDoc.id || 'Unknown';
    currentPoNumber.value = String(poNumber).trim();
    isDiscardDialogOpen.value = true;
    
    // Debug: verify state was set
    alert('DEBUG: isDiscardDialogOpen is now = ' + isDiscardDialogOpen.value + 
          '\nPO Number: ' + currentPoNumber.value);
    
    console.log('[HOME] Opening discard confirmation dialog for PO:', currentPoNumber.value);
    return;
  }

  console.log('[HOME] No active delivery found, navigating directly to register_delivery');
  router.push('/register_delivery');
};

const confirmDiscard = () => {
  isDiscardDialogOpen.value = false;
  storeActions.clearCapturedReceiptItems();
  storeActions.clearActiveDeliveryCache();
  router.push('/register_delivery');
};

/**
 * Accesses active item sets currently loaded within cache memory modules
 */
const activeItems = computed(() => {
  return activeDeliveryDoc.value && activeDeliveryDoc.value.items ? activeDeliveryDoc.value.items : [];
});

/**
 * COUNTER 1: Goods to Scan
 * Returns the count of unique articles that have not been captured yet (recptQty === 0)
 */
const pendingScanCount = computed(() => {
  if (activeItems.value.length === 0) return 0;
  return activeItems.value.filter(item => item.recptQty === 0).length;
});

/**
 * COUNTER 2: Scanned Goods
 * Returns the count of items that currently have captured quantities ready to go to the server (recptQty > 0)
 */
const capturedGoodsCount = computed(() => {
  if (activeItems.value.length === 0) return 0;
  return activeItems.value.filter(item => item.recptQty > 0).length;
});
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
  box-sizing: border-box;
}

.fixed-topbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 56px;
  z-index: 100;
  box-sizing: border-box;
  background-color: var(--surface-color);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
}

.header-title {
  font-family: "72", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 1.2rem;
  margin: 0;
  color: var(--text-main);
}

.content-workspace {}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-top: 0.55rem;
  width: 100%;
  box-sizing: border-box;
}

.tile-card {
  background: linear-gradient(180deg, #ffffff 0%, var(--surface-alt) 100%);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0.85rem;
  aspect-ratio: 1 / 0.88;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  box-sizing: border-box;
  font-family: "72", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  box-shadow: 0 1px 2px rgba(29, 45, 62, 0.06), 0 6px 14px rgba(29, 45, 62, 0.08);
}

.interactive-action {
  cursor: pointer;
}

.tile-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  min-height: 2rem;
  gap: 0.5rem;
}

.tile-icon-container,
.header-home-btn {
  color: var(--accent-color-strong);
  flex: 0 0 auto;
}

.tile-label {
  font-size: 0.8rem;
  line-height: 1.15;
  color: var(--text-main);
  letter-spacing: 0.01em;
}

.badge-count-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
  line-height: 1;
  margin-left: auto;
  padding: 0.05rem 0 0 0.35rem;
  min-width: 2.35rem;
  text-align: right;
}

.badge-number {
  font-size: 2rem;
  font-weight: normal;
  color: var(--text-main);
  line-height: 0.9;
}

.badge-text {
  font-size: 0.6rem;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  margin-top: 0.08rem;
}

@media (max-width: 420px) {
  .content-workspace {
    padding: 0.6rem;
  }

  .dashboard-grid {
    gap: 0.5rem;
    margin-top: 0.45rem;
  }

  .tile-card {
    padding: 0.6rem;
    border-radius: 8px;
    aspect-ratio: 1 / 0.78;
  }

  .tile-top {
    min-height: 2.25rem;
    gap: 0.4rem;
  }

  .tile-icon-container svg {
    width: 22px;
    height: 22px;
  }

  .badge-number {
    font-size: 1.4rem;
  }

  .badge-text {
    font-size: 0.5rem;
  }
}

@media (max-width: 360px) {
  .content-workspace {
    padding: 0.5rem;
  }

  .dashboard-grid {
    margin-top: 0.4rem;
  }

  .tile-card {
    padding: 0.5rem;
    aspect-ratio: 1 / 0.7;
  }

  .tile-top {
    min-height: 2rem;
  }

  .tile-label {
    font-size: 0.6rem;
  }

  .badge-number {
    font-size: 1.2rem;
  }
}
</style>

<!-- Non-scoped styles for the teleported dialog (rendered at body level) -->
<style>
.home-discard-dialog-overlay {
  position: fixed !important;
  inset: 0 !important;
  background-color: rgba(17, 24, 39, 0.45) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 99999 !important;
  padding: 1rem;
  box-sizing: border-box;
}

.home-discard-dialog-card {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border: 1px solid #d9dfe7;
  border-radius: 10px;
  padding: 1rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.home-discard-dialog-title {
  margin: 0;
  font-size: 1rem;
  color: #1d2d3e;
}

.home-discard-dialog-message {
  margin: 0;
  font-size: 0.84rem;
  color: #556b82;
  line-height: 1.4;
}

.home-discard-dialog-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.55rem;
  margin-top: 0.5rem;
}

.home-discard-btn-secondary {
  border: 1px solid #d9dfe7;
  background: transparent;
  color: #1d2d3e;
  border-radius: 6px;
  padding: 0.72rem 0;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
}

.home-discard-btn-secondary:active {
  background: #eef1f4;
}

.home-discard-btn-danger {
  border: 1px solid rgba(209, 67, 67, 0.4);
  background-color: rgba(209, 67, 67, 0.08);
  color: #ba2f2f;
  border-radius: 6px;
  padding: 0.72rem 0;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
}

.home-discard-btn-danger:active {
  background-color: rgba(209, 67, 67, 0.18);
}
</style>
