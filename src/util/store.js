/**
 * @file Global Reactive Application Store.
 *
 * A single Vue-reactive object persisted to localStorage that holds all
 * cross-cutting state: user session, PIN, SAP OData connection config,
 * entity cache, and offline-simulation flag.
 *
 * The store is attached to `window.__GLOBAL_APP_STORE__` so that any
 * module — including non-Vue scripts — can read/write it without
 * importing a Vue composable.
 *
 * @module store
 */

import { reactive, watch } from 'vue';

/** localStorage key used for persisting the reactive store between sessions. */
const STORAGE_KEY = 'vue_sfc_template_store';

/**
 * Factory-default state shape. Used as the initial value when no
 * persisted state exists, and as a reference when migrating older schemas.
 */
const defaultState = {
  user: { name: 'User', isLoggedIn: false },
  appPin: null,
  config: {
    baseHost: 'https://s4hana2025.professorsoft.com:44300',
    poPath: '/sap/opu/odata4/sap/zgr_ui_poscan_o4/srvd_a2x/sap/zgr_ui_poscan_o4/0001/',
    grPath: '/sap/opu/odata4/sap/zgr_grdoc_api/srvd_a2x/sap/zgr_ui_grdoc_o4/0001',
    username: '',
    password: '',
    networkTimeoutMs: 5000,
    useDummyData: false,
    sapClient: '100'
  },
  cache: {
    metadataRawXml: '',
    entityLists: {}
  },
  simulatedOffline: false
};

/**
 * Loads the persisted store from localStorage, migrating older schemas
 * to the current shape. Returns the factory defaults when no saved
 * state exists or when parsing fails.
 *
 * Side effect: always sets isLoggedIn to false so every cold start
 * requires the user to re-authenticate via the PIN screen.
 *
 * @returns {object} The hydrated (or default) state object.
 */
const getInitialState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { ...defaultState };
    
    const parsed = JSON.parse(saved);
    let migrated = false;

    // Ensure nested state nodes exist for older persisted schemas
    if (!parsed.cache) parsed.cache = { ...defaultState.cache };
    if (parsed.simulatedOffline === undefined) parsed.simulatedOffline = false;
    if (!parsed.user) { parsed.user = { ...defaultState.user }; migrated = true; }

    // Migrate config — handle the legacy 'odataUrl' field from older versions
    if (!parsed.config) {
      parsed.config = { ...defaultState.config };
      migrated = true;
    } else {
      // Migrate the deprecated single 'odataUrl' to the split host/path structure
      if (parsed.config.odataUrl && !parsed.config.baseHost) {
        try {
          const urlObj = new URL(parsed.config.odataUrl);
          parsed.config.baseHost = `${urlObj.protocol}//${urlObj.host}`;
          // Attempt to extract path segments; fall back to raw string on parse error
          parsed.config.poPath = urlObj.pathname; 
          parsed.config.grPath = urlObj.pathname; // Default both to old path initially
        } catch (e) {
          parsed.config.baseHost = parsed.config.odataUrl;
        }
        delete parsed.config.odataUrl;
        migrated = true;
      }
      
      // Backfill any fields introduced in later schema versions
      if (!parsed.config.baseHost) parsed.config.baseHost = defaultState.config.baseHost;
      if (!parsed.config.poPath) parsed.config.poPath= defaultState.config.poPath;
      if (!parsed.config.grPath) parsed.config.grPath = defaultState.config.grPath;
      if (parsed.config.networkTimeoutMs === undefined) parsed.config.networkTimeoutMs = defaultState.config.networkTimeoutMs;
      if (parsed.config.sapClient === undefined) parsed.config.sapClient = defaultState.config.sapClient;
    }

    // Persist migrated state immediately so subsequent loads start clean
    if (migrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }

    // Force locked state on every cold start — user must re-authenticate via PIN
    console.log('[STORE INIT] Revoking active login credentials for safety...');
    parsed.user.isLoggedIn = false;
    return parsed;
  } catch (error) {
    console.error('[STORE ERROR] Parse breakdown encountered. Using defaults.', error);
    return { ...defaultState };
  }
};

