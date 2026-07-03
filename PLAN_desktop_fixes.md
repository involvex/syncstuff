# Desktop App Fixes & Seamless Sync Implementation Plan

## Executive Summary

This plan addresses three critical issues in the SyncStuff ecosystem:
1. **Desktop app not discoverable** by other devices
2. **Clipboard sync missing** in desktop and CLI apps
3. **CLI requires explicit `serve` command** instead of seamless background sync

---

## Problem Analysis

### Issue 1: Desktop Discovery Failure

**Root Cause:** The desktop app uses HTTP-only discovery with sequential scanning (2s timeout), while mobile devices expect UDP broadcast announcements on port 8767.

**Current State:**
- Desktop scans /24 subnet sequentially with 2s timeout
- No UDP broadcast listener/sender
- Mobile devices announce via UDP on port 8767
- Desktop only listens on port 8766 for HTTP probes

**Impact:** Desktop cannot discover mobile devices, and mobile devices cannot discover desktop.

### Issue 2: Clipboard Sync Missing

**Root Cause:** No clipboard monitoring service exists in desktop or CLI apps.

**Current State:**
- Mobile has `ClipboardSyncService` with 2-second polling
- Desktop has no clipboard sync implementation
- CLI clipboard endpoint returns hardcoded empty string
- No native clipboard access packages in CLI dependencies

### Issue 3: CLI Not Seamless

**Root Cause:** CLI requires explicit `serve` command and runs as foreground process only.

**Current State:**
- `syncstuff serve` starts HTTP/TCP servers
- No daemon mode or background execution
- No auto-start on system boot
- No system tray integration

---

## Implementation Plan

### Phase 1: Fix Desktop Discovery (Priority: Critical)

#### 1.1 Add UDP Broadcast to Desktop Discovery Service

**File:** `apps/desktop/lib/services/desktop_discovery_service.dart`

**Changes:**
1. Import `dart:io` (already available) for UDP sockets
2. Add UDP broadcast listener on port 8767
3. Add UDP broadcast sender for presence announcement
4. Parse incoming broadcasts into `SyncDevice` entities
5. Filter own IP to prevent self-discovery

**Implementation:**
```dart
// Add to DesktopDiscoveryService class
late RawDatagramSocket _udpSocket;
static const int udpPort = 8767;

Future<void> startUdpBroadcast() async {
  _udpSocket = await RawDatagramSocket.bind(
    InternetAddress.anyIPv4,
    udpPort,
    broadcast: true,
  );
  
  _udpSocket.listen((event) {
    if (event == RawSocketEvent.read) {
      final packet = _udpSocket.receive();
      if (packet != null) {
        final message = utf8.decode(packet.data);
        _handleBroadcastMessage(message, packet.address);
      }
    }
  });
  
  // Send periodic announcements
  Timer.periodic(Duration(seconds: 3), (_) => sendBroadcast());
}

Future<void> sendBroadcast() async {
  final deviceInfo = {
    'id': _deviceId,
    'name': Platform.environment['COMPUTERNAME'] ?? 'Desktop',
    'platform': Platform.operatingSystem,
    'ip': _getLocalIp(),
    'port': 8766,
    'version': '1.0.0',
  };
  
  final message = utf8.encode(jsonEncode(deviceInfo));
  _udpSocket.send(
    message,
    InternetAddress('255.255.255.255'),
    udpPort,
  );
}
```

#### 1.2 Improve HTTP Probe Scanning

**File:** `apps/desktop/lib/services/desktop_discovery_service.dart`

**Changes:**
1. Reduce timeout from 2000ms to 200ms
2. Implement parallel scanning (10 IPs concurrently)
3. Use `SyncDevice` entity instead of raw JSON maps

