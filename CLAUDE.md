# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Manager

This project uses **Bun** as the package manager.

### Essential Commands

```bash
# Development
bun run dev                    # Start Vite dev server (web at http://localhost:5173)
bun run serve                  # Alternative: Ionic dev server
bun run start:signaling        # Start WebSocket signaling server (required for P2P)

# Building
bun run build                  # Build for production (runs prebuild: format + lint + typecheck)
bun run preview                # Preview production build

# Code Quality
bun run typecheck              # TypeScript type checking (tsc --noEmit)
bun run lint                   # Run ESLint
bun run lint:fix               # Auto-fix ESLint issues
bun run format                 # Format code with Prettier
bun run format:check           # Check formatting without changing files

# Testing
bun run test.unit              # Run unit tests (Vitest)
bun run test.e2e               # Run E2E tests (Cypress)

# Mobile Development
bun run run:android            # Build and run on Android with live reload
ionic cap run android -l --external   # Alternative Android live reload command
ionic cap sync                 # Sync web assets to native projects
ionic cap open android         # Open Android Studio
ionic cap open ios             # Open Xcode
```

## Architecture Overview

### Technology Stack

- **UI Framework:** Ionic 7 with React 18
- **Native Runtime:** Capacitor 6 (cross-platform: Android, iOS, Web)
- **Routing:** React Router v5 (required by @ionic/react-router)
- **Build Tool:** Vite
- **State Management:** Zustand with local storage persistence
- **P2P Networking:** WebRTC (simple-peer) + Socket.IO for signaling
- **Device Discovery:** mDNS/Zeroconf (Android native only)

### Core Application Pattern

This is a **hybrid mobile/web P2P file synchronization app** with a multi-layered architecture:

```
UI Components (pages/, components/)
         ↓
Custom Hooks (hooks/)
         ↓
Zustand Stores (store/)
         ↓
Service Layer (services/)
         ↓
Native APIs (Capacitor plugins)
```

### Service Layer Architecture

The business logic is organized into domain-specific services:

**Network Services (`src/services/network/`):**

- `discovery.service.ts` - mDNS broadcasting and device discovery (Android only)
- `webrtc.service.ts` - WebRTC peer connections and WebSocket signaling client

**Storage Services (`src/services/storage/`):**

- `file-manager.service.ts` - File I/O operations using Capacitor Filesystem
- `local-storage.service.ts` - Persistent key-value storage wrapper

**Sync Services (`src/services/sync/`):**

- `transfer.service.ts` - Chunked file transfer protocol implementation

### State Management Pattern

Three Zustand stores manage application state:

1. **`device.store.ts`** - Discovered devices, paired devices, current device info
2. **`transfer.store.ts`** - Active transfers, transfer history, progress tracking
3. **`settings.store.ts`** - App settings (theme preference)

Stores persist critical data (paired devices, settings) to Ionic Storage for cross-session persistence.

### Dual Signaling Architecture

The app supports **two signaling mechanisms** for WebRTC connection establishment:

1. **Automated WebSocket Signaling** (Primary)
   - Server: `signaling-server.js` (Node.js + Socket.IO)
   - Client: `webrtc.service.ts` connects to `ws://localhost:3001`
   - Devices exchange WebRTC offers/answers automatically via server

2. **Manual/QR Code Signaling** (Fallback)
   - `QrCodeModal.tsx` - Generate QR code with device ID
   - `@capacitor-mlkit/barcode-scanning` - Scan QR codes (native)
   - `SignalModal.tsx` - Copy/paste WebRTC signals manually

**Why both approaches?**

- WebSocket signaling requires both devices on same network with server running
- QR code pairing works across different networks (e.g., web ↔ native without server)
- Manual signaling useful for debugging or when automated signaling fails

## Critical Testing Information

### Testing P2P Functionality

P2P file transfer requires **three running processes**:

1. **Signaling Server** (required for automated signaling):

   ```bash
   bun run start:signaling
   # Runs on http://localhost:3001
   # Keep this terminal open during testing
   ```

2. **Web Instance**:

   ```bash
   bun run dev
   # Navigate to http://localhost:5173
   ```

3. **Android Instance**:
   ```bash
   bun run build  # Build web assets first
   ionic cap run android -l --external
   ```

### Testing Workflow

1. Start signaling server
2. Launch web app and Android app
3. **Pair devices:**
   - Via discovery: Tap discovered device → Pair
   - Via QR code: "Show My Code" on Device A → "Scan Code" on Device B
4. **Connect:** Tap "Connect" on paired device
5. **Transfer:** Tap "Send File" → Select file → Monitor "Transfers" tab

### Platform-Specific Behaviors

- **mDNS Discovery:** Only works on **Android native builds** (not web/iOS)
- **QR Scanning:** Uses ML Kit on native, requires camera permission
- **File Access:** Uses Capacitor Filesystem API (platform-specific paths)
- **WebRTC:** Works on all platforms but requires signaling mechanism

### Test Mocking

`src/setupTests.ts` includes comprehensive mocks for:

- Capacitor plugins (@ionic/storage, @capacitor-mlkit/barcode-scanning)
- React Router v5 (BrowserRouter, useHistory, useLocation, useParams)
- Ionic React Router (IonReactRouter, IonRouterOutlet)
- window.matchMedia (for theme detection)

## Key Constraints

### React Router Version Lock

- Must use React Router **v5.x** due to @ionic/react-router@7 dependency
- Cannot upgrade to React Router v6 without breaking Ionic integration

### Java Environment

- Project is stabilized on **Java 17 (JDK 17)** for Android builds
- Gradle and Android tooling expect this version

### Capacitor Plugin Compatibility

- All Capacitor plugins locked at **v6.x** for compatibility
- Test all native features on actual devices (emulators may have limited API support)

## Project Structure Highlights

```
src/
├── pages/              # 4-tab navigation: Devices, Transfers, Clipboard, Settings
├── components/         # Organized by domain: common/, device/, transfer/
├── hooks/              # Custom React hooks for business logic
├── services/           # Service layer: network/, storage/, sync/
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
└── utils/              # Utility functions: crypto, platform detection

signaling-server.js     # WebSocket signaling server (Socket.IO)
```

## Development Notes

- **Signaling Server:** Required for automated P2P connections. Always start before testing transfers.
- **Platform Detection:** Use `platform.utils.ts` to check current platform (Android, iOS, Web)
- **Theme System:** Dark/light/system theme via CSS custom properties in `theme/variables.css`
- **Type Safety:** Strict TypeScript mode enabled. Run `bun run typecheck` before commits.
- **Code Style:** Prettier + ESLint enforced. Prebuild script auto-formats and lints.
