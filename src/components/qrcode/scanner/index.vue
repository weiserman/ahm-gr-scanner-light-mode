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
//import { ref, onMounted, onBeforeUnmount } from 'vue';
//import Html5QrCode from '../../../lib/html5-qrcode/html5-qrcode.min.js';
//
//// Define the component communication events
//const emit = defineEmits(['close', 'scanned']);
//
//const feedbackMessage = ref('Initializing camera matrix...');
//const feedbackStatus = ref('');
//let scannerInstance = null;
//
//onMounted(() => {
//  // 1. Initialize the engine targeting our div ID
//  // Depending on your wrapper method, check if you need: new Html5QrCode.Html5Qrcode(...)
//  scannerInstance = new Html5QrCode.Html5Qrcode("qr-code-region");
//  
//  startCameraStream();
//});
//
//onBeforeUnmount(() => {
//  // 2. Crucial: Release hardware locks cleanly if user changes pages/tabs
//  stopCameraStream();
//});
//
//const startCameraStream = async () => {
//  try {
//    const config = { 
//      fps: 10, 
//      qrbox: { width: 250, height: 250 } 
//    };
//
//    // 3. Start hardware video capture tracking
//    await scannerInstance.start(
//      { facingMode: "environment" }, // Forces mobile rear camera layout
//      config,
//      onQrCodeDetected,
//      onScanTickFailure
//    );
//    
//    feedbackMessage.value = 'Align the server QR code inside the bounding box.';
//    feedbackStatus.value = '';
//  } catch (err) {
//    feedbackMessage.value = `Camera Activation Failed: ${err}`;
//    feedbackStatus.value = 'error';
//    console.error(err);
//  }
//};
//
////const onQrCodeDetected = async (decodedText) => {
////  try {
////    // 4. Kill the active camera stream instantly to stop duplicate scan events
////    await stopCameraStream();
////
////    // 5. Parse out your specific server payload string structure
////    const configData = JSON.parse(decodedText);
////    
////    feedbackMessage.value = 'Configuration loaded successfully!';
////    feedbackStatus.value = 'success';
////
////    // 6. Push the data package back up to your global store action listeners
////    emit('configScanned', configData);
////  } catch (err) {
////    // The scanned code was not your specific JSON server format. Keep scanning!
////    feedbackMessage.value = 'Invalid QR layout. Please scan a valid server setup code.';
////    feedbackStatus.value = 'warning';
////  }
////};
//const onQrCodeDetected = async (decodedText) => {
//  console.log("► Hardware detected raw QR string:", decodedText);
//
//  // 1. STOP THE CAMERA IMMEDIATELY 
//  // Doing this first ensures the camera page doesn't hang if the data processing crashes.
//  await stopCameraStream();
//
//  let payloadToEmit = null;
//
//  try {
//    // 2. Try parsing it as a structured server JSON object
//    payloadToEmit = JSON.parse(decodedText);
//    console.log("► Successfully parsed QR as JSON object:", payloadToEmit);
//  } catch (err) {
//    // 3. Fallback: If it's a raw string/URL instead of JSON, wrap it safely so it doesn't crash
//    console.warn("► QR text is not JSON. Falling back to plain text object mapping.");
//    payloadToEmit = { odataUrl: decodedText };
//  }
//
//  // 4. FORCE THE EMIT TO THE PARENT
//  console.log("► Firing 'scanned' event to parent component now.");
//  emit('scanned', payloadToEmit);
//};
//
//const onScanTickFailure = (error) => {
//  // Triggers continuously on every video frame that does not contain a QR code.
//  // We keep this function entirely silent to preserve memory performance.
//};
//
//const stopCameraStream = async () => {
//  if (scannerInstance && scannerInstance.isScanning) {
//    try {
//      await scannerInstance.stop();
//      console.log('Webcam track closed cleanly.');
//    } catch (err) {
//      console.error('Failed stopping scanner frame loop threads:', err);
//    }
//  }
//};
//
//const handleCancel = async () => {
//  await stopCameraStream();
//  emit('close');
//};
//--------------------------------------------------------------------------------
import { ref, onMounted, onBeforeUnmount } from 'vue';
//import Html5QrCode from '../../../lib/html5-qrcode/html5-qrcode.min.js';
import '../../../lib/html5-qrcode/html5-qrcode.min.js';
const Html5QrCode = window.__Html5QrcodeLibrary__;//.Html5Qrcode;
//const Html5Qrcode = window.Html5Qrcode;

