# Desktop Clipboard, Pairing Notifications & File Transfer Fixes

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix broken file transfers, add clipboard sharing/history, and add pairing notifications to the desktop app for feature parity with mobile.

**Architecture:** Three independent phases - (1) Fix file transfer bugs in TransferBloc and DesktopFileTransferService, (2) Add ClipboardBloc + ClipboardPage + sidebar nav for clipboard history and sync, (3) Add HTTP-based pairing notification endpoints and UI feedback via snackbar.

**Tech Stack:** Flutter, Dart, flutter_bloc, get_it, shared_preferences, flutter_local_notifications, http, uuid

---

## Phase 1: Fix File Transfers (Priority - Core Functionality Broken)

### Task 1.1: Fix TransferBloc fileName extraction and fileSize

**Files:**
- Modify: `apps/desktop/lib/presentation/bloc/transfer/transfer_bloc.dart`

**Problem:** `_onStartTransfer` splits fileName by `/` (fails on Windows `\` paths) and hardcodes `fileSize: 0`.

**Step 1: Fix fileName extraction and fileSize in _onStartTransfer**

Replace the existing `_onStartTransfer` method body:

```dart
Future<void> _onStartTransfer(
  StartTransfer event,
  Emitter<TransferState> emit,
) async {
  final file = File(event.filePath);
  final fileName = file.uri.pathSegments.isNotEmpty
      ? file.uri.pathSegments.last
      : event.filePath.split(Platform.pathSeparator).last;
  final fileSize = await file.exists() ? await file.length() : 0;

  final transfer = FileTransfer(
    id: _uuid.v4(),
    fileName: fileName,
    fileSize: fileSize,
    filePath: event.filePath,
    type: TransferType.file,
    status: TransferStatus.inProgress,
    direction: TransferDirection.sent,
    deviceId: event.deviceIp,
    deviceName: event.deviceIp,
    progress: 0,
    createdAt: DateTime.now(),
  );

  emit(
    state.copyWith(
      activeTransfers: [...state.activeTransfers, transfer],
      isTransferring: true,
    ),
  );

  try {
    await _fileTransferService.sendFile(
      filePath: event.filePath,
      peerIp: event.deviceIp,
      transferId: transfer.id,
      onProgress: (progress) {},
    );
    add(TransferCompleted(transfer.id));
  } catch (e) {
    add(TransferFailed(transfer.id, e.toString()));
  }
}
```

Also add `import 'dart:io';` at the top of the file.

---

### Task 1.2: Fix DesktopFileTransferService to include transferId in events

**Files:**
- Modify: `apps/desktop/lib/services/desktop_file_transfer_service.dart`

**Problem:** Progress events emit `{'status': 'completed', 'fileName': fileName}` but never include `transferId`. The TransferBloc listens for `data['transferId']` which is always `''`.

**Step 1: Add transferId parameter and include it in progress events**

Replace the entire file:

```dart
import 'dart:async';
import 'dart:io';

class DesktopFileTransferService {
  final _progressController =
      StreamController<Map<String, dynamic>>.broadcast();

  String _downloadPath = 'downloads';

  DesktopFileTransferService();

  Stream<Map<String, dynamic>> get progressStream => _progressController.stream;
  String get downloadPath => _downloadPath;

  void setDownloadPath(String path) {
    _downloadPath = path;
  }

  Future<void> sendFile({
    required String filePath,
    required String peerIp,
    String? transferId,
    Function(double)? onProgress,
  }) async {
    final file = File(filePath);
    if (!await file.exists()) {
      throw Exception('File not found: $filePath');
    }

    final fileName = file.uri.pathSegments.isNotEmpty
        ? file.uri.pathSegments.last
        : filePath.split(Platform.pathSeparator).last;
    final fileSize = await file.length();

    final client = HttpClient();
    client.connectionTimeout = const Duration(seconds: 30);

    try {
      final uri = Uri.parse('http://$peerIp:8766/api/upload?name=$fileName');
      final request = await client.postUrl(uri);
      request.headers.contentType = ContentType('application', 'octet-stream');
      request.contentLength = fileSize;

      // Send file in chunks for progress reporting
      final sink = request;
      final raf = await file.open(mode: FileMode.read);
      const chunkSize = 65536; // 64KB chunks
      var sent = 0;

      while (sent < fileSize) {
        final remaining = fileSize - sent;
        final toRead = remaining > chunkSize ? chunkSize : remaining;
        final chunk = await raf.read(toRead);
        sink.add(chunk);
        sent += chunk.length;

        final progress = fileSize > 0 ? sent / fileSize : 0.0;
        onProgress?.call(progress);

        _progressController.add({
          'transferId': transferId,
          'status': 'inProgress',
          'fileName': fileName,
          'progress': progress,
        });
      }

      await raf.close();
      final response = await sink.close();

      if (response.statusCode == 200) {
        _progressController.add({
          'transferId': transferId,
          'status': 'completed',
          'fileName': fileName,
          'progress': 1.0,
        });
      } else {
        throw Exception('Upload failed: ${response.statusCode}');
      }
    } finally {
      client.close();
    }
  }

  Future<List<String>> getDownloadedFiles() async {
    final dir = Directory(_downloadPath);
    if (!await dir.exists()) return [];
    final files = await dir.list().toList();
    return files.whereType<File>().map((f) => f.path).toList();
  }

  void dispose() {
    _progressController.close();
  }
}
```

---

### Task 1.3: Fix DesktopHttpServer download path

**Files:**
- Modify: `apps/desktop/lib/services/desktop_http_server.dart`

**Problem:** `_handleUpload` saves to hardcoded relative `'downloads'` directory. Should use configured download path.

**Step 1: Add downloadPath setter and use it in _handleUpload**

Add a `downloadPath` field and setter after the `_lastClipboardUpdate` field:

```dart
String _downloadPath = 'downloads';

String get downloadPath => _downloadPath;

void setDownloadPath(String path) {
  _downloadPath = path;
}
```

Replace the `_handleUpload` method:

```dart
Future<void> _handleUpload(HttpRequest request) async {
  try {
    final uri = request.uri;
    final fileName = uri.queryParameters['name'] ?? 'unknown';
    final downloadsDir = Directory(_downloadPath);
    if (!await downloadsDir.exists()) {
      await downloadsDir.create(recursive: true);
    }
    final file = File('${downloadsDir.path}/$fileName');
    final sink = file.openWrite();
    await for (final chunk in request) {
      sink.add(chunk);
    }
    await sink.close();
    _fileUploadController.add({'name': fileName, 'path': file.path});
    request.response.statusCode = 200;
    await request.response.close();
  } catch (e) {
    request.response.statusCode = 500;
    await request.response.close();
  }
}
```

---

### Task 1.4: Wire download path from SettingsBloc to services

**Files:**
- Modify: `apps/desktop/lib/core/di/service_locator.dart`
- Modify: `apps/desktop/lib/app.dart`

**Step 1: Start HTTP server and configure download path in main.dart**

In `apps/desktop/lib/main.dart`, after `setupServiceLocator()`, start the HTTP server and configure the download path:

```dart
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'app.dart';
import 'core/di/service_locator.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await setupServiceLocator();

  // Start HTTP server for receiving files and clipboard
  final httpServer = getIt<DesktopHttpServer>();
  await httpServer.start();

  // Configure download path from settings
  final prefs = getIt<SharedPreferences>();
  final downloadPath = prefs.getString('download_path') ?? 'downloads';
  httpServer.setDownloadPath(downloadPath);
  getIt<DesktopFileTransferService>().setDownloadPath(downloadPath);

  runApp(const SyncStuffDesktopApp());
}
```

Add the import for `DesktopFileTransferService`:

```dart
import 'services/desktop_file_transfer_service.dart';
```

---

### Task 1.5: Verify file transfer fixes

**Steps:**
1. Run `bun run dev:desktop` to start the app
2. Ensure HTTP server starts (check logs)
3. Pair with a mobile device
4. Send a file from desktop to mobile
5. Verify file appears in mobile's download directory
6. Check transfer history shows correct fileName and fileSize

---

## Phase 2: Add Clipboard Sharing/History

### Task 2.1: Create ClipboardEvent

**Files:**
- Create: `apps/desktop/lib/presentation/bloc/clipboard/clipboard_event.dart`

```dart
import 'package:equatable/equatable.dart';

