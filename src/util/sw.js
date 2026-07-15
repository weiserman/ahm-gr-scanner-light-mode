/**
 * @file Service Worker State Synchroniser.
 *
 * Activates or deactivates the mock service worker based on the
 * store's useDummyData flag. When mock mode is on the mock-sw.js
 * worker intercepts all fetch requests; when off, any existing
 * registrations are removed and the page is reloaded.
 *
 * @module sw
 */

import { store } from './store.js';

/**
 * Synchronises the active service worker registration with the
 * current mock-data toggle in the store.
 */
export function syncServiceWorkerState() {
  if (!('serviceWorker' in navigator)) {
    console.warn('[SERVICE WORKER] Context is unavailable on this device architecture.');
    return;
  }

  if (store.config.useDummyData) {
    navigator.serviceWorker.register('mock-sw.js')
      .then((registration) => {
        console.log('[SERVICE WORKER] Mocking proxy successfully registered.');
        
        // If the worker is already installed, force immediate activation
        if (registration.active) {
          registration.active.postMessage({ action: 'skipWaiting' });
        }
      })
      .catch(err => console.error('[SERVICE WORKER] Registration failure:', err));
  } else {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then(() => {
          console.log('[SERVICE WORKER] Mocking proxy deactivated.');
          // Force page refresh to return fetch controllers back to normal browser engines
          window.location.reload(); 
        });
      }
    });
  }
}

