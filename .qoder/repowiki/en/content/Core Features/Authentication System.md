# Authentication System

<cite>
**Referenced Files in This Document**
- [PinMobile.vue](file://src/components/pinmobile/PinMobile.vue)
- [README.md](file://src/components/pinmobile/README.md)
- [index.vue](file://src/views/pinenter/index.vue)
- [index.vue](file://src/views/pinsetup/index.vue)
- [store.js](file://src/util/store.js)
- [keyboard.js](file://src/util/keyboard.js)
- [main.js](file://src/main.js)
- [router/index.js](file://src/router/index.js)
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
This document explains the PIN-based authentication system, including setup and validation workflows, session management, security considerations, and mobile-specific UX patterns. It focuses on the PinMobile component, PIN entry interfaces, and integration with the application store for persistence and state synchronization.

## Project Structure
The PIN authentication spans a small set of focused components and utilities:
- UI components for PIN entry and setup
- A reusable PinMobile component for consistent input behavior
- Store integration for persistence and session state
- Keyboard utilities for mobile input optimization
- Routing to guide users through setup and login flows

```mermaid
graph TB
subgraph "Views"
V_PINSETUP["pinsetup/index.vue"]
V_PINENTER["pinenter/index.vue"]
end
subgraph "Components"
C_PINMOBILE["pinmobile/PinMobile.vue"]
end
subgraph "Utilities"
U_STORE["util/store.js"]
U_KEYBOARD["util/keyboard.js"]
end
subgraph "App Shell"
M_MAIN["main.js"]
R_INDEX["router/index.js"]
end
V_PINSETUP --> C_PINMOBILE
V_PINENTER --> C_PINMOBILE
C_PINMOBILE --> U_STORE
C_PINMOBILE --> U_KEYBOARD
V_PINSETUP --> U_STORE
V_PINENTER --> U_STORE
M_MAIN --> R_INDEX
R_INDEX --> V_PINSETUP
R_INDEX --> V_PINENTER
```

**Diagram sources**
- [PinMobile.vue](file://src/components/pinmobile/PinMobile.vue)
- [README.md](file://src/components/pinmobile/README.md)
- [index.vue](file://src/views/pinenter/index.vue)
- [index.vue](file://src/views/pinsetup/index.vue)
- [store.js](file://src/util/store.js)
- [keyboard.js](file://src/util/keyboard.js)
- [main.js](file://src/main.js)
- [router/index.js](file://src/router/index.js)

**Section sources**
- [PinMobile.vue](file://src/components/pinmobile/PinMobile.vue)
- [README.md](file://src/components/pinmobile/README.md)
- [index.vue](file://src/views/pinenter/index.vue)
- [index.vue](file://src/views/pinsetup/index.vue)
- [store.js](file://src/util/store.js)
- [keyboard.js](file://src/util/keyboard.js)
- [main.js](file://src/main.js)
- [router/index.js](file://src/router/index.js)

## Core Components
- PinMobile: Reusable PIN input component providing masked entry, numeric-only constraints, touch-friendly controls, and keyboard hints. Emits events for completion and errors.
- pinsetup view: Guides first-time users through creating and confirming a PIN; persists the PIN securely via the store.
- pinenter view: Handles login by prompting for the PIN, validating against stored credentials, and managing session state.

Key responsibilities:
- Input handling and validation (length, format)
- Error feedback for incorrect attempts
- Session creation and persistence
- Mobile UX optimizations (touch targets, virtual keyboard behavior)

**Section sources**
- [PinMobile.vue](file://src/components/pinmobile/PinMobile.vue)
- [README.md](file://src/components/pinmobile/README.md)
- [index.vue](file://src/views/pinenter/index.vue)
- [index.vue](file://src/views/pinsetup/index.vue)
- [store.js](file://src/util/store.js)
- [keyboard.js](file://src/util/keyboard.js)

## Architecture Overview
The authentication flow is driven by views that orchestrate the PinMobile component and coordinate with the store for persistence and session state.

```mermaid
sequenceDiagram
participant User as "User"
participant Router as "Router"
participant Setup as "pinsetup View"
participant Enter as "pinenter View"
participant PinComp as "PinMobile Component"
participant Store as "Store"
participant App as "App Shell"
User->>Router : Open app
Router-->>Setup : Navigate to PIN setup if no PIN exists
Setup->>PinComp : Render PIN input
PinComp-->>Setup : Emit "complete" with entered PIN
Setup->>Store : Save new PIN securely
Store-->>Setup : Persisted successfully
Setup-->>User : Success message
User->>Router : Open app again
Router-->>Enter : Navigate to PIN entry
Enter->>PinComp : Render PIN input
PinComp-->>Enter : Emit "complete" with entered PIN
Enter->>Store : Validate PIN against stored value
Store-->>Enter : Validation result
alt Valid PIN
Enter->>Store : Create session
Store-->>Enter : Session created
Enter-->>App : Unlock main app
else Invalid PIN
Enter-->>User : Show error and allow retry
end
```

**Diagram sources**
- [index.vue](file://src/views/pinenter/index.vue)
- [index.vue](file://src/views/pinsetup/index.vue)
- [PinMobile.vue](file://src/components/pinmobile/PinMobile.vue)
- [store.js](file://src/util/store.js)
- [router/index.js](file://src/router/index.js)
- [main.js](file://src/main.js)

## Detailed Component Analysis

### PinMobile Component
Purpose:
- Provide a consistent, accessible, and mobile-friendly PIN input experience.
- Enforce numeric-only input, fixed length, and masking.
- Emit structured events for completion and errors.

Behavior highlights:
- Numeric-only constraint and mask display
- Touch-friendly digit buttons and backspace
- Optional hint to show/hide last digit
- Keyboard focus management and virtual keyboard hints
- Event emission on completion or invalid input

Integration points:
- Consumed by both setup and enter views
- Uses store for persistence operations when needed
- Leverages keyboard utility for mobile input optimization

```mermaid
classDiagram
class PinMobile {
+props : digits, maxLength, placeholder
+emits : complete, error
+methods : handleDigit(d), handleBackspace(), clear()
-state : currentInput, isVisible
-validate(input) bool
-formatDisplay(input) string
}
class Store {
+getStoredPin() string?
+setStoredPin(pin) void
+createSession() void
+getSession() object?
}
class KeyboardUtil {
+focusInput() void
+showNumericKeyboard() void
+hideKeyboard() void
}
PinMobile --> Store : "reads/writes PIN/session"
PinMobile --> KeyboardUtil : "manages keyboard"
```

**Diagram sources**
- [PinMobile.vue](file://src/components/pinmobile/PinMobile.vue)
- [store.js](file://src/util/store.js)
- [keyboard.js](file://src/util/keyboard.js)

**Section sources**
- [PinMobile.vue](file://src/components/pinmobile/PinMobile.vue)
- [README.md](file://src/components/pinmobile/README.md)
- [store.js](file://src/util/store.js)
- [keyboard.js](file://src/util/keyboard.js)

### PIN Setup Workflow (pinsetup view)
Responsibilities:
- Prompt user to create a new PIN
- Confirm PIN to prevent typos
- Persist the PIN securely via the store
- Provide clear success/error feedback

Flow overview:
- First run detection and navigation to setup
- Two-step entry: initial PIN and confirmation
- Validation of match and length/format
- Secure storage and transition to main app

```mermaid
flowchart TD
Start(["Open Setup"]) --> Step1["Prompt for New PIN"]
Step1 --> Confirm["Confirm New PIN"]
Confirm --> Match{"PINs Match?"}
Match --> |No| Retry["Show Error and Retry"]
Retry --> Step1
Match --> |Yes| Persist["Persist PIN in Store"]
Persist --> Success["Show Success and Proceed"]
Success --> End(["Done"])
```

**Diagram sources**
- [index.vue](file://src/views/pinsetup/index.vue)
- [store.js](file://src/util/store.js)

**Section sources**
- [index.vue](file://src/views/pinsetup/index.vue)
- [store.js](file://src/util/store.js)

### PIN Entry and Validation (pinenter view)
Responsibilities:
- Prompt for existing PIN
- Validate against stored PIN
- Manage session state upon successful validation
- Handle incorrect attempts with appropriate feedback

Validation logic:
- Compare entered PIN with stored PIN
- On success, create session and unlock app
- On failure, show error and allow retry

```mermaid
sequenceDiagram
participant User as "User"
participant Enter as "pinenter View"
participant PinComp as "PinMobile Component"
participant Store as "Store"
User->>Enter : Launch app
Enter->>PinComp : Render PIN input
PinComp-->>Enter : Emit "complete" with entered PIN
Enter->>Store : Validate PIN
alt Valid
Store-->>Enter : true
Enter->>Store : Create session
Enter-->>User : Unlock app
else Invalid
Store-->>Enter : false
Enter-->>User : Show error and retry
end
```

**Diagram sources**
- [index.vue](file://src/views/pinenter/index.vue)
- [PinMobile.vue](file://src/components/pinmobile/PinMobile.vue)
- [store.js](file://src/util/store.js)

**Section sources**
- [index.vue](file://src/views/pinenter/index.vue)
- [PinMobile.vue](file://src/components/pinmobile/PinMobile.vue)
- [store.js](file://src/util/store.js)

### Session Management and Persistence
- Store provides methods to persist PIN and manage session state.
- Session creation occurs after successful PIN validation.
- Session retrieval determines whether to show setup, entry, or main app.

```mermaid
flowchart TD
Init(["App Init"]) --> CheckSession["Check Session"]
CheckSession --> HasSession{"Session Exists?"}
HasSession --> |Yes| MainApp["Show Main App"]
HasSession --> |No| CheckPin["Check Stored PIN"]
CheckPin --> HasPin{"PIN Exists?"}
HasPin --> |No| Setup["Navigate to PIN Setup"]
HasPin --> |Yes| Enter["Navigate to PIN Entry"]
Enter --> Validate["Validate Entered PIN"]
Validate --> |Valid| CreateSession["Create Session"]
CreateSession --> MainApp
Validate --> |Invalid| Retry["Allow Retry"]
```

**Diagram sources**
- [store.js](file://src/util/store.js)
- [router/index.js](file://src/router/index.js)
- [main.js](file://src/main.js)

**Section sources**
- [store.js](file://src/util/store.js)
- [router/index.js](file://src/router/index.js)
- [main.js](file://src/main.js)

### Mobile-Specific Considerations
- Touch input optimization: large digit buttons, clear visual feedback, and easy backspace.
- Virtual keyboard handling: force numeric keypad where possible, auto-focus input fields, and dismiss keyboard after submission.
- Accessibility: screen reader labels, high contrast, and sufficient tap target sizes.
- Performance: minimal re-renders during input, efficient event handling.

**Section sources**
- [PinMobile.vue](file://src/components/pinmobile/PinMobile.vue)
- [keyboard.js](file://src/util/keyboard.js)

## Dependency Analysis
The following diagram shows how the core modules depend on each other:

```mermaid
graph LR
R_INDEX["router/index.js"] --> V_SETUP["views/pinsetup/index.vue"]
R_INDEX --> V_ENTER["views/pinenter/index.vue"]
V_SETUP --> C_PINMOBILE["components/pinmobile/PinMobile.vue"]
V_ENTER --> C_PINMOBILE
C_PINMOBILE --> U_STORE["util/store.js"]
C_PINMOBILE --> U_KEYBOARD["util/keyboard.js"]
M_MAIN["main.js"] --> R_INDEX
```

**Diagram sources**
- [router/index.js](file://src/router/index.js)
- [index.vue](file://src/views/pinenter/index.vue)
- [index.vue](file://src/views/pinsetup/index.vue)
- [PinMobile.vue](file://src/components/pinmobile/PinMobile.vue)
- [store.js](file://src/util/store.js)
- [keyboard.js](file://src/util/keyboard.js)
- [main.js](file://src/main.js)

**Section sources**
- [router/index.js](file://src/router/index.js)
- [index.vue](file://src/views/pinenter/index.vue)
- [index.vue](file://src/views/pinsetup/index.vue)
- [PinMobile.vue](file://src/components/pinmobile/PinMobile.vue)
- [store.js](file://src/util/store.js)
- [keyboard.js](file://src/util/keyboard.js)
- [main.js](file://src/main.js)

## Performance Considerations
- Keep PinMobile lightweight: avoid heavy computations during keystroke events.
- Debounce or throttle any network calls triggered by PIN changes (if applicable).
- Minimize DOM updates by batching state changes within the component.
- Use efficient keyboard utilities to reduce layout thrashing on mobile devices.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- PIN not saved: verify store persistence methods are called after confirmation and check for errors in the setup view.
- Incorrect PIN repeatedly: ensure validation compares against the stored value and that session is not prematurely created.
- Keyboard not showing numeric keypad: confirm keyboard utility is invoked and input attributes enforce numeric mode.
- Session not persisting across reloads: verify session creation and retrieval logic in the store and router initialization.

**Section sources**
- [index.vue](file://src/views/pinsetup/index.vue)
- [index.vue](file://src/views/pinenter/index.vue)
- [store.js](file://src/util/store.js)
- [keyboard.js](file://src/util/keyboard.js)

## Conclusion
The PIN-based authentication system centers around a reusable PinMobile component, coordinated by dedicated setup and entry views, and backed by a store for persistence and session management. The design emphasizes mobile-friendly input, clear error handling, and secure session control. Following the documented flows and best practices will help maintain a robust and user-friendly authentication experience.