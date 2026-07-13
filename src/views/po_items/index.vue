<template>
  <div class="app-layout po-items-view">
    <!-- Reusable Top Navigation Bar Component -->
    <MenuTop title="PO ITEMS" />

    <main class="app-content content-workspace">
      <!-- Search input container matching your UI layout -->
      <div class="search-container">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search PO items..." 
          class="search-input"
        />
      </div>

      <!-- Empty State Fallback View -->
      <div v-if="!itemsList || itemsList.length === 0" class="empty-state-card">
        <p class="empty-text">No items found for this delivery.</p>
      </div>

      <!-- Scrollable list of items mapped from cache memory -->
      <div v-else class="items-list">
        <div 
          v-for="item in filteredItems" 
          :key="item.id" 
          class="item-card interactive-card"
          @click="selectItem(item)"
          tabindex="0"
          @keydown.enter.prevent="selectItem(item)"
          @keydown.space.prevent="selectItem(item)"

        >
          <!-- Item Code highlighted in green accent color -->
          <div class="item-code">{{ item.code }}</div>
          
          <!-- Detailed Item description text metadata block -->
          <div class="item-description">{{ item.description }}</div>
          
          <!-- Core tracking metrics dynamically reading from your live normalized schema values -->
          <div class="item-meta">
            Recpt. Qty: <span class="highlight">{{ item.recptQty }} / {{ item.targetQty }} {{ item.uom }}</span> 
            <span v-if="hasActiveExceptions(item.flags)" class="exception-alert-tag">- EXCEPTION</span>
            <span class="vendor-label"> - Vendor Arg. <span class="highlight">{{ item.vendorId }}</span></span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import MenuTop from '../../components/menutop/index.vue';
import { store } from '../../util/store.js';

const router = useRouter();
const searchQuery = ref('');

/**
 * Computed State Pull:
 * Extracts the single loaded delivery envelope from the array container
 * and isolates the normalized items collection nested inside it.
 */
const itemsList = computed(() => {
  const cachedData = store.cache.entityLists['ActiveDelivery'];
  if (!cachedData) return [];
  
  // Safely grab the first matched document frame from the lookups cache
  const activeDoc = Array.isArray(cachedData) ? cachedData[0] : cachedData;
  return activeDoc && activeDoc.items ? activeDoc.items : [];
});

// Real-time reactive searching/filtering logic bound to your cache data
const filteredItems = computed(() => {
  if (!searchQuery.value) return itemsList.value;
  const query = searchQuery.value.toLowerCase();
  return itemsList.value.filter(item => 
    (item.code && item.code.toLowerCase().includes(query)) || 
    (item.description && item.description.toLowerCase().includes(query))
  );
});

// Helper check flag to render subtle indicators if flags were toggled on before
const hasActiveExceptions = (flags) => {
  if (!flags) return false;
  return flags.damages || flags.noBarcode || flags.invalidBarcode;
};

const selectItem = (item) => {
  console.log(`[NAVIGATE] Target Product Selected: ${item.code}. Forwarding to receipt screen.`);
  
  // Cache a simple pointer parameter or pass queries over to the item capture route
  router.push({
    path: '/receipt_item',
    query: { articleCode: item.code }
  });
};
</script>

<style scoped>
.po-items-view {
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

/* Fluid search field framing matching input panel definitions */
.search-container {
  width: 100%;
  max-width: 440px;
}

.search-input {
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

.search-input:focus {
  border-color: var(--accent-color);
}

.search-input::placeholder {
  color: var(--text-muted);
}

/* Master list flow wrapper framework stack alignment */
.items-list {
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* List element item row cards */
.item-card {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 1.25rem 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-sizing: border-box;
  text-align: left;
}

.interactive-card {
  cursor: pointer;
  transition: transform 0.1s ease;
}

.interactive-card:active {
  transform: scale(0.99);
  background-color: var(--border-color);
}

/* Identification title metrics mapping green tokens */
.item-code {
  font-size: 1.05rem;
  font-weight: bold;
  color: var(--accent-color);
  font-family: monospace;
}

/* Body description copy definitions */
.item-description {
  font-size: 0.95rem;
  line-height: 1.4;
  color: var(--text-main);
}

/* Footnote detail summary formatting labels */
.item-meta {
  font-size: 0.825rem;
  color: var(--text-muted);
  font-family: monospace;
  letter-spacing: 0.25px;
}

.highlight {
  color: var(--text-main);
}

.exception-alert-tag {
  color: var(--danger-color);
  font-weight: bold;
}

.vendor-label {
  display: inline-block;
}

.empty-state-card {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
}
</style>
