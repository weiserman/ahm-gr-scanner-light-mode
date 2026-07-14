<template>
  <div class="view-wrapper pin-setup-view">
    <p class="setup-kicker">Security setup</p>
    <h1 class="view-header">{{ setupHeading }}</h1>
    <p class="view-subtitle">{{ setupSubtitle }}</p>

    <div class="pin-panel">
      <PinMobile
        ref="pinSetupRef"
        :title="pinTitle"
        :error-message="errorMessage"
        @submit="handleSetupPin"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeActions } from '../../util/store.js';
import PinMobile from '../../components/pinmobile/PinMobile.vue';

const router = useRouter();
const pinSetupRef = ref(null);
const firstPinEntry = ref('');
const errorMessage = ref('');

const pinTitle = computed(() => (
  firstPinEntry.value ? 'Confirm PIN' : 'Create PIN'
));
const setupHeading = computed(() => (
  firstPinEntry.value ? 'Confirm your PIN' : 'Create your PIN'
));
const setupSubtitle = computed(() => (
  firstPinEntry.value
    ? 'Re-enter your new PIN to finish secure setup.'
    : 'Set a 4-digit PIN to protect access to the app.'
));

const handleSetupPin = (chosenPin) => {
  const normalizedPin = String(chosenPin);

  if (!firstPinEntry.value) {
    firstPinEntry.value = normalizedPin;
    errorMessage.value = '';
    if (pinSetupRef.value) pinSetupRef.value.clearAll();
    return;
  }

  if (firstPinEntry.value !== normalizedPin) {
    firstPinEntry.value = '';
    errorMessage.value = 'PINs did not match. Please try again.';
    if (pinSetupRef.value) pinSetupRef.value.clearAll();
    return;
  }

  storeActions.saveNewPin(normalizedPin);
  router.push('/home'); // Send directly to dashboard home view
};
</script>

<style scoped>
.pin-setup-view {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.25rem 1rem 1.75rem;
  box-sizing: border-box;
}

.setup-kicker {
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
  text-align: center;
  max-width: 28ch;
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

.pin-setup-view :deep(.pin-screen) {
  max-width: 300px;
  padding: 1rem 1rem 0.85rem;
}

.pin-setup-view :deep(.pin-header) {
  margin-bottom: 1rem;
  height: auto;
}

.pin-setup-view :deep(.pin-title) {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.pin-setup-view :deep(.pin-error) {
  font-size: 0.78rem;
}

.pin-setup-view :deep(.pin-dots) {
  gap: 0.7rem;
  margin-bottom: 1.05rem;
}

.pin-setup-view :deep(.pin-dot) {
  width: 11px;
  height: 11px;
}

.pin-setup-view :deep(.pin-grid) {
  gap: 0.65rem;
  max-width: 240px;
}

.pin-setup-view :deep(.grid-btn) {
  font-size: 1.18rem;
  border: 1px solid #dbe3ec;
  background: #f8fafc;
}

.pin-setup-view :deep(.grid-btn:active) {
  background: #e9eef5;
}

.pin-setup-view :deep(.functional-btn) {
  font-size: 1rem;
  color: #475569;
}

@media (max-width: 380px) {
  .view-header {
    font-size: 1.45rem;
  }

  .view-subtitle {
    font-size: 0.82rem;
  }

  .pin-setup-view :deep(.pin-screen) {
    max-width: 280px;
    padding: 0.9rem 0.85rem 0.8rem;
  }

  .pin-setup-view :deep(.pin-grid) {
    max-width: 220px;
    gap: 0.55rem;
  }

  .pin-setup-view :deep(.grid-btn) {
    font-size: 1.05rem;
  }
}
</style>
