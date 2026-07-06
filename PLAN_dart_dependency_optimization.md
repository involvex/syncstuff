# Plan: Dart/Flutter pubspec.yaml Optimization

## Overview

Optimize the Dart/Flutter dependency management across the SyncStuff monorepo for better maintainability, up-to-date packages, and easier cross-package management.

## Current Issues Summary

| Issue | Severity | Impact |
|-------|----------|--------|
| SDK version inconsistencies | Medium | Build confusion |
| Core package has outdated deps | High | `very_good_analysis ^7.0.0` vs `^10.3.0` |
| CLI doesn't depend on core | High | Duplication, CLAUDE.md incorrect |
| Massive dependency duplication | Medium | Version drift, maintenance burden |
| Desktop missing P2P deps | High | No feature parity with mobile |
| Broken dependency_overrides in mobile | High | Lower versions than declared deps |
| Stray `dart_style` in mobile | Low | Unnecessary dependency |
| Core is Flutter-dependent, CLI can't use it | High | Architecture flaw |
| No Dart monorepo tool (Melos) | Medium | Manual version management |
| **Mobile has duplicate entity classes** | **High** | **Entities diverge from core (missing `deviceName`, `toJson`, etc.)** |
| **Desktop has duplicate datasources/repositories** | **High** | **Same code exists in core and desktop** |
| **Zero tests in core, desktop, CLI** | **Medium** | **Only mobile has tests, and they test local copies** |

---

## Phase 1: Split Core Package

### 1.1 Create `packages/core` (Pure Dart)

**Current state**: `packages/core` depends on Flutter-specific packages (`sqflite`, `shared_preferences`, `path_provider`).

**Target state**: Core becomes pure Dart with only domain entities, constants, and pure Dart utilities.

**File changes**:

#### `packages/core/pubspec.yaml` — Rewrite

```yaml
name: syncstuff_core
description: "SyncStuff shared core - pure Dart entities, services, and utilities"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.11.0 <4.0.0'

dependencies:
  equatable: ^2.0.7
  uuid: ^4.5.1
  path: ^1.9.1
  http: ^1.4.0
  dartz: ^0.10.1

dev_dependencies:
  very_good_analysis: ^10.3.0
  test: ^1.25.0
```

**What moves OUT of core**:
- `sqflite`, `shared_preferences`, `path_provider` → to new `core_flutter` package
- All datasource implementations that depend on Flutter packages

**What stays in core**:
- `lib/src/domain/entities/` — `transfer.dart`, `device.dart`, `clipboard.dart`, `entities.dart`
- `lib/src/core/constants/app_constants.dart`
- Any pure Dart business logic

**Update barrel export** (`lib/syncstuff_core.dart`):
```dart
export 'src/domain/entities/entities.dart';
export 'src/core/constants/app_constants.dart';
```

---

### 1.2 Create `packages/core_flutter` (New — Flutter Extensions)

**New package** for Flutter-specific implementations that depend on `sqflite`, `shared_preferences`, `path_provider`.

#### `packages/core_flutter/pubspec.yaml` — New file

```yaml
name: syncstuff_core_flutter
description: "SyncStuff Flutter-specific core - datasources and Flutter platform integrations"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.11.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  syncstuff_core:
    path: ../core
  sqflite: ^2.4.2
  sqflite_common_ffi: ^2.3.4+4
  path_provider: ^2.1.5
  shared_preferences: ^2.5.3

dev_dependencies:
  very_good_analysis: ^10.3.0
  flutter_test:
    sdk: flutter

flutter:
  uses-material-design: true
```

**What moves here from core**:
- `lib/src/data/datasources/database_helper.dart`
- `lib/src/data/datasources/transfer_local_datasource.dart`
- `lib/src/data/datasources/device_local_datasource.dart`
- `lib/src/data/datasources/settings_local_datasource.dart`
- `lib/src/data/datasources/clipboard_local_datasource.dart`
- `lib/src/data/repositories/transfer_repository.dart`
- `lib/src/data/repositories/device_repository.dart`
- `lib/src/data/repositories/settings_repository.dart`
- `lib/src/data/repositories/clipboard_repository.dart`

