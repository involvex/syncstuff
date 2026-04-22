import 'dart:async';
import 'dart:io';
import 'dart:convert';

import 'package:uuid/uuid.dart';
import 'package:path/path.dart' as path;

/// Simple SyncStuff CLI - works reliably in all terminals
class SyncStuffCLI {
  final Config config;
  final _uuid = const Uuid();
  HttpServer? _httpServer;
  ServerSocket? _tcpServer;
  final _devices = <Device>[];
  String _localIp = 'unknown';

  SyncStuffCLI(this.config);

  String get deviceId => config.deviceId ?? _uuid.v4();

  /// Get local IP by listing network interfaces
  Future<String> _getLocalIp() async {
    try {
      // Get all network interfaces
      final interfaces = await NetworkInterface.list();
      for (final iface in interfaces) {
        for (final addr in iface.addresses) {
          // Prefer IPv4 addresses that are not loopback
          if (addr.type == InternetAddressType.IPv4 && !addr.isLoopback) {
            _localIp = addr.address;
            return _localIp;
          }
        }
      }
    } catch (_) {}
    _localIp = 'localhost';
    return _localIp;
  }

  Future<void> run(List<String> args) async {
    if (args.isEmpty) {
      await interactiveMode();
      return;
    }

    final cmd = args[0].toLowerCase();
    switch (cmd) {
      case 'status':
        await cmdStatus();
      case 'scan':
        await cmdScan();
      case 'serve':
        await cmdServe(args);
      case 'device':
        await cmdDevice(args);
      case 'transfer':
        await cmdTransfer(args);
      case 'clipboard':
        await cmdClipboard(args);
      case 'help':
        cmdHelp();
      default:
        print('Unknown command: $cmd');
        print('Run "syncstuff help" for available commands');
    }
  }

  Future<void> interactiveMode() async {
    print('''
╔═══════════════════════════════════════════════════════════════╗
║                   ⚡ SyncStuff CLI ⚡                      ║
║         P2P File Sync & Clipboard Sharing                ║
╠═══════════════════════════════════════════════════════════════╣
║  Type "help" for commands, "exit" to quit               ║
╚═══════════════════════════════════════════════════════════════╝
''');

    while (true) {
      stdout.write('\n➜ ');
      final input = stdin.readLineSync();
      if (input == null || input.toLowerCase() == 'exit') {
        print('Goodbye!');
        break;
      }
      if (input.trim().isEmpty) continue;

      final parts = input.trim().split(RegExp(r'\s+'));
      final cmd = parts[0].toLowerCase();
      final cmdArgs = parts.sublist(1);

      try {
        switch (cmd) {
          case 'help':
            cmdHelp();
          case 'status':
            await cmdStatus();
          case 'scan':
            await cmdScan();
          case 'serve':
            await cmdServe(cmdArgs);
          case 'device':
            await cmdDevice(cmdArgs);
          case 'transfer':
            await cmdTransfer(cmdArgs);
          case 'clipboard':
            await cmdClipboard(cmdArgs);
          case 'clear':
            print('\x1B[2J\x1B[H');
          default:
            print('Unknown command: $cmd');
        }
      } catch (e) {
        print('Error: $e');
      }
    }
  }

  void cmdHelp() {
    print('''
📚 Available Commands:

  status       Show system status
  scan         Scan for devices on network
  serve [port] Start HTTP server (default: 8765)
  device       List connected devices
  transfer     Manage file transfers
  clipboard   Clipboard operations
  help         Show this help
  exit         Exit interactive mode

🌐 Examples:
  > status
  > scan
  > serve 8080
  > device list

🔗 API Endpoints (when server running):
  http://localhost:8765/api/status
  http://localhost:8765/api/devices
  http://localhost:8765/api/clipboard
''');
  }

  Future<void> cmdStatus() async {
    print('''
┌─ System Status ─────────────────────────────┐
│ 🟢 SyncStuff CLI v0.1.0
│ ${_tcpServer != null ? '🟢 Server running on :${_tcpServer!.port}' : '🔴 Server not running'}
│ 📱 ${_devices.length} devices connected
│ 🆔 Device ID: ${deviceId.substring(0, 8)}...
└────────────────────────────────────────────┘''');
  }

  Future<void> cmdScan() async {
    print('🔍 Scanning network...');

    // Simulate scan - in real impl would do mDNS/UDP discovery
    await Future.delayed(Duration(milliseconds: 500));

    _devices.clear();
    _devices.add(Device('Android Phone', 'android', '192.168.1.100', true));
    _devices.add(Device('Windows PC', 'windows', '192.168.1.101', false));

    print('✅ Found ${_devices.length} devices:');
    for (final d in _devices) {
      print(
        '   📱 ${d.name} (${d.platform}) - ${d.ip} ${d.connected ? "🟢" : "⚪"}',
      );
    }
  }