abstract class ClipboardEvent extends Equatable {
  const ClipboardEvent();

  @override
  List<Object?> get props => [];
}

class LoadClipboardItems extends ClipboardEvent {}

class AddClipboardItem extends ClipboardEvent {
  final String content;
  final String contentType;

  const AddClipboardItem({required this.content, required this.contentType});

  @override
  List<Object?> get props => [content, contentType];
}

class DeleteClipboardItem extends ClipboardEvent {
  final String id;

  const DeleteClipboardItem(this.id);

  @override
  List<Object?> get props => [id];
}

class ToggleClipboardSync extends ClipboardEvent {}

class SyncClipboardToDevices extends ClipboardEvent {
  final String itemId;

  const SyncClipboardToDevices(this.itemId);

  @override
  List<Object?> get props => [itemId];
}
```

---

### Task 2.2: Create ClipboardState

**Files:**
- Create: `apps/desktop/lib/presentation/bloc/clipboard/clipboard_state.dart`

```dart
import 'package:equatable/equatable.dart';
import 'package:syncstuff_core/syncstuff_core.dart';

class ClipboardState extends Equatable {
  final List<ClipboardItem> items;
  final bool syncEnabled;
  final bool isSyncing;
  final String? error;

  const ClipboardState({
    this.items = const [],
    this.syncEnabled = false,
    this.isSyncing = false,
    this.error,
  });