**New barrel export** (`lib/syncstuff_core_flutter.dart`):
```dart
export 'package:syncstuff_core/syncstuff_core.dart';
export 'src/data/datasources/database_helper.dart';
export 'src/data/datasources/transfer_local_datasource.dart';
export 'src/data/datasources/device_local_datasource.dart';
export 'src/data/datasources/settings_local_datasource.dart';
export 'src/data/datasources/clipboard_local_datasource.dart';
export 'src/data/repositories/transfer_repository.dart';
export 'src/data/repositories/device_repository.dart';
export 'src/data/repositories/settings_repository.dart';
export 'src/data/repositories/clipboard_repository.dart';
```

---

## Phase 2: Migrate Mobile Entities to Use Core

**Critical finding**: Mobile has its own independent copies of `FileTransfer`, `SyncDevice`, and `ClipboardItem` that are **stale and divergent** from core's versions.

### Entity Comparison

| Feature | Mobile's Entity | Core's Entity |
|---------|----------------|---------------|
| `FileTransfer.deviceName` | ❌ Missing | ✅ Present |
| `FileTransfer.toJson()` | ❌ Missing | ✅ Present |
| `FileTransfer.fromJson()` | ❌ Missing | ✅ Present |
| `TransferType.displayName` | ❌ Missing | ✅ Present |
| `TransferStatus.displayName` | ❌ Missing | ✅ Present |
| `SyncDevice.toJson()` | ❌ Missing | ✅ Present |
| `SyncDevice.fromJson()` | ❌ Missing | ✅ Present |
| `DevicePlatform.displayName` | ❌ Missing | ✅ Present |
| `DevicePlatform.icon` | ❌ Missing | ✅ Present |

### Actions

1. **Delete mobile's local entity files**:
   - `apps/mobile/lib/domain/entities/transfer.dart`
   - `apps/mobile/lib/domain/entities/device.dart`
   - `apps/mobile/lib/domain/entities/clipboard.dart`

2. **Update all mobile imports** to use `syncstuff_core`:
   ```dart
   // Before (mobile's local copy)
   import 'package:syncstuff_mobile/domain/entities/transfer.dart';
   
   // After (from core)
   import 'package:syncstuff_core/syncstuff_core.dart';
   ```

3. **Fix any call sites** that reference fields/methods missing in core's version (e.g., mobile's `FileTransfer` constructor may need `deviceName` added where not provided, `progress` may need to be required).

---

## Phase 3: Migrate Desktop Datasources to Use Core Flutter

**Critical finding**: Desktop has its own copies of datasources/repositories that already exist in core. After the core split, desktop should import from `core_flutter` instead.

### Desktop Duplicate Files to Remove

| Desktop File | Core Equivalent |
|-------------|-----------------|
| `lib/data/datasources/database_helper.dart` | `core_flutter/.../database_helper.dart` |
| `lib/data/datasources/transfer_local_datasource.dart` | `core_flutter/.../transfer_local_datasource.dart` |
| `lib/data/datasources/device_local_datasource.dart` | `core_flutter/.../device_local_datasource.dart` |
| `lib/data/datasources/settings_local_datasource.dart` | `core_flutter/.../settings_local_datasource.dart` |
| `lib/data/repositories/transfer_repository.dart` | `core_flutter/.../transfer_repository.dart` |
| `lib/data/repositories/device_repository.dart` | `core_flutter/.../device_repository.dart` |
| `lib/data/repositories/settings_repository.dart` | `core_flutter/.../settings_repository.dart` |

### Desktop Entity Files (Already Correct)

Desktop's entity files are already thin re-exports from core:
```dart
// apps/desktop/lib/domain/entities/transfer.dart
export 'package:syncstuff_core/syncstuff_core.dart'
show FileTransfer, TransferType, TransferStatus, TransferDirection;
```

These can be kept as re-exports or removed in favor of direct imports from `syncstuff_core`.

---

## Phase 4: Migrate Mobile Tests to Core

**Critical finding**: Mobile's tests (`transfer_test.dart`, `device_test.dart`, `clipboard_test.dart`) test entity classes that should live in core. These tests should be moved to `packages/core/test/` as pure Dart tests.

### Actions

