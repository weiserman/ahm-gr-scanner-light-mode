<template>
  <div v-if="isOpen" class="custom-dialog-overlay" role="dialog" aria-modal="true" @click.self="handleBackdropClick">
    <div class="custom-dialog-card">
      <!-- Header / Type Label -->
      <h3 class="custom-dialog-title" :class="type">
        {{ type }}
      </h3>
      
      <!-- Message Body -->
      <p class="custom-dialog-message">
        {{ message }}
      </p>

      <!-- Input Field for Prompt Only -->
      <div v-if="type === 'prompt'" class="custom-dialog-input-container">
        <input 
          v-model="promptValue" 
          type="text" 
          class="custom-dialog-input"
          @keyup.enter="handleAction('confirm')"
          ref="inputRef"
          autofocus
        />
      </div>

      <!-- Action Buttons (Stacked vertically on tiny screens, side-by-side on mobile/tablet) -->
      <div class="custom-dialog-actions" :class="{ 'single-btn': type === 'alert' }">
        <button 
          v-if="type !== 'alert'" 
          @click="handleAction('cancel')"
          class="btn-secondary"
        >
          Cancel
        </button>
        <button 
          @click="handleAction('confirm')"
          class="btn-primary"
        >
          OK
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, watch, ref } from 'vue';
import { useDialog } from './useDialog.js';

const { isOpen, type, message, promptValue, handleAction } = useDialog();
const inputRef = ref(null);

// Auto-focus input when a prompt opens
watch([isOpen, type], async () => {
  if (isOpen.value && type.value === 'prompt') {
    await nextTick();
    inputRef.value?.focus();
  }
});

// Optional safety: treat backdrop clicks as cancellation/dismissal
const handleBackdropClick = () => {
  if (type.value === 'alert') {
    handleAction('confirm');
  } else {
    handleAction('cancel');
  }
};
</script>

<style scoped>
/* 1. Reset & Fullscreen Semi-Transparent Dimmer */
.custom-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(17, 24, 39, 0.18); /* Darker backdrop to emphasize your dark theme dashboard */
  backdrop-filter: blur(2px); /* Soft focus effect for modern mobile layouts */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999999;
  font-family: monospace;
  padding: 16px; /* Prevents card from hitting screen edges on small devices */
  box-sizing: border-box;
}

/* 2. Responsive Card Layout matching your terminal theme */
.custom-dialog-card {
  background: var(--surface-color); /* True dark background */
  border: 1px solid var(--border-color); /* Subdued frame borders */
  padding: 24px;
  width: 100%;
  max-width: 400px; /* Fluid boundary on mobile screens */
  box-shadow: 0px 10px 30px rgba(17, 24, 39, 0.12);
  text-align: left;
  box-sizing: border-box;
}

/* 3. Terminal Header labels styling */
.custom-dialog-title {
  margin: 0 0 16px 0;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 2px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
  font-weight: bold;
}
/* Color-coded alert categories matching tech dashboards */
.custom-dialog-title.alert { color: var(--text-muted); }
.custom-dialog-title.confirm { color: #4ade80; } /* Matrix/Terminal green indicator */
.custom-dialog-title.prompt { color: #60a5fa; }

/* 4. Readable monospace body message text */
.custom-dialog-message {
  font-size: 14px;
  color: var(--text-main); /* Off-white for reduced eye-strain */
  margin: 0 0 24px 0;
  white-space: pre-wrap;
  line-height: 1.5;
}

/* 5. Fluid Responsive inputs */
.custom-dialog-input-container {
  margin-bottom: 24px;
}
.custom-dialog-input {
  width: 100%;
  box-sizing: border-box;
  font-family: monospace;
  font-size: 14px;
  padding: 12px; /* Large touch target */
  background: var(--bg-color);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  outline: none;
}
.custom-dialog-input:focus {
  border-color: var(--accent-color); /* Changes border to dashboard green on focus */
}

/* 6. Optimized Mobile Touch Controls */
.custom-dialog-actions {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Splitting keys evenly for fingers */
  gap: 12px;
}
.custom-dialog-actions.single-btn {
  grid-template-columns: 1fr; /* Spans across full width if it is just a solitary OK option */
}

/* 7. Action Button Overhaul */
.btn-primary, .btn-secondary {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 14px 16px; /* Generous padding padding matches mobile touch standards (min 44px height) */
  font-family: monospace;
  font-size: 13px;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
}

/* Subtle highlighting styling for primaries */
.btn-primary {
  background: var(--bg-color);
  border-color: var(--border-color);
  color: var(--text-main);
}
.btn-primary:active {
  background: rgba(22, 163, 74, 0.12); /* Touch feedback flashes green on click/tap */
  color: var(--accent-color);
  border-color: var(--accent-color);
}

.btn-secondary:active {
  background: var(--bg-color);
  color: var(--text-main);
}

/* Tailwind-style fallback responsive block tweak for very narrow viewports (<340px) */
@media (max-width: 340px) {
  .custom-dialog-actions {
    grid-template-columns: 1fr; /* Stack buttons vertically if screen is incredibly tiny */
  }
}
</style>