**Implementation:**
```dart
Future<List<SyncDevice>> scanSubnetParallel() async {
  final devices = <SyncDevice>[];
  final completer = Completer<List<SyncDevice>>();
  
  // Get local subnet
  final localIp = _getLocalIp();
  final subnet = localIp.substring(0, localIp.lastIndexOf('.'));
  
  // Create batches of 10 IPs
  final futures = <Future>[];
  for (int i = 1; i <= 254; i += 10) {
    final batch = List.generate(10, (j) => '$subnet.${i + j}');
    futures.add(_scanBatch(batch, devices));
  }
  
  await Future.wait(futures);
  return devices;
}

Future<void> _scanBatch(List<String> ips, List<SyncDevice> devices) async {
  final futures = ips.map((ip) async {
    try {
      final client = HttpClient();
      client.connectionTimeout = Duration(milliseconds: 200);
      final request = await client.getUrl(Uri.parse('http://$ip:8766/api/probe'));
      final response = await request.close();
      
      if (response.statusCode == 200) {
        final body = await response.transform(utf8.decoder).join();
        final json = jsonDecode(body);
        devices.add(SyncDevice.fromJson(json));
      }
    } catch (e) {
      // Device not reachable
    }
  });
  
  await Future.wait(futures);
}
```

#### 1.3 Add WebSocket Signaling Server

**File:** `apps/desktop/lib/services/desktop_websocket_server.dart` (new)

**Changes:**
1. Create WebSocket server on port 8767
2. Handle device connections and signaling messages
3. Support WebRTC offer/answer/ICE candidate exchange

**Implementation:**
```dart
import 'dart:io';
import 'dart:convert';

class DesktopWebSocketServer {
  late HttpServer _server;
  final _clients = <WebSocket>[];
  
  Future<void> start(int port) async {
    _server = await HttpServer.bind(InternetAddress.anyIPv4, port);
    
    _server.listen((HttpRequest request) {
      if (WebSocketTransformer.isUpgradeRequest(request)) {
        final socket = await WebSocketTransformer.upgrade(request);
        _handleClient(socket);
      }
    });
  }
  
  void _handleClient(WebSocket socket) {
    _clients.add(socket);
    
    socket.listen(
      (message) {
        final data = jsonDecode(message);
        _handleMessage(socket, data);
      },
      onDone: () => _clients.remove(socket),
    );
  }
  
  void _handleMessage(WebSocket sender, Map<String, dynamic> data) {
    // Broadcast to all other clients
    for (final client in _clients) {
      if (client != sender) {
        client.add(jsonEncode(data));
      }
    }
  }
  
  Future<void> stop() async {
    await _server.close();
    for (final client in _clients) {
      await client.close();
    }
  }
}
```

#### 1.4 Update Service Locator

**File:** `apps/desktop/lib/core/di/service_locator.dart`

**Changes:**
1. Register `DesktopWebSocketServer`
2. Initialize UDP broadcast in discovery service
3. Add clipboard sync service (Phase 2)

**Implementation:**
```dart
Future<void> setupServiceLocator() async {
  // ... existing registrations ...
  
  // Add WebSocket server
  final webSocketServer = DesktopWebSocketServer();
  getIt.registerSingleton(webSocketServer);
  
  // Start UDP broadcast
  final discoveryService = getIt<DesktopDiscoveryService>();
  await discoveryService.startUdpBroadcast();
  
  // Start WebSocket server
  await webSocketServer.start(8767);
}
```

#### 1.5 Fix Device Entity Mismatch

**File:** `apps/desktop/lib/domain/entities/device.dart`

**Changes:**
1. Use `SyncDevice` from `packages/core` instead of local implementation
2. Update all references to use the shared entity

**Alternative:** If `packages/core` is not accessible from desktop (Flutter dependency), duplicate the `SyncDevice` class with proper `fromJson`/`toJson` methods.

---

### Phase 2: Implement Clipboard Sync (Priority: High)

#### 2.1 Add Clipboard Package to CLI

**File:** `apps/cli_dart/pubspec.yaml`

