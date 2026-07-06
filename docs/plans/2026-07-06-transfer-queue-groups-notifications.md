# Transfer Queue, Device Groups & Notifications

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a prioritized transfer queue, device groups for bulk operations, and push notifications for transfer events.

**Architecture:** 
- **Transfer Queue:** Add priority field to FileTransfer, create TransferQueue service with max concurrent limit, priority scheduling, and retry logic
- **Device Groups:** New DeviceGroup entity, GroupRepository, DeviceGroupBloc, UI for group management
- **Notifications:** Flutter Local Notifications for transfer completion/failure events

**Tech Stack:** Dart, Flutter, flutter_bloc, sqflite, flutter_local_notifications

---

## Feature 1: Transfer Queue with Priority

### Task 1: Add Priority to FileTransfer Entity

**Files:**
- Modify: `packages/core/lib/src/domain/entities/transfer.dart`

**Step 1: Add TransferPriority enum**

```dart
enum TransferPriority { low, normal, high, urgent }
```

**Step 2: Add priority field to FileTransfer**

```dart
final TransferPriority priority;
```

Update constructor, copyWith, toJson, fromJson, props accordingly.

**Step 3: Run analyzer**

Run: `cd packages/core && dart analyze`
Expected: No errors

**Step 4: Commit**

```bash
git add packages/core/lib/src/domain/entities/transfer.dart
git commit -m "feat(core): add TransferPriority enum and field to FileTransfer"
```

---

### Task 2: Create TransferQueue Service

**Files:**
- Create: `packages/core_flutter/lib/src/data/services/transfer_queue.dart`

**Step 1: Create TransferQueue class**

```dart
import 'dart:async';
import 'package:syncstuff_core/syncstuff_core.dart';

class TransferQueue {
  final int maxConcurrent;
  final List<FileTransfer> _queue = [];
  final List<FileTransfer> _active = [];
  
  final _queueController = StreamController<List<FileTransfer>>.broadcast();
  final _activeController = StreamController<List<FileTransfer>>.broadcast();
  
  TransferQueue({this.maxConcurrent = 3});
  
  Stream<List<FileTransfer>> get queueStream => _queueController.stream;
  Stream<List<FileTransfer>> get activeStream => _activeController.stream;
  List<FileTransfer> get pendingQueue => List.unmodifiable(_queue);
  List<FileTransfer> get activeTransfers => List.unmodifiable(_active);
  
  void enqueue(FileTransfer transfer) {
    _queue.add(transfer);
    _sortQueue();
    _queueController.add(_queue);
    _processQueue();
  }
  
  void _sortQueue() {
    _queue.sort((a, b) => b.priority.index.compareTo(a.priority.index));
  }
  
  void _processQueue() {
    while (_active.length < maxConcurrent && _queue.isNotEmpty) {
      final next = _queue.removeAt(0);
      _active.add(next);
      _activeController.add(_active);
      _queueController.add(_queue);
    }
  }
  
  void onComplete(String transferId) {
    _active.removeWhere((t) => t.id == transferId);
    _activeController.add(_active);
    _processQueue();
  }
  
  void onCancel(String transferId) {
    _queue.removeWhere((t) => t.id == transferId);
    _active.removeWhere((t) => t.id == transferId);
    _queueController.add(_queue);
    _activeController.add(_active);
    _processQueue();
  }
  
  void dispose() {
    _queueController.close();
    _activeController.close();
  }
}
```

**Step 2: Run analyzer**

Run: `cd packages/core_flutter && dart analyze`
Expected: No errors

**Step 3: Commit**

```bash
git add packages/core_flutter/lib/src/data/services/transfer_queue.dart
git commit -m "feat(core_flutter): add TransferQueue service with priority scheduling"
```

---

### Task 3: Add Queue Methods to TransferBloc

**Files:**
- Modify: `apps/mobile/lib/presentation/bloc/transfer/transfer_bloc.dart`
- Modify: `apps/mobile/lib/presentation/bloc/transfer/transfer_event.dart`
- Modify: `apps/mobile/lib/presentation/bloc/transfer/transfer_state.dart`

