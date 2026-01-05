# Syncstuff: Current Implementation

This document outlines the current state of the Syncstuff application, including its architecture, dependencies, implemented features, and instructions for running and testing.

## 1. Project Architecture & Core Stack

The project has been stabilized on a compatible set of technologies to ensure a smooth development experience on a standard Java 17 (JDK 17) environment.

- **UI Framework:** Ionic 7 w/ React 18
- **Native Runtime:** Capacitor 6
- **Routing:** React Router v5 (as required by `@ionic/react-router@7`)
- **Build Tool:** Vite
- **Package Manager:** Bun
- **State Management:** Zustand
- **Styling:** CSS Modules & global `variables.css` for theming.

### Key Dependencies:

- `@capacitor/core: ^6.0.0`
- `@ionic/react: ^7.0.0`
- `@ionic/react-router: ^7.0.0`
- `react-router-dom: ^5.3.4`
- `simple-peer: ^9.11.1` (for WebRTC)
- `capacitor-zeroconf: ^3.0.0` (for mDNS discovery)
- `@capacitor-community/barcode-scanner: ^4.0.1` (for QR code scanning)
- `qrcode.react: ^4.2.0` (for QR code generation)
- `socket.io-client: ^4.8.3` (for WebSocket signaling client)
- `socket.io: ^4.8.3` (for WebSocket signaling server)
- `zustand: ^5.0.9` (for state management)
- `crypto-js: ^4.2.0` (for file checksums)

## 2. Implemented Features

### Phase 1: Foundation & Core UI

- **4-Tab Navigation:** Stable tab bar for Devices, Transfers, Clipboard, and Settings.
- **State Management:** Zustand stores for `settings`, `devices`, `transfers`, and `cloud`.
- **Theme System:** Functional dark/light/system theme toggle.

### Phase 2: Device Discovery

- **mDNS/Zeroconf:** Local network discovery (Native Android).
- **Device List UI:** Real-time discovery and pairing management.

### Phase 3: File Transfer (MVP)

- **WebRTC P2P Connections:** Direct peer-to-peer connection via `simple-peer`.
- **Automated Signaling:** WebSocket-based signaling server for connection negotiation.
- **File Transfer Protocol:** Chunked file transfer with progress tracking.

### Phase 4: Cloud Provider Integration

- **Cloud Architecture:** Unified `CloudManagerService` for multiple providers.
- **Mock Cloud Provider:** Simulated cloud storage for testing.
- **Google Drive / Mega Stubs:** Ready for API key configuration.
- **Cloud File Browser:** UI for browsing, uploading, and downloading cloud files.

### Phase 5: URL-Based Pairing & Deep Linking

- **Deep Link Service:** Support for `syncstuff://pair` and HTTPS pairing URLs.
- **QR Code Enhancement:** Codes now contain shareable pairing URLs.
- **Web Share Integration:** Easy sharing of pairing links via system share sheet.

## 3. How to Run & Test the App

### A. Unit Tests

```bash
bun run test.unit
```

### B. Start the Signaling Server

```bash
bun run start:signaling
```

### C. Run the App

- **Web:** `bun run dev`
- **Android:** `ionic cap run android -l --external`

### D. Testing Features

1. **P2P Transfer:** Pair two devices via discovery or QR code, then use "Send File".
2. **Cloud Sync:** Go to Settings, connect "Mock Cloud", then manage files in the Transfers > Cloud tab.
3. **Clipboard Sync:** Enable monitoring in Clipboard tab and "Backup to Cloud" in its settings.

## 4. Next Steps

- **Account Service:** Implement real OAuth2 flows for Google Drive and Mega.
- **Background Service:** Ensure clipboard monitoring works in the background on mobile.
- **Conflict Resolution:** Add strategies for handling file versioning in cloud sync.
- **Desktop Support:** Implement Electron/Tauri wrapper for Windows/macOS/Linux.