  ClipboardState copyWith({
    List<ClipboardItem>? items,
    bool? syncEnabled,
    bool? isSyncing,
    String? error,
  }) {
    return ClipboardState(
      items: items ?? this.items,
      syncEnabled: syncEnabled ?? this.syncEnabled,
      isSyncing: isSyncing ?? this.isSyncing,
      error: error,
    );
  }

  @override
  List<Object?> get props => [items, syncEnabled, isSyncing, error];
}
```

---

### Task 2.3: Create ClipboardBloc

**Files:**
- Create: `apps/desktop/lib/presentation/bloc/clipboard/clipboard_bloc.dart`

```dart
import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:uuid/uuid.dart';
import 'package:syncstuff_core_flutter/syncstuff_core_flutter.dart';

import '../../../services/desktop_clipboard_sync_service.dart';
import 'clipboard_event.dart';
import 'clipboard_state.dart';

class ClipboardBloc extends Bloc<ClipboardEvent, ClipboardState> {
  final DesktopClipboardSyncService _clipboardService;
  final ClipboardRepository _clipboardRepository;
  final _uuid = const Uuid();

  StreamSubscription<List<ClipboardItem>>? _historySubscription;

  ClipboardBloc({
    required DesktopClipboardSyncService clipboardService,
    ClipboardRepository? clipboardRepository,
  })  : _clipboardService = clipboardService,
        _clipboardRepository = clipboardRepository ?? ClipboardRepository(),
        super(const ClipboardState()) {
    on<LoadClipboardItems>(_onLoadItems);
    on<AddClipboardItem>(_onAddItem);
    on<DeleteClipboardItem>(_onDeleteItem);
    on<ToggleClipboardSync>(_onToggleSync);
    on<SyncClipboardToDevices>(_onSyncToDevices);
    on<ClipboardReceived>(_onClipboardReceived);

    // Start the clipboard service
    _clipboardService.start();

    // Listen to history updates from the service
    _historySubscription = _clipboardService.historyStream.listen((items) {
      emit(state.copyWith(items: items));
    });
  }

  Future<void> _onLoadItems(
    LoadClipboardItems event,
    Emitter<ClipboardState> emit,
  ) async {
    final items = await _clipboardService.getHistory(limit: 100);
    emit(state.copyWith(items: items));
  }

