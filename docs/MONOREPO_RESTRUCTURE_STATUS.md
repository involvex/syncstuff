# Monorepo Restructure - Status Report

**Date**: 2026-04-28
**Status**: Migrated to Flutter/Dart stack

---

## Changes Completed

### Directory Cleanup

- **Removed** `apps/mobileapp/` (old Ionic/React/Capacitor hybrid app)
- **Removed** `apps/cli/` (old Bun/TypeScript CLI)
- **Removed** `packages/network-types/` (only used by removed apps)
- **Removed** stale docs: electron, android, Tamagui, old CLI docs

### Current Structure

```
apps/
├── mobile/       # Flutter mobile app (Android/iOS)
├── desktop/      # Flutter desktop app (Windows)
├── cli_dart/     # Dart CLI (native executable)
└── web/          # Remix.js + Cloudflare Workers

packages/
├── core/         # Shared Dart/Flutter core
├── ui/           # React UI component library
├── api/          # Cloudflare Workers API
├── database/     # Cloudflare D1 migrations
├── shared/       # TypeScript utilities
└── telemetry/    # OpenTelemetry workers
```

### Build System Updates

- **Root package.json**: Removed old workspace entries (`apps/cli`, `apps/mobileapp`), removed old scripts (electron, gradle, debug-android, etc.), added Flutter/Dart build/dev/test scripts
- **turbo.json**: Added Flutter/Dart task definitions, removed old Capacitor Android outputs
- **.gitignore**: Cleaned up old mobileapp/electron references, added Flutter/Dart ignore patterns
- **CI Workflows**: Rewritten for Flutter (`subosito/flutter-action@v2`)

### Scripts Removed

- `scripts/debug-android.cjs` (Capacitor-specific)
- `scripts/debug-electron.cjs` (Electron-specific)
- `scripts/bump-app-version.cjs` (old mobileapp versioning)
- `build_desktop.bat` (old Electron build)

### NPM Dependencies Removed

- `@syncstuff/electron` from trustedDependencies
- Tamagui-related devDependencies (`@tamagui/config`, `@tamagui/core`, `@tamagui/themes`, `tamagui`, `@tamagui/lucide-icons-2`)

## Verification Commands

```bash
# Install npm dependencies
bun install

# Build npm packages (web, ui, shared, api)
bun run build

# Build Flutter apps
bun run build:mobile
bun run build:desktop
bun run build:cli_dart

# Development
bun run dev:web
bun run dev:mobile
bun run dev:desktop
bun run dev:cli_dart

# Code quality
bun run check
flutter analyze  # from apps/mobile or apps/desktop
```