# Desktop: Notification Settings, Device Groups Port, Widget Tests

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add notification settings UI to desktop, port the full Device Groups feature from mobile to desktop, and add widget tests for the Settings page.

**Architecture:** Each feature is implemented as an independent task group. Notification settings extend the existing desktop SettingsBloc/SettingsPage. Device Groups requires porting Entity→Datasource→Repository→Bloc→UI→Navigation. Widget tests use flutter_test with manual mocks following the existing core_flutter test patterns.

**Tech Stack:** Flutter, flutter_bloc, shared_preferences, sqflite_common_ffi, flutter_test, flutter_local_notifications

---

## Feature 1: Desktop Notification Settings

### Task 1: Add notification settings to desktop SettingsBloc

**Files:**
- Modify: `apps/desktop/lib/presentation/bloc/settings/settings_state.dart`
- Modify: `apps/desktop/lib/presentation/bloc/settings/settings_event.dart`
- Modify: `apps/desktop/lib/presentation/bloc/settings/settings_bloc.dart`

**Step 1: Add notification fields to SettingsState**

Read `apps/desktop/lib/presentation/bloc/settings/settings_state.dart`. Add 4 new fields:

```dart
final bool notificationsEnabled;
final bool transferCompleteNotificationEnabled;
final bool transferFailedNotificationEnabled;
final bool transferProgressNotificationEnabled;
```

Add these to the constructor with defaults (`true`), to `props`, and to `copyWith`.

**Step 2: Add notification events**

Read `apps/desktop/lib/presentation/bloc/settings/settings_event.dart`. Add 4 new events:

```dart
class ToggleNotifications extends SettingsEvent {}
class ToggleTransferCompleteNotification extends SettingsEvent {}
class ToggleTransferFailedNotification extends SettingsEvent {}
class ToggleTransferProgressNotification extends SettingsEvent {}
```

**Step 3: Add notification handlers to SettingsBloc**

Read `apps/desktop/lib/presentation/bloc/settings/settings_bloc.dart`. Import `SettingsKeys` from `syncstuff_core`. Add 4 new `on<>` handlers that flip the boolean, persist to SharedPreferences, and emit new state. Use the same pattern as `ToggleDarkMode`.

Add `LoadSettings` handler reads for the 4 new keys (default `true`).

**Step 4: Run analyzer**

Run: `cd apps/desktop && dart analyze`
Expected: 0 errors (same 0 as before)

**Step 5: Commit**

```bash
git add apps/desktop/lib/presentation/bloc/settings/
git commit -m "feat(desktop): add notification settings events and state"
```

---

### Task 2: Wire NotificationService into desktop DI and TransferBloc

**Files:**
- Modify: `apps/desktop/lib/core/di/service_locator.dart`
- Modify: `apps/desktop/lib/app.dart` (or wherever TransferBloc is created)

**Step 1: Register NotificationService in service_locator.dart**

Read `apps/desktop/lib/core/di/service_locator.dart`. Add:

```dart
getIt.registerLazySingleton<NotificationService>(() => NotificationService());
```

**Step 2: Pass NotificationService to TransferBloc**

Find where `TransferBloc` is created (either in service_locator or in a BlocProvider). Add `notificationService: getIt<NotificationService>()` parameter.

**Step 3: Run analyzer**

Run: `cd apps/desktop && dart analyze`
Expected: 0 errors

**Step 4: Commit**

```bash
git add apps/desktop/lib/core/di/service_locator.dart apps/desktop/lib/app.dart
git commit -m "feat(desktop): wire NotificationService into DI and TransferBloc"
```

---

### Task 3: Add notification settings UI to desktop SettingsPage

**Files:**
- Modify: `apps/desktop/lib/presentation/pages/settings_page.dart`

**Step 1: Add notification settings section**

Read `apps/desktop/lib/presentation/pages/settings_page.dart`. After the existing settings sections, add a "Notifications" section with:

1. Master toggle: "Enable Notifications" → dispatches `ToggleNotifications`
2. Conditional sub-toggles (only when master is on):
   - "Transfer Complete" → `ToggleTransferCompleteNotification`
   - "Transfer Failed" → `ToggleTransferFailedNotification`
   - "Transfer Progress" → `ToggleTransferProgressNotification`

Follow the existing pattern for the `_buildSectionHeader` and `_buildSwitchTile` helpers already in the file.

**Step 2: Run analyzer**

Run: `cd apps/desktop && dart analyze`
Expected: 0 errors

**Step 3: Commit**

```bash
git add apps/desktop/lib/presentation/pages/settings_page.dart
git commit -m "feat(desktop): add notification settings UI to settings page"
```

---

## Feature 2: Port Device Groups to Desktop