**Step 1: Add new events**

```dart
class EnqueueTransfer extends TransferEvent {
  final String filePath;
  final String deviceIp;
  final String? deviceId;
  final TransferPriority priority;
  
  const EnqueueTransfer({
    required this.filePath,
    required this.deviceIp,
    this.deviceId,
    this.priority = TransferPriority.normal,
  });
  
  @override
  List<Object?> get props => [filePath, deviceIp, deviceId, priority];
}

class DequeueTransfer extends TransferEvent {
  final String transferId;
  const DequeueTransfer(this.transferId);
  @override
  List<Object?> get props => [transferId];
}
```

**Step 2: Add queue state fields**

```dart
final class TransferState extends Equatable {
  final List<FileTransfer> activeTransfers;
  final List<FileTransfer> transferHistory;
  final List<FileTransfer> queuedTransfers;
  final bool isTransferring;
  final String? error;
  
  const TransferState({
    this.activeTransfers = const [],
    this.transferHistory = const [],
    this.queuedTransfers = const [],
    this.isTransferring = false,
    this.error,
  });
  
  // ... copyWith, props
}
```

**Step 3: Implement queue handlers in TransferBloc**

```dart
on<EnqueueTransfer>(_onEnqueue);
on<DequeueTransfer>(_onDequeue);

Future<void> _onEnqueue(EnqueueTransfer event, Emitter<TransferState> emit) async {
  final transfer = FileTransfer(
    id: _uuid.v4(),
    fileName: event.filePath.split('/').last,
    fileSize: 0,
    filePath: event.filePath,
    type: TransferType.file,
    status: TransferStatus.pending,
    direction: TransferDirection.sent,
    deviceId: event.deviceId,
    progress: 0,
    priority: event.priority,
    createdAt: DateTime.now(),
  );
  
  emit(state.copyWith(
    queuedTransfers: [...state.queuedTransfers, transfer],
  ));
  
  _transferQueue.enqueue(transfer);
}
```

**Step 4: Run analyzer**

Run: `cd apps/mobile && dart analyze`
Expected: No errors

**Step 5: Commit**

```bash
git add apps/mobile/lib/presentation/bloc/transfer/
git commit -m "feat(mobile): add queue support to TransferBloc"
```

---

### Task 4: Add Queue UI to Mobile

**Files:**
- Modify: `apps/mobile/lib/presentation/pages/transfer_page.dart` (or create new)

**Step 1: Add queue section to transfer page**

Add a "Queue" section showing pending transfers with priority indicators, reorder buttons, and cancel options.

**Step 2: Add priority selector to transfer initiation**

When selecting a file to transfer, show priority options (Low, Normal, High, Urgent).

**Step 3: Run app and test**

Run: `cd apps/mobile && flutter run`
Test: Initiate multiple transfers, verify priority ordering

**Step 4: Commit**

```bash
git add apps/mobile/lib/presentation/
git commit -m "feat(mobile): add transfer queue UI with priority selection"
```

---

## Feature 2: Device Groups

### Task 5: Create DeviceGroup Entity

**Files:**
- Create: `packages/core/lib/src/domain/entities/device_group.dart`

**Step 1: Create DeviceGroup entity**

```dart
import 'package:equatable/equatable.dart';

class DeviceGroup extends Equatable {
  final String id;
  final String name;
  final String? description;
  final List<String> deviceIds;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const DeviceGroup({
    required this.id,
    required this.name,
    this.description,
    this.deviceIds = const [],
    required this.createdAt,
    this.updatedAt,
  });

  DeviceGroup copyWith({
    String? name,
    String? description,
    List<String>? deviceIds,
    DateTime? updatedAt,
  }) {
    return DeviceGroup(
      id: id,
      name: name ?? this.name,
      description: description ?? this.description,
      deviceIds: deviceIds ?? this.deviceIds,
      createdAt: createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'description': description,
    'deviceIds': deviceIds,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt?.toIso8601String(),
  };

  factory DeviceGroup.fromJson(Map<String, dynamic> json) {
    return DeviceGroup(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      deviceIds: List<String>.from(json['deviceIds'] ?? []),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] != null 
        ? DateTime.parse(json['updatedAt'] as String) 
        : null,
    );
  }

  @override
  List<Object?> get props => [id, name, description, deviceIds, createdAt, updatedAt];
}
```

