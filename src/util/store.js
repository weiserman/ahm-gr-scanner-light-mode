//import { reactive, watch } from 'vue';
//
//const STORAGE_KEY = 'vue_sfc_template_store';
//
//const defaultState = {
//  user: {
//    name: 'User',
//    isLoggedIn: false
//  },
//  appPin: null,
//  config: {
//    odataUrl: 'http://localhost:4004/odata/v4/catalog',
//    username: '',
//    password: '',
//    networkTimeoutMs: 5000,
//    useDummyData: false 
//  },
//  // NEW: Offline Caching Schema Core
//  cache: {
//    metadataRawXml: '', // Caches the raw $metadata string
//    entityLists: {}     // Dynamic bucket: { PurchaseOrder: [...], PurchaseOrderItem: [...] }
//  },
//  // NEW: Network Failure Simulator state tracking
//  simulatedOffline: false
//};
//
//const getInitialState = () => {
//  try {
//    const saved = localStorage.getItem(STORAGE_KEY);
//    if (!saved) return { ...defaultState };
//
//    const parsed = JSON.parse(saved);
//    let migrated = false;
//
//    // Ensure cache node properties exist on older legacy localStorage formats
//    if (!parsed.cache) parsed.cache = { ...defaultState.cache };
//    if (parsed.simulatedOffline === undefined) parsed.simulatedOffline = false;
//
//
//    
//
//    // SCHEMA MIGRATION CHECK 1: Ensure user node properties match definitions
//    if (!parsed.user) {
//      parsed.user = { ...defaultState.user };
//      migrated = true;
//    }
//
//    // SCHEMA MIGRATION CHECK 2: Merge missing configuration parameters on legacy keys
//    if (!parsed.config) {
//      parsed.config = { ...defaultState.config };
//      migrated = true;
//    }
//
//    // Ensure fallback initialization for older cached structures
//    if (parsed.config.networkTimeoutMs === undefined) {
//      parsed.config.networkTimeoutMs = defaultState.config.networkTimeoutMs;
//    }
//
//    // Rewrite updated schema parameters back immediately if modifications were applied
//    if (migrated) {
//      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
//    }
//
//
//
//    // FORCE LOCKED STATE ON REBOOT: Ensure the session always boots up locked 
//    console.log('[STORE INIT] Window loaded. Revoking active login credentials for safety...');
//    parsed.user.isLoggedIn = false;
//
//    return parsed;
//  } catch (error) {
//    console.error('[STORE ERROR] Parse breakdown encountered. Using defaults.', error);
//    return { ...defaultState };
//  }
//};
//
//if (!window.__GLOBAL_APP_STORE__) {
//  window.__GLOBAL_APP_STORE__ = reactive(getInitialState());
//  
//  watch(() => window.__GLOBAL_APP_STORE__, (newState) => {
//    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
//  }, { deep: true });
//}
//
//export const store = window.__GLOBAL_APP_STORE__;
//
//export const storeActions = {
//  saveNewPin(pin) {
//    store.appPin = String(pin);
//    store.user.isLoggedIn = true;
//  },
//  login() {
//    store.user.isLoggedIn = true;
//  },
//  logout() {
//    store.user.isLoggedIn = false;
//  },
//  saveODataConfig(url, user, pass, timeoutMs, useDummyData = false) {
//    store.config.odataUrl = url;
//    store.config.username = user;
//    store.config.password = pass;
//    store.config.networkTimeoutMs = parseInt(timeoutMs, 10) || 5000;
//    store.config.useDummyData = !!useDummyData; // Commits toggle choice
//    console.log('[STORE ACTION] OData settings updated successfully.');
//  },
//  // NEW ACTIONS: Cache setters and simulator controls
//  toggleNetworkSimulation() {
//    store.simulatedOffline = !store.simulatedOffline;
//    console.log(`[SIMULATOR] Network Offline Simulation flipped to: ${store.simulatedOffline}`);
//  },
//  setMetadataCache(rawXml) {
//    store.cache.metadataRawXml = rawXml;
//    console.log(`[CACHE STORE] Successfully backed up raw $metadata XML (Size: ${rawXml.length} chars).`);
//  },
//  setEntityListCache(entityName, dataArray) {
//    store.cache.entityLists[entityName] = dataArray;
//    console.log(`[CACHE STORE] Successfully backed up ${dataArray.length} records for collection: ${entityName}`);
//  },
//  // New single-source-of-truth wipe method
//  resetStore() {
//    console.log('[STORE ACTION] Executing total state and storage wipe...');
//    
//    // 1. Reset the active properties to factory defaults in reactive memory
//    store.appPin = null;
//    store.user.isLoggedIn = false;
//    store.config.odataUrl = '';
//    store.config.username = '';
//    store.config.password = '';
//    
//    // 2. Remove the persistent string cache block from disk space completely
//    localStorage.removeItem(STORAGE_KEY);
//  },
//  clearActiveDeliveryCache() {
//    store.cache.entityLists['ActiveDelivery'] = null;
//    console.log('[STORE ACTION] Active delivery cache data wiped from memory and localstorage.');
//  }
//};
//--------------------------------------------------------------------------------
import { reactive, watch } from 'vue';

const STORAGE_KEY = 'vue_sfc_template_store';

