<template>
  <div class="view-wrapper">
    <div class="view-header">Setup Required</div>
    <PinMobile 
      ref="pinSetupRef"
      :title="pinTitle"
      :error-message="errorMessage"
      @submit="handleSetupPin" 
    />
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
  firstPinEntry.value ? 'Confirm New PIN' : 'Create New PIN'
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
