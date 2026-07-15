/**
 * Service Worker Registration and Cross-Thread Messaging Module.
 *
 * Provides helpers for:
 *   - Registering the background service worker and waiting for it to
 *     become fully active without triggering a reload loop.
 *   - Posting arbitrary payloads from the main thread to the active worker.
 *   - Attaching a listener that forwards worker responses back to callers.
 *
 * @module serviceWorker
 */

/**
 * Registers the service worker script and waits for it to reach the
 * 'activated' state. Uses the native `navigator.serviceWorker.ready`
 * promise to confirm the worker is fully initialised, avoiding the
 * common window.location.reload() infinite-loop pitfall.
 *
 * @param {string} [workerScriptPath='/sw.js'] - Path to the service worker script.
 */
export function registerServiceWorker(workerScriptPath) {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    const targetPath = workerScriptPath || '/sw.js';
    console.log('[SW REGISTER] Initiating registration for:', targetPath);

    navigator.serviceWorker.register(targetPath)
      .then((registration) => {
        console.log('[SW REGISTER] Registered with scope:', registration.scope);

        // Wait for the worker to finish installing and become active
        navigator.serviceWorker.ready.then((readyReg) => {
          console.log('[SW REGISTER] Worker is fully initialised and active.');
        });
      })
      .catch((error) => {
        console.error('[SW REGISTER] Registration failed:', error);
      });
  });
}

/**
 * Posts a message payload to the currently controlling service worker.
 * No-op when no worker is active (e.g. in development without SW).
 *
 * @param {*} messageDataPayload - The data to send to the service worker.
 */
export function sendWorkerMessage(messageDataPayload) {
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(messageDataPayload);
  }
}

/**
 * Attaches a persistent 'message' listener on the service worker
 * container so that responses pushed from the worker thread are
 * forwarded to the supplied callback.
 *
 * @param {function(*): void} onMessageReceivedCallback - Invoked with the
 *   event.data payload each time the worker posts a message.
 */
export function listenForWorkerMessages(onMessageReceivedCallback) {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (typeof onMessageReceivedCallback === 'function') {
      console.log('[SW MESSAGE]', event.data);
      onMessageReceivedCallback(event.data);
    }
  });
}