  Future<void> cmdServe(List<String> args) async {
    final port = args.isNotEmpty ? int.tryParse(args[0]) ?? 8765 : 8765;

    if (_httpServer != null || _tcpServer != null) {
      print('🔴 Server already running on port $port');
      return;
    }

    // Get local IP first
    final localIp = await _getLocalIp();
    print('🚀 Starting server on port $port (IP: $localIp)...');

    try {
      // Start TCP server for device discovery (raw TCP, receives JSON probes)
      _tcpServer = await ServerSocket.bind(InternetAddress.anyIPv4, port);
      print('✅ TCP server started on port $port');

      // HTTP server for API on next port
      _httpServer = await HttpServer.bind(InternetAddress.anyIPv4, port + 1);

      print('''
✅ Server running!

   Local IP: $localIp
   Device Discovery: port $port (TCP)
   API: http://$localIp:${port + 1}/api/status

   Press Ctrl+C to stop...
''');

      // Handle both TCP and HTTP concurrently
      await Future.wait([_handleTcpConnections(), _handleHttpRequests()]);
    } catch (e) {
      print('❌ Failed to start server: $e');
    }
  }

  Future<void> _handleTcpConnections() async {
    await for (final socket in _tcpServer!) {
      _handleTcpClient(socket);
    }
  }

  Future<void> _handleTcpClient(Socket socket) async {
    try {
      final addr = socket.remoteAddress.address;
      print('📥 TCP connection from $addr');
      print('   Remote port: ${socket.remotePort}');

      // Read all data from client
      final list = <int>[];
      await for (final b in socket) {
        list.addAll(b);
      }
      final jsonStr = String.fromCharCodes(list);
      final json = jsonDecode(jsonStr) as Map<String, dynamic>;

      if (json['type'] == 'probe') {
        // Respond with device info
        final response = jsonEncode({
          'type': 'announce',
          'id': deviceId,
          'name': 'SyncStuff CLI',
          'platform': 'cli',
          'ip': _localIp,
          'port': 8765,
          'version': '0.1.0',
        });
        socket.write(response);
      }

      await socket.close();
    } catch (e) {
      await socket.close();
    }
  }

  Future<void> _handleHttpRequests() async {
    await for (final request in _httpServer!) {
      _handleRequest(request);
    }
  }

