# Task 13: Add Notification Permission Handling

## What I Implemented

Added a `requestPermission()` method to `NotificationService` that handles platform-specific notification permissions:
- **Android**: Calls `AndroidFlutterLocalNotificationsPlugin.requestNotificationsPermission()`
- **iOS**: Calls `IOSFlutterLocalNotificationsPlugin.requestPermissions()` with alert, badge, sound enabled
- **Other platforms**: Returns `true` (no permission needed)

The method auto-initializes the plugin if not already initialized, then resolves the platform-specific implementation to request permissions.

## What I Tested and Test Results

- `dart analyze` on `packages/core_flutter`: No issues found
- `flutter test` on `packages/core_flutter`: All 50 tests passed

## Files Changed

- `packages/core_flutter/lib/src/data/services/notification_service.dart` — Added `requestPermission()` method (lines 13-39)
- `apps/mobile/lib/main.dart` — Added NotificationService instantiation and permission request on app startup, passed shared instance to TransferBloc

## Integration Points

- Permission is requested once during app startup in `main()` before `runApp()`
- The same `NotificationService` instance is shared with `TransferBloc` to avoid duplicate initialization
- `requestPermission()` returns `bool` indicating whether permission was granted