**Changes:**
1. Add `clipboard: ^0.1.3` dependency
2. Or implement platform-specific clipboard access

**Implementation:**
```yaml
dependencies:
  clipboard: ^0.1.3
  # ... existing dependencies
```

#### 2.2 Create Shared Clipboard Sync Service

**File:** `packages/core/lib/src/services/clipboard_sync_service.dart` (new)

**Changes:**
1. Create platform-agnostic clipboard monitoring service
2. Use polling with change detection
3. Support both HTTP and WebSocket transport

**Implementation:**
```dart
import 'dart:async';
import 'package:clipboard/clipboard.dart';

class ClipboardSyncService {
  Timer? _pollTimer;
  String? _lastClipboardContent;
  final StreamController<ClipboardItem> _clipboardStream = 
    StreamController<ClipboardItem>.broadcast();
  
  Stream<ClipboardItem> get clipboardStream => _clipboardStream.stream;
  
  void startMonitoring({Duration interval = const Duration(seconds: 2)}) {
    _pollTimer = Timer.periodic(interval, (_) => _checkClipboard());
  }
  
  void stopMonitoring() {
    _pollTimer?.cancel();
    _pollTimer = null;
  }
  
  Future<void> _checkClipboard() async {
    try {
      final content = await Clipboard.read();
      if (content != null && content != _lastClipboardContent) {
        _lastClipboardContent = content;
        final item = ClipboardItem(
          id: Uuid().v4(),
          content: content,
          contentType: 'text',
          createdAt: DateTime.now(),
          synced: false,
        );
        _clipboardStream.add(item);
      }
    } catch (e) {
      // Clipboard access failed
    }
  }
  
  Future<void> setClipboardContent(String content) async {
    await Clipboard.write(content);
    _lastClipboardContent = content;
  }
  
  void dispose() {
    stopMonitoring();
    _clipboardStream.close();
  }
}
```

#### 2.3 Implement Clipboard Sync in Desktop

**File:** `apps/desktop/lib/services/desktop_clipboard_sync_service.dart` (new)

**Changes:**
1. Create desktop-specific clipboard sync service
2. Integrate with `DesktopDiscoveryService` for peer communication
3. Add `ClipboardBloc` for state management

**Implementation:**
```dart
import 'package:syncstuff_core/syncstuff_core.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DesktopClipboardSyncService {
  final ClipboardSyncService _clipboardService;
  final DesktopDiscoveryService _discoveryService;
  
  DesktopClipboardSyncService({
    required ClipboardSyncService clipboardService,
    required DesktopDiscoveryService discoveryService,
  }) : _clipboardService = clipboardService,
       _discoveryService = discoveryService;
  
  void start() {
    _clipboardService.startMonitoring();
    
    // Listen for local clipboard changes
    _clipboardService.clipboardStream.listen((item) {
      _broadcastToPeers(item);
    });
    
    // Listen for peer clipboard changes
    _discoveryService.peerMessages.listen((message) {
      if (message['type'] == 'clipboard') {
        _handlePeerClipboard(message);
      }
    });
  }
  
  void _broadcastToPeers(ClipboardItem item) {
    final peers = _discoveryService.discoveredDevices;
    for (final peer in peers) {
      _sendClipboardToPeer(peer, item);
    }
  }
  
  Future<void> _sendClipboardToPeer(SyncDevice peer, ClipboardItem item) async {
    // Send via HTTP or WebSocket
    try {
      final client = HttpClient();
      final request = await client.postUrl(
        Uri.parse('http://${peer.ip}:${peer.port}/api/clipboard'),
      );
      request.headers.contentType = ContentType.json;
      request.write(jsonEncode({
        'content': item.content,
        'contentType': item.contentType,
        'deviceId': item.deviceId,
        'deviceName': item.deviceName,
      }));
      await request.close();
    } catch (e) {
      // Peer unreachable
    }
  }
  
  void _handlePeerClipboard(Map<String, dynamic> message) {
    final content = message['content'] as String;
    _clipboardService.setClipboardContent(content);
  }
}
```

