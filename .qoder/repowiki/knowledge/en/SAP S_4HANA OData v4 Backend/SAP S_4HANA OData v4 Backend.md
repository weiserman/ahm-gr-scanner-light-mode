---
kind: external_dependency
name: SAP S/4HANA OData v4 Backend
slug: sap-s4hana-odata-gateway
category: external_dependency
category_hints:
    - auth_protocol
    - sdk_real_api
scope:
    - '**'
---

### Identity & Role
The backend data source is an SAP S/4HANA system exposing OData v4 services. The app fetches palette manifests and pushes verified outbox records back to it.

### Auth & CSRF Protocol
- For non-GET operations the client performs an initial GET handshake against the service root with `X-CSRF-Token: Fetch`, caches the returned token, and attaches it to every mutating request. A 403 triggers a fresh token fetch and automatic retry.

### SDK Real API Shape
- OData v4 queries require `$format=json` appended unless the path already contains `$metadata`, `$format`, or a bound-action namespace segment matching `v0001.`.
- `$metadata` endpoints must accept `application/xml, text/xml, */*` and return raw XML text rather than JSON.
- All requests are proxied through the AHM broker at `/api/net/request` (not sent directly), so CORS is handled by the native layer.