1. **Create `packages/core/test/` directory**
2. **Move and adapt tests**:
   - `apps/mobile/test/domain/entities/transfer_test.dart` → `packages/core/test/domain/entities/transfer_test.dart`
   - `apps/mobile/test/domain/entities/device_test.dart` → `packages/core/test/domain/entities/device_test.dart`
   - `apps/mobile/test/domain/entities/clipboard_test.dart` → `packages/core/test/domain/entities/clipboard_test.dart`

3. **Change test imports** from `flutter_test` to `test` (pure Dart):
   ```dart
   // Before
   import 'package:flutter_test/flutter_test.dart';
   import 'package:syncstuff_mobile/domain/entities/transfer.dart';
   
   // After
   import 'package:test/test.dart';
   import 'package:syncstuff_core/syncstuff_core.dart';
   ```

4. **Remove migrated tests from mobile** (or keep as integration tests if needed)

5. **Keep `widget_test.dart` in mobile** — it tests Flutter widget rendering, which belongs in the mobile app.

---

## Phase 5: Add Melos for Dart Dependency Management

### 5.1 Create `melos.yaml` at monorepo root

```yaml
name: syncstuff
repository: https://github.com/involvex/syncstuff

packages:
  - packages/*
  - apps/cli_dart
  - apps/mobile
  - apps/desktop

command:
  version:
    workspaceChangelog: true
  bootstrap:
    usePubspecOverrides: true

scripts:
  analyze:
    run: melos exec -- dart analyze --fatal-infos
    description: Run dart analyze in all packages

  format:
    run: melos exec -- dart format --set-exit-if-changed .
    description: Check formatting across all packages

  test:
    run: melos exec -- dart test
    packageFilters:
      dirExists: test
    description: Run tests in all packages

  test:flutter:
    run: melos exec -- flutter test
    packageFilters:
      dirExists: test
    description: Run Flutter tests in mobile/desktop

  upgrade:
    run: melos exec -- flutter pub upgrade
    description: Upgrade dependencies in all packages

  clean:
    run: melos exec -- rm -rf build .dart_tool .packages
    description: Clean build artifacts
```

### 5.2 Add `melos_overrides.yaml` (optional, for development)

```yaml
dependency_overrides:
  syncstuff_core:
    path: packages/core
  syncstuff_core_flutter:
    path: packages/core_flutter
```

---

## Phase 6: Standardize SDK & Dependency Versions

### 6.1 Align SDK Constraints

All Dart packages should use the same constraint style:

| Package | Current | Target |
|---------|---------|--------|
| `packages/core` | `^3.11.4` | `>=3.11.0 <4.0.0` |
| `packages/core_flutter` | (new) | `>=3.11.0 <4.0.0` |
| `apps/mobile` | `^3.11.4` | `>=3.11.0 <4.0.0` |
| `apps/desktop` | `^3.11.5` | `>=3.11.0 <4.0.0` |
| `apps/cli_dart` | `>=3.11.0 <4.0.0` | `>=3.11.0 <4.0.0` (no change) |

### 6.2 Standardize Dependency Versions

| Dependency | Current Versions | Standardized |
|------------|-----------------|--------------|
| `equatable` | `^2.0.7` (all) | `^2.0.7` ✅ |
| `uuid` | `^4.5.1` (all) | `^4.5.1` ✅ |
| `path` | `^1.9.1` (all) | `^1.9.1` ✅ |
| `http` | `^1.4.0` (core, desktop, cli) | `^1.4.0` ✅ |
| `very_good_analysis` | `^7.0.0` (core), `^10.3.0` (mobile) | `^10.3.0` |
| `flutter_lints` | `^6.0.0` (mobile, desktop, core) | `^6.0.0` ✅ |

---

## Phase 7: Update apps/mobile/pubspec.yaml

### Target `apps/mobile/pubspec.yaml`

