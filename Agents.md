# SyncStuff Tech Stack Documentation

## Project Overview

SyncStuff is a cross-platform file synchronization application built as a monorepo. It uses Flutter for mobile/desktop, Dart for CLI, and Remix/Cloudflare Workers for web and API.

## Monorepo Structure

```
syncstuff-monorepo/
├── apps/
│   ├── mobile/       # Flutter mobile app (Android/iOS)
│   ├── desktop/      # Flutter desktop app (Windows)
│   ├── cli_dart/     # Dart CLI (compiled native executable)
│   └── web/          # Web dashboard (Remix.js + Cloudflare Workers)
├── packages/
│   ├── core/         # Shared Dart/Flutter core (entities, services, utils)
│   ├── ui/           # Shared React UI component library
│   ├── api/          # Backend API (Cloudflare Workers)
│   ├── database/     # Database schema and migrations (Cloudflare D1)
│   ├── shared/       # Shared TypeScript types and utilities
│   └── telemetry/   # OpenTelemetry workers
└── docs/             # Documentation
```

## Technology Stack

### Mobile & Desktop (Flutter)
- **Flutter 3.x**: Cross-platform UI framework
- **Dart 3.x**: Programming language
- **flutter_bloc**: State management (BLoC pattern)
- **get_it**: Dependency injection
- **flutter_webrtc**: P2P connections
- **qr_flutter / mobile_scanner**: QR code generation & scanning
- **file_picker / permission_handler**: File & permission management

### CLI (Dart)
- **Dart**: Native compiled executable
- No runtime dependency needed

### Web Application
- **React 18**: UI framework
- **Remix.js**: Full-stack React framework
- **Cloudflare Workers**: Serverless runtime
- **Tailwind CSS**: Styling

### Backend
- **Cloudflare Workers**: API runtime
- **Cloudflare D1**: SQLite database
- **Cloudflare KV**: Key-value storage (planned)

### Shared Packages
- **packages/core**: Dart package shared by mobile, desktop, cli_dart
- **packages/shared**: TypeScript utilities for web/api
- **packages/ui**: React component library for web

### Build & Tooling
- **Bun**: Package manager and npm workspace runtime
- **Turborepo**: Task orchestration across monorepo
- **TypeScript**: Strict mode for all TS packages
- **Biome**: Formatting and linting
- **ESLint**: Additional code quality

## Development Commands

```bash
# Install dependencies (npm workspace packages)
bun install

# Build all npm packages (via Turborepo)
bun run build

# Build specific targets
bun run build:web        # Web app (includes UI package)
bun run build:mobile     # Flutter Android APK
bun run build:mobile:ios # Flutter iOS
bun run build:desktop     # Flutter Windows desktop
bun run build:cli_dart    # Compile Dart CLI to native exe
bun run build:ui          # Shared UI library only
bun run build:shared      # Shared TS utilities only

# Development servers
bun run dev:web          # Remix dev server
bun run dev:api          # Cloudflare Workers dev
bun run dev:mobile       # Flutter run (connected device)
bun run dev:desktop       # Flutter run -d windows
bun run dev:cli_dart      # Dart run CLI

# Testing
bun run test              # Turbo test across npm packages
bun run test:mobile       # Flutter test
bun run test:desktop       # Flutter test
bun run test:cli_dart      # Dart test

# Code quality
bun run lint / lint:fix   # ESLint
bun run format            # Biome format
bun run typecheck         # TypeScript checking
bun run check             # lint:fix + format + typecheck

# Deployment
bun run deploy:web
bun run deploy:api
bun run deploy:telemetry

# Database
bun run db:create
bun run db:migrate
```

## Flutter App Architecture (apps/mobile & apps/desktop)

Clean Architecture with BLoC pattern:
```
UI Components → BLoC/Cubit → Use Cases → Repositories → Data Sources
```

### Core Services (packages/core)
- **DiscoveryService**: mDNS/UDP device discovery
- **P2PService**: WebRTC peer-to-peer connections
- **FileTransferService**: Chunked file transfer (16KB chunks)
- **ClipboardSyncService**: Real-time clipboard sync

### P2P Signaling
- **Port 8765**: Discovery service
- **Port 8766**: UDP broadcast
- **Port 8767**: WebSocket signaling

### QR Code Pairing
- **URI**: `syncstuff://connect`
- **Params**: id, name, ip, port, platform, version

## Web Architecture (apps/web)

- Remix.js full-stack framework on Cloudflare Workers
- D1 database for user management
- OAuth2 authentication (GitHub, Discord)

## CLI (apps/cli_dart)

- Dart-compiled native executable
- Device discovery, file transfer, clipboard sync from terminal
- No runtime dependency required