  void _handleRequest(HttpRequest request) async {
    final path = request.uri.path;
    final response = request.response;

    try {
      if (path == '/debug/scan') {
        // Test endpoint - check if phone can reach us
        print('📥 HTTP debug scan from ${request.uri}');
      }
      final remoteIp =
          request.connectionInfo?.remoteAddress.address ?? 'unknown';
      print('📥 HTTP request: $path from $remoteIp');
      if (path == '/api/probe' || path.startsWith('/api/probe?')) {
        // HTTP probe endpoint for discovery
        response.headers.contentType = ContentType.json;
        response.write(
          jsonEncode({
            'type': 'announce',
            'id': deviceId,
            'name': 'SyncStuff CLI',
            'platform': 'cli',
            'ip': _localIp.isNotEmpty && _localIp != 'unknown'
                ? _localIp
                : 'localhost',
            'port': 8765,
            'version': '0.1.0',
          }),
        );
      } else if (path == '/api/connect') {
        // Simple connection tracking
        final peerIp = request.uri.queryParameters['peer'] ?? remoteIp;
        print('🔗 Peer connected: $peerIp');

        response.headers.contentType = ContentType.json;
        response.write(jsonEncode({'connected': true, 'peer': remoteIp}));
      } else if (path == '/api/send') {
        // Simple HTTP file send: /api/send?name=file.txt
        final fileName = request.uri.queryParameters['name'] ?? 'file';
        final size = request.uri.queryParameters['size'] ?? '0';

        print('📥 File incoming: $fileName ($size bytes) from $remoteIp');

        // Just acknowledge - actual transfer happens via upload endpoint
        response.headers.contentType = ContentType.json;
        response.write(jsonEncode({'ready': true, 'fileName': fileName}));
      } else if (path == '/api/status') {
        response.headers.contentType = ContentType.json;
        response.write(
          jsonEncode({
            'status': 'online',
            'deviceId': deviceId,
            'platform': 'cli',
            'version': '0.1.0',
          }),
        );
      } else if (path == '/api/upload' || path.startsWith('/api/upload?')) {
        // File upload endpoint
        print('📤 File upload request from $remoteIp');
        final contentType =
            request.headers.contentType?.mimeType ?? 'application/octet-stream';

        // Read the file data
        final data = await request.fold<List<int>>(
          [],
          (prev, chunk) => prev..addAll(chunk),
        );

        // Get filename from query params or generate one
        final uri = request.uri;
        var fileName = uri.queryParameters['name'] ?? 'received_file';

        // Save to downloads folder
        final downloadsDir = Directory('downloads');
        if (!await downloadsDir.exists()) {
          await downloadsDir.create(recursive: true);
        }
        final filePath = '${downloadsDir.path}/$fileName';
        final file = File(filePath);
        await file.writeAsBytes(data);

        print('📥 Saved file: $fileName (${data.length} bytes)');

        response.headers.contentType = ContentType.json;
        response.write(
          jsonEncode({
            'success': true,
            'fileName': fileName,
            'size': data.length,
          }),
        );
      } else if (path.startsWith('/api/download') ||
          path.startsWith('/files/')) {
        // File download endpoint
        final uri = request.uri;
        final fileName =
            uri.queryParameters['file'] ?? uri.path.split('/').last;
        final file = File('downloads/$fileName');

        if (await file.exists()) {
          final data = await file.readAsBytes();
          print('📤 Sending file: $fileName (${data.length} bytes)');
          response.headers.set('Content-Length', data.length);
          response.headers.set(
            'Content-Disposition',
            'attachment; filename="$fileName"',
          );
          response.add(data);
        } else {
          response.statusCode = HttpStatus.notFound;
          response.write('File not found: $fileName');
        }
      } else if (path == '/api/devices') {
        response.headers.contentType = ContentType.json;
        response.write(
          jsonEncode({
            'devices': _devices
                .map(
                  (d) => {
                    'id': d.ip,
                    'name': d.name,
                    'platform': d.platform,
                    'ip': d.ip,
                  },
                )
                .toList(),
          }),
        );
      } else if (path == '/api/clipboard') {
        response.headers.contentType = ContentType.json;
        response.write(jsonEncode({'clipboard': ''}));
      } else if (path == '/' || path.isEmpty) {
        response.headers.contentType = ContentType.html;
        response.write('''
<!DOCTYPE html>
<html><head><title>SyncStuff CLI</title></head>
<body><h1>⚡ SyncStuff CLI</h1>
<p>Server running. API available at /api/*</p>
</body></html>''');
      } else {
        response.statusCode = HttpStatus.notFound;
        response.write('Not Found');
      }
      await response.close();
    } catch (e) {
      response.statusCode = HttpStatus.internalServerError;
      response.write('Error: $e');
      await response.close();
    }
  }

  Future<void> cmdDevice(List<String> args) async {
    if (args.isEmpty || args[0] == 'list') {
      if (_devices.isEmpty) {
        print('📱 No devices. Run "scan" first.');
      } else {
        print('┌─ Connected Devices ─────────────────────────┐');
        for (final d in _devices) {
          print('│ 📱 ${d.name.padRight(20)} ${d.connected ? "🟢" : "⚪"}');
        }
        print('└────────────────────────────────────────────┘');
      }
    }
  }

  Future<void> cmdTransfer(List<String> args) async {
    print('📁 Transfer Manager');
    print('   (not implemented yet)');
  }

  Future<void> cmdClipboard(List<String> args) async {
    print('📋 Clipboard Operations');
    print('   (not implemented yet)');
  }
}

class Device {
  final String name;
  final String platform;
  final String ip;
  final bool connected;
  Device(this.name, this.platform, this.ip, this.connected);
}

class Config {
  final String? deviceId;
  final String apiHost;
  final int apiPort;

  Config({this.deviceId, this.apiHost = 'localhost', this.apiPort = 8765});

  static Config load() {
    final configPath = _configPath();
    if (FileSystemEntity.typeSync(configPath) == FileSystemEntityType.file) {
      try {
        final content = File(configPath).readAsStringSync();
        final json = jsonDecode(content) as Map<String, dynamic>;
        return Config(
          deviceId: json['deviceId'] as String?,
          apiHost: json['apiHost'] as String? ?? 'localhost',
          apiPort: json['apiPort'] as int? ?? 8765,
        );
      } catch (_) {}
    }
    return Config();
  }

  static String _configPath() {
    final home =
        Platform.environment['HOME'] ??
        Platform.environment['USERPROFILE'] ??
        '.';
    return path.join(home, '.config', 'syncstuff', 'config.json');
  }
}

void main(List<String> args) async {
  final config = Config.load();
  final cli = SyncStuffCLI(config);
  await cli.run(args);
}