**Step 2: Export from barrel**

Add to `packages/core/lib/syncstuff_core.dart`:
```dart
export 'src/domain/entities/device_group.dart';
```

**Step 3: Run analyzer**

Run: `cd packages/core && dart analyze`
Expected: No errors

**Step 4: Commit**

```bash
git add packages/core/lib/src/domain/entities/device_group.dart packages/core/lib/syncstuff_core.dart
git commit -m "feat(core): add DeviceGroup entity"
```

---

### Task 6: Add DeviceGroup to Database

**Files:**
- Modify: `packages/core_flutter/lib/src/data/datasources/database_helper.dart`
- Create: `packages/core_flutter/lib/src/data/datasources/device_group_local_datasource.dart`

**Step 1: Add device_groups table to DatabaseHelper**

```dart
await db.execute('''
  CREATE TABLE device_groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT
  )
''');

await db.execute('''
  CREATE TABLE device_group_members (
    groupId TEXT NOT NULL,
    deviceId TEXT NOT NULL,
    PRIMARY KEY (groupId, deviceId),
    FOREIGN KEY (groupId) REFERENCES device_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (deviceId) REFERENCES devices(id) ON DELETE CASCADE
  )
''');
```

**Step 2: Create DeviceGroupLocalDataSource**

```dart
class DeviceGroupLocalDataSource {
  final DatabaseHelper _db;
  
  DeviceGroupLocalDataSource({DatabaseHelper? db}) : _db = db ?? DatabaseHelper();
  
  Future<List<DeviceGroup>> getAllGroups() async {
    final database = await _db.database;
    final groups = await database.query('device_groups', orderBy: 'createdAt DESC');
    
    final result = <DeviceGroup>[];
    for (final group in groups) {
      final members = await database.query(
        'device_group_members',
        where: 'groupId = ?',
        whereArgs: [group['id']],
      );
      result.add(DeviceGroup(
        id: group['id'] as String,
        name: group['name'] as String,
        description: group['description'] as String?,
        deviceIds: members.map((m) => m['deviceId'] as String).toList(),
        createdAt: DateTime.parse(group['createdAt'] as String),
        updatedAt: group['updatedAt'] != null 
          ? DateTime.parse(group['updatedAt'] as String) 
          : null,
      ));
    }
    return result;
  }
  
  Future<void> saveGroup(DeviceGroup group) async {
    final database = await _db.database;
    await database.insert(
      'device_groups',
      {
        'id': group.id,
        'name': group.name,
        'description': group.description,
        'createdAt': group.createdAt.toIso8601String(),
        'updatedAt': group.updatedAt?.toIso8601String(),
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
    
    await database.delete('device_group_members', where: 'groupId = ?', whereArgs: [group.id]);
    for (final deviceId in group.deviceIds) {
      await database.insert('device_group_members', {
        'groupId': group.id,
        'deviceId': deviceId,
      });
    }
  }
  
  Future<void> deleteGroup(String id) async {
    final database = await _db.database;
    await database.delete('device_groups', where: 'id = ?', whereArgs: [id]);
    await database.delete('device_group_members', where: 'groupId = ?', whereArgs: [id]);
  }
}
```

**Step 3: Run analyzer**

Run: `cd packages/core_flutter && dart analyze`
Expected: No errors

**Step 4: Commit**

```bash
git add packages/core_flutter/lib/src/data/datasources/
git commit -m "feat(core_flutter): add DeviceGroup database and datasource"
```

---

### Task 7: Create DeviceGroupRepository

**Files:**
- Create: `packages/core_flutter/lib/src/data/repositories/device_group_repository.dart`

**Step 1: Create repository**

