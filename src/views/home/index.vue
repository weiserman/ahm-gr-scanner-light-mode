<template>
  <div class="app-layout home-view">
    <!--Topbar locked at the absolute top of the viewport-->
    <MenuTop title="Home" />

    <!--Main Workspace with dynamic viewport-height constraints to eliminate scroll-->
    <main class="app-content content-workspace">
      <div class="dashboard-grid">
        
        <!--Tile 1:Register Delivery-->
        <router-link to="/register_delivery" class="tile-card">
          <div class="tile-icon-container">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
          </div>
          <div class="tile-label">Register Delivery</div>
        </router-link>

        <!--Tile 2:Goods to Scan-->
        <router-link to="/goods_to_scan" class="tile-card">
          <div class="tile-meta">
            <div class="tile-icon-container">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round">
                <!--Barcode Vertical Slats(Varied Widths and Offsets)-->
                <path d="M3 6h1v12H3zm3 0h2v12H6zm4 0h1v12h-1zm3 0h3v12h-3zm5 0h1v12h-1zm3 0h1v12h-1z" fill="currentColor" stroke="none"/>
                <!--Laser Target Line Overlay-->
                <line x1="1" y1="12" x2="23" y2="12" stroke="var(--accent-color)" stroke-width="1.5"/>
              </svg>
            </div>
            <!-- Computes unreceived warehouse product rows remaining -->
            <div class="badge-count-wrapper">
              <span class="badge-number">{{ pendingScanCount }}</span>
              <span class="badge-text">PEND.</span>
            </div>
          </div>
          <div class="tile-label">Goods to Scan</div>
        </router-link>

        <!--Tile 3:Scanned Goods-->
        <router-link to="/scanned_goods" class="tile-card">
          <div class="tile-meta">
            <div class="tile-icon-container">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="9"></line>
                <line x1="9" y1="13" x2="15" y2="13"></line>
                <line x1="9" y1="17" x2="15" y2="17"></line>
              </svg>
            </div>
            <!-- Computes local active queue counts ready to submit to server -->
            <div class="badge-count-wrapper">
              <span class="badge-number">{{ capturedGoodsCount }}</span>
              <span class="badge-text">PEND.</span>
            </div>
          </div>
          <div class="tile-label">Scanned Goods 1</div>
        </router-link>

        <!--Tile 4:System Server Engine Settings Profile Configuration-->
        <router-link to="/config" class="tile-card">
          <div class="tile-icon-container">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1-2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </div>
          <div class="tile-label">Configuration</div>
        </router-link>

        <!--Tile 5:About Screen Link-->
        <router-link to="/about" class="tile-card">
          <div class="tile-icon-container">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <div class="tile-label">About</div>
        </router-link>

        <!--Tile 6:Lock Application System Hook-->
        <div class="tile-card interactive-action lock-tile" @click="handleLock">
          <div class="tile-icon-container">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <div class="tile-label">Lock</div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { store, storeActions } from '../../util/store.js';
import MenuTop from '../../components/menutop/index.vue';

const router = useRouter();

const handleLock = () => {
  storeActions.logout();
  router.push('/enter');
};

/**
 * Accesses active item sets currently loaded within cache memory modules
 */
const activeItems = computed(() => {
  const cachedData = store.cache.entityLists['ActiveDelivery'];
  if (!cachedData) return [];
  const activeDoc = Array.isArray(cachedData) ? cachedData[0] : cachedData;
  return activeDoc && activeDoc.items ? activeDoc.items : [];
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
  font-family: monospace;
  font-size: 1.2rem;
  margin: 0;
  color: var(--text-main);
}

.content-workspace {}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  width: 100%;
  box-sizing: border-box;
}

.tile-card {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 1rem;
  aspect-ratio: 1 / 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  box-sizing: border-box;
  font-family: monospace;
}

.interactive-action {
  cursor: pointer;
}

.tile-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.tile-icon-container, .header-home-btn {
  color: var(--accent-color);
}

.tile-label {
  font-size: 0.85rem;
  line-height: 1.2;
  color: var(--text-main);
}

.badge-count-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 0.8;
}

.badge-number {
  font-size: 2.2rem;
  font-weight: normal;
  color: var(--text-main);
}

.badge-text {
  font-size: 0.6rem;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}

@media (max-width: 420px) {
  .dashboard-grid {
    gap: 0.5rem;
  }

  .tile-card {
    padding: 0.7rem;
    border-radius: 5px;
  }

  .tile-icon-container svg {
    width: 20px;
    height: 20px;
  }

  .tile-label {
    font-size: 0.75rem;
  }

  .badge-number {
    font-size: 1.7rem;
  }
}
</style>