#### 2.4 Update Desktop Service Locator

**File:** `apps/desktop/lib/core/di/service_locator.dart`

**Changes:**
1. Register `ClipboardSyncService`
2. Register `DesktopClipboardSyncService`
3. Start clipboard monitoring on app launch

**Implementation:**
```dart
Future<void> setupServiceLocator() async {
  // ... existing registrations ...
  
  // Add clipboard sync
  final clipboardService = ClipboardSyncService();
  getIt.registerSingleton(clipboardService);
  
  final desktopClipboardSync = DesktopClipboardSyncService(
    clipboardService: clipboardService,
    discoveryService: getIt<DesktopDiscoveryService>(),
  );
  getIt.registerSingleton(desktopClipboardSync);
  
  // Start clipboard monitoring
  desktopClipboardSync.start();
}
```

#### 2.5 Implement Clipboard Sync in CLI

**File:** `apps/cli_dart/lib/src/services/clipboard_sync_service.dart` (new)

**Changes:**
1. Create CLI-specific clipboard sync service
2. Integrate with `ServerService` for peer communication
3. Add clipboard monitoring to serve command

**Implementation:**
```dart
import 'package:clipboard/clipboard.dart';

class CliClipboardSyncService {
  final ServerService _serverService;
  Timer? _pollTimer;
  String? _lastClipboardContent;
  
  CliClipboardSyncService({required ServerService serverService})
    : _serverService = serverService;
  
  void start() {
    _pollTimer = Timer.periodic(Duration(seconds: 2), (_) => _checkClipboard());
    
    // Listen for peer clipboard updates
    _serverService.onClipboardUpdate = _handlePeerClipboard;
  }
  
  void stop() {
    _pollTimer?.cancel();
    _pollTimer = null;
  }
  
  Future<void> _checkClipboard() async {
    try {
      final content = await Clipboard.read();
      if (content != null && content != _lastClipboardContent) {
        _lastClipboardContent = content;
        _broadcastToPeers(content);
      }
    } catch (e) {
      // Clipboard access failed
    }
  }
  
  void _broadcastToPeers(String content) {
    final peers = _serverService.connectedDevices;
    for (final peer in peers) {
      _sendClipboardToPeer(peer, content);
    }
  }
  
  Future<void> _sendClipboardToPeer(Map<String, dynamic> peer, String content) async {
    try {
      final client = HttpClient();
      final request = await client.postUrl(
        Uri.parse('http://${peer['ip']}:${peer['port']}/api/clipboard'),
      );
      request.headers.contentType = ContentType.json;
      request.write(jsonEncode({'content': content}));
      await request.close();
    } catch (e) {
      // Peer unreachable
    }
  }
  
  void _handlePeerClipboard(String content) {
    Clipboard.write(content);
    _lastClipboardContent = content;
  }
}
```

#### 2.6 Update CLI Serve Command

**File:** `apps/cli_dart/bin/main.dart`

**Changes:**
1. Initialize clipboard sync service in `cmdServe`
2. Start clipboard monitoring alongside HTTP/TCP servers
3. Update `/api/clipboard` endpoint to read/write real clipboard

**Implementation:**
```dart
Future<void> cmdServe(List<String> args) async {
  // ... existing server setup ...
  
  // Initialize clipboard sync
  final clipboardSync = CliClipboardSyncService(
    serverService: serverService,
  );
  clipboardSync.start();
  
  // Update HTTP server clipboard endpoint
  _httpServer.listen((request) {
    if (request.uri.path == '/api/clipboard') {
      if (request.method == 'GET') {
        final content = Clipboard.read();
        _respondWithJson(request, {'clipboard': content});
      } else if (request.method == 'POST') {
        final body = jsonDecode(await utf8.decoder.bind(request).join());
        Clipboard.write(body['content']);
        _respondWithJson(request, {'success': true});
      }
    }
  });
  
  // ... rest of serve command ...
}
```

