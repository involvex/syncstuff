import 'dart:async';
import 'dart:io';
import 'dart:convert';

class ServerService {
  HttpServer? _httpServer;
  ServerSocket? _tcpServer;
  String _localIp = 'unknown';

  void Function(String method, String path, String ip)? onHttpRequest;

  Future<String> getLocalIp() async {
    try {
      final interfaces = await NetworkInterface.list();
      for (final iface in interfaces) {
        for (final addr in iface.addresses) {
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

  String get localIp => _localIp;

  Future<void> start(int port) async {
    await getLocalIp();

    _tcpServer = await ServerSocket.bind(InternetAddress.anyIPv4, port);
    _httpServer = await HttpServer.bind(InternetAddress.anyIPv4, port + 1);

    _handleTcpConnections();
    _handleHttpRequests();
  }

  Future<void> stop() async {
    await _httpServer?.close(force: true);
    await _tcpServer?.close();
    _httpServer = null;
    _tcpServer = null;
  }

  bool get isRunning => _httpServer != null;
  int? get port => _tcpServer?.port;

  void _handleTcpConnections() {
    if (_tcpServer == null) return;
    _tcpServer!.listen((socket) => _handleTcpClient(socket));
  }

  void _handleTcpClient(Socket socket) async {
    try {
      final addr = socket.remoteAddress.address;
      onHttpRequest?.call('TCP', 'probe', addr);

      final list = <int>[];
      await for (final b in socket) {
        list.addAll(b);
      }
      final jsonStr = String.fromCharCodes(list);
      final json = jsonDecode(jsonStr) as Map<String, dynamic>;

      if (json['type'] == 'probe') {
        final response = jsonEncode({
          'type': 'announce',
          'name': 'SyncStuff CLI',
          'platform': 'cli',
          'ip': _localIp,
          'port': _tcpServer?.port ?? 8765,
          'version': '0.1.0',
        });
        socket.write(response);
      }
      await socket.close();
    } catch (_) {
      await socket.close();
    }
  }

  void _handleHttpRequests() {
    if (_httpServer == null) return;
    _httpServer!.listen(_handleRequest);
  }

  void _handleRequest(HttpRequest request) async {
    final path = request.uri.path;
    final response = request.response;
    final remoteIp = request.connectionInfo?.remoteAddress.address ?? 'unknown';

    onHttpRequest?.call(request.method, path, remoteIp);

    try {
      if (path == '/api/probe' || path.startsWith('/api/probe?')) {
        response.headers.contentType = ContentType.json;
        response.write(
          jsonEncode({
            'type': 'announce',
            'name': 'SyncStuff CLI',
            'platform': 'cli',
            'ip': _localIp,
            'port': _tcpServer?.port ?? 8765,
            'version': '0.1.0',
          }),
        );
      } else if (path == '/api/connect') {
        response.headers.contentType = ContentType.json;
        response.write(jsonEncode({'connected': true, 'peer': remoteIp}));
      } else if (path == '/api/status') {
        response.headers.contentType = ContentType.json;
        response.write(
          jsonEncode({
            'status': 'online',
            'platform': 'cli',
            'version': '0.1.0',
          }),
        );
      } else if (path == '/api/devices') {
        response.headers.contentType = ContentType.json;
        response.write(jsonEncode({'devices': []}));
      } else if (path == '/api/clipboard') {
        response.headers.contentType = ContentType.json;
        response.write(jsonEncode({'clipboard': ''}));
      } else if (path == '/api/upload' || path.startsWith('/api/upload?')) {
        final data = await request.fold<List<int>>(
          [],
          (prev, chunk) => prev..addAll(chunk),
        );
        var fileName = request.uri.queryParameters['name'] ?? 'received_file';
        final downloadsDir = Directory('downloads');
        if (!await downloadsDir.exists()) {
          await downloadsDir.create(recursive: true);
        }
        final file = File('${downloadsDir.path}/$fileName');
        await file.writeAsBytes(data);
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
        final fileName =
            request.uri.queryParameters['file'] ??
            request.uri.path.split('/').last;
        final file = File('downloads/$fileName');
        if (await file.exists()) {
          final data = await file.readAsBytes();
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
      } else if (path == '/' || path.isEmpty) {
        response.headers.contentType = ContentType.html;
        response.write(
          '<!DOCTYPE html><html><head><title>SyncStuff CLI</title></head>'
          '<body><h1>SyncStuff CLI</h1><p>Server running. API at /api/*</p></body></html>',
        );
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
}
