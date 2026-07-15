<template>
  <div class="minimal-container">
    <router-view></router-view>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { isWebcamScannerOpen } from './util/barcodeScanner.js';
import { store } from './util/store.js';

const route = useRoute();
const router = useRouter();

let scanCatcher = null;

/**
 * Determines whether the user is actively typing into a standard form field
 * (input, textarea, or select). The hidden hardware-scanner input is excluded
 * so that focus can be reclaimed without interrupting manual data entry.
 *
 * @returns {boolean} True when focus is on a user-facing form control or the
 *                    webcam scanner overlay is open.
 */
const isUserManuallyTyping = () => {
  if (isWebcamScannerOpen.value) return true; // Yield to camera module

  const activeEl = document.activeElement;
  if (!activeEl) return false;

  const tagName = activeEl.tagName.toLowerCase();
  
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
    if (activeEl.id === 'hardwareScanCatcher') {
      return false;
    }
    return true; // Picker is actively writing a manual form layout
  }
  return false;
};

/**
 * Returns focus to the hidden hardware-scanner input so that the next
 * Zebra wedge keystroke is captured, but only when the user is not
 * actively typing into another field.
 */
const reclaimScannerFocus = () => {
  if (!isUserManuallyTyping() && scanCatcher) {
    scanCatcher.focus();
  }
};

/**
 * Capture-phase click handler attached to document. After any click that
 * does NOT land on a form input, the scanner focus is reclaimed with a
 * short delay to let the browser finish its own focus bookkeeping.
 *
 * @param {MouseEvent} event - The capture-phase click event.
 */
const handleWindowClickReclaim = (event) => {
  const tag = event.target && event.target.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea') return;
  setTimeout(reclaimScannerFocus, 50);
};

/**
 * Handles the Enter key-down event emitted by the hidden hardware-scanner
 * input. Zebra wedge scanners emulate a keyboard: they type the decoded
 * barcode string into the focused element and then fire an Enter key.
 *
 * Flow:
 *  1. Prevent the default Enter behaviour.
 *  2. Read and clear the accumulated barcode string.
 *  3. Dispatch the value to processScannedBarcode().
 *
 * @param {KeyboardEvent} event - The keydown event from the hidden input.
 */
const handleHardwareWedgeInput = (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    const rawScanString = scanCatcher.value.trim();
    scanCatcher.value = ''; // Clear buffer immediately for the next rapid scan

    if (!rawScanString) return;

    processScannedBarcode(rawScanString);
  }
};

/**
 * Processes a barcode string captured by the Zebra hardware wedge scanner.
 *
 * Behaviour depends on the current route:
 *
 * • /register_delivery — The barcode is injected directly into the delivery-
 *   number input field so the existing form pipeline can process it.
 *
 * • All other routes — The barcode is matched against the items of the
 *   currently active delivery (loaded in the global reactive store). On a
 *   match the item's received quantity is incremented, a custom
 *   'zebra-hardware-scan-completed' event is dispatched (allowing the
 *   receipt-item view to update live without a route change), and the
 *   router navigates to the receipt-item detail screen if not already there.
 *
 * @param {string} barcodeString - The raw barcode/ean string from the scanner.
 */
const processScannedBarcode = (barcodeString) => {
  // On the registration screen, fill the PO/STO/DC input directly
  if (route.path === '/register_delivery') {
    const deliveryInput = document.querySelector('input[placeholder*="PO, STO, DC"]');
    if (deliveryInput) {
      deliveryInput.value = barcodeString;
      deliveryInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    return;
  }

  // Match the barcode against the active delivery's item list
  const cachedData = store.cache.entityLists['ActiveDelivery'];
  if (!cachedData) return;

  const activeDoc = Array.isArray(cachedData) ? cachedData[0] : cachedData;
  if (!activeDoc || !activeDoc.items) return;

  const matchedItem = activeDoc.items.find(item =>
    item.code === barcodeString || item.vendorId === barcodeString
  );

  if (matchedItem) {
    // Increment the item's received-quantity counter in the reactive store
    matchedItem.recptQty = (parseInt(matchedItem.recptQty, 10) || 0) + 1;

    // Broadcast a global event so the receipt-item view can update live
    // without a router transition when the user is already on that screen
    window.dispatchEvent(new CustomEvent('zebra-hardware-scan-completed', {
      detail: { articleCode: matchedItem.code, newQty: matchedItem.recptQty }
    }));

    // Navigate to the receipt-item screen only if not already viewing it
    if (route.path !== '/receipt_item' || route.query.articleCode !== matchedItem.code) {
      router.push({
        path: '/receipt_item',
        query: { articleCode: matchedItem.code }
      });
    }
  }
};


/**
 * Watches route transitions and reclaims scanner focus after a short delay,
 * ensuring the hidden input is always ready to capture the next wedge scan
 * regardless of which view is currently active.
 */
watch(() => route.path, () => {
  setTimeout(reclaimScannerFocus, 100);
});

onMounted(() => {
  // Programmatically create a hidden input that acts as the keystroke sink
  // for the Zebra hardware wedge scanner (it emulates keyboard input)
  scanCatcher = document.createElement('input');
  scanCatcher.type = 'text';
  scanCatcher.id = 'hardwareScanCatcher';

  // Suppress the on-screen keyboard on Android WebView while still
  // allowing hardware keystrokes to land in the input
  scanCatcher.inputMode = 'none';
  scanCatcher.setAttribute('inputmode', 'none');

  // Position the element off-screen and make it invisible / non-interactive
  scanCatcher.style.position = 'fixed';
  scanCatcher.style.opacity = '0';
  scanCatcher.style.pointerEvents = 'none';
  scanCatcher.style.left = '-999px';
  scanCatcher.style.top = '0';
  scanCatcher.style.width = '1px';
  scanCatcher.style.height = '1px';
  scanCatcher.style.zIndex = '-999999';

  document.body.appendChild(scanCatcher);

  // Attach the wedge keydown listener and the global click-to-reclaim handler
  scanCatcher.addEventListener('keydown', handleHardwareWedgeInput);
  document.addEventListener('click', handleWindowClickReclaim, true);

  reclaimScannerFocus();

  // Background stabiliser: periodically re-asserts scanner focus to guard
  // against edge cases where third-party UI or route guards steal it
  window.zebraFocusStabilizer = setInterval(reclaimScannerFocus, 1000);
});

onUnmounted(() => {
  // Tear down the hidden scanner input and all associated listeners
  if (scanCatcher && document.body.contains(scanCatcher)) {
    scanCatcher.removeEventListener('keydown', handleHardwareWedgeInput);
    document.body.removeChild(scanCatcher);
  }
  document.removeEventListener('click', handleWindowClickReclaim, true);
  if (window.zebraFocusStabilizer) clearInterval(window.zebraFocusStabilizer);
});
</script>

<style>
.minimal-container {
  width: 100%;
  box-sizing: border-box;
}
</style>

