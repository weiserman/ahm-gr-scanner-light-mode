---
kind: external_dependency
name: SAP S/4HANA Backend Integration
slug: sap-s4hana
category: external_dependency
category_hints:
    - vendor_identity
    - auth_protocol
    - client_constraint
scope:
    - '**'
---

### SAP S/4HANA Integration
- **Role**: Primary backend system for purchase order management and goods receipt processing via OData v4 APIs
- **Integration Point**: Custom transport layer in `src/util/odata.js` routes all requests through AHM native proxy broker at `/api/net/request`
- **Authentication**: HTTP Basic Auth with credentials stored in localStorage; CSRF token lifecycle managed automatically with 403 retry mechanism
- **OData Endpoints**: Dual service paths configured - PurchaseOrder (`poPath`) and GoodsReceipt (`grPath`) services under `/sap/opu/odata4/sap/...` namespace
- **Session Management**: SAP session cookies captured and replayed across broker calls to maintain affinity
- **Format Handling**: Automatic `$format=json` injection for queries, XML handling for `$metadata`, bound action support for v0001 namespaces
- **Client Constraint**: Requires SAP client number configuration (`sapClient` field) appended as query parameter for multi-client environments