---
kind: business_term
name: Business Glossary
category: business_term
scope:
    - '**'
---

### Goods Receipt
- Definition：Warehouse process of receiving and verifying delivered goods against purchase orders, involving barcode scanning to match physical items with expected quantities and recording discrepancies or exceptions
- Aliases：GR、goods receipt process、receiving process

### Purchase Order
- Definition：Official document from supplier specifying ordered items, quantities, and delivery details; serves as the primary reference document for goods receipt verification and matching scanned barcodes against expected inventory
- Aliases：PO、purchase order number、PurchaseOrder

### Active Delivery
- Definition：Currently selected purchase order document loaded into the reactive store cache, containing header information and nested item list with received quantities and exception flags for the active goods receipt session
- Aliases：active delivery document、current delivery、ActiveDelivery cache key

### Outbox
- Definition：Local offline queue storing verified goods receipt transactions when network connectivity is unavailable, enabling batch synchronization with SAP backend once connection is restored
- Aliases：outbox queue、offline outbox、sync outbox

### Hardware Wedge Scanner
- Definition：Physical barcode scanner device that emulates keyboard input, typing decoded barcode strings into a hidden input field followed by Enter key events, allowing seamless integration with web forms without custom SDKs
- Aliases：wedge scanner、keyboard wedge、Zebra wedge scanner

### Broker Proxy
- Definition：Local AHM native proxy endpoint at `/api/net/request` that performs actual HTTP calls server-side to bypass browser CORS restrictions, returning normalized response objects to the web application
- Aliases：native proxy、local broker、proxy broker

### CSRF Token
- Definition：Security token required by SAP Gateway for state-changing HTTP requests (POST/PATCH/PUT/DELETE), fetched via GET handshake and cached in memory with automatic refresh on 403 responses
- Aliases：X-CSRF-Token、CSRF handshake、token lifecycle

### Draft Pipeline
- Definition：Three-step RAP (Rapid Application Programming) transaction flow for creating goods receipts: create draft header, append draft items, then activate to promote to active ledger entry
- Aliases：RAP draft pipeline、draft creation flow、activate pipeline

### Entry Unit
- Definition：Unit of measure context (e.g., EA, PK, CT) required alongside quantity fields to satisfy SAP dependent-property constraints when submitting goods receipt transactions
- Aliases：UOM、unit of measure、EntryUnit

### Vendor ID
- Definition：Carton EAN or vendor-specific barcode identifier used to match physical packages against expected items in the active delivery, distinct from the material code
- Aliases：CartonEAN、vendor barcode、vendorId
