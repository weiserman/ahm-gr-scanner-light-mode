/**
 * @file SAP Data Adapter Normalizers and Entity Services.
 *
 * This module bridges the front-end domain model and the SAP S/4HANA
 * OData v4 backend. It exposes:
 *   - Normalizer functions that transform raw SAP response payloads into
 *     the shape consumed by the Vue reactive store.
 *   - An EntityService object with high-level operations for fetching
 *     purchase orders and committing goods-receipt transactions.
 *
 * @module entities
 */

import { odataFetch } from './odata.js';
import { store } from './store.js';

/**
 * Normalises a raw SAP PurchaseOrder header response into the internal
 * delivery-document shape used by the Vue reactive store.
 *
 * @param {object} sapHeader - Raw SAP OData PurchaseOrder entity.
 * @returns {object|null} Normalised delivery document, or null when the input is falsy.
 */
function normalizeSAPHeader(sapHeader) {
  if (!sapHeader) return null;
  return {
    id: sapHeader.PurchaseOrder || '',
    deliveryNumber: sapHeader.PurchaseOrder || '',
    storageLocationId: sapHeader.Plant || '', 
    sscc: sapHeader.Supplier || 'N/A',
    deliveryReference: sapHeader.SupplierName || 'None',
    pallets: 0, 
    cartons: 0,
    dateReceived: sapHeader.PurchaseOrderDate ? formatSAPDate(sapHeader.PurchaseOrderDate) : '',
    status: 'PEND', 
    items: Array.isArray(sapHeader._Items) ? sapHeader._Items.map(normalizeSAPItem) : []
  };
}

/**
 * Normalises a single SAP PurchaseOrderItem into the internal item row
 * consumed by the goods-receipt UI.
 *
 * @param {object} sapItem - Raw SAP OData PurchaseOrderItem entity.
 * @returns {object|null} Normalised item, or null when the input is falsy.
 */
function normalizeSAPItem(sapItem) {
  if (!sapItem) return null;
  return {
    id: `${sapItem.PurchaseOrder}-${sapItem.PurchaseOrderItem}`, 
    deliveryId: sapItem.PurchaseOrder || '',
    code: sapItem.Material || '',
    itemNumber: sapItem.PurchaseOrderItem || '',
    description: sapItem.MaterialDescription || '',
    recptQty: 0, 
    targetQty: Math.floor(parseFloat(sapItem.OpenQuantity || 0)), 
    uom: sapItem.EntryUnit || 'EA',
    vendorId: sapItem.CartonEAN || 'None', 
    flags: {
      damages: false,
      noBarcode: false,
      invalidBarcode: false
    }
  };
}

/**
 * Converts an ISO-8601 date string ('YYYY-MM-DD') to the 'DD/MM/YYYY'
 * display format used in the UI.
 *
 * @param {string} isoDateString - The SAP date string.
 * @returns {string} Formatted date, or empty string on invalid input.
 */
