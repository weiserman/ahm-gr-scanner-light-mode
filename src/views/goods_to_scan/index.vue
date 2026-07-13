<template>
  <div class="app-layout goods-to-scan-view">
    <!-- Reusable Top Navigation Bar Component -->
    <MenuTop title="DELIVERIES LIST" />

    <!-- Main Workspace Scroll Area -->
    <main class="app-content content-workspace">
      <!-- Empty State Banner: Appears if no records exist in the store cache -->
      <div v-if="!deliveriesList || deliveriesList.length === 0" class="empty-state-card">
        <svg viewBox="0 0 24 24" width="36" height="36" stroke="var(--text-muted)" stroke-width="1.5" fill="none">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p class="empty-text">No active deliveries loaded in cache memory.</p>
        <router-link to="/register_delivery" class="return-link">Register a Delivery</router-link>
      </div>

      <!-- Active Content Loop Display Track -->
      <div v-else class="deliveries-list">
        
        <!-- Loopable Delivery Entry Card Component -->
        <div 
          v-for="delivery in deliveriesList" 
          :key="delivery.id" 
          class="delivery-card"
          @click="selectDelivery(delivery)"
          tabindex="0"
          @keydown.enter.prevent="selectDelivery(delivery)"
          @keydown.space.prevent="selectDelivery(delivery)"
        >
          <!-- Left Layout Block: Icon Graphic and Shipment Metadata details -->
          <div class="card-left">
            <div class="package-icon-wrapper">
              <!-- Inline high-contrast dynamic shipping container vector asset -->
              <svg viewBox="0 0 24 24" width="32" height="32" stroke="#d97706" stroke-width="1.5" fill="#f59e0b">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" fill="none" />
                <path d="M2 7v10l10 5V12L2 7z" opacity="0.15" />
              </svg>
            </div>
            
            <div class="delivery-details">
              <!-- Maps the sanitized, normalized data fields from the store cache -->
              <h2 class="delivery-number">{{ delivery.deliveryNumber }}</h2>
              <div class="meta-row">SSCC: <span class="meta-value">{{ delivery.sscc }}</span></div>
              <div class="meta-row">Delivery: <span class="meta-value">{{ delivery.deliveryReference }}</span></div>
              <div class="meta-row">
                Pallet: <span class="meta-value">{{ delivery.pallets }}</span> 
                Cartons: <span class="meta-value">{{ delivery.cartons }}</span>
              </div>
            </div>
          </div>

          <!-- Right Layout Block: Timestamp and Status Metrics -->
          <div class="card-right">
            <span class="status-label">Received:</span>
            <span class="date-stamp">{{ delivery.dateReceived }}</span>
            <span class="status-badge" :class="delivery.status.toLowerCase()">{{ delivery.status }}</span>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import MenuTop from '../../components/menutop/index.vue';
import { store } from '../../util/store.js';

const router = useRouter();

/**
 * Single-Source-of-Truth Computed Property:
 * Listens directly to your custom reactive store cache structure.
 * Automatically handles safe data array normalization fallbacks.
 */
const deliveriesList = computed(() => {
  const cachedData = store.cache.entityLists['ActiveDelivery'];
  if (!cachedData) return [];
  // Ensure we are working with an array structure format natively
  return Array.isArray(cachedData) ? cachedData : [cachedData];
});

/**
 * Item selection event execution handler:
 * Saves a sub-pointer or moves directly into the line items list tracking screen.
 */
const selectDelivery = (delivery) => {
  console.log(`[NAVIGATE] Target Delivery Selected: ${delivery.deliveryNumber}. Loading line items array...`);
  
  // We can pass or preserve information using your designated route parameter target
  router.push('/po_items');
};
</script>

<style scoped>
.goods-to-scan-view {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  box-sizing: border-box;
}

.content-workspace {
  padding-top: 5.5rem !important;
  padding-left: 1rem;
  padding-right: 1rem;
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
}

.deliveries-list {
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin: 0 auto;
}

.delivery-card {
  background-color: var(--surface-color, #ffffff);
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 8px;
  padding: 1.25rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  box-sizing: border-box;
  cursor: pointer;
  transition: transform 0.1s ease, background-color 0.1s ease;
}

.delivery-card:active {
  background-color: var(--border-color, #d1d5db);
  transform: scale(0.99);
}

.card-left {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}

.package-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 0.2rem;
}

.delivery-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: left;
}

.delivery-number {
  font-size: 1.15rem;
  font-weight: bold;
  color: var(--text-main, #111827);
  margin: 0 0 0.15rem 0;
  font-family: system-ui, -apple-system, sans-serif;
}

.meta-row {
  font-size: 0.85rem;
  color: var(--text-muted, #6b7280);
  font-family: monospace;
}

.meta-value {
  color: var(--text-main, #111827);
}

.card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  gap: 0.35rem;
  min-width: max-content;
}

.status-label {
  font-size: 0.75rem;
  color: var(--text-muted, #6b7280);
}

.date-stamp {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-muted, #6b7280);
  font-family: monospace;
}

/* Status badge presentation styling rules */
.status-badge {
  font-size: 0.7rem;
  font-weight: bold;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  text-transform: uppercase;
  font-family: monospace;
}

.status-badge.pend {
  background-color: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.status-badge.completed {
  background-color: rgba(22, 163, 74, 0.12);
  color: var(--accent-color);
}

/* Empty cache fallback view layout styling blocks */
.empty-state-card {
  width: 100%;
  max-width: 440px;
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 3rem 1.5rem;
  margin: 2rem auto 0 auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-text {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 0;
}

.return-link {
  color: var(--accent-color);
  font-size: 0.9rem;
  font-weight: bold;
  text-decoration: underline;
}
</style>

