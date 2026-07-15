<template>
  <div class="app-layout receipt-item-view">
    <MenuTop title="RECEIPT ITEM" />

    <!-- Main Workspace Area -->
    <main class="app-content content-workspace">
      <!-- Fallback Error View if no item matches the query code -->
      <div v-if="!activeItem" class="empty-state-card">
        <p class="empty-text">Target item code could not be loaded from cache.</p>
        <router-link to="/po_items" class="return-link">Return to PO Items</router-link>
      </div>

      <!-- Top Info Summary Card Details -->
      <div v-else class="summary-wrapper-stack">
        <div class="summary-card">
          <!-- Dynamically maps normalized descriptive text values directly from your store schema -->
          <h2 class="product-title">{{ activeItem.description }}</h2>
          
          <div class="meta-grid">
            <div class="meta-label">Article: <span class="meta-val">{{ activeItem.code }}</span></div>
            <div class="meta-label text-right">Item: <span class="meta-val">{{ activeItem.itemNumber }}</span></div>
          </div>

          <div class="status-counter" :class="{ 'has-qty': quantity > 0 }">
            {{ quantity }} / {{ activeItem.targetQty }} {{ activeItem.uom }} - captured
          </div>

          <div class="vendor-stamp">Vendor Arg. {{ activeItem.vendorId }}</div>
        </div>

        <!-- Quantity Stepper Calculator Row Controls -->
	<!--
        <div class="stepper-row">
          <button class="step-btn" @click="adjustQty(-5)">&lt; 5</button>
          <button class="step-btn" @click="adjustQty(-1)">-</button>
          <button class="step-btn" @click="adjustQty(1)">+</button>
          <button class="step-btn" @click="adjustQty(5)">5 &gt;</button>
        </div>
	-->
		<div class="stepper-row">
		  <button 
		    ref="stepBtn0"
		    class="step-btn" 
		    @click="adjustQty(-5)"
		    @keydown.right.prevent="$refs.stepBtn1.focus()"
		    aria-label="Decrease quantity by 5"
		  >&lt; 5</button>
		  
		  <button 
		    ref="stepBtn1"
		    class="step-btn" 
		    @click="adjustQty(-1)"
		    @keydown.left.prevent="$refs.stepBtn0.focus()"
		    @keydown.right.prevent="$refs.stepBtn2.focus()"
		    aria-label="Decrease quantity by 1"
		  >-</button>
		  
		  <button 
		    ref="stepBtn2"
		    class="step-btn" 
		    @click="adjustQty(1)"
		    @keydown.left.prevent="$refs.stepBtn1.focus()"
		    @keydown.right.prevent="$refs.stepBtn3.focus()"
		    aria-label="Increase quantity by 1"
		  >+</button>
		  
		  <button 
		    ref="stepBtn3"
		    class="step-btn" 
		    @click="adjustQty(5)"
		    @keydown.left.prevent="$refs.stepBtn2.focus()"
		    aria-label="Increase quantity by 5"
		  >5 &gt;</button>
		</div>


        <!-- Exception Flag Row Toggles -->
        <div class="toggles-list">
          
          <!-- Condition 1: Damages Flag -->
<!--
          <div class="toggle-row">
            <span class="toggle-label">Damages</span>
            <div class="binary-switch">
              <button 
                type="button" 
                class="switch-btn segment-no" 
                :class="{ active: !flags.damages }"
                @click="flags.damages = false"
              >NO</button>
              <button 
                type="button" 
                class="switch-btn segment-yes" 
                :class="{ active: flags.damages }"
                @click="flags.damages = true"
              >YES</button>
            </div>
          </div>
-->
<div class="toggles-list">
  <!-- Condition 1: Damages Flag -->
  <div class="toggle-row">
    <span class="toggle-label" id="label-damages">Damages</span>
    
    <div 
      class="binary-switch"
      tabindex="0"
      role="radiogroup"
      aria-labelledby="label-damages"
      @keydown.left.prevent="flags.damages = false"
      @keydown.right.prevent="flags.damages = true"
      @keydown.space.prevent="flags.damages = !flags.damages"
    >
      <button
        type="button"
        tabindex="-1"
        class="switch-btn segment-no"
        :class="{ active: !flags.damages }"
        :aria-checked="!flags.damages"
        role="radio"
        @click="flags.damages = false"
      >NO</button>
      <button
        type="button"
        tabindex="-1"
        class="switch-btn segment-yes"
        :class="{ active: flags.damages }"
        :aria-checked="flags.damages"
        role="radio"
        @click="flags.damages = true"
      >YES</button>
    </div>
  </div>
</div>


          <!-- Condition 2: No Barcode Flag -->
<!--
          <div class="toggle-row">
            <span class="toggle-label">No Barcode</span>
            <div class="binary-switch">
              <button 
                type="button" 
                class="switch-btn segment-no" 
                :class="{ active: !flags.noBarcode }"
                @click="flags.noBarcode = false"
              >NO</button>
              <button 
                type="button" 
                class="switch-btn segment-yes" 
                :class="{ active: flags.noBarcode }"
                @click="flags.noBarcode = true"
              >YES</button>
            </div>
          </div>
