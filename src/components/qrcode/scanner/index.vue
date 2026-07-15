<template>
  <div class="scanner-page">
    <header class="scanner-header">
      <button type="button" @click="handleCancel" class="back-btn">← Back</button>
      <h2>Camera Scanner</h2>
    </header>

    <main class="scanner-body">
      <!-- The critical DOM mount point for the html5-qrcode engine -->
      <div id="qr-code-region"></div>
      
      <!-- Status message tracking layout -->
      <div v-if="feedbackMessage" class="feedback-banner" :class="feedbackStatus">
        {{ feedbackMessage }}
      </div>
    </main>
  </div>
</template>

<script setup>
/**
 * Camera-based barcode / QR-code scanner component.
 *
 * Wraps the vendored html5-qrcode library and adds an Android-native
 * permission-acquisition flow that coordinates with the AHM WebView
 * event bus before starting the camera stream.
 */
import { ref, onMounted, onBeforeUnmount } from 'vue';
import '../../../lib/html5-qrcode/html5-qrcode.min.js';

/** Global library handle exposed by the vendored script on window. */
const Html5QrCode = window.__Html5QrcodeLibrary__;

const emit = defineEmits(['close', 'scanned']);

const feedbackMessage = ref('Initializing camera matrix...');
const feedbackStatus = ref('');
let scannerInstance = null;

/**
 * Pauses execution for the specified number of milliseconds.
 *
 * @param {number} ms - Milliseconds to sleep.
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Probes the local AHM native endpoint to determine whether the app is
 * running inside the Android WebView host (native) or a desktop browser.
 * A short abort timeout ensures the check never blocks the UI.
 *
 * @returns {Promise<boolean>} True when the native device-info API responds.
 */
const checkIsNativeEnvironment = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    
    const response = await fetch('/api/device/info', {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (e) {
    return false;
  }
};

/**
 * Acquires the Android CAMERA permission through the AHM native event bus.
 *
 * The flow has three stages:
 *   A. Fast-path pre-check — queries the current permission status and
 *      returns immediately when already GRANTED.
 *   B. Request trigger — posts to the native permissions-request endpoint,
 *      which surfaces the OS dialog.
 *   C. Asynchronous polling — polls the status endpoint at 500 ms intervals
 *      (up to 30 s) until the user grants or the timeout expires.
 *
 * On desktop browsers (non-native environment) the check is bypassed
 * entirely and the function resolves to true.
 *
 * @returns {Promise<boolean>} True when the camera permission is granted.
 */
const acquireCameraHardwareClearance = async () => {
  const cameraPermission = 'android.permission.CAMERA';
  const payloadData = { permissions: [cameraPermission] };

  try {
    const isNative = await checkIsNativeEnvironment();
    if (!isNative) {
      console.log('-> [SCANNER] Running in desktop dev browser fallback mode. Bypassing native hooks.');
      return true;
    }

    // Stage A: Fast-path — check if permission was already granted
    const statusResponse = await fetch('/api/permissions/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadData)
    });
    
    if (statusResponse.ok) {
      const matrixData = await statusResponse.json();
      if (matrixData.permissions_matrix && matrixData.permissions_matrix[cameraPermission] === 'GRANTED') {
        console.log('-> [SCANNER-FAST-PATH] Camera permission already verified as GRANTED.');
        return true;
      }
    }

    // Stage B: Trigger the OS permission dialog via the native event bus
    feedbackMessage.value = 'Requesting system hardware access permissions...';
    feedbackStatus.value = 'warning';

    const reqResponse = await fetch('/api/permissions/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadData)
    });

    if (reqResponse.status !== 202) {
      throw new Error(`Native permissions event bus rejected query with status: ${reqResponse.status}`);
    }

    // Stage C: Poll the status endpoint until the user responds (max 30 s)
    const maxAttempts = 60;
    let currentAttempt = 0;
    let isGranted = false;

    while (currentAttempt < maxAttempts) {
      await sleep(500);
      currentAttempt++;

      const checkResponse = await fetch('/api/permissions/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadData)
      });

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.permissions_matrix && checkData.permissions_matrix[cameraPermission] === 'GRANTED') {
          isGranted = true;
          break;
        }
      }
    }

    return isGranted;

  } catch (err) {
    console.error('Camera allocation transaction layer collapsed:', err.message);
    return false;
  }
};

