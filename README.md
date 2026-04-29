# SyncStuff

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-1.0+-green)](https://bun.sh)
[![Flutter](https://img.shields.io/badge/Flutter-3.x-blue)](https://flutter.dev)

SyncStuff is a cross-platform file synchronization ecosystem that enables secure peer-to-peer file transfer, clipboard synchronization, and cloud storage integration across mobile, desktop, and web platforms.

[SyncStuff Web](https://syncstuff-web.involvex.workers.dev/)

## Features

- **P2P File Transfer**: Direct file sharing between devices using WebRTC
- **Universal Clipboard**: Copy on one device, paste on another
- **Cloud Integration**: Google Drive, Mega, and custom cloud providers
- **Cross-Platform**: Android, iOS, Windows desktop, web, and CLI
- **mDNS Discovery**: Automatic local network device detection
- **QR Code Pairing**: Easy cross-network device pairing
- **No Cloud Required**: P2P transfers work without internet

## Monorepo Structure

```
syncstuff-monorepo/
├── apps/
│   ├── mobile/       # Flutter mobile app (Android/iOS)
│   ├── desktop/      # Flutter desktop app (Windows)
│   ├── cli_dart/     # Dart CLI (native executable)
│   └── web/          # Web dashboard (Remix.js + Cloudflare Workers)
├── packages/
│   ├── core/         # Shared Dart/Flutter core (entities, services, utils)
│   ├── ui/           # Shared React UI component library
│   ├── api/          # Backend API (Cloudflare Workers)
│   ├── database/     # Database schema and migrations (Cloudflare D1)
│   ├── shared/       # Shared TypeScript types and utilities
│   └── telemetry/    # OpenTelemetry workers
└── docs/             # Documentation
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile/Desktop | Flutter 3.x, Dart 3.x, flutter_bloc, WebRTC |
| CLI | Dart (compiled to native executable) |
| Web | React 18, Remix, Tailwind CSS |
| API | Cloudflare Workers, D1 (SQLite) |
| Build | Bun (npm workspace), Flutter, Wrangler, Turborepo |
| Type Safety | TypeScript strict, Dart strict linting |

## Quick Start

### Prerequisites

- **Node.js** >= 20
- **Bun** >= 1.0
- **Flutter** 3.x with Dart 3.x

### Install

```bash
git clone https://github.com/involvex/syncstuff.git
cd syncstuff
bun install
```

### Development

```bash
# Web app
bun run dev:web

# API
bun run dev:api

# Mobile app
bun run dev:mobile

# Desktop app
bun run dev:desktop

# Dart CLI
bun run dev:cli_dart
```

### Build

```bash
# Web (npm/turbo packages)
bun run build            # Build all npm packages
bun run build:web        # Build web app

# Flutter/Dart (uses flutter/dart directly)
bun run build:mobile     # Build Android APK
bun run build:mobile:ios  # Build iOS
bun run build:desktop     # Build Windows desktop
bun run build:cli_dart    # Compile CLI to native exe
```

### Test

```bash
# TypeScript packages
bun run test              # Run turbo test across npm packages

# Flutter/Dart
bun run test:mobile       # Flutter test
bun run test:desktop       # Flutter test
bun run test:cli_dart      # Dart test
```

### Code Quality

```bash
bun run lint              # ESLint for all npm packages
bun run lint:fix          # Auto-fix linting issues
bun run format            # Format with Biome
bun run typecheck         # TypeScript type checking
bun run check             # Format + lint + typecheck

# Flutter
cd apps/mobile && flutter analyze
```

## Deployment

```bash
bun run deploy:web        # Deploy web to Cloudflare Workers
bun run deploy:api        # Deploy API to Cloudflare Workers
bun run deploy:telemetry  # Deploy telemetry workers

# Database
bun run db:create         # Create D1 database
bun run db:migrate        # Apply migrations
```

## Environment Variables

**API** (`packages/api/.env`):
```bash
GITHUB_OAUTH_CLIENT_ID=your-client-id
GITHUB_OAUTH_CLIENT_SECRET=your-client-secret
SESSION_SECRET=your-session-secret
```

**Web** (`apps/web/.env`):
```bash
API_URL=https://syncstuff-api.involvex.workers.dev
```

## Current Status

- [x] Flutter mobile app with P2P file transfer
- [x] Device discovery (UDP broadcast, mDNS)
- [x] QR code device pairing
- [x] WebRTC peer-to-peer connections
- [x] Clipboard synchronization service
- [x] BLoC state management (Clean Architecture)
- [x] Web landing page and dashboard
- [x] Database schema and migrations
- [x] Authentication flow with OAuth2
- [x] Shared UI Library
- [x] Dart CLI tool
- [ ] Background service support
- [ ] Email notification system
- [ ] Conflict resolution strategies
- [ ] Additional cloud providers

## License

MIT - see [LICENSE](LICENSE) for details.