// Updated Default State
const defaultState = {
  user: { name: 'User', isLoggedIn: false },
  appPin: null,
  config: {
    baseHost: 'https://s4hana2025.professorsoft.com:44300', // New: Common Host
    poPath: '/sap/opu/odata4/sap/zgr_ui_poscan_o4/srvd_a2x/sap/zgr_ui_poscan_o4/0001/', // New: Register Service
    grPath: '/sap/opu/odata4/sap/zgr_grdoc_api/srvd_a2x/sap/zgr_ui_grdoc_o4/0001', // New: Goods Receipt Service
    username: '',
    password: '',
    networkTimeoutMs: 5000,
    useDummyData: false,
    sapClient: '100' // Optional: Added for completeness
  },
  cache: {
    metadataRawXml: '',
    entityLists: {}
  },
  simulatedOffline: false
};

const getInitialState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { ...defaultState };
    
    const parsed = JSON.parse(saved);
    let migrated = false;

    // Ensure cache exists
    if (!parsed.cache) parsed.cache = { ...defaultState.cache };
    if (parsed.simulatedOffline === undefined) parsed.simulatedOffline = false;
    if (!parsed.user) { parsed.user = { ...defaultState.user }; migrated = true; }
    
    // Migration Logic for Config
    if (!parsed.config) {
      parsed.config = { ...defaultState.config };
      migrated = true;
    } else {
      // Migrate old 'odataUrl' to new structure if it exists
      if (parsed.config.odataUrl && !parsed.config.baseHost) {
        try {
          const urlObj = new URL(parsed.config.odataUrl);
          parsed.config.baseHost = `${urlObj.protocol}//${urlObj.host}`;
          // Attempt to extract path, or default to empty if complex
          parsed.config.poPath = urlObj.pathname; 
          parsed.config.grPath = urlObj.pathname; // Default both to old path initially
        } catch (e) {
          parsed.config.baseHost = parsed.config.odataUrl;
        }
        delete parsed.config.odataUrl;
        migrated = true;
      }
      
      // Fill in missing new fields
      if (!parsed.config.baseHost) parsed.config.baseHost = defaultState.config.baseHost;
      if (!parsed.config.poPath) parsed.config.poPath= defaultState.config.poPath;
      if (!parsed.config.grPath) parsed.config.grPath = defaultState.config.grPath;
      if (parsed.config.networkTimeoutMs === undefined) parsed.config.networkTimeoutMs = defaultState.config.networkTimeoutMs;
      if (parsed.config.sapClient === undefined) parsed.config.sapClient = defaultState.config.sapClient;
    }

    if (migrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }

    console.log('[STORE INIT] Window loaded. Revoking active login credentials for safety...');
    parsed.user.isLoggedIn = false;
    return parsed;
  } catch (error) {
    console.error('[STORE ERROR] Parse breakdown encountered. Using defaults.', error);
    return { ...defaultState };
  }
};

if (!window.__GLOBAL_APP_STORE__) {
  window.__GLOBAL_APP_STORE__ = reactive(getInitialState());
  watch(() => window.__GLOBAL_APP_STORE__, (newState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, { deep: true });
}

export const store = window.__GLOBAL_APP_STORE__;

export const hasConfiguredUser = () => {
  const username = typeof store.config.username === 'string' ? store.config.username.trim() : '';
  const password = typeof store.config.password === 'string' ? store.config.password.trim() : '';
  return username.length > 0 && password.length > 0;
};

export const storeActions = {
  saveNewPin(pin) {
    store.appPin = String(pin);
    store.user.isLoggedIn = true;
  },
  login() {
    store.user.isLoggedIn = true;
  },
  logout() {
    store.user.isLoggedIn = false;
  },
  // Updated to accept separate host and paths
  saveODataConfig(baseHost, poPath, grPath, user, pass, timeoutMs, useDummyData = false, sapClient = '') {
    store.config.baseHost = baseHost.replace(/\/$/, ''); // Remove trailing slash from host
    store.config.poPath = poPath;
    store.config.grPath = grPath;
    store.config.username = user;
    store.config.password = pass;
    store.config.networkTimeoutMs = parseInt(timeoutMs, 10) || 5000;
    store.config.useDummyData = !!useDummyData;
    store.config.sapClient = sapClient;
    
    console.log('[STORE ACTION] OData settings (Host + Dual Paths) updated successfully.');
  },
  toggleNetworkSimulation() {
    store.simulatedOffline = !store.simulatedOffline;
    console.log(`[SIMULATOR] Network Offline Simulation flipped to: ${store.simulatedOffline}`);
  },
  setMetadataCache(rawXml) {
    store.cache.metadataRawXml = rawXml;
    console.log(`[CACHE STORE] Successfully backed up raw $metadata XML (Size: ${rawXml.length} chars).`);
  },
  setEntityListCache(entityName, dataArray) {
    store.cache.entityLists[entityName] = dataArray;
    console.log(`[CACHE STORE] Successfully backed up ${dataArray.length} records for collection: ${entityName}`);
  },
  resetStore() {
    console.log('[STORE ACTION] Executing total state and storage wipe...');
    store.appPin = null;
    store.user.isLoggedIn = false;
    store.user.name = defaultState.user.name;

    // Reset config field-by-field to avoid stale references.
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
  clearActiveDeliveryCache() {
    store.cache.entityLists['ActiveDelivery'] = null;
    console.log('[STORE ACTION] Active delivery cache data wiped from memory and localstorage.');
  },
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