```dart
class DeviceGroupRepository {
  final DeviceGroupLocalDataSource _dataSource;
  
  DeviceGroupRepository({DeviceGroupLocalDataSource? dataSource})
      : _dataSource = dataSource ?? DeviceGroupLocalDataSource();
  
  Future<List<DeviceGroup>> getAllGroups() => _dataSource.getAllGroups();
  Future<void> saveGroup(DeviceGroup group) => _dataSource.saveGroup(group);
  Future<void> deleteGroup(String id) => _dataSource.deleteGroup(id);
  
  Future<void> addDeviceToGroup(String groupId, String deviceId) async {
    final groups = await _dataSource.getAllGroups();
    final group = groups.firstWhere((g) => g.id == groupId);
    if (!group.deviceIds.contains(deviceId)) {
      await _dataSource.saveGroup(group.copyWith(
        deviceIds: [...group.deviceIds, deviceId],
        updatedAt: DateTime.now(),
      ));
    }
  }
  
  Future<void> removeDeviceFromGroup(String groupId, String deviceId) async {
    final groups = await _dataSource.getAllGroups();
    final group = groups.firstWhere((g) => g.id == groupId);
    await _dataSource.saveGroup(group.copyWith(
      deviceIds: group.deviceIds.where((id) => id != deviceId).toList(),
      updatedAt: DateTime.now(),
    ));
  }
}
```

**Step 2: Export from barrel**

Add to `packages/core_flutter/lib/syncstuff_core_flutter.dart`:
```dart
export 'src/data/repositories/device_group_repository.dart';
```

**Step 3: Run analyzer**

Run: `cd packages/core_flutter && dart analyze`
Expected: No errors

**Step 4: Commit**

```bash
git add packages/core_flutter/lib/src/data/repositories/device_group_repository.dart
git commit -m "feat(core_flutter): add DeviceGroupRepository"
```

---

### Task 8: Create DeviceGroupBloc

**Files:**
- Create: `apps/mobile/lib/presentation/bloc/device_group/device_group_bloc.dart`
- Create: `apps/mobile/lib/presentation/bloc/device_group/device_group_event.dart`
- Create: `apps/mobile/lib/presentation/bloc/device_group/device_group_state.dart`

**Step 1: Create events**

```dart
abstract class DeviceGroupEvent extends Equatable {
  const DeviceGroupEvent();
  @override
  List<Object?> get props => [];
}

class LoadDeviceGroups extends DeviceGroupEvent {}

class CreateDeviceGroup extends DeviceGroupEvent {
  final String name;
  final String? description;
  const CreateDeviceGroup({required this.name, this.description});
  @override
  List<Object?> get props => [name, description];
}

class DeleteDeviceGroup extends DeviceGroupEvent {
  final String groupId;
  const DeleteDeviceGroup(this.groupId);
  @override
  List<Object?> get props => [groupId];
}

class AddDeviceToGroup extends DeviceGroupEvent {
  final String groupId;
  final String deviceId;
  const AddDeviceToGroup({required this.groupId, required this.deviceId});
  @override
  List<Object?> get props => [groupId, deviceId];
}

class RemoveDeviceFromGroup extends DeviceGroupEvent {
  final String groupId;
  final String deviceId;
  const RemoveDeviceFromGroup({required this.groupId, required this.deviceId});
  @override
  List<Object?> get props => [groupId, deviceId];
}

class SendToGroup extends DeviceGroupEvent {
  final String groupId;
  final String filePath;
  const SendToGroup({required this.groupId, required this.filePath});
  @override
  List<Object?> get props => [groupId, filePath];
}
```

**Step 2: Create state**

```dart
final class DeviceGroupState extends Equatable {
  final List<DeviceGroup> groups;
  final bool isLoading;
  final String? error;
  
  const DeviceGroupState({
    this.groups = const [],
    this.isLoading = false,
    this.error,
  });
  
  DeviceGroupState copyWith({
    List<DeviceGroup>? groups,
    bool? isLoading,
    String? error,
  }) {
    return DeviceGroupState(
      groups: groups ?? this.groups,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
  
  @override
  List<Object?> get props => [groups, isLoading, error];
}
```