const emit = defineEmits(['close', 'scanned']);
const feedbackMessage = ref('Initializing camera matrix...');
const feedbackStatus = ref('');
let scannerInstance = null;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * PURE VANILLA FETCH ENVIRONMENT AUDITOR
 * Verifies if the container is a native Android WebView host.
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
 * ZERO-DEPENDENCY JUST-IN-TIME PROMPT ENGINE
 * Orchestrates native security gates using plain fetch calls.
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

    // Step A: FAST-PATH PRE-CHECK
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

    // Step B: TRIGGER PROMPT OVERLAY VIA NATIVE EVENT BUS
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

    // Step C: ASYNCHRONOUS POLLING LAYER
    const maxAttempts = 60; // 30-second timeout safety boundary
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
  // Step 1: Initialize the structural html5-qrcode instance target selector
  scannerInstance = new Html5QrCode.Html5Qrcode("qr-code-region");
  
  // Step 2: Fire the zero-dependency permissions checkpoint
  const pathClearForStreaming = await acquireCameraHardwareClearance();
  
  if (pathClearForStreaming) {
    // Step 3: Spin up the video stream if cleared
    startCameraStream();
  } else {
    // Step 4: Revert component state safely if denied or timed out
    feedbackMessage.value = 'Camera Access Denied. Camera permission is required to scan codes.';
    feedbackStatus.value = 'error';
    console.warn('-> [SCANNER] Aborted camera stream initialization due to negative permissions clearance.');
  }
});

onBeforeUnmount(() => {
  stopCameraStream();
});

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

const onQrCodeDetected = async (decodedText) => {
  console.log("Hardware detected raw QR string:", decodedText);
  await stopCameraStream();
  const payloadToEmit = { rawText: decodedText };
  try {
    const parsedPayload = JSON.parse(decodedText);
    if (parsedPayload && typeof parsedPayload === 'object' && !Array.isArray(parsedPayload)) {
      Object.assign(payloadToEmit, parsedPayload);
    }
    console.log("Successfully parsed QR as JSON object:", parsedPayload);
  } catch (err) {
    console.warn("QR text is not JSON. Falling back to plain text object mapping.");
    payloadToEmit.odataUrl = decodedText;
  }
  console.log("Firing scanned event to parent component now.");
  emit('scanned', payloadToEmit);
};

const onScanTickFailure = (error) => {
  // Silent tick failures are expected during search frames cycles
};

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

const handleCancel = async () => {
  await stopCameraStream();
  emit('close');
};

</script>


<style scoped>
/*
.scanner-fullscreen-shell {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #000000;
  color: #ffffff;
  z-index: 9999;
  box-sizing: border-box;
}

.bar-header {
  height: 60px;
  background-color: #111111;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  border-bottom: 1px solid #222222;
  z-index: 10;
}

.nav-btn {
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem;
}

.bar-title {
  font-weight: bold;
}

.spacer-block {
  width: 50px;
}

.view-viewport {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #1a1a1a;
  position: relative;
  gap: 2rem;
  overflow: hidden;
}

.webcam-stream {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.capture-target-box {
  width: 220px;
  height: 220px;
  border: 3px solid #94a3b8;
  border-radius: 12px;
  position: relative;
  background-color: rgba(0, 0, 0, 0.15);
  z-index: 2;
  box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.45);
}

.laser-indicator {
  position: absolute;
  width: 90%;
  height: 2px;
  background-color: var(--accent-color);
  top: 50%;
  left: 5%;
  box-shadow: 0 0 8px rgba(22, 163, 74, 0.35);
}

.guide-text {
  font-size: 0.9rem;
  color: #f1f5f9;
  margin: 0;
  text-align: center;
  z-index: 2;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
}

.error-banner {
  position: absolute;
  top: 1rem;
  background-color: rgba(239, 68, 68, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  z-index: 3;
}

.bar-footer {
  padding: 1.5rem;
  background-color: #111111;
  display: flex;
  justify-content: center;
  z-index: 10;
}

.mock-action-btn {
  background-color: #ffffff;
  color: #000000;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  max-width: 300px;
}

.mock-action-btn:active {
  background-color: #cccccc;
}
*/
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
