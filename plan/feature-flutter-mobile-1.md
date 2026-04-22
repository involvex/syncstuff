---
goal: Implement Flutter mobile app for SyncStuff with P2P file sync capabilities
version: 1.0
date_created: 2026-04-18
owner: SyncStuff Team
status: Completed
tags: feature, mobile, flutter, p2p, networking
---

# Flutter Mobile App Implementation Plan

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

## Introduction

This plan outlines the implementation of a Flutter-based mobile application for SyncStuff that enables peer-to-peer file synchronization, local network discovery, and clipboard sharing across devices (mobile, desktop, CLI, web).

## 1. Requirements & Constraints

### Functional Requirements

- **REQ-001**: Local network device discovery using mDNS/Bonjour
- **REQ-002**: P2P file transfer between devices on same network
- **REQ-003**: Clipboard synchronization across paired devices
- **REQ-004**: QR code pairing for cross-network device connection
- **REQ-005**: Device pairing and authentication
- **REQ-006**: Transfer progress tracking and history
- **REQ-007**: Dark/Light theme support with custom theming

### Technical Requirements

- **REQ-010**: Flutter 3.x with Dart 3.x
- **REQ-011**: Target Android (API 21+) and iOS (12+)
- **REQ-012**: Use drift (SQLite) for local storage
- **REQ-013**: BLoC pattern for state management
- **REQ-014**: Clean Architecture (Presentation → Domain → Data layers)

### UI/UX Requirements

- **REQ-020**: Modern, clean UI with syncstuff branding
- **REQ-021**: Bottom navigation with 4 tabs: Devices, Transfers, Clipboard, Settings
- **REQ-022**: Material Design 3 components
- **REQ-023**: Responsive layouts for phones and tablets

## 2. Implementation Steps

### Phase 1: Project Setup & Core Infrastructure

- GOAL-001: Initialize Flutter project and configure dependencies

| Task | Description | Completed | Date |
| ---- | ----------- | --------- | ---- |
| TASK-001 | Create Flutter project structure | | |
| TASK-002 | Add dependencies (flutter_bloc, drift, network_info, etc.) | | |
| TASK-003 | Set up project folder structure (Clean Architecture) | | |
| TASK-004 | Configure theme and branding | | |
| TASK-005 | Verify shell project builds | | |

### Phase 2: P2P Networking Layer

- GOAL-002: Implement local network discovery and P2P communication

| Task | Description | Completed | Date |
| ---- | ----------- | --------- | ---- |
| TASK-006 | Implement mDNS service for device discovery | | |
| TASK-007 | Create WebSocket server for signaling | | |
| TASK-008 | Implement WebRTC service for P2P connections | | |
| TASK-009 | Create device pairing protocol | | |
| TASK-010 | Implement QR code generation/scanning for pairing | | |

### Phase 3: File Transfer Protocol

- GOAL-003: Implement chunked file transfer with progress tracking

| Task | Description | Completed | Date |
| ---- | ----------- | --------- | ---- |
| TASK-011 | Create transfer service with chunked protocol | | |
| TASK-012 | Implement file metadata exchange | | |
| TASK-013 | Add transfer progress tracking | | |
| TASK-014 | Implement transfer history and resume capability | | |

### Phase 4: Mobile UI Implementation

- GOAL-004: Build UI screens and navigation

| Task | Description | Completed | Date |
| ---- | ----------- | --------- | ---- |
| TASK-015 | Implement main navigation (bottom tabs) | | |
| TASK-016 | Build Devices tab (discovered/paired devices) | | |
| TASK-017 | Build Transfers tab (active/history) | | |
| TASK-018 | Build Clipboard tab (sync toggle/history) | | |
| TASK-019 | Build Settings tab (theme, storage, about) | | |
| TASK-020 | Implement device detail/connection screens | | |

### Phase 5: Integration & Testing

- GOAL-005: Finalize and test all features

| Task | Description | Completed | Date |
| ---- | ----------- | --------- | ---- |
| TASK-021 | Integrate all services with UI | | |
| TASK-022 | Test P2P file transfer between devices | | |
| TASK-023 | Test clipboard sync functionality | | |
| TASK-024 | Build debug APK and verify | | |

## 3. Alternatives

- **ALT-001**: Use Firebase for device discovery - Rejected (requires internet, want local-first)
- **ALT-002**: Use HTTP instead of WebRTC for file transfer - Rejected (WebRTC more efficient for P2P)
- **ALT-003**: Use Provider instead of BLoC - Rejected (BLoC better for complex state management)

## 4. Dependencies

### Core Flutter Packages

- `flutter_bloc` - State management
- `drift` + `sqlite3_flutter_libs` - Local database
- `get_it` - Dependency injection
- `equatable` - Value equality for BLoC states
- `uuid` - Device ID generation

### Networking Packages

- `network_info_plus` - Get device IP addresses
- `dns_sd` - mDNS/Bonjour discovery (native)
- `web_socket_channel` - WebSocket connections
- `flutter_webrtc` - WebRTC for P2P
- `qr_flutter` - QR code generation
- `mobile_scanner` - QR code scanning

### UI Packages

- `flutter_svg` - SVG support
- `cached_network_image` - Image caching
- `file_picker` - File selection
- `path_provider` - Local storage paths

### Utilities

- `shared_preferences` - Simple key-value storage
- `permission_handler` - Runtime permissions
- `share_plus` - Share files externally

## 5. Files

### Project Structure

```
apps/mobile/                    # Flutter mobile app
├── lib/
│   ├── main.dart               # App entry point
│   ├── app.dart                # App configuration
│   ├── core/                   # Core utilities
│   │   ├── theme/              # Theme configuration
│   │   ├── constants/          # App constants
│   │   └── utils/              # Utility functions
│   ├── data/                   # Data layer
│   │   ├── datasources/        # Local/remote datasources
│   │   ├── models/             # Data models
│   │   └── repositories/       # Repository implementations
│   ├── domain/                 # Domain layer
│   │   ├── entities/           # Business entities
│   │   ├── repositories/       # Repository interfaces
│   │   └── usecases/           # Business logic
│   └── presentation/           # Presentation layer
│       ├── bloc/               # BLoC state management
│       ├── pages/              # Screen widgets
│       └── widgets/            # Reusable widgets
├── pubspec.yaml                # Dependencies
└── android/                    # Android configuration
```

## 6. Testing

- **TEST-001**: Unit tests for all BLoCs and use cases
- **TEST-002**: Widget tests for UI components
- **TEST-003**: Integration test for file transfer between two Android devices
- **TEST-004**: Manual test for clipboard sync

## 7. Risks & Assumptions

- **RISK-001**: mDNS may not work on all Android versions - Fallback to manual IP entry
- **RISK-002**: WebRTC NAT traversal may fail on some networks - Use relay server fallback
- **ASSUMPTION-001**: Devices will be on same WiFi network for most use cases
- **ASSUMPTION-002**: CLI tool will have same discovery protocol compatible

## 8. Related Specifications / Further Reading

- [Flutter WebRTC Documentation](https://docs.flutter.dev/development/platform-integration/android/webview-and-debugging)
- [mDNS Service Discovery Protocol](https://datatracker.ietf.org/doc/html/rfc6763)
- [SyncStuff Web App Architecture](../web/README.md)
- [SyncStuff CLI Commands](../cli/src/cli/commands/index.ts)