**Step 3: Create bloc**

```dart
class DeviceGroupBloc extends Bloc<DeviceGroupEvent, DeviceGroupState> {
  final DeviceGroupRepository _repository;
  final TransferBloc _transferBloc;
  
  DeviceGroupBloc({
    required DeviceGroupRepository repository,
    required TransferBloc transferBloc,
  }) : _repository = repository,
       _transferBloc = transferBloc,
       super(const DeviceGroupState()) {
    on<LoadDeviceGroups>(_onLoad);
    on<CreateDeviceGroup>(_onCreate);
    on<DeleteDeviceGroup>(_onDelete);
    on<AddDeviceToGroup>(_onAddDevice);
    on<RemoveDeviceFromGroup>(_onRemoveDevice);
    on<SendToGroup>(_onSendToGroup);
  }
  
  Future<void> _onLoad(LoadDeviceGroups event, Emitter<DeviceGroupState> emit) async {
    emit(state.copyWith(isLoading: true));
    final groups = await _repository.getAllGroups();
    emit(state.copyWith(groups: groups, isLoading: false));
  }
  
  Future<void> _onCreate(CreateDeviceGroup event, Emitter<DeviceGroupState> emit) async {
    final group = DeviceGroup(
      id: const Uuid().v4(),
      name: event.name,
      description: event.description,
      createdAt: DateTime.now(),
    );
    await _repository.saveGroup(group);
    add(LoadDeviceGroups());
  }
  
  Future<void> _onDelete(DeleteDeviceGroup event, Emitter<DeviceGroupState> emit) async {
    await _repository.deleteGroup(event.groupId);
    add(LoadDeviceGroups());
  }
  
  Future<void> _onAddDevice(AddDeviceToGroup event, Emitter<DeviceGroupState> emit) async {
    await _repository.addDeviceToGroup(event.groupId, event.deviceId);
    add(LoadDeviceGroups());
  }
  
  Future<void> _onRemoveDevice(RemoveDeviceFromGroup event, Emitter<DeviceGroupState> emit) async {
    await _repository.removeDeviceFromGroup(event.groupId, event.deviceId);
    add(LoadDeviceGroups());
  }
  
  Future<void> _onSendToGroup(SendToGroup event, Emitter<DeviceGroupState> emit) async {
    final group = state.groups.firstWhere((g) => g.id == event.groupId);
    // Get devices from DeviceBloc and queue transfers for each
    // This will be wired up in dependency injection
  }
}
```

**Step 4: Register in service locator**

Add to `apps/mobile/lib/core/di/service_locator.dart`:
```dart
sl.registerFactory(() => DeviceGroupBloc(
  repository: sl(),
  transferBloc: sl(),
));
```

**Step 5: Run analyzer**

Run: `cd apps/mobile && dart analyze`
Expected: No errors

**Step 6: Commit**

```bash
git add apps/mobile/lib/presentation/bloc/device_group/
git commit -m "feat(mobile): add DeviceGroupBloc"
```

---

### Task 9: Create Device Groups UI

**Files:**
- Create: `apps/mobile/lib/presentation/pages/device_groups_page.dart`
- Create: `apps/mobile/lib/presentation/widgets/group_card.dart`
- Create: `apps/mobile/lib/presentation/widgets/group_form_dialog.dart`

**Step 1: Create group form dialog**

Dialog for creating/editing groups with name, description, and device selection.

**Step 2: Create group card widget**

Card showing group name, device count, and actions (edit, delete, send to group).

**Step 3: Create device groups page**

Page listing all groups with FAB for creating new groups.

**Step 4: Add navigation**

Add routes and navigation to device groups page from main navigation.

**Step 5: Run app and test**

Run: `cd apps/mobile && flutter run`
Test: Create groups, add devices, send files to groups

**Step 6: Commit**

```bash
git add apps/mobile/lib/presentation/pages/device_groups_page.dart apps/mobile/lib/presentation/widgets/group_*.dart
git commit -m "feat(mobile): add device groups UI"
```

