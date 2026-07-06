# Syncstuff Monorepo - Technical Reference

This document provides comprehensive technical context for AI assistants working with the Syncstuff monorepo project.

## Project Overview

**Syncstuff** is a cross-platform file synchronization ecosystem built as a monorepo. The project enables secure peer-to-peer file transfer, clipboard synchronization, and cloud storage integration across mobile, desktop, web, and CLI platforms.

## Monorepo Structure

### Workspace Packages

The project is organized into 4 apps and 7 packages:

#### Apps

1. **`apps/mobile`** - Flutter Mobile Application
   - **Technology**: Flutter 3.x + Dart 3.x
   - **Purpose**: Cross-platform mobile app (Android/iOS) with P2P file sync
   - **Key Features**: WebRTC P2P transfers, mDNS discovery, QR pairing, clipboard sync, cloud integration
   - **Architecture**: Clean Architecture with BLoC pattern
   - **Shared Packages**: Depends on `packages/core` and `packages/core_flutter`

2. **`apps/desktop`** - Flutter Desktop Application
   - **Technology**: Flutter 3.x + Dart 3.x
   - **Purpose**: Windows desktop app for P2P file sync
   - **Key Features**: Full P2P parity with mobile (WebRTC, QR, discovery, permissions)
   - **Shared Packages**: Depends on `packages/core` and `packages/core_flutter`

3. **`apps/cli_dart`** - Dart CLI
   - **Technology**: Dart (compiled to native executable)
   - **Purpose**: Command-line tool for device discovery, file transfer, clipboard sync
   - **Shared Package**: Depends on `packages/core` (pure Dart entities)
   - **No runtime dependency required**

4. **`apps/web`** - Web Application
   - **Technology**: Remix.js + Cloudflare Workers + React 18
   - **Purpose**: Web dashboard, landing page, and admin interface
   - **Key Features**: User auth, dashboard, admin panel
   - **Depends on**: `@syncstuff/ui`, `@syncstuff/shared`

#### Packages

5. **`packages/core`** - Shared Pure Dart Core
   - **Technology**: Dart (pure, no Flutter dependencies)
   - **Purpose**: Shared entities, constants, and pure Dart utilities
   - **Used by**: mobile, desktop, cli_dart (all apps)
   - **Contains**: Domain entities (`FileTransfer`, `SyncDevice`, `ClipboardItem`), constants, utility functions

6. **`packages/core_flutter`** - Flutter Extensions for Core
   - **Technology**: Dart + Flutter
   - **Purpose**: Flutter-specific datasources and repositories (sqflite, shared_preferences, path_provider)
   - **Used by**: mobile, desktop (Flutter apps only)
   - **Contains**: `DatabaseHelper`, `TransferLocalDataSource`, `DeviceLocalDataSource`, `SettingsLocalDataSource`, `ClipboardLocalDataSource`, and repository classes

7. **`packages/ui`** - Shared UI Component Library
   - **Technology**: React + TypeScript
   - **Purpose**: Shared UI components for the web app

8. **`packages/api`** - Backend API
   - **Technology**: Cloudflare Workers
   - **Purpose**: Authentication and user management API

9. **`packages/database`** - Database Layer
   - **Technology**: Cloudflare D1 (SQLite)
   - **Purpose**: Database schema and migrations

10. **`packages/shared`** - Shared TypeScript Utilities
    - **Technology**: TypeScript
    - **Purpose**: Shared types and utilities for web and API packages

11. **`packages/telemetry`** - OpenTelemetry Workers
    - **Technology**: Cloudflare Workers + OpenTelemetry
    - **Purpose**: Request tracing and observability

## Technology Stack

### Frontend Technologies

- **Flutter 3.x**: Mobile and desktop UI framework
- **Dart 3.x**: Programming language for mobile, desktop, CLI
- **React 18**: Web UI framework
- **Remix.js**: Web application framework
- **Tailwind CSS**: Styling
- **Zustand**: State management (web)

### Backend Technologies

- **Cloudflare Workers**: Serverless runtime
- **Cloudflare D1**: SQLite database
- **Cloudflare KV**: Key-value storage (planned)

### Mobile/Desktop Technologies

- **WebRTC**: Peer-to-peer connections
- **mDNS/UDP**: Local network discovery
- **flutter_bloc**: State management
- **sqflite**: Local SQLite storage

### Development Tools

- **Bun**: Package manager and runtime
- **Turborepo**: Task orchestration (npm packages)
- **Melos**: Task orchestration (Dart/Flutter packages)
- **TypeScript**: Type safety for web packages
- **Biome**: Formatting
- **ESLint**: Code quality
- **Wrangler**: Cloudflare Workers CLI

## Flutter App Architecture (apps/mobile & apps/desktop)

Clean Architecture with BLoC pattern:
```
UI Components → BLoC/Cubit → Use Cases → Repositories → Data Sources
```