### Task 4: Add DeviceGroup entity to desktop (already in core)

**Files:**
- No new files needed — `DeviceGroup` entity is already in `packages/core`

**Step 1: Verify entity is accessible**

The `DeviceGroup` entity is already in `packages/core/lib/src/domain/entities/device_group.dart` and exported via `syncstuff_core.dart`. Desktop already depends on `syncstuff_core`. No changes needed.

**Step 2: Commit** (skip if no changes)

---

### Task 5: Add DeviceGroup datasource to desktop

**Files:**
- Create: `apps/desktop/lib/data/datasources/device_group_local_datasource.dart`

**Step 1: Create the datasource**

Model after `packages/core_flutter/lib/src/data/datasources/device_group_local_datasource.dart`. The desktop version should use the same `DatabaseHelper` from `core_flutter` (which desktop already depends on).

```dart
import 'package:syncstuff_core_flutter/syncstuff_core_flutter.dart';

class DeviceGroupLocalDataSource {
  Future<List<DeviceGroup>> getAllGroups() async { ... }
  Future<DeviceGroup?> getGroupById(String id) async { ... }
  Future<void> saveGroup(DeviceGroup group) async { ... }
  Future<void> deleteGroup(String id) async { ... }
  Future<void> addDeviceToGroup(String groupId, String deviceId) async { ... }
  Future<void> removeDeviceFromGroup(String groupId, String deviceId) async { ... }
}
```

Use `DatabaseHelper.database` to get the SQLite instance, query the `device_groups` and `device_group_devices` tables.

**Step 2: Run analyzer**

Run: `cd apps/desktop && dart analyze`
Expected: 0 errors

**Step 3: Commit**

```bash
git add apps/desktop/lib/data/datasources/device_group_local_datasource.dart
git commit -m "feat(desktop): add DeviceGroup local datasource"
```

---

### Task 6: Add DeviceGroup repository to desktop

**Files:**
- Create: `apps/desktop/lib/data/repositories/device_group_repository.dart`

**Step 1: Create the repository**

Wrap the datasource:

```dart
import '../datasources/device_group_local_datasource.dart';
import 'package:syncstuff_core/syncstuff_core.dart';

class DeviceGroupRepository {
  final DeviceGroupLocalDataSource _dataSource;

  DeviceGroupRepository({DeviceGroupLocalDataSource? dataSource})
      : _dataSource = dataSource ?? DeviceGroupLocalDataSource();

  Future<List<DeviceGroup>> getAllGroups() => _dataSource.getAllGroups();
  Future<void> saveGroup(DeviceGroup group) => _dataSource.saveGroup(group);
  Future<void> deleteGroup(String id) => _dataSource.deleteGroup(id);
  Future<void> addDeviceToGroup(String groupId, String deviceId) =>
      _dataSource.addDeviceToGroup(groupId, deviceId);
  Future<void> removeDeviceFromGroup(String groupId, String deviceId) =>
      _dataSource.removeDeviceFromGroup(groupId, deviceId);
}
```

**Step 2: Run analyzer**

Run: `cd apps/desktop && dart analyze`
Expected: 0 errors

**Step 3: Commit**

```bash
git add apps/desktop/lib/data/repositories/device_group_repository.dart
git commit -m "feat(desktop): add DeviceGroup repository"
```

---

### Task 7: Add DeviceGroupBloc to desktop

**Files:**
- Create: `apps/desktop/lib/presentation/bloc/device_group/device_group_bloc.dart`
- Create: `apps/desktop/lib/presentation/bloc/device_group/device_group_event.dart`
- Create: `apps/desktop/lib/presentation/bloc/device_group/device_group_state.dart`

**Step 1: Create events**

Copy from mobile's `apps/mobile/lib/presentation/bloc/device_group/device_group_event.dart`. Events: `LoadDeviceGroups`, `CreateDeviceGroup`, `DeleteDeviceGroup`, `AddDeviceToGroup`, `RemoveDeviceFromGroup`, `SendToGroup`.

**Step 2: Create state**

Copy from mobile's `apps/mobile/lib/presentation/bloc/device_group/device_group_state.dart`. State fields: `groups`, `isLoading`, `error`.

**Step 3: Create bloc**

Copy from mobile's `apps/mobile/lib/presentation/bloc/device_group/device_group_bloc.dart`. Adjust imports to use desktop's `DeviceGroupRepository` and `DeviceBloc`. The `SendToGroup` handler should look up device IPs from `DeviceBloc.state.pairedDevices`/`discoveredDevices`.

**Step 4: Run analyzer**

Run: `cd apps/desktop && dart analyze`
Expected: 0 errors

**Step 5: Commit**

```bash
git add apps/desktop/lib/presentation/bloc/device_group/
git commit -m "feat(desktop): add DeviceGroupBloc"
```