---

### Phase 3: Make CLI Seamless (Priority: Medium)

#### 3.1 Add Daemon Mode

**File:** `apps/cli_dart/bin/main.dart`

**Changes:**
1. Add `--daemon` flag to `serve` command
2. Implement process detachment on Linux/macOS
3. Implement Windows Service registration

**Implementation:**
```dart
Future<void> cmdServe(List<String> args) async {
  final parser = ArgParser();
  parser.addFlag('daemon', abbr: 'd', help: 'Run as background daemon');
  parser.addOption('port', abbr: 'p', defaultsTo: '8765');
  
  final results = parser.parse(args);
  
  if (results['daemon'] as bool) {
    await _startDaemon(results);
  } else {
    await _startForeground(results);
  }
}

Future<void> _startDaemon(ArgResults results) async {
  // Linux/macOS: fork and detach
  if (Platform.isLinux || Platform.isMacOS) {
    final pid = await Process.start('nohup', [
      Platform.resolvedExecutable,
      'serve',
      '--port', results['port'],
    ], mode: ProcessStartMode.detached);
    
    print('Started daemon with PID: ${pid.pid}');
    exit(0);
  }
  
  // Windows: start as background process
  if (Platform.isWindows) {
    await Process.start('cmd', [
      '/c', 'start', '/b',
      Platform.resolvedExecutable,
      'serve',
      '--port', results['port'],
    ]);
    
    print('Started background process');
    exit(0);
  }
}
```

#### 3.2 Add Auto-Start on Boot

**File:** `apps/cli_dart/lib/src/commands/service_commands.dart`

**Changes:**
1. Add `install` command to register as system service
2. Add `uninstall` command to remove service
3. Platform-specific service registration

**Implementation:**
```dart
class InstallCommand extends BaseCommand {
  @override
  String get name => 'install';
  
  @override
  String get description => 'Install syncstuff as system service';
  
  @override
  Future<void> run() async {
    if (Platform.isLinux) {
      await _installLinuxService();
    } else if (Platform.isMacOS) {
      await _installMacService();
    } else if (Platform.isWindows) {
      await _installWindowsService();
    }
  }
  
  Future<void> _installLinuxService() async {
    final serviceContent = '''
[Unit]
Description=SyncStuff File Sync Service
After=network.target

[Service]
Type=simple
ExecStart=${Platform.resolvedExecutable} serve
Restart=always
RestartSec=10

[Install]
WantedBy=default.target
''';
    
    final servicePath = '${Platform.environment['HOME']}/.config/systemd/user/syncstuff.service';
    await File(servicePath).writeAsString(serviceContent);
    
    await Process.run('systemctl', ['--user', 'enable', 'syncstuff']);
    await Process.run('systemctl', ['--user', 'start', 'syncstuff']);
    
    print('Service installed and started');
  }
  
  Future<void> _installMacService() async {
    final plistContent = '''
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.syncstuff.service</string>
    <key>ProgramArguments</key>
    <array>
        <string>${Platform.resolvedExecutable}</string>
        <string>serve</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
''';
    
    final plistPath = '${Platform.environment['HOME']}/Library/LaunchAgents/com.syncstuff.service.plist';
    await File(plistPath).writeAsString(plistContent);
    
    await Process.run('launchctl', ['load', plistPath]);
    
    print('Service installed and started');
  }
  
  Future<void> _installWindowsService() async {
    // Use sc.exe to register Windows service
    await Process.run('sc.exe', [
      'create',
      'SyncStuff',
      'binPath=', '${Platform.resolvedExecutable} serve',
      'start=', 'auto',
    ]);
    
    await Process.run('sc.exe', ['start', 'SyncStuff']);
    
    print('Service installed and started');
  }
}
```

#### 3.3 Add System Tray Support (Optional Enhancement)

