---
kind: business_term
name: Business Glossary
category: business_term
scope:
    - '**'
---

### palette manifest
- Definition：A delivery document listing expected items and counts for incoming pallets; the app pulls this from the server before scanning to verify physical goods against the expected list.

### outbox
- Definition：Local persistent queue of scanned verification records stored on the device until the Sync Outbox action bulk-pushes them back to the server.
- Aliases：outbox queue

### goods_to_scan
- Definition：One of the three dashboard tiles; the screen where the camera barcode scanner compares scanned codes against the fetched palette manifest and enqueues matches into the outbox.

### scanned_goods
- Definition：One of the three dashboard tiles; the screen displaying pending outbox entries awaiting sync to the server.

### register_delivery
- Definition：One of the three dashboard tiles; the screen that triggers the API call to pull the latest palette item manifests into the local system.

### broker
- Definition：The local AHM-native HTTP proxy endpoint `/api/net/request` that wraps outgoing requests in a JSON envelope, handling CORS, authentication, and cookie persistence between the WebView and the SAP backend.
- Aliases：local proxy broker、native proxy