---

### Task 8: Register DeviceGroupBloc in desktop DI

**Files:**
- Modify: `apps/desktop/lib/core/di/service_locator.dart`
- Modify: `apps/desktop/lib/app.dart` (where BlocProvider is set up)

**Step 1: Register in service_locator or app.dart**

Add `DeviceGroupBloc` to the `MultiBlocProvider` in `app.dart`:

```dart
BlocProvider<DeviceGroupBloc>(
  create: (context) => DeviceGroupBloc(
    repository: DeviceGroupRepository(),
    transferBloc: context.read<TransferBloc>(),
    deviceBloc: context.read<DeviceBloc>(),
  )..add(LoadDeviceGroups()),
),
```

**Step 2: Run analyzer**

Run: `cd apps/desktop && dart analyze`
Expected: 0 errors

**Step 3: Commit**

```bash
git add apps/desktop/lib/core/di/service_locator.dart apps/desktop/lib/app.dart
git commit -m "feat(desktop): register DeviceGroupBloc in DI"
```

---

### Task 9: Create Device Groups UI page for desktop

**Files:**
- Create: `apps/desktop/lib/presentation/pages/device_groups_page.dart`

**Step 1: Create the page**

Create a desktop-optimized Device Groups page with:
- List of groups (ListView)
- Each group shows: name, description, device count
- "Create Group" button → opens a dialog
- Each group has: "Send File" button, "Edit" button, "Delete" button
- Use `BlocBuilder<DeviceGroupBloc, DeviceGroupState>` for data

Follow the visual style of existing desktop pages (TransfersPage, DevicesPage). Use `SectionHeader`, `EmptyState` widgets from the existing widget library.

**Step 2: Run analyzer**

Run: `cd apps/desktop && dart analyze`
Expected: 0 errors

**Step 3: Commit**

```bash
git add apps/desktop/lib/presentation/pages/device_groups_page.dart
git commit -m "feat(desktop): add Device Groups UI page"
```

---

### Task 10: Add Device Groups to desktop navigation

**Files:**
- Modify: `apps/desktop/lib/presentation/pages/home_page.dart`
- Modify: `apps/desktop/lib/presentation/widgets/app_sidebar.dart`

**Step 1: Add sidebar nav item**

Read `apps/desktop/lib/presentation/widgets/app_sidebar.dart`. Add a 4th nav item:

```dart
_NavItem(
  icon: Icons.devices_other,
  label: 'Groups',
  index: 3,
),
```

**Step 2: Add page to IndexedStack**

Read `apps/desktop/lib/presentation/pages/home_page.dart`. Add `DeviceGroupsPage()` as the 4th child in the `IndexedStack`.

**Step 3: Run analyzer**

Run: `cd apps/desktop && dart analyze`
Expected: 0 errors

**Step 4: Commit**

```bash
git add apps/desktop/lib/presentation/pages/home_page.dart apps/desktop/lib/presentation/widgets/app_sidebar.dart
git commit -m "feat(desktop): add Device Groups to sidebar navigation"
```

---

## Feature 3: Desktop Widget Tests

### Task 11: Create test directory and test helper

**Files:**
- Create: `apps/desktop/test/widget_test.dart`

**Step 1: Create minimal widget test**

Create a basic test that verifies the app renders:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('App renders without crashing', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(body: Center(child: Text('SyncStuff'))),
      ),
    );
    expect(find.text('SyncStuff'), findsOneWidget);
  });
}
```

**Step 2: Run tests**

Run: `cd apps/desktop && flutter test`
Expected: 1 test passed

**Step 3: Commit**

```bash
git add apps/desktop/test/
git commit -m "test(desktop): add minimal widget test"
```

---

### Task 12: Add Settings page widget test

**Files:**
- Create: `apps/desktop/test/presentation/pages/settings_page_test.dart`

**Step 1: Create SettingsPage test**

Write a test that:
1. Creates a `MaterialApp` with `BlocProvider<SettingsBloc>`
2. Uses a mock or fake `SharedPreferences`
3. Renders `SettingsPage`
4. Verifies key UI elements exist (device name field, dark mode toggle, notification toggles)
5. Tests that toggling notification settings updates the state

Use manual fakes for `SharedPreferences` (in-memory map) following the pattern from `packages/core_flutter/test/`.

**Step 2: Run tests**

Run: `cd apps/desktop && flutter test`
Expected: All tests pass

**Step 3: Commit**

```bash
git add apps/desktop/test/
git commit -m "test(desktop): add Settings page widget tests"
```

---

## Verification

After all tasks, run:

```bash
cd apps/desktop && dart analyze  # 0 errors
cd apps/desktop && flutter test  # all tests pass
```
