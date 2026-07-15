# Core Features

<cite>
**Referenced Files in This Document**
- [main.js](file://src/main.js)
- [Main.vue](file://src/Main.vue)
- [router/index.js](file://src/router/index.js)
- [util/store.js](file://src/util/store.js)
- [util/odata.js](file://src/util/odata.js)
- [util/barcodeScanner.js](file://src/util/barcodeScanner.js)
- [components/pinmobile/PinMobile.vue](file://src/components/pinmobile/PinMobile.vue)
- [views/pinenter/index.vue](file://src/views/pinenter/index.vue)
- [views/pinsetup/index.vue](file://src/views/pinsetup/index.vue)
- [components/qrcode/scanner/index.vue](file://src/components/qrcode/scanner/index.vue)
- [views/goods_to_scan/index.vue](file://src/views/goods_to_scan/index.vue)
- [views/scanned_goods/index.vue](file://src/views/scanned_goods/index.vue)
- [views/register_delivery/index.vue](file://src/views/register_delivery/index.vue)
- [views/receipt_item/index.vue](file://src/views/receipt_item/index.vue)
- [views/outbox_item/index.vue](file://src/views/outbox_item/index.vue)
- [views/po_items/index.vue](file://src/views/po_items/index.vue)
- [views/config/index.vue](file://src/views/config/index.vue)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document explains the core features of the ahm-gr-scanner application, focusing on:
- PIN authentication system for secure access and session control
- QR/barcode scanning module for item identification
- Inventory management views for scanned goods and delivery registration
- Purchase order processing flows
- Goods registration workflows from scan to receipt
It also covers user interaction patterns, data flow between modules, configuration options, error handling strategies, and user feedback mechanisms. Practical examples illustrate how these features work together to support inventory operations.

## Project Structure
The application is a Vue-based web app with modular views and reusable components. Key areas include:
- Application bootstrap and routing
- Global state store
- Utility services for OData integration and barcode scanning
- Feature-specific views (PIN entry/setup, scanning, goods, purchase orders, config)
- Reusable UI components (PIN pad, dialog, scanner)

```mermaid
graph TB
A["src/main.js"] --> B["src/Main.vue"]
B --> C["src/router/index.js"]
C --> D["Views<br/>pinenter, pinsetup, goods_to_scan,<br/>scanned_goods, register_delivery,<br/>receipt_item, outbox_item, po_items, config"]
B --> E["Components<br/>PinMobile, qrcode/scanner"]
B --> F["Utilities<br/>store.js, odata.js, barcodeScanner.js"]
```

**Diagram sources**
- [main.js](file://src/main.js)
- [Main.vue](file://src/Main.vue)
- [router/index.js](file://src/router/index.js)
- [util/store.js](file://src/util/store.js)
- [util/odata.js](file://src/util/odata.js)
- [util/barcodeScanner.js](file://src/util/barcodeScanner.js)
- [components/pinmobile/PinMobile.vue](file://src/components/pinmobile/PinMobile.vue)
- [components/qrcode/scanner/index.vue](file://src/components/qrcode/scanner/index.vue)
- [views/pinenter/index.vue](file://src/views/pinenter/index.vue)
- [views/pinsetup/index.vue](file://src/views/pinsetup/index.vue)
- [views/goods_to_scan/index.vue](file://src/views/goods_to_scan/index.vue)
- [views/scanned_goods/index.vue](file://src/views/scanned_goods/index.vue)
- [views/register_delivery/index.vue](file://src/views/register_delivery/index.vue)
- [views/receipt_item/index.vue](file://src/views/receipt_item/index.vue)
- [views/outbox_item/index.vue](file://src/views/outbox_item/index.vue)
- [views/po_items/index.vue](file://src/views/po_items/index.vue)
- [views/config/index.vue](file://src/views/config/index.vue)

**Section sources**
- [main.js](file://src/main.js)
- [Main.vue](file://src/Main.vue)
- [router/index.js](file://src/router/index.js)

## Core Components
- Application shell and routing: The main entry initializes the app and sets up routes for feature views.
- Global store: Centralized state for settings, current user/session, pending scans, and outbound queue.
- OData service: Encapsulates HTTP requests to backend services for entities like items, receipts, and purchase orders.
- Barcode scanner utility: Wraps camera and decoding logic for QR/barcode capture.
- PIN mobile component: Reusable PIN pad used across PIN entry and setup screens.
- Scanner component: Camera-based QR/barcode scanner view component.

Key responsibilities:
- Authentication gating via PIN
- Scanning input normalization and validation
- Data synchronization with backend via OData
- Local persistence for offline or retry scenarios
- User feedback through dialogs and status messages

**Section sources**
- [util/store.js](file://src/util/store.js)
- [util/odata.js](file://src/util/odata.js)
- [util/barcodeScanner.js](file://src/util/barcodeScanner.js)
- [components/pinmobile/PinMobile.vue](file://src/components/pinmobile/PinMobile.vue)
- [components/qrcode/scanner/index.vue](file://src/components/qrcode/scanner/index.vue)

## Architecture Overview
High-level architecture shows how views interact with shared utilities and components to implement end-to-end workflows.

```mermaid
graph TB
subgraph "UI Layer"
V1["pinenter/index.vue"]
V2["pinsetup/index.vue"]
V3["goods_to_scan/index.vue"]
V4["scanned_goods/index.vue"]
V5["register_delivery/index.vue"]
V6["receipt_item/index.vue"]
V7["outbox_item/index.vue"]
V8["po_items/index.vue"]
V9["config/index.vue"]
C1["PinMobile.vue"]
C2["qrcode/scanner/index.vue"]
end
subgraph "Shared Services"
S1["store.js"]
S2["odata.js"]
S3["barcodeScanner.js"]
end
V1 --> C1
V2 --> C1
V3 --> C2
V4 --> S1
V5 --> S1
V6 --> S1
V7 --> S1
V8 --> S1
V9 --> S1
V3 --> S3
V4 --> S2
V5 --> S2
V6 --> S2
V7 --> S2
V8 --> S2
V9 --> S2
S1 --> S2
```

**Diagram sources**
- [views/pinenter/index.vue](file://src/views/pinenter/index.vue)
- [views/pinsetup/index.vue](file://src/views/pinsetup/index.vue)
- [views/goods_to_scan/index.vue](file://src/views/goods_to_scan/index.vue)
- [views/scanned_goods/index.vue](file://src/views/scanned_goods/index.vue)
- [views/register_delivery/index.vue](file://src/views/register_delivery/index.vue)
- [views/receipt_item/index.vue](file://src/views/receipt_item/index.vue)
- [views/outbox_item/index.vue](file://src/views/outbox_item/index.vue)
- [views/po_items/index.vue](file://src/views/po_items/index.vue)
- [views/config/index.vue](file://src/views/config/index.vue)
- [components/pinmobile/PinMobile.vue](file://src/components/pinmobile/PinMobile.vue)
- [components/qrcode/scanner/index.vue](file://src/components/qrcode/scanner/index.vue)
- [util/store.js](file://src/util/store.js)
- [util/odata.js](file://src/util/odata.js)
- [util/barcodeScanner.js](file://src/util/barcodeScanner.js)

## Detailed Component Analysis

### PIN Authentication System
Purpose:
- Enforce PIN-based access control
- Allow initial PIN setup and change
- Maintain session state and guard protected routes

User interactions:
- Enter PIN on first launch or when session expires
- Set or change PIN during setup
- Receive immediate feedback for invalid attempts and success

Data flow:
- PinMobile component emits typed digits
- PIN entry view validates against stored PIN
- Store updates session state and navigates to home or setup

Error handling:
- Invalid PIN prompts re-entry
- Locked-out behavior after repeated failures (if implemented)
- Clear messages guide users

```mermaid
sequenceDiagram
participant U as "User"
participant P as "PinMobile.vue"
participant E as "pinenter/index.vue"
participant ST as "store.js"
participant R as "router/index.js"
U->>P : "Enter digits"
P-->>E : "Emits PIN value"
E->>ST : "Validate PIN"
ST-->>E : "Result (valid/invalid)"
alt "Valid"
E->>R : "Navigate to Home"
else "Invalid"
E->>U : "Show error and prompt again"
end
```

**Diagram sources**
- [components/pinmobile/PinMobile.vue](file://src/components/pinmobile/PinMobile.vue)
- [views/pinenter/index.vue](file://src/views/pinenter/index.vue)
- [util/store.js](file://src/util/store.js)
- [router/index.js](file://src/router/index.js)

**Section sources**
- [views/pinenter/index.vue](file://src/views/pinenter/index.vue)
- [views/pinsetup/index.vue](file://src/views/pinsetup/index.vue)
- [components/pinmobile/PinMobile.vue](file://src/components/pinmobile/PinMobile.vue)
- [util/store.js](file://src/util/store.js)

### QR/Barcode Scanning Module
Purpose:
- Capture QR/barcodes using device camera
- Normalize and validate decoded values
- Feed identifiers into downstream workflows

User interactions:
- Start/stop scanning
- Immediate visual/audio feedback on successful decode
- Manual fallback entry if needed

Data flow:
- Scanner component reads frames and decodes codes
- Decoded value emitted to owning view
- View normalizes input and proceeds to lookup or add to list

Error handling:
- Camera permission denied
- No code detected
- Invalid format handling

```mermaid
flowchart TD
Start(["Start Scan"]) --> CheckPerm["Check Camera Permission"]
CheckPerm --> PermOK{"Permission Granted?"}
PermOK --> |No| ShowErr["Show Error and Exit"]
PermOK --> |Yes| Capture["Capture Frame"]
Capture --> Decode["Decode Barcode/QR"]
Decode --> Valid{"Valid Format?"}
Valid --> |No| Retry["Prompt Retry or Manual Entry"]
Valid --> |Yes| Emit["Emit Value to View"]
Emit --> End(["Stop Scan"])
ShowErr --> End
Retry --> Capture
```

**Diagram sources**
- [components/qrcode/scanner/index.vue](file://src/components/qrcode/scanner/index.vue)
- [util/barcodeScanner.js](file://src/util/barcodeScanner.js)

**Section sources**
- [components/qrcode/scanner/index.vue](file://src/components/qrcode/scanner/index.vue)
- [util/barcodeScanner.js](file://src/util/barcodeScanner.js)

### Inventory Management: Scanned Goods
Purpose:
- Track items added by scanning
- Display scanned list with details
- Support removal and bulk actions

User interactions:
- Add items via scanner or manual entry
- Review scanned list
- Remove duplicates or incorrect entries

Data flow:
- Scanned value enters local list in store
- Optional enrichment via OData lookup
- List persists until submission or reset

Error handling:
- Duplicate detection
- Lookup failures handled gracefully

```mermaid
sequenceDiagram
participant G as "goods_to_scan/index.vue"
participant SC as "qrcode/scanner/index.vue"
participant BS as "barcodeScanner.js"
participant ST as "store.js"
participant OD as "odata.js"
G->>SC : "Open scanner"
SC->>BS : "Start capture"
BS-->>SC : "Decoded value"
SC-->>G : "Emit value"
G->>ST : "Add to scanned list"
G->>OD : "Optional enrichment by ID"
OD-->>G : "Item details"
G-->>G : "Render updated list"
```

**Diagram sources**
- [views/goods_to_scan/index.vue](file://src/views/goods_to_scan/index.vue)
- [components/qrcode/scanner/index.vue](file://src/components/qrcode/scanner/index.vue)
- [util/barcodeScanner.js](file://src/util/barcodeScanner.js)
- [util/store.js](file://src/util/store.js)
- [util/odata.js](file://src/util/odata.js)

**Section sources**
- [views/goods_to_scan/index.vue](file://src/views/goods_to_scan/index.vue)
- [views/scanned_goods/index.vue](file://src/views/scanned_goods/index.vue)
- [util/store.js](file://src/util/store.js)
- [util/odata.js](file://src/util/odata.js)

### Purchase Order Processing
Purpose:
- Load and display purchase order items
- Associate scanned goods with PO lines
- Validate quantities and line matching

User interactions:
- Select or search PO
- View PO lines and quantities
- Confirm matches and adjust as needed

Data flow:
- Fetch PO header and lines via OData
- Map scanned IDs to PO lines
- Update local state for confirmation

Error handling:
- Network errors
- Missing PO or lines
- Quantity mismatches

```mermaid
sequenceDiagram
participant PO as "po_items/index.vue"
participant OD as "odata.js"
participant ST as "store.js"
participant GS as "goods_to_scan/index.vue"
PO->>OD : "Load PO header and lines"
OD-->>PO : "PO data"
PO->>ST : "Persist PO context"
GS->>ST : "Provide scanned items"
PO->>PO : "Match scanned items to PO lines"
PO-->>PO : "Show match results and discrepancies"
```

**Diagram sources**
- [views/po_items/index.vue](file://src/views/po_items/index.vue)
- [util/odata.js](file://src/util/odata.js)
- [util/store.js](file://src/util/store.js)
- [views/goods_to_scan/index.vue](file://src/views/goods_to_scan/index.vue)

**Section sources**
- [views/po_items/index.vue](file://src/views/po_items/index.vue)
- [util/odata.js](file://src/util/odata.js)
- [util/store.js](file://src/util/store.js)

### Goods Registration Workflows
Purpose:
- Register delivered goods into the system
- Create receipt items and finalize delivery registration

User interactions:
- Choose delivery context
- Confirm scanned goods
- Submit receipt items

Data flow:
- Aggregate scanned goods
- Build receipt payloads
- Post to backend via OData
- Persist confirmation and clear working lists

Error handling:
- Validation errors before submit
- Server-side rejection with actionable messages
- Retry mechanism for failed submissions

```mermaid
sequenceDiagram
participant RD as "register_delivery/index.vue"
participant RI as "receipt_item/index.vue"
participant SG as "scanned_goods/index.vue"
participant ST as "store.js"
participant OD as "odata.js"
SG->>ST : "Provide final scanned list"
RD->>RI : "Prepare receipt items"
RI->>OD : "Create receipt items"
OD-->>RI : "Server response"
RI->>OD : "Finalize delivery registration"
OD-->>RD : "Confirmation"
RD->>ST : "Clear working state"
```

**Diagram sources**
- [views/register_delivery/index.vue](file://src/views/register_delivery/index.vue)
- [views/receipt_item/index.vue](file://src/views/receipt_item/index.vue)
- [views/scanned_goods/index.vue](file://src/views/scanned_goods/index.vue)
- [util/store.js](file://src/util/store.js)
- [util/odata.js](file://src/util/odata.js)

**Section sources**
- [views/register_delivery/index.vue](file://src/views/register_delivery/index.vue)
- [views/receipt_item/index.vue](file://src/views/receipt_item/index.vue)
- [views/scanned_goods/index.vue](file://src/views/scanned_goods/index.vue)
- [util/store.js](file://src/util/store.js)
- [util/odata.js](file://src/util/odata.js)

### Outbox and Offline Handling
Purpose:
- Queue operations when offline or when server is unavailable
- Retry and sync when connectivity is restored

User interactions:
- See queued items
- Trigger manual retry
- Clear successfully sent items

Data flow:
- Failed operations appended to outbox
- Background or manual sync pushes items
- Success removes from outbox

Error handling:
- Conflict resolution guidance
- Clear status indicators per item

```mermaid
flowchart TD
Op["Operation Attempt"] --> Net{"Network OK?"}
Net --> |Yes| Send["Send to Server"]
Net --> |No| Queue["Append to Outbox"]
Send --> Resp{"Success?"}
Resp --> |Yes| Done["Remove from Outbox"]
Resp --> |No| Queue
Queue --> Retry["Manual or Auto Retry"]
Retry --> Send
```

**Diagram sources**
- [views/outbox_item/index.vue](file://src/views/outbox_item/index.vue)
- [util/store.js](file://src/util/store.js)
- [util/odata.js](file://src/util/odata.js)

**Section sources**
- [views/outbox_item/index.vue](file://src/views/outbox_item/index.vue)
- [util/store.js](file://src/util/store.js)
- [util/odata.js](file://src/util/odata.js)

### Configuration Options
Purpose:
- Configure connection endpoints, timeouts, and feature flags
- Persist settings locally for reuse

User interactions:
- Edit settings in config view
- Save and apply changes
- Reset to defaults if needed

Data flow:
- Settings read/written via store
- OData service uses configured endpoints

Error handling:
- Validate inputs before saving
- Warn about incompatible combinations

```mermaid
sequenceDiagram
participant CFG as "config/index.vue"
participant ST as "store.js"
participant OD as "odata.js"
CFG->>ST : "Load current settings"
CFG->>CFG : "User edits settings"
CFG->>ST : "Save new settings"
CFG->>OD : "Apply endpoints/timeouts"
OD-->>CFG : "Acknowledge configuration"
```

**Diagram sources**
- [views/config/index.vue](file://src/views/config/index.vue)
- [util/store.js](file://src/util/store.js)
- [util/odata.js](file://src/util/odata.js)

**Section sources**
- [views/config/index.vue](file://src/views/config/index.vue)
- [util/store.js](file://src/util/store.js)
- [util/odata.js](file://src/util/odata.js)

## Dependency Analysis
Component and module dependencies are organized around shared services and reusable UI components. Views depend on store and OData for data operations; scanning depends on the scanner utility; PIN flows depend on the PIN component and store.

```mermaid
graph LR
PIN["pinenter/index.vue"] --> PM["PinMobile.vue"]
PIN --> ST["store.js"]
SETUP["pinsetup/index.vue"] --> PM
SETUP --> ST
GOODS["goods_to_scan/index.vue"] --> SCAN["qrcode/scanner/index.vue"]
GOODS --> BS["barcodeScanner.js"]
GOODS --> ST
SGOODS["scanned_goods/index.vue"] --> ST
REG["register_delivery/index.vue"] --> ST
REG --> OD["odata.js"]
RECEIPT["receipt_item/index.vue"] --> OD
OUTBOX["outbox_item/index.vue"] --> ST
OUTBOX --> OD
PO["po_items/index.vue"] --> OD
PO --> ST
CFG["config/index.vue"] --> ST
CFG --> OD
```

**Diagram sources**
- [views/pinenter/index.vue](file://src/views/pinenter/index.vue)
- [views/pinsetup/index.vue](file://src/views/pinsetup/index.vue)
- [components/pinmobile/PinMobile.vue](file://src/components/pinmobile/PinMobile.vue)
- [views/goods_to_scan/index.vue](file://src/views/goods_to_scan/index.vue)
- [components/qrcode/scanner/index.vue](file://src/components/qrcode/scanner/index.vue)
- [util/barcodeScanner.js](file://src/util/barcodeScanner.js)
- [util/store.js](file://src/util/store.js)
- [views/scanned_goods/index.vue](file://src/views/scanned_goods/index.vue)
- [views/register_delivery/index.vue](file://src/views/register_delivery/index.vue)
- [views/receipt_item/index.vue](file://src/views/receipt_item/index.vue)
- [views/outbox_item/index.vue](file://src/views/outbox_item/index.vue)
- [views/po_items/index.vue](file://src/views/po_items/index.vue)
- [views/config/index.vue](file://src/views/config/index.vue)
- [util/odata.js](file://src/util/odata.js)

**Section sources**
- [util/store.js](file://src/util/store.js)
- [util/odata.js](file://src/util/odata.js)
- [util/barcodeScanner.js](file://src/util/barcodeScanner.js)
- [components/pinmobile/PinMobile.vue](file://src/components/pinmobile/PinMobile.vue)
- [components/qrcode/scanner/index.vue](file://src/components/qrcode/scanner/index.vue)

## Performance Considerations
- Debounce rapid scans to avoid duplicate entries
- Batch OData requests where possible
- Use pagination for large PO or item lists
- Keep scanned lists lightweight; offload heavy computations to background tasks
- Cache frequently accessed reference data locally when appropriate

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Camera not available: Ensure permissions granted; fall back to manual entry
- Invalid barcode format: Prompt user to verify label and rescan
- Network errors: Check configuration endpoints; use outbox to retry later
- PIN lockouts: Follow on-screen instructions to reset via setup flow
- Stale data: Refresh lists and re-fetch from server

**Section sources**
- [util/barcodeScanner.js](file://src/util/barcodeScanner.js)
- [util/odata.js](file://src/util/odata.js)
- [util/store.js](file://src/util/store.js)
- [views/pinenter/index.vue](file://src/views/pinenter/index.vue)
- [views/pinsetup/index.vue](file://src/views/pinsetup/index.vue)

## Conclusion
The ahm-gr-scanner integrates PIN authentication, robust scanning, and end-to-end inventory workflows. Shared services centralize state and network operations, while modular views provide focused user experiences. Together, these features enable efficient goods registration, purchase order reconciliation, and reliable delivery processing with clear user feedback and resilient error handling.