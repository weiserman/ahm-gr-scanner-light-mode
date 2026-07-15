/**
 * @file Barcode Scanner Shared State.
 *
 * Exposes reactive refs that track the global scanner state so that
 * the focus-management logic in Main.vue and the QR scanner component
 * can coordinate without direct coupling.
 *
 * @module barcodeScanner
 */

import { ref } from 'vue';

/** Whether the background hardware-scanner focus loop is active. */
export const isGlobalScanningActive = ref(true);

/** Whether the webcam/QR scanner overlay is currently open. */
export const isWebcamScannerOpen = ref(false);

/**
 * Determines whether the user is actively typing into a form field.
 * Returns false when focus is on the hidden hardware-scanner input
 * (identified by the 'zebra-hidden-guardian' CSS class).
 *
 * @returns {boolean} True when the webcam scanner is open or focus is
 *                    on a user-facing input, textarea, or select element.
 */
export function isUserEditing() {
  // Yield to the camera module when it is active
  if (isWebcamScannerOpen.value) return true;

  const activeEl = document.activeElement;
  if (!activeEl) return false;

  const tagName = activeEl.tagName.toLowerCase();
  
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
    if (activeEl.classList.contains('zebra-hidden-guardian')) {
      return false;
    }
    return true;
  }
  
  return false;
}