---

## Feature 3: Notifications

### Task 10: Add Notification Service

**Files:**
- Create: `packages/core_flutter/lib/src/data/services/notification_service.dart`

**Step 1: Create NotificationService**

```dart
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:syncstuff_core/syncstuff_core.dart';

class NotificationService {
  final FlutterLocalNotificationsPlugin _plugin;
  bool _initialized = false;
  
  NotificationService({FlutterLocalNotificationsPlugin? plugin})
      : _plugin = plugin ?? FlutterLocalNotificationsPlugin();
  
  Future<void> init() async {
    if (_initialized) return;
    
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    
    const settings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );
    
    await _plugin.initialize(settings);
    _initialized = true;
  }
  
  Future<void> showTransferComplete(FileTransfer transfer) async {
    if (!_initialized) await init();
    
    const androidDetails = AndroidNotificationDetails(
      'transfer_complete',
      'Transfer Complete',
      channelDescription: 'File transfer completed',
      importance: Importance.defaultImportance,
      priority: Priority.defaultPriority,
    );
    
    const details = NotificationDetails(android: androidDetails);
    
    final title = transfer.direction == TransferDirection.sent
        ? 'Transfer Sent'
        : 'Transfer Received';
    final body = '${transfer.fileName} (${transfer.formattedSize})';
    
    await _plugin.show(transfer.id.hashCode, title, body, details);
  }
  
  Future<void> showTransferFailed(FileTransfer transfer) async {
    if (!_initialized) await init();
    
    const androidDetails = AndroidNotificationDetails(
      'transfer_failed',
      'Transfer Failed',
      channelDescription: 'File transfer failed',
      importance: Importance.high,
      priority: Priority.high,
    );
    
    const details = NotificationDetails(android: androidDetails);
    
    await _plugin.show(
      transfer.id.hashCode,
      'Transfer Failed',
      '${transfer.fileName}: ${transfer.error ?? "Unknown error"}',
      details,
    );
  }
  
  Future<void> showTransferProgress(FileTransfer transfer) async {
    if (!_initialized) await init();
    
    final androidDetails = AndroidNotificationDetails(
      'transfer_progress',
      'Transfer Progress',
      channelDescription: 'File transfer in progress',
      importance: Importance.low,
      priority: Priority.low,
      progress: (transfer.progress * 100).toInt(),
      showProgress: true,
      maxProgress: 100,
    );
    
    final details = NotificationDetails(android: androidDetails);
    
    await _plugin.show(
      transfer.id.hashCode,
      'Transferring ${transfer.fileName}',
      '${(transfer.progress * 100).toInt()}% complete',
      details,
    );
  }
  
  Future<void> cancelNotification(int id) async {
    await _plugin.cancel(id);
  }
  
  Future<void> cancelAll() async {
    await _plugin.cancelAll();
  }
}
```

**Step 2: Add flutter_local_notifications to pubspec.yaml**

Add to `packages/core_flutter/pubspec.yaml`:
```yaml
dependencies:
  flutter_local_notifications: ^18.0.0
```

**Step 3: Run flutter pub get**

Run: `cd packages/core_flutter && flutter pub get`
Expected: Success

**Step 4: Run analyzer**

Run: `cd packages/core_flutter && dart analyze`
Expected: No errors

**Step 5: Commit**

```bash
git add packages/core_flutter/lib/src/data/services/notification_service.dart packages/core_flutter/pubspec.yaml
git commit -m "feat(core_flutter): add NotificationService for transfer events"
```

---

### Task 11: Integrate Notifications with TransferBloc

**Files:**
- Modify: `apps/mobile/lib/presentation/bloc/transfer/transfer_bloc.dart`

**Step 1: Add NotificationService to TransferBloc**

```dart
class TransferBloc extends Bloc<TransferEvent, TransferState> {
  final FileTransferService _fileTransferService;
  final TransferRepository _transferRepository;
  final TransferQueue _transferQueue;
  final NotificationService _notificationService;
  // ...
}
```