**File:** `apps/cli_dart/lib/src/services/system_tray_service.dart` (new)

**Changes:**
1. Add system tray icon for status indication
2. Add context menu for quick actions
3. Show notifications for clipboard sync events

**Note:** This is a more advanced feature and may require additional packages. Consider implementing in Phase 4.

#### 3.4 Update CLI Entry Point

**File:** `apps/cli_dart/bin/main.dart`

**Changes:**
1. Add `install` and `uninstall` commands
2. Add `status` command to check service status
3. Update help text with new commands

**Implementation:**
```dart
void main(List<String> args) {
  if (args.isEmpty) {
    _printHelp();
    return;
  }
  
  final command = args[0];
  final commandArgs = args.sublist(1);
  
  switch (command) {
    case 'serve':
      cmdServe(commandArgs);
      break;
    case 'install':
      InstallCommand().run();
      break;
    case 'uninstall':
      UninstallCommand().run();
      break;
    case 'status':
      StatusCommand().run();
      break;
    // ... existing commands ...
  }
}
```

---

### Phase 4: Integration & Testing (Priority: High)

#### 4.1 Update Mobile App to Discover Desktop

**File:** `apps/mobile/lib/data/services/discovery_service.dart`

**Changes:**
1. Ensure mobile listens for UDP broadcasts on port 8767
2. Parse desktop broadcast messages
3. Add desktop devices to discovered list

**Verification:**
- Desktop should appear in mobile's device list
- Mobile should appear in desktop's device list

#### 4.2 Test Cross-Platform Clipboard Sync

**Test Cases:**
1. Copy text on desktop → Verify it appears on mobile
2. Copy text on mobile → Verify it appears on desktop
3. Copy text on CLI → Verify it appears on mobile/desktop
4. Copy text on mobile → Verify it appears on CLI

#### 4.3 Test Seamless CLI Sync

**Test Cases:**
1. Run `syncstuff serve --daemon` → Verify process runs in background
2. Restart system → Verify service starts automatically
3. Copy text on mobile → Verify CLI receives it
4. Copy text on CLI → Verify mobile receives it

---

## Dependencies & Package Requirements

### Desktop App (apps/desktop)

No new dependencies required - uses `dart:io` for UDP and WebSocket.

### CLI App (apps/cli_dart)

Add to `pubspec.yaml`:
```yaml
dependencies:
  clipboard: ^0.1.3  # Cross-platform clipboard access
```

### packages/core

No new dependencies required.

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| UDP broadcast blocked by firewall | High | Document firewall configuration; add HTTP fallback |
| Clipboard access denied on some systems | Medium | Graceful error handling; manual clipboard paste option |
| WebSocket connection drops | Medium | Implement reconnection logic; fallback to HTTP |
| Windows Service registration requires admin | Medium | Check for admin privileges; provide manual instructions |
| Cross-platform clipboard format differences | Low | Stick to plain text; document limitations |

---

## Success Criteria

1. ✅ Desktop app appears in mobile's discovered devices list
2. ✅ Mobile app appears in desktop's discovered devices list
3. ✅ Copy text on desktop → appears on mobile within 2 seconds
4. ✅ Copy text on mobile → appears on desktop within 2 seconds
5. ✅ `syncstuff serve --daemon` runs in background
6. ✅ `syncstuff install` registers system service
7. ✅ System restart → service starts automatically
8. ✅ CLI clipboard sync works with mobile/desktop

---

## Timeline Estimate

- **Phase 1 (Desktop Discovery):** 4-6 hours
- **Phase 2 (Clipboard Sync):** 6-8 hours
- **Phase 3 (Seamless CLI):** 4-6 hours
- **Phase 4 (Integration Testing):** 2-4 hours

**Total:** 16-24 hours

---

## Next Steps

1. Review this plan with the team
2. Prioritize phases based on user needs
3. Begin implementation with Phase 1
4. Test each phase before moving to the next
