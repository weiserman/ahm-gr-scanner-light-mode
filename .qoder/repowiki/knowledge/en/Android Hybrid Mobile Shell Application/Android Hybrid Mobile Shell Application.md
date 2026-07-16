---
kind: external_dependency
name: Android Hybrid Mobile Shell Application
slug: android-hybrid-mobile
category: external_dependency
category_hints:
    - vendor_identity
    - client_constraint
scope:
    - '**'
---

### AHM Native Shell Integration
- **Role**: Host container application that wraps this web app and provides native device capabilities (camera, barcode scanning, network proxy)
- **Integration Point**: Local proxy broker endpoint `/api/net/request` handles CORS bypass and native network operations
- **Deployment**: Package distributed as zip archive and deployed via AHM maintenance screen using `ahm-app://deploy?package_url=` protocol
- **Native Features**: Provides camera access for QR/barcode scanning, hardware wedge scanner input emulation, and secure local storage
- **Runtime Environment**: WebView-based execution with custom JavaScript bridge for native functionality