# Plan: Mobile Build Fixes + Desktop Notification Crash

## Context

The mobile Android build was broken because `flutter_local_notifications` requires core library desugaring to be enabled. This was fixed by adding `isCoreLibraryDesugaringEnabled = true` and the `desugar_jdk_libs` dependency to `build.gradle.kts`.

Additionally, the mobile `TransferBloc` had 4 analyzer warnings from using `emit()` directly inside stream listener callbacks instead of dispatching events via `add()`. These were fixed by introducing `QueueUpdated` and `ActiveTransfersUpdated` events.

The desktop app crashes when sending files to mobile with `LateInitializationError: Field '_instance@463271368' has not been initialized` in `FlutterLocalNotificationsPlugin.show`. This is because `flutter_local_notifications` does not fully support Windows desktop — the plugin's internal `_instance` late field is never initialized on Windows, so calling `show()`, `cancel()`, etc. throws.

## Uncommitted Changes (3 files)

1. `apps/mobile/android/app/build.gradle.kts` — Core library desugaring enabled
2. `apps/mobile/lib/presentation/bloc/transfer/transfer_bloc.dart` — Stream listeners use `add()` with new events
3. `apps/mobile/lib/presentation/bloc/transfer/transfer_event.dart` — Added `QueueUpdated` and `ActiveTransfersUpdated` events

## Tasks

### Task 1: Commit the current mobile fixes
- Stage all 3 modified files (`git add .`)
- Commit with conventional commit message: `fix(mobile): enable desugaring and fix transfer bloc analyzer warnings`

### Task 2: Fix desktop notification crash
- Modify `NotificationService` in `packages/core_flutter/lib/src/data/services/notification_service.dart`:
  - Add platform detection: check `Platform.isWindows` in `init()` and set `_initialized = false` + return early if Windows
  - Add try-catch around every public method (`showTransferComplete`, `showTransferFailed`, `cancelNotification`, `cancelAll`) to catch `LateInitializationError` gracefully (log and swallow)
  - This ensures desktop works even if `flutter_local_notifications` adds partial support later — it degrades gracefully
- Alternative considered: Remove `flutter_local_notifications` from desktop entirely and use Windows-native toasts — rejected for now as it's a larger scope change

### Task 3: Commit the desktop notification fix
- Commit with: `fix(desktop): guard NotificationService against unsupported Windows platform`

## Verification

1. Run `flutter analyze` in `apps/mobile` — should be clean (0 issues)
2. Run `flutter analyze` in `apps/desktop` — should be clean
3. Build mobile APK: `flutter build apk --debug` — should succeed
4. Build desktop: `flutter build windows` — should succeed
5. Desktop send-to-mobile flow should no longer crash with `LateInitializationError`