**Package Organization**:
- `packages/core`: Pure Dart entities, constants, utilities (no Flutter dependencies)
- `packages/core_flutter`: Flutter-specific datasources/repositories (sqflite, shared_preferences)

### P2P Signaling

- **Automated**: WebSocket server for same-network P2P
- **Manual**: QR codes and manual signal exchange for cross-network
- **Ports**: 8765 (discovery), 8766 (UDP), 8767 (WebSocket)

### QR Code Pairing

- **URI**: `syncstuff://connect`
- **Params**: id, name, ip, port, platform, version

## Web Architecture (apps/web)

- Remix.js on Cloudflare Workers
- D1 database for user management
- OAuth2 authentication (GitHub, Discord)

## CLI (apps/cli_dart)

- Dart-compiled native executable
- Device discovery, file transfer, clipboard sync from terminal
- Depends on `packages/core` for shared entities
- No runtime dependency required

## Development Workflow

### Essential Commands

```bash
# Package Management
bun install                    # Install npm dependencies

# Dart Dependency Management (Melos)
melos bootstrap                # Bootstrap all Dart packages
melos run analyze              # Run dart analyze across packages
melos run test                 # Run tests across packages (pure Dart)
melos run test:flutter         # Run Flutter tests (mobile/desktop)
melos run upgrade              # Upgrade all Dart dependencies

# Build (npm/turbo packages)
bun run build                  # Build all npm packages via turbo
bun run build:web              # Build web app
bun run build:ui               # Build shared UI library

# Build (Flutter/Dart)
bun run build:mobile           # Build Android APK
bun run build:mobile:ios       # Build iOS
bun run build:desktop          # Build Windows desktop
bun run build:cli_dart         # Compile CLI to native exe

# Development
bun run dev:web                # Start web dev server
bun run dev:api                # Start API dev server
bun run dev:mobile             # Flutter run (connected device)
bun run dev:desktop            # Flutter run -d windows
bun run dev:cli_dart           # Dart run CLI

# Testing
bun run test                   # Turbo test across npm packages
bun run test:mobile            # Flutter test
bun run test:desktop           # Flutter test
bun run test:cli_dart          # Dart test

# Code Quality
bun run lint                   # ESLint across npm packages
bun run lint:fix               # Auto-fix linting
bun run format                 # Biome format
bun run typecheck              # TypeScript checking
bun run check                  # lint:fix + format + typecheck

# Deployment
bun run deploy:web             # Deploy web to Cloudflare
bun run deploy:api             # Deploy API to Cloudflare
bun run deploy:telemetry       # Deploy telemetry workers
```

### Testing Strategy

- **Dart (pure)**: Unit tests via `dart test` in `packages/core`
- **Flutter**: Widget tests via `flutter test` in `apps/mobile` and `apps/desktop`
- **TypeScript/Web**: Vitest for components, Cypress for E2E
- **Integration**: Manual testing for P2P features

### Deployment Pipeline

- **Web**: Cloudflare Workers with assets
- **API**: Cloudflare Workers
- **Database**: Cloudflare D1 with migrations
- **Mobile**: APK built via CI/CD (GitHub Actions)
- **Desktop**: Windows build via CI/CD (GitHub Actions)

## Configuration

### Environment Variables

```bash
# API Configuration
GITHUB_OAUTH_CLIENT_ID=<client-id>
GITHUB_OAUTH_CLIENT_SECRET=<secret>
SESSION_SECRET=<session-secret>

# Web
API_URL=https://syncstuff-api.involvex.workers.dev
```

### Cloudflare Configuration

- **Workers**: API and web application deployed separately
- **D1 Database**: Single database shared across services
- **KV Storage**: Planned for caching and temporary data

## Development Guidelines

### Code Style

- **TypeScript**: Strict mode for all TS packages
- **Dart**: Strict linting with very_good_analysis and flutter_lints
- **ESLint**: Comprehensive rules for React, TypeScript
- **Biome**: Consistent formatting
- **Flutter**: Follow effective Dart and BLoC patterns

### Architecture Principles

- **Separation of Concerns**: Clear boundaries between apps and packages
- **Service Layer**: Business logic isolated from UI components
- **Type Safety**: Full TypeScript and Dart coverage
- **Shared Core**: `packages/core` provides common Dart business logic (pure, no Flutter)
- **Flutter Extensions**: `packages/core_flutter` provides Flutter-specific implementations

## Troubleshooting

### Common Issues

- **Flutter Build Errors**: Ensure Flutter 3.x and Dart 3.x are installed; run `flutter clean`
- **Database Migrations**: Run `bun run db:migrate` for schema updates
- **TypeScript Errors**: Run `bun run typecheck` to identify issues
- **Bun Install Issues**: Delete `node_modules` and `bun.lock`, then `bun install`
- **Melos Issues**: Run `melos clean` then `melos bootstrap` to reset Dart packages