onMounted(async () => {
  // Initialize the html5-qrcode engine targeting the mount-point div
  scannerInstance = new Html5QrCode.Html5Qrcode("qr-code-region");

  // Gate the camera stream behind the native permission-acquisition flow
  const hasPermission = await acquireCameraHardwareClearance();

  if (hasPermission) {
    startCameraStream();
  } else {
    feedbackMessage.value = 'Camera Access Denied. Camera permission is required to scan codes.';
    feedbackStatus.value = 'error';
    console.warn('[SCANNER] Aborted camera stream — permission not granted.');
  }
});

onBeforeUnmount(() => {
  stopCameraStream();
});

/**
 * Starts the rear-camera video stream via the html5-qrcode engine and
 * wires up the detection and tick-failure callbacks.
 */
const startCameraStream = async () => {
  try {
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    feedbackMessage.value = 'Connecting to hardware device webcam channels...';
    feedbackStatus.value = 'warning';

    // This call will trigger your updated MainActivity onPermissionRequest gate automatically and silently!
    await scannerInstance.start({ facingMode: "environment" }, config, onQrCodeDetected, onScanTickFailure);
    
    feedbackMessage.value = 'Align the barcode or QR code inside the frame.';
    feedbackStatus.value = '';
  } catch (err) {
    feedbackMessage.value = `Camera Activation Failed: ${err}`;
    feedbackStatus.value = 'error';
    console.error(err);
  }
};

/**
 * Callback invoked by html5-qrcode on every successfully decoded frame.
 * Stops the camera immediately, attempts to parse the payload as JSON
 * (falling back to a plain-text wrapper), and emits the 'scanned' event.
 *
 * @param {string} decodedText - The raw decoded barcode / QR string.
 */
const onQrCodeDetected = async (decodedText) => {
  console.log('[SCANNER] Decoded QR string:', decodedText);
  await stopCameraStream();

  const payloadToEmit = { rawText: decodedText };
  try {
    const parsed = JSON.parse(decodedText);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      Object.assign(payloadToEmit, parsed);
    }
  } catch {
    // Not JSON — expose the raw string via the odataUrl fallback key
    payloadToEmit.odataUrl = decodedText;
  }

  emit('scanned', payloadToEmit);
};

/**
 * Continuous per-frame callback fired when no QR code is detected.
 * Kept intentionally silent to avoid per-frame console noise.
 */
const onScanTickFailure = () => {};

/** Stops the active camera stream and releases the hardware track lock. */
const stopCameraStream = async () => {
  if (scannerInstance && scannerInstance.isScanning) {
    try {
      await scannerInstance.stop();
      console.log('Webcam track closed cleanly.');
    } catch (err) {
      console.error('Failed stopping scanner frame loop threads:', err);
    }
  }
};

/** Cancels the scanner UI and emits 'close' to the parent component. */
const handleCancel = async () => {
  await stopCameraStream();
  emit('close');
};

</script>


<style scoped>
.scanner-page {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background-color: var(--bg-color); color: var(--text-main);
  display: flex; flex-direction: column; z-index: 9999;
}
.scanner-header {
  height: 56px; background-color: var(--surface-color);
  display: flex; align-items: center; padding: 0 1rem; gap: 1rem;
}
.back-btn {
  background: transparent; border: none; color: var(--text-main); font-size: 1rem; cursor: pointer;
}
.scanner-body {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem; gap: 1.5rem;
}

/* Ensure the library injection respects our maximum responsive wrapper limits */
#qr-code-region {
  width: 100%; max-width: 400px; border-radius: 12px; overflow: hidden;
  background-color: var(--surface-color); border: 2px solid var(--border-color);
}

/* Deeper element targeting overrides for code injected directly by html5-qrcode */
:deep(#qr-code-region video) {
  width: 100% !important; height: auto !important; object-fit: cover !important;
}

.feedback-banner {
  padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.9rem; text-align: center; max-width: 400px;
}
.feedback-banner.error { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid #ef4444; }
.feedback-banner.success { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid #10b981; }
.feedback-banner.warning { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid #f59e0b; }
</style>