```yaml
name: syncstuff_mobile
description: "SyncStuff - P2P file sync across devices"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.11.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.8

  # State Management
  flutter_bloc: ^9.1.1
  equatable: ^2.0.7

  # Dependency Injection
  get_it: ^9.2.1

  # Networking
  network_info_plus: ^6.1.4
  web_socket_channel: ^3.0.2
  dartz: ^0.10.1

  # P2P & Discovery
  flutter_webrtc: ^1.5.2

  # QR Code
  qr_flutter: ^4.1.0
  mobile_scanner: ^6.0.11

  # File Handling
  file_picker: ^11.0.2
  permission_handler: ^11.4.0
  share_plus: ^12.0.2

  # Utilities
  uuid: ^4.5.1
  intl: ^0.20.2
  path: ^1.9.1

  # UI
  google_fonts: ^8.1.0
  flutter_svg: ^2.0.17

  # Shared Core
  syncstuff_core:
    path: ../../packages/core
  syncstuff_core_flutter:
    path: ../../packages/core_flutter

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^6.0.0
  very_good_analysis: ^10.3.0

flutter:
  uses-material-design: true
```

**Changes from current**:
1. ✅ SDK constraint standardized to `>=3.11.0 <4.0.0`
2. ✅ Removed `dependency_overrides` (broken backwards overrides)
3. ✅ Removed stray `dart_style: ^3.1.9`
4. ✅ Removed `sqflite`, `path_provider`, `shared_preferences` (now in `core_flutter`)
5. ✅ Added `syncstuff_core_flutter` dependency
6. ✅ Organized sections with clear comments
7. ✅ Removed local entity files (use core's entities)

---

## Phase 8: Update apps/desktop/pubspec.yaml (Full P2P Parity)

### Target `apps/desktop/pubspec.yaml`

```yaml
name: syncstuff_desktop
description: "SyncStuff Desktop - P2P file sync companion app"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.11.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

  # State Management
  flutter_bloc: ^9.1.1
  equatable: ^2.0.7

  # Dependency Injection
  get_it: ^9.2.1

  # Networking
  network_info_plus: ^6.1.4
  web_socket_channel: ^3.0.2
  http: ^1.4.0
  dartz: ^0.10.1

  # P2P & Discovery
  flutter_webrtc: ^1.5.2

  # QR Code
  qr_flutter: ^4.1.0
  mobile_scanner: ^6.0.11

  # File Handling
  file_picker: ^11.0.2
  permission_handler: ^11.4.0
  share_plus: ^12.0.2

  # Utilities
  uuid: ^4.5.1
  intl: ^0.20.2
  path: ^1.9.1

  # UI
  google_fonts: ^8.1.0
  flutter_svg: ^2.0.17

  # Shared Core
  syncstuff_core:
    path: ../../packages/core
  syncstuff_core_flutter:
    path: ../../packages/core_flutter

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^6.0.0
  very_good_analysis: ^10.3.0

flutter:
  uses-material-design: true
```

**Changes from current**:
1. ✅ SDK constraint standardized
2. ✅ Added P2P dependencies: `flutter_webrtc`, `web_socket_channel`, `network_info_plus`
3. ✅ Added QR dependencies: `qr_flutter`, `mobile_scanner`
4. ✅ Added file handling: `permission_handler`, `share_plus`
5. ✅ Added `dartz`, `flutter_svg`
6. ✅ Added `syncstuff_core_flutter`
7. ✅ Added `very_good_analysis` to dev_dependencies
8. ✅ Removed duplicate datasource/repository files (use `core_flutter`)
9. ✅ `sqflite_common_ffi` handled by `core_flutter`

---

## Phase 9: Update apps/cli_dart/pubspec.yaml

### Target `apps/cli_dart/pubspec.yaml`

```yaml
name: syncstuff_cli
description: "SyncStuff CLI - P2P file sync command line tool"
version: 0.1.0
homepage: https://syncstuff-web.involvex.workers.dev/
repository: https://github.com/involvex/syncstuff
license: MIT

executables:
  syncstuff:
    dart: bin/main.dart

environment:
  sdk: '>=3.11.0 <4.0.0'

dependencies:
  syncstuff_core:
    path: ../../packages/core
  nocterm: ^0.8.0
  args: ^2.6.0
  http: ^1.4.0
  web_socket_channel: ^3.0.2
  uuid: ^4.5.1
  path: ^1.9.1
  equatable: ^2.0.7
  dartz: ^0.10.1

dev_dependencies:
  very_good_analysis: ^10.3.0
  test: ^1.25.0

topics:
  - p2p
  - file-transfer
  - sync
  - cli
  - tui
```

**Changes from current**:
1. ✅ Added `syncstuff_core` dependency (was missing, CLAUDE.md was correct)
2. ✅ Added `equatable`, `dartz` for consistency with core pattern
3. ✅ Added `very_good_analysis` and `test` dev dependencies
4. ✅ SDK constraint unchanged (already correct style)

---

## Phase 10: Update Documentation

### 10.1 Update CLAUDE.md

Fix the following inaccuracies:
- Core is now split: `packages/core` (pure Dart) + `packages/core_flutter` (Flutter datasources)
- CLI does depend on `packages/core` (pure Dart)
- Desktop now has full P2P parity with mobile
- Mobile and desktop now share entities from core (no more local copies)

### 10.2 Update AGENTS.md

Add Melos commands to the development commands section:
```bash
# Dart dependency management (Melos)
melos bootstrap              # Bootstrap all Dart packages
melos run analyze            # Run dart analyze across packages
melos run test               # Run tests across packages (pure Dart)
melos run test:flutter       # Run Flutter tests (mobile/desktop)
melos run upgrade            # Upgrade all Dart dependencies
melos run clean              # Clean all build artifacts
```

---

## Implementation Order

| Step | Task | Key Files | Effort |
|------|------|-----------|--------|
| 1 | Rewrite `packages/core` as pure Dart | `packages/core/pubspec.yaml`, `packages/core/lib/syncstuff_core.dart` | Medium |
| 2 | Create `packages/core_flutter` (new) | `packages/core_flutter/pubspec.yaml`, move datasource files from core | Medium |
| 3 | Add `melos.yaml` | `melos.yaml` (new) | Small |
| 4 | Migrate mobile entities to use core | Delete `apps/mobile/lib/domain/entities/*.dart`, update imports | Medium |
| 5 | Migrate desktop datasources to use core_flutter | Delete `apps/desktop/lib/data/**/*.dart`, update imports | Medium |
| 6 | Move mobile entity tests to core | `packages/core/test/domain/entities/*.dart` | Small |
| 7 | Update `apps/mobile/pubspec.yaml` | Remove overrides, add core_flutter | Small |
| 8 | Update `apps/desktop/pubspec.yaml` | Add P2P deps, core_flutter | Small |
| 9 | Update `apps/cli_dart/pubspec.yaml` | Add core dependency | Small |
| 10 | Run `melos bootstrap` and verify | Test all packages resolve | Medium |
| 11 | Run `dart analyze` across all packages | Verify no errors | Medium |
| 12 | Update CLAUDE.md and AGENTS.md | Documentation files | Small |

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Core split breaks existing imports | Update all imports in mobile/desktop to use `core_flutter` for datasources |
| Mobile entity migration breaks call sites | Core's entities have richer API; fix any missing fields at call sites |
| Desktop P2P packages don't work on Windows | `flutter_webrtc` has Windows support; test early |
| Melos adds complexity | It simplifies more than it adds; team can opt out |
| `sqflite_common_ffi` needs desktop setup | Already in desktop's current deps; included in `core_flutter` |
| CLI can't use Flutter datasources (by design) | CLI uses pure Dart core entities; its own network layer stays independent |
| Mobile tests fail after migration | Tests use `test` package (not `flutter_test`); entities are pure Dart |

---

## Success Criteria

- [ ] All Dart packages use consistent SDK constraint: `>=3.11.0 <4.0.0`
- [ ] Core is pure Dart, can be used by CLI
- [ ] Core Flutter extensions package exists for datasources
- [ ] Desktop has same P2P dependencies as mobile
- [ ] CLI depends on `syncstuff_core`
- [ ] Mobile no longer has duplicate entity classes
- [ ] Desktop no longer has duplicate datasource/repository files
- [ ] Entity tests live in `packages/core/test/` (pure Dart)
- [ ] No `dependency_overrides` with backwards versions
- [ ] Stray `dart_style` removed from mobile
- [ ] Melos configured and `melos bootstrap` succeeds
- [ ] All packages pass `dart analyze`
- [ ] CLAUDE.md and AGENTS.md updated to reflect changes