// Singleton: attach the reactive store to window for cross-module access
if (!window.__GLOBAL_APP_STORE__) {
  window.__GLOBAL_APP_STORE__ = reactive(getInitialState());

  // Deep-watch the store and persist every mutation to localStorage
  watch(() => window.__GLOBAL_APP_STORE__, (newState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, { deep: true });
}

/** The global reactive store instance. */
export const store = window.__GLOBAL_APP_STORE__;

/**
 * Checks whether the store contains non-empty SAP credentials
 * (both username and password).
 *
 * @returns {boolean} True when both username and password are set.
 */
export const hasConfiguredUser = () => {
  const username = typeof store.config.username === 'string' ? store.config.username.trim() : '';
  const password = typeof store.config.password === 'string' ? store.config.password.trim() : '';
  return username.length > 0 && password.length > 0;
};

/**
 * Mutating actions that operate on the global store.
 * Each action modifies the reactive object in-place so that all
 * Vue watchers and computed properties update automatically.
 */
export const storeActions = {
  /** Stores the user's PIN and marks the session as logged-in. */
  saveNewPin(pin) {
    store.appPin = String(pin);
    store.user.isLoggedIn = true;
  },
  /** Marks the session as logged-in (post-PIN verification). */
  login() {
    store.user.isLoggedIn = true;
  },
  /** Marks the session as logged-out. */
  logout() {
    store.user.isLoggedIn = false;
  },
  /**
   * Saves the full SAP OData connection configuration.
   *
   * @param {string} baseHost   - SAP host origin (e.g. 'https://host:port').
   * @param {string} poPath     - OData path for the PurchaseOrder service.
   * @param {string} grPath     - OData path for the GoodsReceipt service.
   * @param {string} user       - SAP Basic Auth username.
   * @param {string} pass       - SAP Basic Auth password.
   * @param {number|string} timeoutMs - Network timeout in milliseconds.
   * @param {boolean} [useDummyData=false] - Enable mock service worker.
   * @param {string}  [sapClient='']      - SAP client number (e.g. '100').
   */
  saveODataConfig(baseHost, poPath, grPath, user, pass, timeoutMs, useDummyData = false, sapClient = '') {
    store.config.baseHost = baseHost.replace(/\/$/, '');
    store.config.poPath = poPath;
    store.config.grPath = grPath;
    store.config.username = user;
    store.config.password = pass;
    store.config.networkTimeoutMs = parseInt(timeoutMs, 10) || 5000;
    store.config.useDummyData = !!useDummyData;
    store.config.sapClient = sapClient;
    
    console.log('[STORE ACTION] OData settings (Host + Dual Paths) updated successfully.');
  },
  /** Toggles the mock-service-worker offline simulation on or off. */
  toggleNetworkSimulation() {
    store.simulatedOffline = !store.simulatedOffline;
    console.log(`[SIMULATOR] Network Offline Simulation flipped to: ${store.simulatedOffline}`);
  },
  /** Caches the raw $metadata XML string. */
  setMetadataCache(rawXml) {
    store.cache.metadataRawXml = rawXml;
    console.log(`[CACHE STORE] Successfully backed up raw $metadata XML (Size: ${rawXml.length} chars).`);
  },
  /** Caches an array of entities under the given collection name. */
  setEntityListCache(entityName, dataArray) {
    store.cache.entityLists[entityName] = dataArray;
    console.log(`[CACHE STORE] Successfully backed up ${dataArray.length} records for collection: ${entityName}`);
  },
  /**
   * Resets the entire store to factory defaults and persists the
   * wiped state to localStorage immediately.
   */
  resetStore() {
    console.log('[STORE ACTION] Executing total state and storage wipe...');
    store.appPin = null;
    store.user.isLoggedIn = false;
    store.user.name = defaultState.user.name;

    // Reset config field-by-field to avoid stale reactive references
    store.config.baseHost = defaultState.config.baseHost;
    store.config.poPath = defaultState.config.poPath;
    store.config.grPath = defaultState.config.grPath;
    store.config.username = '';
    store.config.password = '';
    store.config.networkTimeoutMs = defaultState.config.networkTimeoutMs;
    store.config.useDummyData = defaultState.config.useDummyData;
    store.config.sapClient = defaultState.config.sapClient;

    store.cache.metadataRawXml = '';
    store.cache.entityLists = {};
    store.simulatedOffline = false;

    // Persist the wiped state immediately.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  },
  /** Nullifies the ActiveDelivery entry in the entity cache. */
  clearActiveDeliveryCache() {
    store.cache.entityLists['ActiveDelivery'] = null;
    console.log('[STORE ACTION] Active delivery cache data wiped from memory and localstorage.');
  },
  /**
   * Resets all captured receipt quantities and exception flags to zero
   * while preserving the active delivery header and item metadata.
   */
  clearCapturedReceiptItems() {
    const cachedData = store.cache.entityLists['ActiveDelivery'];
    if (!cachedData) return;

    const activeDoc = Array.isArray(cachedData) ? cachedData[0] : cachedData;
    if (!activeDoc || !Array.isArray(activeDoc.items)) return;

    activeDoc.items.forEach(item => {
      item.recptQty = 0;
      item.flags = {
        damages: false,
        noBarcode: false,
        invalidBarcode: false
      };
    });

    console.log('[STORE ACTION] Cleared captured receipt quantities while keeping active delivery data.');
  }
};   