function formatSAPDate(isoDateString) {
  if (!isoDateString) return '';
  const parts = isoDateString.split('-');
  if (parts.length !== 3) return isoDateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * High-level SAP entity operations. Each method encapsulates the
 * OData endpoint, query parameters, and payload structure required
 * by the S/4HANA gateway.
 */
export const EntityService = {

  /**
   * Fetches a purchase order by number, expanding its nested line items
   * via the OData $expand=_Items clause.
   *
   * @param {string} purchaseOrderNumber - The SAP PurchaseOrder number.
   * @returns {Promise<object[]>} Array of normalised delivery documents.
   * @throws {Error} When the OData request fails.
   */
  async getDeliveriesList(purchaseOrderNumber) {
    try {
      console.log(`[SAP ENTITY SERVICE] Fetching Purchase Order: ${purchaseOrderNumber}`);
      
      const queryParams = `$filter=PurchaseOrder eq '${encodeURIComponent(purchaseOrderNumber)}'&$expand=_Items`;
      const endpoint = `${store.config.poPath}/PurchaseOrder?${queryParams}`;
      const response = await odataFetch(endpoint, { method: 'GET' });
      const rawCollection = response.value || [];
      
      return rawCollection.map(normalizeSAPHeader);
    } catch (error) {
      console.error('[SAP ENTITY SERVICE] Purchase Order fetch failed:', error);
      throw new Error(`SAP PO Lookup Failed: ${error.message}`);
    }
  },

  /**
   * Commits goods-receipt quantities via sequential PATCH requests against
   * the GoodsReceipt entity set, one per item line.
   *
   * Each PATCH sends the remaining open quantity (targetQty - recptQty)
   * together with the EntryUnit to satisfy the SAP dependent-property
   * constraint.
   *
   * @param {string} purchaseOrderNumber - The SAP PurchaseOrder number.
   * @param {object[]} frontEndItemsArray - Items with targetQty, recptQty, uom.
   * @returns {Promise<string>} Success message.
   * @throws {Error} When any PATCH request fails.
   */
  async submitGoodsReceiptTransaction(purchaseOrderNumber, frontEndItemsArray) {
    try {
      console.log(`[SAP ENTITY SERVICE] Committing goods receipt for PO: ${purchaseOrderNumber}`);

      for (const item of frontEndItemsArray) {
        const poId = purchaseOrderNumber;
        const itemId = item.itemNumber; 
        
        const endpoint = `${store.config.grPath}/GoodsReceipt(PurchaseOrder='${poId}',PurchaseOrderItem='${itemId}')`;
        
        // Include EntryUnit alongside OpenQuantity to satisfy the SAP dependent-property constraint
        const patchPayload = {
          OpenQuantity: Math.max(0, item.targetQty - item.recptQty),
          EntryUnit: item.uom
        };

        console.log(`[SAP PATCH] Dispatching payload with unit context to ${endpoint}:`, patchPayload);

        await odataFetch(endpoint, {
          method: 'PATCH', 
          headers: { 'If-Match': '*' }, 
          body: JSON.stringify(patchPayload)
        });
      }

      return 'Success: Purchase order quantities updated on SAP backend successfully.';
    } catch (error) {
      console.error('[SAP ENTITY SERVICE] Batch post processing failure:', error);
      throw new Error(`SAP Receipt Submission Failed: ${error.message}`);
    }
  },

  /**
   * Creates a Goods Receipt document header on the SAP backend via a
   * single POST to the GoodsReceipt entity set.
   *
   * @param {string} purchaseOrderNumber - The SAP PurchaseOrder number.
   * @param {string} [postingDate='2026-06-22'] - Posting date in ISO format.
   * @returns {Promise<object>} The SAP response payload.
   * @throws {Error} When the POST request fails.
   */
  async postGoodsReceiptHeader(purchaseOrderNumber, postingDate = '2026-06-22') {
    try {
      console.log(`[SAP ENTITY SERVICE] Creating Goods Receipt Document Header for PO: ${purchaseOrderNumber}`);
      
      // Derive the service-root URL for the GoodsReceipt entity set
      const endpoint = `${store.config.grPath}/GoodsReceipt`;
      
      const postPayload = {
        PurchaseOrder: String(purchaseOrderNumber),
        PostingDate: postingDate
      };

      console.log(`[SAP POST] Dispatching document creation payload to ${endpoint}:`, postPayload);
      
      const response = await odataFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(postPayload)
      });

      return response;
    } catch (error) {
      console.error('[SAP ENTITY SERVICE] Goods Receipt header submission failed:', error);
      throw new Error(`SAP Header Posting Failed: ${error.message}`);
    }
  },

  /**
   * End-to-end RAP draft pipeline for creating and activating a goods
   * receipt document in three sequential steps:
   *
   *   1. **Create Draft Header** — POST to GoodsReceipt to obtain a UUID.
   *   2. **Append Draft Items** — POST each item line to the _Item
   *      navigation path of the draft header.
   *   3. **Activate** — Invoke the namespace-bound Activate action to
   *      promote the draft to an active ledger entry.
   *
   * @param {string} purchaseOrderNumber - The SAP PurchaseOrder number.
   * @param {object[]} frontEndItemsArray - Captured item rows from the UI.
   * @param {string} [postingDate='2026-06-22'] - Posting date in ISO format.
   * @returns {Promise<object>} The activation response from SAP.
   * @throws {Error} When any step in the pipeline fails.
   */
  async executeDraftGoodsReceiptPipeline(purchaseOrderNumber, frontEndItemsArray, postingDate = '2026-06-22') {
    try {
      const sapClientParam = store.config.sapClient ? `?sap-client=${store.config.sapClient}` : '';

      // Step 1: Create a draft goods-receipt header to obtain the UUID
      console.log('[SAP PIPELINE] Step 1: Creating draft Goods Receipt header...');
      const headerEndpoint = `${store.config.grPath}/GoodsReceipt${sapClientParam}`;
      
      const headerPayload = {
        PurchaseOrder: String(purchaseOrderNumber),
        PostingDate: postingDate
      };

      const headerResponse = await odataFetch(headerEndpoint, {
        method: 'POST',
        body: JSON.stringify(headerPayload)
      });

      const grUuid = headerResponse.GoodsReceiptUUID;
      if (!grUuid) {
        throw new Error("SAP gateway failed to yield a structural GoodsReceiptUUID draft token identification string.");
      }
      console.log(`[SAP PIPELINE] Draft Header constructed successfully. Assigned UUID: ${grUuid}`);

      // Step 2: Append each item to the draft header via the _Item navigation path
      console.log(`[SAP PIPELINE] Step 2: Appending ${frontEndItemsArray.length} draft item lines...`);
      
      // Target the bound navigational path context directly off the created header uuid instance
      const baseItemEndpoint = `${store.config.grPath}/GoodsReceipt(GoodsReceiptUUID=${grUuid},IsActiveEntity=false)/_Item${sapClientParam}`;

      for (const item of frontEndItemsArray) {
        // Pad item number to 5 digits (SAP standard line-item format, e.g. '10' → '00010')
        const paddedLineItem = String(item.itemNumber || '10').padStart(5, '0');

        const itemPayload = {
          GoodsReceiptUUID: grUuid,
          PurchaseOrderItem: paddedLineItem,
          Material: item.code || '',
          MaterialDescription: item.description || '',
          OrderQuantity: Math.floor(parseFloat(item.targetQty || 0)),
          ReceivedQuantity: Math.floor(parseFloat(item.recptQty || 0)),
          EntryUnit: item.uom || 'EA',
          Plant: item.storageLocationId || '1010', // Maps back from normalizeSAPHeader fallback values
          StorageLocation: '0001',                // Default fallback configuration assignment
          PrimaryEAN: item.vendorId || '',        // Maps back from normalizeSAPItem schema
          CartonEAN: item.vendorId || ''
        };

        console.log(`[SAP PIPELINE] Appending Draft Item line: ${paddedLineItem}`);
        await odataFetch(baseItemEndpoint, {
          method: 'POST',
          body: JSON.stringify(itemPayload)
        });
      }

      // Step 3: Activate the draft to promote it to an active ledger entry
      console.log('[SAP PIPELINE] Step 3: Activating draft via namespace-bound action...');
      const actionNamespace = "com.sap.gateway.srvd_a2x.zgr_ui_grdoc_o4.v0001.Activate";
      const activationEndpoint = `${store.config.grPath}/GoodsReceipt(GoodsReceiptUUID=${grUuid},IsActiveEntity=false)/${actionNamespace}${sapClientParam}`;

      const activationResponse = await odataFetch(activationEndpoint, {
        method: 'POST',
        body: JSON.stringify({}) // Bound actions require an explicit empty JSON body
      });

      console.log(`[SAP PIPELINE] Activation successful. IsActiveEntity: ${activationResponse.IsActiveEntity}`);
      return activationResponse;

    } catch (error) {
      console.error('[SAP PIPELINE] Critical transactional breakdown on RAP stack compilation:', error);
      throw new Error(`SAP Draft Transaction Pipeline Aborted: ${error.message}`);
    }
  }

};