-->
<div class="toggle-row">
  <span class="toggle-label" id="label-no-barcode">No Barcode</span>
  
  <div 
    class="binary-switch"
    tabindex="0"
    role="radiogroup"
    aria-labelledby="label-no-barcode"
    @keydown.left.prevent="flags.noBarcode = false"
    @keydown.right.prevent="flags.noBarcode = true"
    @keydown.space.prevent="flags.noBarcode = !flags.noBarcode"
  >
    <button
      type="button"
      tabindex="-1"
      class="switch-btn segment-no"
      :class="{ active: !flags.noBarcode }"
      :aria-checked="!flags.noBarcode"
      role="radio"
      @click="flags.noBarcode = false"
    >NO</button>
    <button
      type="button"
      tabindex="-1"
      class="switch-btn segment-yes"
      :class="{ active: flags.noBarcode }"
      :aria-checked="flags.noBarcode"
      role="radio"
      @click="flags.noBarcode = true"
    >YES</button>
  </div>
</div>


          <!-- Condition 3: Invalid Barcode Flag -->
<!--
          <div class="toggle-row">
            <span class="toggle-label">Invalid Barcode</span>
            <div class="binary-switch">
              <button 
                type="button" 
                class="switch-btn segment-no" 
                :class="{ active: !flags.invalidBarcode }"
                @click="flags.invalidBarcode = false"
              >NO</button>
              <button 
                type="button" 
                class="switch-btn segment-yes" 
                :class="{ active: flags.invalidBarcode }"
                @click="flags.invalidBarcode = true"
              >YES</button>
            </div>
          </div>
-->
          <div class="toggle-row">
            <span class="toggle-label" id="label-invalid-barcode">Invalid Barcode</span>
            <div 
              class="binary-switch"
              tabindex="0"
              role="radiogroup"
              aria-labelledby="label-invalid-barcode"
              @keydown.left.prevent="flags.invalidBarcode = false"
              @keydown.right.prevent="flags.invalidBarcode = true"
              @keydown.space.prevent="flags.invalidBarcode = !flags.invalidBarcode"
            >
              <button
                type="button"
                tabindex="-1"
                class="switch-btn segment-no"
                :class="{ active: !flags.invalidBarcode }"
                :aria-checked="!flags.invalidBarcode"
                role="radio"
                @click="flags.invalidBarcode = false"
              >NO</button>
              <button
                type="button"
                tabindex="-1"
                class="switch-btn segment-yes"
                :class="{ active: flags.invalidBarcode }"
                :aria-checked="flags.invalidBarcode"
                role="radio"
                @click="flags.invalidBarcode = true"
              >YES</button>
            </div>
          </div>


        </div>

        <!-- Bottom Form Control Action Buttons Row -->
        <div class="form-actions-row">
          <!-- Clear / Reset Parameters Trigger -->
          <button type="button" class="action-btn-clear" @click="handleClear">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Clear
          </button>

          <!-- Save / Persist Entry Data Trigger -->
          <button type="button" class="action-btn-save" @click="handleSave">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 3 7 8 15 8"></polyline>
            </svg>
            Save
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import MenuTop from '../../components/menutop/index.vue';
import { store } from '../../util/store.js';

const router = useRouter();
const route = useRoute();

/** Article code extracted from the route query parameter. */
const targetArticleCode = computed(() => route.query.articleCode || '');

/** Local reactive refs for the quantity counter and exception flags. */
const quantity = ref(0);
const flags = ref({
  damages: false,
  noBarcode: false,
  invalidBarcode: false
});

/** Looks up the current item from the active delivery in the reactive store. */
const activeItem = computed(() => {
  const cachedData = store.cache.entityLists['ActiveDelivery'];
  if (!cachedData) return null;
  const activeDoc = Array.isArray(cachedData) ? cachedData[0] : cachedData;
  if (!activeDoc || !activeDoc.items) return null;
  return activeDoc.items.find(item => item.code === targetArticleCode.value) || null;
});

/**
 * Callback for the 'zebra-hardware-scan-completed' custom event
 * emitted by Main.vue when the hardware wedge scanner decodes a
 * barcode. If the scanned article matches the one currently on
 * screen, the quantity display is updated live without a route change.
 *
 * @param {CustomEvent} event - Contains { articleCode, newQty }.
 */
const handleHardwareLaserBroadcast = (event) => {
  const { articleCode, newQty } = event.detail;
  
  if (articleCode === targetArticleCode.value) {
    console.log(`[RECEIPT SCREEN EVENT] Continuous scan captured for ${articleCode}. New Qty: ${newQty}`);
    
    // Update the local reactive quantity ref
    quantity.value = newQty;

    // Direct DOM sync fallback to force layout repaint on slower WebView renders
    const nativeCounterLabel = document.getElementById('lblCapturedQty');
    if (nativeCounterLabel) {
      nativeCounterLabel.textContent = newQty;
    }
  }
};

/** Adjusts the local quantity by the given delta, clamped to a minimum of 0. */
const adjustQty = (amount) => {
  quantity.value = Math.max(0, quantity.value + amount);
};

