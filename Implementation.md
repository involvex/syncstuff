# Syncstuff: Current Implementation (As of Automated Signaling & QR Pairing)

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

The MVP implementation is complete, covering the first three phases of the project plan, and has been enhanced with automated signaling and QR code pairing.

### Phase 1: Foundation & Core UI

- **4-Tab Navigation:** The app has a stable tab bar for Devices, Transfers, Clipboard, and Settings.
- **State Management:** Zustand stores are set up for `settings`, `devices`, and `transfers`.
- **Theme System:** A fully functional dark/light/system theme toggle is implemented and persists across app restarts using `@ionic/storage`.
- **Platform Utilities:** A helper service (`platform.utils.ts`) is in place to detect the current platform (Android, Web, etc.).

### Phase 2: Device Discovery

- **mDNS/Zeroconf:** The app can successfully broadcast its presence and discover other devices running the app on the same local network.
  - This currently only functions on the native Android build.
- **Device List UI:** The "Devices" page displays a real-time list of discovered devices and a separate list of paired devices.
- **Pairing:** A user can "pair" with a discovered device, which saves it for future connections.
- **Fix:** The unresponsive "Start/Stop Discovery" buttons bug has been fixed by simplifying the component lifecycle.

### Phase 3: File Transfer (MVP)

- **WebRTC P2P Connections:** The core logic for establishing a direct peer-to-peer connection between devices is implemented using `simple-peer`.
- **Automated Signaling (via WebSocket):** The previous manual signaling process has been replaced with an automated WebSocket-based signaling server. This allows devices on the same local network to exchange WebRTC offer/answer signals automatically once they know each other's IDs.
- **File Transfer Protocol:** A protocol for sending file information and data chunks has been implemented in `transfer.service.ts`.
- **Chunking & Reassembly:** The logic to read a file in chunks, send it over the data channel, and write it to disk on the receiving device is complete.
- **UI for Transfers:** The "Transfers" page now shows active and historical transfers, and the "Devices" page has a "Send File" button for paired devices.
- **QR Code Pairing:** This new feature enables easy pairing and connection setup, especially between a native app and the web version, by scanning a QR code containing the device ID.

### Phase 4: Cloud Provider Integration (In Progress)

- **Cloud Architecture:** Implemented a unified `CloudManagerService` and `useCloudStore` to handle multiple cloud providers.
- **Provider Interface:** Defined generic `CloudProvider` interface for seamless integration of different services (Google Drive, Mega, etc.).
- **Mock Cloud Provider:** Added a mock provider to demonstrate and test the UI and authentication flows without external API keys.
- **Google Drive Stub:** Created a structure for Google Drive integration, ready for Client ID configuration.
- **Settings UI:** Added a "Cloud Accounts" section in the Settings page to manage connected accounts.
- **Cloud File Browser:** Implemented a functional `CloudFileBrowser` component integrated into the **Transfers** page (via segments).
- **Cloud Upload/Download:** Added support for uploading local files to the cloud and downloading files from the cloud via the unified interface.

## 3. How to Run & Test the App

To test the full P2P functionality, you will need to run the signaling server and then instances of the app on different platforms (e.g., your Android device and a web browser).

### A. Start the Signaling Server

- Open a **new, separate terminal** in the project root.
- Run the command:
  ```bash
  bun run start:signaling
  ```
- Keep this terminal open. It will log connection events.

### B. Run the App on Web

```bash
bun run dev
```

Navigate to `http://localhost:5173`. The web version will automatically connect to the signaling server.
To test Cloud Integration:

1. Go to **Settings** and click **"Connect Mock Cloud (Test)"**.
2. Go to **Transfers** and switch to the **"Cloud"** segment.
3. You can now browse mock files, download them, or upload new ones.

### C. Run the App on Android

After building the web assets:

```bash
# Build the web assets (if not already done)
bun run build

# Sync assets and run on a connected Android device with Live Reload
ionic cap run android -l --external
```

The Android app will automatically connect to the signaling server.

### D. Testing P2P Connection & File Transfer (Android <> Web)

1.  **Start Services:** Ensure the **signaling server** is running (`bun run start:signaling`), and both your **web app** (`bun run dev`) and **Android app** (`ionic cap run android -l --external`) are running.
2.  **Pair Devices (if not already):**
    - **On Device A (e.g., Android):** Go to the "Devices" tab. If you see the web instance, you can pair it.
    - **Using QR Code (if discovery fails or for web):**
      - On Device A (e.g., Android), tap the **"Show My Code"** button to display its device ID as a QR code.
      - On Device B (e.g., Web), tap the **"Scan Code"** button. This will (on native devices) open the camera, or on web it will ask for a camera permission. Scan the QR code displayed on Device A.
      - Upon successful scan, Device B will automatically pair with Device A.
3.  **Initiate Connection:**
    - Go to the "Paired" segment on the Devices page.
    - Tap **"Connect"** next to the paired device you wish to communicate with. The connection should establish automatically via the signaling server.
    - You should see "Connected" status.
4.  **Send a File:**
    - From the "Paired" list on either device, tap the **"Send File"** button for the connected device.
    - Select a file.
    - Observe the transfer progress on the "Transfers" tab on both devices.

## 4. Next Steps

- **Complete Google Drive Integration:** Register a Google Cloud project and configure the Client ID in `src/services/cloud/providers/google-drive.service.ts`.
- **Implement Cloud File Browser:** Create a UI to browse, upload, and download files from connected cloud storage.
- **Mega Integration:** Research and implement Mega cloud provider.
- **Phase 5: Clipboard Synchronization:** (Previously Phase 4) Refine the existing clipboard implementation and ensure it integrates well with the new cloud features if needed (e.g., syncing clipboard history to cloud).

## 4. Next Steps

The implemented features align with the "Futureplan" items for "Quick Pairing with QR Code Scan". The automated signaling and QR code pairing significantly enhance the core P2P experience. The next logical steps, as per your updated `Plan.md`, would involve:

- **Account Service & Cloud Linking:** Integrating cloud providers like Google Drive or Mega for account login and device linking.