  Future<void> _onAddItem(
    AddClipboardItem event,
    Emitter<ClipboardState> emit,
  ) async {
    await _clipboardService.setClipboard(event.content);
    final items = await _clipboardService.getHistory(limit: 100);
    emit(state.copyWith(items: items));

    if (state.syncEnabled) {
      final newItem = items.firstWhere(
        (i) => i.content == event.content,
        orElse: () => ClipboardItem(
          id: '',
          content: event.content,
          contentType: event.contentType,
          createdAt: DateTime.now(),
        ),
      );
      if (newItem.id.isNotEmpty) {
        add(SyncClipboardToDevices(newItem.id));
      }
    }
  }

  Future<void> _onDeleteItem(
    DeleteClipboardItem event,
    Emitter<ClipboardState> emit,
  ) async {
    await _clipboardService.deleteHistoryItem(event.id);
    final items = await _clipboardService.getHistory(limit: 100);
    emit(state.copyWith(items: items));
  }

  void _onToggleSync(
    ToggleClipboardSync event,
    Emitter<ClipboardState> emit,
  ) {
    final newEnabled = !state.syncEnabled;

    if (newEnabled) {
      _clipboardService.enable();
    } else {
      _clipboardService.disable();
    }

    emit(state.copyWith(syncEnabled: newEnabled));
  }

  Future<void> _onSyncToDevices(
    SyncClipboardToDevices event,
    Emitter<ClipboardState> emit,
  ) async {
    emit(state.copyWith(isSyncing: true));

    final item = state.items.firstWhere(
      (i) => i.id == event.itemId,
      orElse: () => ClipboardItem(
        id: '',
        content: '',
        contentType: 'text',
        createdAt: DateTime.now(),
      ),
    );

    if (item.content.isEmpty) {
      emit(state.copyWith(isSyncing: false));
      return;
    }

    await _clipboardService.setClipboard(item.content);

    final updated = state.items.map((i) {
      if (i.id == event.itemId) {
        return i.copyWith(synced: true);
      }
      return i;
    }).toList();

    emit(state.copyWith(items: updated, isSyncing: false));
  }

  void _onClipboardReceived(
    ClipboardReceived event,
    Emitter<ClipboardState> emit,
  ) async {
    if (state.items.any((i) => i.content == event.item.content)) {
      return;
    }

    final receivedItem = event.item.copyWith(synced: true);
    await _clipboardRepository.addItem(receivedItem);
    final items = await _clipboardService.getHistory(limit: 100);
    emit(state.copyWith(items: items));
  }

  @override
  Future<void> close() {
    _historySubscription?.cancel();
    _clipboardService.dispose();
    return super.close();
  }
}

class ClipboardReceived extends ClipboardEvent {
  final ClipboardItem item;

  const ClipboardReceived(this.item);

  @override
  List<Object?> get props => [item];
}
```

---

### Task 2.4: Create ClipboardPage

**Files:**
- Create: `apps/desktop/lib/presentation/pages/clipboard_page.dart`

```dart
import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../bloc/clipboard/clipboard_bloc.dart';
import '../bloc/clipboard/clipboard_event.dart';
import '../bloc/clipboard/clipboard_state.dart';
import '../widgets/empty_state.dart';