/** Resets the quantity counter and all exception flags to their defaults. */
const handleClear = () => {
  console.log("[FORM ACTION] Resetting input trackers to default states...");
  quantity.value = 0;
  flags.value.damages = false;
  flags.value.noBarcode = false;
  flags.value.invalidBarcode = false;
};

/**
 * Commits the local quantity and flag values back to the matching
 * item in the reactive store, then navigates to the PO-items list.
 */
const handleSave = () => {
  if (!activeItem.value) return;
  console.log(`[STORE WRITE] Committing quantities back onto product row cache target: ${activeItem.value.code}`);
  
  // Write local state back to the reactive store item
  activeItem.value.recptQty = parseInt(quantity.value, 10) || 0;
  activeItem.value.flags = {
    damages: !!flags.value.damages,
    noBarcode: !!flags.value.noBarcode,
    invalidBarcode: !!flags.value.invalidBarcode
  };
  
  router.push('/po_items');
};

onMounted(() => {
  // Hydrate local refs from the store when the page first loads
  if (activeItem.value) {
    quantity.value = activeItem.value.recptQty || 0;
    if (activeItem.value.flags) {
      flags.value.damages = !!activeItem.value.flags.damages;
      flags.value.noBarcode = !!activeItem.value.flags.noBarcode;
      flags.value.invalidBarcode = !!activeItem.value.flags.invalidBarcode;
    }
  }

  // Listen for hardware scanner broadcasts on the global window
  window.addEventListener('zebra-hardware-scan-completed', handleHardwareLaserBroadcast);
});

onUnmounted(() => {
  // Remove the scanner event listener to prevent background leaks
  window.removeEventListener('zebra-hardware-scan-completed', handleHardwareLaserBroadcast);
});
</script>





<style scoped>
.receipt-item-view {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  box-sizing: border-box;
}

.content-workspace {
  padding-top: 0.75rem !important;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  padding-bottom: 0.75rem;
  width: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  align-items: center;
}

/* Info Summary Card styling wrapper block */
.summary-card {
  width: 100%;
  max-width: 440px;
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.85rem 1rem;
  box-sizing: border-box;
  text-align: left;
}

.product-title {
  font-size: 1.05rem;
  font-weight: bold;
  line-height: 1.3;
  margin: 0 0 0.4rem 0;
  color: var(--text-main);
}

.meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 0.5rem;
}

.meta-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-family: monospace;
}

.meta-val {
  color: var(--text-main);
}

.text-right {
  text-align: right;
}

/* Captured Quantity Text Field feedback selector color tracking */
.status-counter {
  font-size: 1.15rem;
  font-weight: bold;
  font-family: monospace;
  color: var(--text-muted);
  margin-bottom: 0.25rem;
}

.status-counter.has-qty {
  color: var(--accent-color); /* Transforms immediately into green accent color */
}

.vendor-stamp {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-family: monospace;
}

/* Stepper incremental matrix layout styling keys */
.stepper-row {
  width: 100%;
  max-width: 440px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.step-btn {
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  border-radius: 6px;
  padding: 0.6rem 0;
  font-size: 0.95rem;
  font-weight: bold;
  cursor: pointer;
  outline: none;
  font-family: monospace;
}

.step-btn:active {
  background-color: var(--border-color);
}

.step-btn:focus,
.step-btn:focus-visible {
  background-color: var(--border-color);
}

/* Exception flag toggle lists mapping rules */
.toggles-list {
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.toggle-row {
  width: 100%;
  background-color: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.5rem 0.85rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
}

.toggle-label {
  font-size: 1rem;
  color: var(--text-main);
}

/* Custom segmented controls styling tracks */
.binary-switch {
  display: flex;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  overflow: hidden;
  padding: 2px;
}

.switch-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 0.5rem 1.15rem;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
  outline: none;
  transition: all 0.1s ease;
}

/* Toggle option highlight background states */
.switch-btn.segment-no.active {
  background-color: var(--accent-color); /* Standard layout neon active state green color token */
  color: var(--accent-contrast);
}

.switch-btn.segment-yes.active {
  background-color: var(--accent-color);
  color: var(--accent-contrast);
}

/* Footer Action Buttons Section Layout */
.form-actions-row {
  width: 100%;
  max-width: 440px;
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: 0.6rem;
  margin-top: auto;
  padding-top: 0.5rem;
}

/* Red Clear Button */
.action-btn-clear {
  background-color: transparent;
  border: 1px solid rgba(var(--danger-rgb), 0.35);
  color: var(--danger-color);
  border-radius: 6px;
  padding: 0.7rem 0;
  font-size: 0.95rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  cursor: pointer;
}

.action-btn-clear:active {
  background-color: rgba(var(--danger-rgb), 0.08);
}

/* Green Bright Save Action Button */
.action-btn-save {
  background-color: var(--accent-color);
  color: var(--accent-contrast);
  border: none;
  border-radius: 6px;
  padding: 0.7rem 0;
  font-size: 0.95rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  cursor: pointer;
  box-shadow: var(--accent-shadow);
}

.action-btn-save:active {
  opacity: 0.9;
}
</style>
