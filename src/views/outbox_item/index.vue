<template>
  <div class="app-layout edit-outbox-view">
    <!--Reusable Top Navigation Bar Component-->
    <MenuTop title="EDIT OUTBOX ITEM" />

    <!--Main Entry Form Container Workspace-->
    <main class="app-content content-workspace">
      
      <div v-if="!targetItem" class="error-fallback">
        <p>Target item record could not be parsed from cache memory.</p>
        <router-link to="/scanned_goods" class="return-btn">Return to Scanned Goods</router-link>
      </div>

      <form v-else class="outbox-form" @submit.prevent="handleUpdate">
        
        <!--Field 1:Article Code(Read-Only State View)-->
        <div class="form-group">
          <label class="form-label">Article</label>
          <div class="input-container">
            <input 
              type="text" 
              :value="targetItem.code" 
              class="form-input read-only-input" 
              readonly
            />
          </div>
        </div>

        <!--Field 2:Description(Read-Only State View)-->
        <div class="form-group">
          <label class="form-label">Description</label>
          <div class="input-container">
            <textarea 
              :value="targetItem.description" 
              class="form-input text-area-input read-only-input" 
              readonly 
              rows="2"
            ></textarea>
          </div>
        </div>

        <!--Field 3:Unit of Measure(Read-Only State View)-->
        <div class="form-group">
          <label class="form-label">Unit of Measure</label>
          <div class="input-container">
            <input 
              type="text" 
              :value="targetItem.uom" 
              class="form-input read-only-input" 
              readonly
            />
          </div>
        </div>

        <!--Field 4:Editable Quantity Input Field-->
        <div class="form-group">
          <label class="form-label">Quantity</label>
          <div class="input-container">
            <input 
              type="number" 
              v-model.number="editableQuantity" 
              class="form-input numeric-input"
              min="0"
              required
            />
          </div>
        </div>

        <!--Update Quantity Submission Action Button Module-->
        <button type="submit" class="update-submit-btn">
          <!--Save Floppy Vector Disk Icon matching your design wireframe standard-->
          <svg class="btn-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          Update Quantity
        </button>

        <!--Back Navigation Button to return to Scanned Goods list-->
        <button type="button" class="back-btn" @click="router.push('/scanned_goods')">
          <svg class="btn-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back to Scanned Goods
        </button>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import MenuTop from '../../components/menutop/index.vue';
import { store } from '../../util/store.js';

const router = useRouter();
const route = useRoute();

// Extract the target article code identifier passed from the scanned goods view list
const targetArticleCode = computed(() => route.query.articleCode || '');

/**
 * Locate the explicit target item directly inside your active cache structures
 */
const targetItem = computed(() => {
  const cachedData = store.cache.entityLists['ActiveDelivery'];
  if (!cachedData) return null;
  
  const activeDoc = Array.isArray(cachedData) ? cachedData[0] : cachedData;
  if (!activeDoc || !activeDoc.items) return null;
  
  return activeDoc.items.find(item => item.code === targetArticleCode.value) || null;
});

/**
 * Create a direct, local bound proxy value to track editing quantities safely
 */
const editableQuantity = ref(targetItem.value ? targetItem.value.recptQty : 0);

const handleUpdate = () => {
  if (!targetItem.value) return;

  console.log(`[OUTBOX EDIT] Committing new quantity (${editableQuantity.value}) for item: ${targetItem.value.code}`);

  // 1. Mutate the target cache reference cell location directly in reactive memory
  targetItem.value.recptQty = parseInt(editableQuantity.value, 10) || 0;

  // 2. Return the operator seamlessly back onto the Scanned Goods checklist area trace
  router.push('/scanned_goods');
};
</script>

<style scoped>
.edit-outbox-view {
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

.outbox-form {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
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
  background-color: var(--surface-color, #ffffff);
  border: 1px solid var(--border-color, #d1d5db);
  color: var(--text-main, #111827);
  border-radius: 6px;
  padding: 0.85rem 1rem;
  font-size: 0.95rem;
  box-sizing: border-box;
  outline: none;
  font-family: system-ui, -apple-system, sans-serif;
  text-align: left;
}

.read-only-input {
  color: var(--text-muted, #6b7280);
  cursor: not-allowed;
}

.text-area-input {
  resize: none;
  line-height: 1.4;
}

.numeric-input:focus {
  border-color: var(--accent-color, #16a34a);
}

.update-submit-btn {
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
  margin-top: 1rem;
  box-sizing: border-box;
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.15);
  transition: opacity 0.1s ease;
}

.update-submit-btn:active {
  opacity: 0.9;
}

.back-btn {
  background-color: transparent;
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
  transition: background-color 0.15s ease;
}

.back-btn:active {
  background-color: var(--surface-alt, #eef1f4);
}

.btn-icon {
  display: inline-block;
  flex-shrink: 0;
}

/* Error Fallback container styling */
.error-fallback {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
}

.return-btn {
  color: var(--accent-color);
  text-decoration: underline;
  display: inline-block;
  margin-top: 1rem;
}
</style>