class ClipboardPage extends StatelessWidget {
  const ClipboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(context),
          _buildSyncBanner(context),
          Expanded(
            child: BlocBuilder<ClipboardBloc, ClipboardState>(
              builder: (context, state) {
                if (state.items.isEmpty) {
                  return EmptyState(
                    icon: Icons.content_paste_off,
                    title: 'No clipboard history',
                    subtitle: 'Copied text will appear here',
                    action: ElevatedButton.icon(
                      onPressed: () => _addClipboardItem(context),
                      icon: const Icon(Icons.add),
                      label: const Text('Add Item'),
                    ),
                  );
                }

                return _buildClipboardList(context, state);
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _addClipboardItem(context),
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Clipboard', style: theme.textTheme.displaySmall),
              const SizedBox(height: 4),
              Text(
                'Sync clipboard across devices',
                style: theme.textTheme.bodyMedium,
              ),
            ],
          ),
          BlocBuilder<ClipboardBloc, ClipboardState>(
            builder: (context, state) {
              return Row(
                children: [
                  if (state.isSyncing)
                    Padding(
                      padding: const EdgeInsets.only(right: 12),
                      child: SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: theme.colorScheme.primary,
                        ),
                      ),
                    ),
                  Text(
                    'Sync',
                    style: theme.textTheme.bodyMedium,
                  ),
                  const SizedBox(width: 8),
                  Switch(
                    value: state.syncEnabled,
                    onChanged: (_) {
                      context.read<ClipboardBloc>().add(ToggleClipboardSync());
                    },
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSyncBanner(BuildContext context) {
    return BlocBuilder<ClipboardBloc, ClipboardState>(
      builder: (context, state) {
        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 24),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: state.syncEnabled
                ? Colors.green.withValues(alpha: 0.08)
                : Colors.grey.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: state.syncEnabled
                  ? Colors.green.withValues(alpha: 0.2)
                  : Colors.grey.withValues(alpha: 0.2),
            ),
          ),
          child: Row(
            children: [
              Icon(
                state.syncEnabled ? Icons.sync : Icons.sync_disabled,
                size: 20,
                color: state.syncEnabled ? Colors.green : Colors.grey,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  state.syncEnabled
                      ? 'Clipboard sync enabled - Changes will be sent to paired devices'
                      : 'Clipboard sync disabled',
                  style: TextStyle(
                    color: state.syncEnabled
                        ? Colors.green[700]
                        : Colors.grey[600],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildClipboardList(BuildContext context, ClipboardState state) {
    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: state.items.length,
      itemBuilder: (context, index) {
        final item = state.items[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: Icon(
              item.contentType == 'text'
                  ? Icons.text_fields
                  : Icons.image,
            ),
            title: Text(
              item.content,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            subtitle: Text(
              _formatDateTime(item.createdAt),
              style: TextStyle(
                color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
                fontSize: 12,
              ),
            ),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (item.synced)
                  const Icon(
                    Icons.cloud_done,
                    color: Colors.green,
                    size: 20,
                  ),
                IconButton(
                  icon: const Icon(Icons.delete_outline),
                  onPressed: () {
                    context.read<ClipboardBloc>().add(
                      DeleteClipboardItem(item.id),
                    );
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  String _formatDateTime(DateTime dt) {
    return '${dt.day}/${dt.month}/${dt.year} ${dt.hour}:${dt.minute.toString().padLeft(2, '0')}';
  }

  void _addClipboardItem(BuildContext context) {
    final controller = TextEditingController();
    unawaited(
      showDialog<void>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Add Clipboard Item'),
          content: TextField(
            controller: controller,
            decoration: const InputDecoration(
              hintText: 'Enter text to add to clipboard',
            ),
            maxLines: 4,
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                if (controller.text.isNotEmpty) {
                  context.read<ClipboardBloc>().add(
                    AddClipboardItem(
                      content: controller.text,
                      contentType: 'text',
                    ),
                  );
                }
                Navigator.pop(context);
              },
              child: const Text('Add'),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

### Task 2.5: Register ClipboardBloc in service_locator.dart

**Files:**
- Modify: `apps/desktop/lib/core/di/service_locator.dart`

**Step 1: Add ClipboardBloc import and registration**

Add import at top:

```dart
import '../../presentation/bloc/clipboard/clipboard_bloc.dart';
```

Add registration after the SettingsBloc registration (line 72):

```dart
getIt.registerFactory<ClipboardBloc>(
  () => ClipboardBloc(
    clipboardService: getIt<DesktopClipboardSyncService>(),
  ),
);
```

---

### Task 2.6: Add ClipboardBloc provider to app.dart

**Files:**
- Modify: `apps/desktop/lib/app.dart`

**Step 1: Add import and provider**

Add import:

```dart
import 'presentation/bloc/clipboard/clipboard_bloc.dart';
import 'presentation/bloc/clipboard/clipboard_event.dart';
```

Add provider in `MultiBlocProvider` after `DeviceGroupBloc`:

```dart
BlocProvider<ClipboardBloc>(
  create: (_) => getIt<ClipboardBloc>()..add(LoadClipboardItems()),
),
```

---

### Task 2.7: Add Clipboard to sidebar and home page

**Files:**
- Modify: `apps/desktop/lib/presentation/widgets/app_sidebar.dart`
- Modify: `apps/desktop/lib/presentation/pages/home_page.dart`

**Step 1: Add Clipboard nav item to AppSidebar**

In `app_sidebar.dart`, add after the Groups nav item (after line 108):

```dart
const SizedBox(height: 4),
_NavItem(
  icon: Icons.content_paste_outlined,
  selectedIcon: Icons.content_paste,
  label: 'Clipboard',
  isSelected: selectedIndex == 3,
  onTap: () => onDestinationSelected(3),
),
```

Update the Settings nav item to use index 4:

```dart
const SizedBox(height: 4),
_NavItem(
  icon: Icons.settings_outlined,
  selectedIcon: Icons.settings,
  label: 'Settings',
  isSelected: selectedIndex == 4,
  onTap: () => onDestinationSelected(4),
),
```

**Step 2: Add ClipboardPage to HomePage**

In `home_page.dart`:

Add import:

```dart
import 'clipboard_page.dart';
```

Add `ClipboardPage()` to the `IndexedStack` children list at index 3, and shift `SettingsPage()` to index 4:

```dart
Expanded(
  child: IndexedStack(
    index: _currentIndex,
    children: const [
      DevicesPage(),
      TransfersPage(),
      DeviceGroupsPage(),
      ClipboardPage(),
      SettingsPage(),
    ],
  ),
),
```

---

## Phase 3: Pairing Notifications

### Task 3.1: Add pair/unpair HTTP endpoints to DesktopHttpServer

**Files:**
- Modify: `apps/desktop/lib/services/desktop_http_server.dart`

**Step 1: Add pairing notification controller and endpoints**

Add a new stream controller after `_clipboardUpdateController`:

```dart
final _pairingUpdateController =
    StreamController<Map<String, dynamic>>.broadcast();
```

Add getter:

```dart
Stream<Map<String, dynamic>> get pairingUpdates =>
    _pairingUpdateController.stream;
```

Add route handling in `_handleHttpRequests`:

```dart
} else if (request.method == 'POST' && path == '/api/pair') {
  await _handlePairNotification(request);
} else if (request.method == 'POST' && path == '/api/unpair') {
  await _handleUnpairNotification(request);
} else {
```

Add the handler methods:

```dart
Future<void> _handlePairNotification(HttpRequest request) async {
  try {
    final body = await request.fold<List<int>>(
      [],
      (prev, chunk) => prev..addAll(chunk),
    );
    final data = jsonDecode(utf8.decode(body)) as Map<String, dynamic>;

    _pairingUpdateController.add({
      'type': 'pair',
      'deviceId': data['deviceId'] as String?,
      'deviceName': data['deviceName'] as String?,
      'timestamp': DateTime.now().toIso8601String(),
    });

    request.response.statusCode = 200;
    request.response.headers.contentType = ContentType.json;
    request.response.write(jsonEncode({'success': true}));
  } catch (e) {
    request.response.statusCode = 400;
    request.response.write(jsonEncode({'error': e.toString()}));
  }
  await request.response.close();
}

Future<void> _handleUnpairNotification(HttpRequest request) async {
  try {
    final body = await request.fold<List<int>>(
      [],
      (prev, chunk) => prev..addAll(chunk),
    );
    final data = jsonDecode(utf8.decode(body)) as Map<String, dynamic>;

    _pairingUpdateController.add({
      'type': 'unpair',
      'deviceId': data['deviceId'] as String?,
      'deviceName': data['deviceName'] as String?,
      'timestamp': DateTime.now().toIso8601String(),
    });

    request.response.statusCode = 200;
    request.response.headers.contentType = ContentType.json;
    request.response.write(jsonEncode({'success': true}));
  } catch (e) {
    request.response.statusCode = 400;
    request.response.write(jsonEncode({'error': e.toString()}));
  }
  await request.response.close();
}
```

Update `dispose` to close `_pairingUpdateController`:

```dart
void dispose() {
  _server?.close();
  _discoveredDevicesController.close();
  _fileUploadController.close();
  _clipboardUpdateController.close();
  _pairingUpdateController.close();
}
```

---

### Task 3.2: Add pairing events and state updates

**Files:**
- Modify: `apps/desktop/lib/presentation/bloc/device/device_event.dart`
- Modify: `apps/desktop/lib/presentation/bloc/device/device_state.dart`

**Step 1: Add new events to device_event.dart**

Add at the bottom of the file:

```dart
class DevicePairedByRemote extends DeviceEvent {
  final String deviceId;
  final String deviceName;

  const DevicePairedByRemote({required this.deviceId, required this.deviceName});

  @override
  List<Object?> get props => [deviceId, deviceName];
}

class DeviceUnpairedByRemote extends DeviceEvent {
  final String deviceId;
  final String deviceName;

  const DeviceUnpairedByRemote({required this.deviceId, required this.deviceName});

  @override
  List<Object?> get props => [deviceId, deviceName];
}
```

**Step 2: Add notification field to device_state.dart**

Add field:

```dart
final String? lastNotification;
```

Add to constructor:

```dart
this.lastNotification,
```

Add to copyWith:

```dart
String? lastNotification,
```

And in the copyWith body:

```dart
lastNotification: lastNotification,
```

Add to props:

```dart
lastNotification,
```

---

### Task 3.3: Wire pairing notifications into DeviceBloc

**Files:**
- Modify: `apps/desktop/lib/presentation/bloc/device/device_bloc.dart`

**Step 1: Add imports and subscriptions**

Add imports:

```dart
import 'dart:io';
import 'dart:convert';
import '../../../services/desktop_http_server.dart';
import 'device_event.dart';
```

Add fields:

```dart
final DesktopHttpServer _httpServer;
StreamSubscription<Map<String, dynamic>>? _pairingSubscription;
```

Update constructor to accept `httpServer`:

```dart
DeviceBloc({
  required DesktopDiscoveryService discoveryService,
  required DeviceRepository deviceRepository,
  required DesktopHttpServer httpServer,
})  : _discoveryService = discoveryService,
       _deviceRepository = deviceRepository,
       _httpServer = httpServer,
       super(const DeviceState()) {
```

Register new event handlers:

```dart
on<DevicePairedByRemote>(_onDevicePairedByRemote);
on<DeviceUnpairedByRemote>(_onDeviceUnpairedByRemote);
```

Start listening to pairing updates in constructor (after the `on` registrations):

```dart
// Listen for remote pairing notifications
_pairingSubscription = _httpServer.pairingUpdates.listen((event) {
  final type = event['type'] as String?;
  final deviceId = event['deviceId'] as String?;
  final deviceName = event['deviceName'] as String?;

  if (deviceId == null) return;

  if (type == 'pair') {
    add(DevicePairedByRemote(deviceId: deviceId, deviceName: deviceName ?? 'Unknown'));
  } else if (type == 'unpair') {
    add(DeviceUnpairedByRemote(deviceId: deviceId, deviceName: deviceName ?? 'Unknown'));
  }
});
```

**Step 2: Update _onPairDevice to send notification**

```dart
Future<void> _onPairDevice(
  PairDevice event,
  Emitter<DeviceState> emit,
) async {
  final device = state.discoveredDevices.firstWhere(
    (d) => d.id == event.deviceId,
  );
  await _deviceRepository.pairDevice(device);
  final paired = await _deviceRepository.getPairedDevices();
  emit(state.copyWith(pairedDevices: paired));

  // Notify the remote device
  _sendPairNotification(device);
}
```

**Step 3: Add _sendPairNotification method**

```dart
Future<void> _sendPairNotification(SyncDevice device) async {
  try {
    final client = HttpClient();
    client.connectionTimeout = const Duration(seconds: 3);

    final uri = Uri.parse(
      'http://${device.ipAddress}:${device.port ?? 8766}/api/pair',
    );
    final request = await client.postUrl(uri);
    request.headers.contentType = ContentType.json;
    request.write(jsonEncode({
      'deviceId': _httpServer.deviceId,
      'deviceName': _httpServer.deviceName,
    }));

    await request.close();
    client.close();
  } catch (e) {
    // Remote device unreachable
  }
}
```

**Step 4: Add _onDevicePairedByRemote handler**

```dart
void _onDevicePairedByRemote(
  DevicePairedByRemote event,
  Emitter<DeviceState> emit,
) {
  emit(state.copyWith(
    lastNotification: '${event.deviceName} paired with this device',
  ));
}
```

**Step 5: Add _onDeviceUnpairedByRemote handler**

```dart
void _onDeviceUnpairedByRemote(
  DeviceUnpairedByRemote event,
  Emitter<DeviceState> emit,
) {
  emit(state.copyWith(
    lastNotification: '${event.deviceName} unpaired from this device',
  ));
}
```

**Step 6: Update close() to cancel subscription**

```dart
@override
Future<void> close() {
  _discoverySubscription?.cancel();
  _pairingSubscription?.cancel();
  return super.close();
}
```

---

### Task 3.4: Update service_locator to pass httpServer to DeviceBloc

**Files:**
- Modify: `apps/desktop/lib/core/di/service_locator.dart`

**Step 1: Update DeviceBloc registration**

```dart
getIt.registerFactory<DeviceBloc>(
  () => DeviceBloc(
    discoveryService: getIt<DesktopDiscoveryService>(),
    deviceRepository: getIt<DeviceRepository>(),
    httpServer: getIt<DesktopHttpServer>(),
  ),
);
```

---

### Task 3.5: Show snackbar on pairing notification in DevicesPage

**Files:**
- Modify: `apps/desktop/lib/presentation/pages/devices_page.dart`

**Step 1: Add BlocListener for notifications**

Wrap the `Scaffold` body with a `BlocListener` to show snackbars:

Replace the `build` method body:

```dart
@override
Widget build(BuildContext context) {
  return BlocListener<DeviceBloc, DeviceState>(
    listenWhen: (previous, current) =>
        previous.lastNotification != current.lastNotification &&
        current.lastNotification != null,
    listener: (context, state) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(state.lastNotification!),
          duration: const Duration(seconds: 3),
          behavior: SnackBarBehavior.floating,
        ),
      );
    },
    child: Scaffold(
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(context),
          _buildDiscoveryBanner(context),
          Expanded(
            child: BlocBuilder<DeviceBloc, DeviceState>(
              builder: (context, state) {
                if (state.pairedDevices.isEmpty &&
                    state.discoveredDevices.isEmpty &&
                    state.discoveryStatus != 'discovering') {
                  return EmptyState(
                    icon: Icons.devices,
                    title: 'No devices found',
                    subtitle:
                        'Tap the scan button to discover devices on your network',
                    action: ElevatedButton.icon(
                      onPressed: () =>
                          context.read<DeviceBloc>().add(StartDiscovery()),
                      icon: const Icon(Icons.search),
                      label: const Text('Start Scanning'),
                    ),
                  );
                }

                return _buildDeviceList(context, state);
              },
            ),
          ),
        ],
      ),
    ),
  );
}
```

---

## Verification Checklist

After all phases are complete:

1. **File Transfers:**
   - [ ] Desktop can send files to mobile device
   - [ ] Transfer shows correct fileName and fileSize in history
   - [ ] Files are saved to the configured download path
   - [ ] Progress updates are shown during transfer

2. **Clipboard:**
   - [ ] Clipboard page appears in sidebar (5th item)
   - [ ] Clipboard sync toggle works (enable/disable)
   - [ ] Clipboard history is shown with items
   - [ ] Manual clipboard item addition works
   - [ ] Clipboard items can be deleted
   - [ ] Clipboard syncs to paired devices when enabled
   - [ ] Incoming clipboard items from peers are shown

3. **Pairing Notifications:**
   - [ ] When desktop pairs with mobile, mobile shows notification
   - [ ] When mobile pairs with desktop, desktop shows snackbar
   - [ ] Paired device appears in paired devices list
   - [ ] Pairing persists across app restarts

4. **Build:**
   - [ ] `bun run build:desktop` succeeds
   - [ ] No analyzer warnings
