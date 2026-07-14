<template>
  <div class="app-layout po-items-view">
    <!-- Reusable Top Navigation Bar Component -->
    <MenuTop title="PO ITEMS" :menu-items="topMenuItems" />

    <main class="app-content content-workspace">
      <!-- Search input container matching your UI layout -->
      <div class="search-container scan-input-container">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search PO items..." 
          class="search-input"
          @keydown.enter.prevent="handleSearchSubmit"
        />
        <button
          type="button"
          class="input-action-btn"
          aria-label="Scan PO item barcode"
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

    <QrCodeScanner v-if="isQrScannerOpen" @close="closeScanner" @scanned="handleScan" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import MenuTop from '../../components/menutop/index.vue';
import QrCodeScanner from '../../components/qrcode/scanner/index.vue';
import { isWebcamScannerOpen } from '../../util/barcodeScanner.js';
import { store } from '../../util/store.js';

const router = useRouter();
const searchQuery = ref('');
const isQrScannerOpen = ref(false);
const topMenuItems = [
  { label: 'Home', to: '/home', icon: 'home' },
  { label: 'Scanned Goods', to: '/scanned_goods', icon: 'scanned_goods' }
];

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
    (item.description && item.description.toLowerCase().includes(query)) ||
    (item.vendorId && String(item.vendorId).toLowerCase().includes(query))
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

const findExactItemMatch = (scanOrQueryValue) => {
  const normalized = String(scanOrQueryValue || '').trim().toLowerCase();
  if (!normalized) return null;

  return itemsList.value.find(item => {
    const codeMatch = item.code && String(item.code).toLowerCase() === normalized;
    const vendorMatch = item.vendorId && String(item.vendorId).toLowerCase() === normalized;
    return codeMatch || vendorMatch;
  }) || null;
};

const handleSearchSubmit = () => {
  const matchedItem = findExactItemMatch(searchQuery.value);
  if (matchedItem) {
    selectItem(matchedItem);
  }
};

const openScannerAction = () => {
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

  const normalizedScan = String(scannedValue || '').trim();
  searchQuery.value = normalizedScan;

  const matchedItem = findExactItemMatch(normalizedScan);
  if (matchedItem) {
    selectItem(matchedItem);
  }

  closeScanner();
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
  position: relative;
}

.scan-input-container {
  display: flex;
  align-items: center;
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
  padding-right: 3.75rem;
}

.search-input:focus {
  border-color: var(--accent-color);
}

.search-input::placeholder {
  color: var(--text-muted);
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

.input-action-btn:active {
  background-color: rgba(var(--accent-rgb), 0.18);
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
