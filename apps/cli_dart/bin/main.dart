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
  RawDatagramSocket? _udpSocket;
  final _devices = <Device>[];
  String _localIp = 'unknown';
  String _clipboardContent = '';
  DateTime? _lastClipboardUpdate;
  Timer? _clipboardTimer;
  Timer? _broadcastTimer;
  bool _clipboardSyncEnabled = true;

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

  /// Get system clipboard content
  Future<String> _getClipboard() async {
    try {
      if (Platform.isWindows) {
        // Use PowerShell to get clipboard on Windows
        final result = await Process.run('powershell', [
          '-command',
          'Get-Clipboard -Raw',
        ]);
        if (result.exitCode == 0) {
          return (result.stdout as String).trim();
        }
      } else if (Platform.isLinux) {
        // Use xclip on Linux
        final result = await Process.run('xclip', [
          '-selection',
          'clipboard',
          '-o',
        ]);
        if (result.exitCode == 0) {
          return (result.stdout as String).trim();
        }
      } else if (Platform.isMacOS) {
        // Use pbpaste on macOS
        final result = await Process.run('pbpaste', []);
        if (result.exitCode == 0) {
          return (result.stdout as String).trim();
        }
      }
    } catch (_) {}
    return '';
  }

  /// Set system clipboard content
  Future<void> _setClipboard(String content) async {
    try {
      if (Platform.isWindows) {
        // Use PowerShell to set clipboard on Windows
        await Process.run('powershell', [
          '-command',
          'Set-Clipboard -Value "$content"',
        ]);
      } else if (Platform.isLinux) {
        // Use xclip on Linux
        final process = await Process.start('xclip', [
          '-selection',
          'clipboard',
        ]);
        process.stdin.write(content);
        await process.stdin.close();
      } else if (Platform.isMacOS) {
        // Use pbcopy on macOS
        final process = await Process.start('pbcopy', []);
        process.stdin.write(content);
        await process.stdin.close();
      }
    } catch (_) {}
  }

  Future<void> run(List<String> args) async {
    if (args.isEmpty) {
      // Auto-serve when launched without arguments
      await cmdServe([]);
      return;
    }

    final cmd = args[0].toLowerCase();
    switch (cmd) {
      case 'status':
        await cmdStatus();
      case 'scan':
        await cmdScan();
      case 'serve':
        await cmdServe(args.sublist(1));
      case 'device':
        await cmdDevice(args);
      case 'transfer':
        await cmdTransfer(args);
      case 'clipboard':
        await cmdClipboard(args.sublist(1));
      case 'completions':
        await cmdCompletions(args.sublist(1));
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
          case 'completions':
            await cmdCompletions(cmdArgs);
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
  completions  Generate shell completions
  help         Show this help
  exit         Exit interactive mode

🌐 Examples:
  > status
  > scan
  > serve 8080
  > device list
  > completions powershell

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

    // Get local IP first
    await _getLocalIp();
    final subnet = _localIp.substring(0, _localIp.lastIndexOf('.'));

    _devices.clear();

    // Scan in parallel batches
    final futures = <Future<void>>[];
    for (int i = 1; i <= 254; i += 10) {
      final batch = <String>[];
      for (int j = 0; j < 10 && i + j <= 254; j++) {
        batch.add('$subnet.${i + j}');
      }
      futures.add(_scanBatch(batch));
    }

    await Future.wait(futures);

    if (_devices.isEmpty) {
      print('No devices found on network');
    } else {
      print('✅ Found ${_devices.length} devices:');
      for (final d in _devices) {
        print(
          '   📱 ${d.name} (${d.platform}) - ${d.ip} ${d.connected ? "🟢" : "⚪"}',
        );
      }
    }
  }

  Future<void> _scanBatch(List<String> ips) async {
    final futures = ips.map((ip) => _probeDevice(ip));
    await Future.wait(futures);
  }

  Future<void> _probeDevice(String ip) async {
    if (ip == _localIp) return;

    try {
      final client = HttpClient();
      client.connectionTimeout = Duration(milliseconds: 200);
      final request = await client.getUrl(
        Uri.parse('http://$ip:8766/api/probe'),
      );
      final response = await request.close().timeout(
        Duration(milliseconds: 200),
      );

      if (response.statusCode == 200) {
        final body = await response.transform(utf8.decoder).join();
        final data = jsonDecode(body) as Map<String, dynamic>;

        if (data['id'] != deviceId) {
          _devices.add(
            Device(
              data['name'] as String? ?? 'Unknown',
              data['platform'] as String? ?? 'unknown',
              ip,
              true,
            ),
          );
        }
      }
      client.close();
    } catch (_) {}
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

      // Start UDP broadcast listener
      await _startBroadcastListener();

      // Start clipboard sync
      await _startClipboardSync();

      // Broadcast presence periodically
      _broadcastTimer = Timer.periodic(
        Duration(seconds: 3),
        (_) => _broadcastPresence(),
      );

      // Initial broadcast
      await _broadcastPresence();

      print('''
✅ Server running!

   Local IP: $localIp
   Device Discovery: port $port (TCP)
   API: http://$localIp:${port + 1}/api/status
   Clipboard Sync: ${_clipboardSyncEnabled ? '🟢 Enabled' : '🔴 Disabled'}

   Press Ctrl+C to stop...
''');

      // Handle both TCP and HTTP concurrently
      await Future.wait([_handleTcpConnections(), _handleHttpRequests()]);
    } catch (e) {
      print('❌ Failed to start server: $e');
    }
  }

  Future<void> _startBroadcastListener() async {
    try {
      _udpSocket = await RawDatagramSocket.bind(
        InternetAddress.anyIPv4,
        8767,
        reuseAddress: true,
      );
      _udpSocket!.broadcastEnabled = true;

      _udpSocket!.listen((event) {
        if (event == RawSocketEvent.read) {
          final datagram = _udpSocket!.receive();
          if (datagram != null) {
            _handleBroadcastMessage(datagram.data, datagram.address);
          }
        }
      });
    } catch (e) {
      print('Failed to start broadcast listener: $e');
    }
  }

  void _handleBroadcastMessage(List<int> data, InternetAddress address) {
    // Ignore messages from our own IP
    if (address.address == _localIp) return;

    try {
      final message = utf8.decode(data);
      final info = jsonDecode(message) as Map<String, dynamic>;

      if (info['type'] == 'announce') {
        // Add to discovered devices if not already there
        final exists = _devices.any((d) => d.ip == address.address);
        if (!exists) {
          _devices.add(
            Device(
              info['name'] as String? ?? 'Unknown',
              info['platform'] as String? ?? 'unknown',
              address.address,
              true,
            ),
          );
          print('📱 Discovered device: ${info['name']} at ${address.address}');
        }
      }
    } catch (_) {}
  }

  Future<void> _broadcastPresence() async {
    try {
      final socket = await RawDatagramSocket.bind(
        InternetAddress.anyIPv4,
        0,
        reuseAddress: true,
      );
      socket.broadcastEnabled = true;

      final message = jsonEncode({
        'type': 'announce',
        'id': deviceId,
        'name': 'SyncStuff CLI',
        'platform': 'cli',
        'ip': _localIp,
        'port': 8765,
        'version': '0.1.0',
      });

      // Broadcast to all devices on local network
      final broadcastAddress = InternetAddress('255.255.255.255');
      socket.send(utf8.encode(message), broadcastAddress, 8767);

      // Also send to subnet broadcast
      if (_localIp != 'localhost' && _localIp.contains('.')) {
        final subnetParts = _localIp.split('.');
        final subnetBroadcast =
            '${subnetParts[0]}.${subnetParts[1]}.${subnetParts[2]}.255';
        socket.send(
          utf8.encode(message),
          InternetAddress(subnetBroadcast),
          8767,
        );
      }

      socket.close();
    } catch (e) {
      print('Failed to broadcast presence: $e');
    }
  }

  Future<void> _startClipboardSync() async {
    // Get initial clipboard content
    _clipboardContent = await _getClipboard();

    // Poll clipboard every 2 seconds
    _clipboardTimer = Timer.periodic(
      Duration(seconds: 2),
      (_) => _checkClipboard(),
    );
  }

  Future<void> _checkClipboard() async {
    if (!_clipboardSyncEnabled) return;

    try {
      final content = await _getClipboard();
      if (content.isNotEmpty && content != _clipboardContent) {
        _clipboardContent = content;
        _lastClipboardUpdate = DateTime.now();
        await _broadcastClipboard(content);
      }
    } catch (_) {}
  }

  Future<void> _broadcastClipboard(String content) async {
    // Send to all known devices
    for (final device in _devices) {
      await _sendClipboardToPeer(device, content);
    }
  }

  Future<void> _sendClipboardToPeer(Device peer, String content) async {
    try {
      final client = HttpClient();
      client.connectionTimeout = Duration(seconds: 2);

      final request = await client.postUrl(
        Uri.parse('http://${peer.ip}:8766/api/clipboard'),
      );

      request.headers.contentType = ContentType.json;
      request.write(
        jsonEncode({
          'content': content,
          'deviceId': deviceId,
          'deviceName': 'SyncStuff CLI',
        }),
      );

      await request.close();
      client.close();
    } catch (e) {
      // Peer unreachable
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
      } else if (path == '/api/clipboard' && request.method == 'GET') {
        response.headers.contentType = ContentType.json;
        response.write(
          jsonEncode({
            'content': _clipboardContent,
            'lastUpdate': _lastClipboardUpdate?.toIso8601String(),
          }),
        );
      } else if (path == '/api/clipboard' && request.method == 'POST') {
        // Receive clipboard from peer
        final body = await request.fold<List<int>>(
          [],
          (prev, chunk) => prev..addAll(chunk),
        );
        final data = jsonDecode(utf8.decode(body)) as Map<String, dynamic>;
        final content = data['content'] as String? ?? '';
        final deviceId = data['deviceId'] as String?;

        // Don't apply our own clipboard updates
        if (deviceId != this.deviceId && content != _clipboardContent) {
          await _setClipboard(content);
          _clipboardContent = content;
          _lastClipboardUpdate = DateTime.now();
          print('📋 Clipboard synced from peer');
        }

        response.headers.contentType = ContentType.json;
        response.write(jsonEncode({'success': true}));
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
    if (args.isEmpty || args[0] == 'status') {
      print('📋 Clipboard Sync Status');
      print('   Enabled: ${_clipboardSyncEnabled ? "🟢" : "🔴"}');
      print('   Last Update: ${_lastClipboardUpdate ?? "Never"}');
      print('   Content Length: ${_clipboardContent.length} chars');
    } else if (args[0] == 'enable') {
      _clipboardSyncEnabled = true;
      print('📋 Clipboard sync enabled');
    } else if (args[0] == 'disable') {
      _clipboardSyncEnabled = false;
      print('📋 Clipboard sync disabled');
    } else if (args[0] == 'get') {
      final content = await _getClipboard();
      print('📋 Clipboard content:');
      print(content);
    } else if (args[0] == 'set' && args.length > 1) {
      final content = args.sublist(1).join(' ');
      await _setClipboard(content);
      _clipboardContent = content;
      _lastClipboardUpdate = DateTime.now();
      print('📋 Clipboard updated');
    } else {
      print('📋 Clipboard Commands:');
      print('   status   - Show clipboard sync status');
      print('   enable   - Enable clipboard sync');
      print('   disable  - Disable clipboard sync');
      print('   get      - Get current clipboard content');
      print('   set <text> - Set clipboard content');
    }
  }

  void dispose() {
    _clipboardTimer?.cancel();
    _broadcastTimer?.cancel();
    _udpSocket?.close();
    _httpServer?.close();
    _tcpServer?.close();
  }

  Future<void> cmdCompletions(List<String> args) async {
    final shell = args.isNotEmpty ? args[0].toLowerCase() : 'powershell';

    switch (shell) {
      case 'powershell':
      case 'pwsh':
        print(_generatePowerShellCompletions());
        break;
      case 'bash':
        print(_generateBashCompletions());
        break;
      case 'zsh':
        print(_generateZshCompletions());
        break;
      case 'fish':
        print(_generateFishCompletions());
        break;
      default:
        print('❌ Unsupported shell: $shell');
        print('Supported shells: powershell, bash, zsh, fish');
    }
  }

  String _generatePowerShellCompletions() {
    return '''# PowerShell completions for syncstuff-cli
# Add this to your PowerShell profile:
# syncstuff-cli completions powershell | Out-File -Append \$PROFILE

using namespace System.Management.Automation
using namespace System.Management.Automation.Language

Register-ArgumentCompleter -Native -CommandName 'syncstuff-cli' -ScriptBlock {
    param(\$wordToComplete, \$commandAst, \$cursorPosition)

    \$commandElements = \$commandAst.CommandElements
    \$command = @()
    \$subcommand = \$null

    # Parse command elements
    for (\$i = 1; \$i -lt \$commandElements.Count; \$i++) {
        \$element = \$commandElements[\$i].Extent.Text
        if (\$element -notlike '-*') {
            if (-not \$subcommand) {
                \$command = \$element
            } else {
                \$subcommand = \$element
            }
        }
    }

    # Complete main commands
    if (-not \$command) {
        \$commands = @(
            [CompletionResult]::new('status', 'status', [CompletionResultType]::ParameterValue, 'Show system status')
            [CompletionResult]::new('scan', 'scan', [CompletionResultType]::ParameterValue, 'Scan for devices on network')
            [CompletionResult]::new('serve', 'serve', [CompletionResultType]::ParameterValue, 'Start HTTP server (default: 8765)')
            [CompletionResult]::new('device', 'device', [CompletionResultType]::ParameterValue, 'List connected devices')
            [CompletionResult]::new('transfer', 'transfer', [CompletionResultType]::ParameterValue, 'Manage file transfers')
            [CompletionResult]::new('clipboard', 'clipboard', [CompletionResultType]::ParameterValue, 'Clipboard operations')
            [CompletionResult]::new('completions', 'completions', [CompletionResultType]::ParameterValue, 'Generate shell completions')
            [CompletionResult]::new('help', 'help', [CompletionResultType]::ParameterValue, 'Show this help')
        )
        \$commands | Where-Object { \$_.CompletionText -like "\$wordToComplete*" }
        return
    }

    # Complete subcommands for specific commands
    switch (\$command) {
        'device' {
            if (-not \$subcommand) {
                \$subcommands = @(
                    [CompletionResult]::new('list', 'list', [CompletionResultType]::ParameterValue, 'List devices')
                )
                \$subcommands | Where-Object { \$_.CompletionText -like "\$wordToComplete*" }
            }
        }
        'completions' {
            if (-not \$subcommand) {
                \$subcommands = @(
                    [CompletionResult]::new('powershell', 'powershell', [CompletionResultType]::ParameterValue, 'PowerShell completions')
                    [CompletionResult]::new('bash', 'bash', [CompletionResultType]::ParameterValue, 'Bash completions')
                    [CompletionResult]::new('zsh', 'zsh', [CompletionResultType]::ParameterValue, 'Zsh completions')
                    [CompletionResult]::new('fish', 'fish', [CompletionResultType]::ParameterValue, 'Fish completions')
                )
                \$subcommands | Where-Object { \$_.CompletionText -like "\$wordToComplete*" }
            }
        }
    }
}
''';
  }

  String _generateBashCompletions() {
    return '''# Bash completions for syncstuff-cli
# Add this to your ~/.bashrc:
# eval "\$(syncstuff-cli completions bash)"

_syncstuff_cli_completions() {
    local cur prev words cword
    _init_completion || return

    case \${prev} in
        syncstuff-cli)
            COMPREPLY=(\$(compgen -W "status scan serve device transfer clipboard help completions" -- "\${cur}"))
            ;;
        device)
            COMPREPLY=(\$(compgen -W "list" -- "\${cur}"))
            ;;
        completions)
            COMPREPLY=(\$(compgen -W "powershell bash zsh fish" -- "\${cur}"))
            ;;
        *)
            ;;
    esac
}

complete -F _syncstuff_cli_completions syncstuff-cli
''';
  }

  String _generateZshCompletions() {
    return '''# Zsh completions for syncstuff-cli
# Add this to your ~/.zshrc:
# syncstuff-cli completions zsh > ~/.zsh/completions/_syncstuff-cli

#compdef syncstuff-cli

_syncstuff_cli() {
    local -a commands
    commands=(
        'status:Show system status'
        'scan:Scan for devices on network'
        'serve:Start HTTP server'
        'device:List connected devices'
        'transfer:Manage file transfers'
        'clipboard:Clipboard operations'
        'help:Show this help'
        'completions:Generate shell completions'
    )

    if (( CURRENT == 2 )); then
        _describe 'command' commands
    elif (( CURRENT == 3 )); then
        case \${words[2]} in
            device)
                _describe 'subcommand' 'list:List devices'
                ;;
            completions)
                _describe 'shell' 'powershell:PowerShell completions' 'bash:Bash completions' 'zsh:Zsh completions' 'fish:Fish completions'
                ;;
        esac
    fi
}

_syncstuff_cli
''';
  }

  String _generateFishCompletions() {
    return '''# Fish completions for syncstuff-cli
# Add this to your ~/.config/fish/completions/syncstuff-cli.fish:
# syncstuff-cli completions fish > ~/.config/fish/completions/syncstuff-cli.fish

complete -c syncstuff-cli -f

complete -c syncstuff-cli -n '__fish_use_subcommand' -a status -d 'Show system status'
complete -c syncstuff-cli -n '__fish_use_subcommand' -a scan -d 'Scan for devices on network'
complete -c syncstuff-cli -n '__fish_use_subcommand' -a serve -d 'Start HTTP server'
complete -c syncstuff-cli -n '__fish_use_subcommand' -a device -d 'List connected devices'
complete -c syncstuff-cli -n '__fish_use_subcommand' -a transfer -d 'Manage file transfers'
complete -c syncstuff-cli -n '__fish_use_subcommand' -a clipboard -d 'Clipboard operations'
complete -c syncstuff-cli -n '__fish_use_subcommand' -a help -d 'Show this help'
complete -c syncstuff-cli -n '__fish_use_subcommand' -a completions -d 'Generate shell completions'

complete -c syncstuff-cli -n '__fish_seen_subcommand_from device' -a list -d 'List devices'
complete -c syncstuff-cli -n '__fish_seen_subcommand_from completions' -a powershell -d 'PowerShell completions'
complete -c syncstuff-cli -n '__fish_seen_subcommand_from completions' -a bash -d 'Bash completions'
complete -c syncstuff-cli -n '__fish_seen_subcommand_from completions' -a zsh -d 'Zsh completions'
complete -c syncstuff-cli -n '__fish_seen_subcommand_from completions' -a fish -d 'Fish completions'
''';
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