**Step 2: Show notifications on transfer events**

In `_onTransferCompleted`:
```dart
await _notificationService.showTransferComplete(transfer);
```

In `_onTransferFailed`:
```dart
await _notificationService.showTransferFailed(transfer);
```

In progress handler:
```dart
await _notificationService.showTransferProgress(transfer);
```

**Step 3: Run analyzer**

Run: `cd apps/mobile && dart analyze`
Expected: No errors

**Step 4: Commit**

```bash
git add apps/mobile/lib/presentation/bloc/transfer/transfer_bloc.dart
git commit -m "feat(mobile): integrate notifications with transfer events"
```

---

### Task 12: Add Notification Settings

**Files:**
- Modify: `packages/core/lib/src/domain/entities/settings_keys.dart` (or create)
- Modify: `apps/mobile/lib/presentation/bloc/settings/settings_bloc.dart`
- Modify: `apps/mobile/lib/presentation/pages/settings_page.dart`

**Step 1: Add notification settings keys**

```dart
class SettingsKeys {
  static const String notificationsEnabled = 'notifications_enabled';
  static const String transferCompleteNotification = 'transfer_complete_notification';
  static const String transferFailedNotification = 'transfer_failed_notification';
  static const String transferProgressNotification = 'transfer_progress_notification';
}
```

**Step 2: Add settings events and state**

Add to SettingsBloc:
- `ToggleNotifications`
- `ToggleTransferCompleteNotification`
- `ToggleTransferFailedNotification`
- `ToggleTransferProgressNotification`

**Step 3: Add notification settings UI**

Add toggles for each notification type in settings page.

**Step 4: Run app and test**

Run: `cd apps/mobile && flutter run`
Test: Toggle notifications, complete transfers, verify notifications appear

**Step 5: Commit**

```bash
git add packages/core/lib/ apps/mobile/lib/presentation/bloc/settings/ apps/mobile/lib/presentation/pages/settings_page.dart
git commit -m "feat(mobile): add notification settings UI"
```

---

### Task 13: Add Notification Permission Handling

**Files:**
- Modify: `packages/core_flutter/lib/src/data/services/notification_service.dart`

**Step 1: Add permission request method**

```dart
Future<bool> requestPermission() async {
  if (!_initialized) await init();
  
  final android = _plugin.resolvePlatformSpecificImplementation<
      AndroidFlutterLocalNotificationsPlugin>();
  if (android != null) {
    final granted = await android.requestNotificationsPermission();
    return granted ?? false;
  }
  
  final ios = _plugin.resolvePlatformSpecificImplementation<
      IOSFlutterLocalNotificationsPlugin>();
  if (ios != null) {
    final granted = await ios.requestPermissions(
      alert: true,
      badge: true,
      sound: true,
    );
    return granted ?? false;
  }
  
  return true;
}
```

**Step 2: Request permission on first launch**

In app initialization, request notification permission.

**Step 3: Commit**

```bash
git add packages/core_flutter/lib/src/data/services/notification_service.dart
git commit -m "feat(core_flutter): add notification permission handling"
```

---

### Task 14: Repeat for Desktop

**Files:**
- Modify: `apps/desktop/lib/presentation/bloc/transfer/transfer_bloc.dart`
- Modify: `apps/desktop/pubspec.yaml`

**Step 1: Add flutter_local_notifications to desktop pubspec**

**Step 2: Add NotificationService to desktop TransferBloc**

**Step 3: Test desktop notifications**

**Step 4: Commit**

```bash
git add apps/desktop/
git commit -m "feat(desktop): add transfer notifications"
```

---

## Summary

| Feature | Tasks | Est. Time |
|---------|-------|-----------|
| Transfer Queue | 4 | 2-3 hours |
| Device Groups | 5 | 3-4 hours |
| Notifications | 5 | 2-3 hours |
| **Total** | **14** | **7-10 hours** |

---

Plan complete and saved to `docs/plans/2026-07-06-transfer-queue-groups-notifications.md`.

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
