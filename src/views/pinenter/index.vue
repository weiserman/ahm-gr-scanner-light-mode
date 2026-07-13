<template>
  <div class="view-wrapper lock-view">
    <p class="lock-kicker">Secure access</p>
    <h1 class="view-header">App locked</h1>
    <p class="view-subtitle">Enter your PIN to continue.</p>

    <div class="pin-panel">
      <PinMobile
        ref="pinEntryRef"
        title="Unlock with PIN"
        :error-message="errorMessage"
        @submit="handleVerifyPin"
      />
    </div>

    <!-- Minimalist Forgot PIN reset trigger link -->
    <div class="forgot-container">
      <button class="forgot-btn" @click="handleForgotPin">
        Forgot PIN?
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { store, storeActions } from '../../util/store.js';
import PinMobile from '../../components/pinmobile/PinMobile.vue';

const router = useRouter();
const pinEntryRef = ref(null);
const errorMessage = ref('');

const handleVerifyPin = (enteredPin) => {
  if (String(enteredPin) === String(store.appPin)) {
    errorMessage.value = '';
    storeActions.login();
    router.push('/home'); 
  } else {
    errorMessage.value = 'Incorrect PIN code.';
    if (pinEntryRef.value) {
      pinEntryRef.value.clearAll();
    }
  }
};

// Clear out application data and bounce back to setup phase
const handleForgotPin = () => {
  const confirmReset = confirm("Are you sure you want to reset your PIN? This will wipe your saved access settings.");
  
  if (confirmReset) {
    // 1. Hand off all database mutation loops to the store action context
    storeActions.resetStore();
    
    // 2. Simply switch the window viewport page location location path string
    router.push('/setup');
  }
};

</script>

<style scoped>
.lock-view {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.25rem 1rem 1.75rem;
  box-sizing: border-box;
}

.lock-kicker {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
}

.view-header {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  color: #0f172a;
}

.view-subtitle {
  margin: 0.35rem 0 0;
  font-size: 0.9rem;
  color: #475569;
}

.pin-panel {
  margin-top: 1rem;
  width: 100%;
  max-width: 340px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border: 1px solid #dbe3ec;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
}

.lock-view :deep(.pin-screen) {
  max-width: 300px;
  padding: 1rem 1rem 0.85rem;
}

.lock-view :deep(.pin-header) {
  margin-bottom: 1rem;
  height: auto;
}

.lock-view :deep(.pin-title) {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.lock-view :deep(.pin-error) {
  font-size: 0.78rem;
}

.lock-view :deep(.pin-dots) {
  gap: 0.7rem;
  margin-bottom: 1.05rem;
}

.lock-view :deep(.pin-dot) {
  width: 11px;
  height: 11px;
}

.lock-view :deep(.pin-grid) {
  gap: 0.65rem;
  max-width: 240px;
}

.lock-view :deep(.grid-btn) {
  font-size: 1.18rem;
  border: 1px solid #dbe3ec;
  background: #f8fafc;
}

.lock-view :deep(.grid-btn:active) {
  background: #e9eef5;
}

.lock-view :deep(.functional-btn) {
  font-size: 1rem;
  color: #475569;
}

.forgot-container {
  margin-top: 0.7rem;
  text-align: center;
}

.forgot-btn {
  background: none;
  border: none;
  color: #64748b;
  text-decoration: none;
  font-family: inherit;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0.35rem 0.5rem;
  border-radius: 999px;
}

.forgot-btn:hover {
  color: #334155;
  background-color: #eef2f7;
}

@media (max-width: 380px) {
  .view-header {
    font-size: 1.45rem;
  }

  .view-subtitle {
    font-size: 0.82rem;
  }

  .lock-view :deep(.pin-screen) {
    max-width: 280px;
    padding: 0.9rem 0.85rem 0.8rem;
  }

  .lock-view :deep(.pin-grid) {
    max-width: 220px;
    gap: 0.55rem;
  }

  .lock-view :deep(.grid-btn) {
    font-size: 1.05rem;
  }
}
</style>
