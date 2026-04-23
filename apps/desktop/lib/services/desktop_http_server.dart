import 'dart:async';
import 'dart:io';
import 'dart:convert';

class DesktopHttpServer {
  HttpServer? _server;
  final _discoveredDevicesController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _fileUploadController =
      StreamController<Map<String, dynamic>>.broadcast();

  String? _localIp;
  final String _deviceId;
  final String _deviceName;

  DesktopHttpServer()
    : _deviceId = DateTime.now().millisecondsSinceEpoch.toString(),
      _deviceName = Platform.localHostname;

  Stream<Map<String, dynamic>> get discoveredDevices =>
      _discoveredDevicesController.stream;
  Stream<Map<String, dynamic>> get fileUploads => _fileUploadController.stream;
  String? get localIp => _localIp;
  String get deviceId => _deviceId;
  String get deviceName => _deviceName;
  bool get isRunning => _server != null;

  Future<void> start([int port = 8766]) async {
    if (_server != null) return;

    _localIp = await _getLocalIp();
    _server = await HttpServer.bind(InternetAddress.anyIPv4, port);
    _handleHttpRequests();
  }

  Future<String> _getLocalIp() async {
    final interfaces = await NetworkInterface.list(
      type: InternetAddressType.IPv4,
    );
    for (final interface in interfaces) {
      for (final addr in interface.addresses) {
        if (!addr.isLoopback && addr.type == InternetAddressType.IPv4) {
          return addr.address;
        }
      }
    }
    return '127.0.0.1';
  }

  void _handleHttpRequests() {
    _server!.listen((request) async {
      final path = request.uri.path;
      if (request.method == 'GET' && path == '/api/probe') {
        await _handleProbe(request);
      } else if (request.method == 'POST' && path == '/api/upload') {
        await _handleUpload(request);
      } else if (request.method == 'GET' && path == '/api/status') {
        await _handleStatus(request);
      } else {
        request.response.statusCode = 404;
        await request.response.close();
      }
    });
  }

  Future<void> _handleProbe(HttpRequest request) async {
    request.response.statusCode = 200;
    request.response.headers.contentType = ContentType.json;
    request.response.write(
      jsonEncode({
        'id': _deviceId,
        'name': _deviceName,
        'platform': 'windows',
        'ip': _localIp,
        'port': 8766,
        'version': '1.0.0',
      }),
    );
    await request.response.close();
  }

  Future<void> _handleUpload(HttpRequest request) async {
    try {
      final uri = request.uri;
      final fileName = uri.queryParameters['name'] ?? 'unknown';
      final downloadsDir = Directory('downloads');
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

  Future<void> _handleStatus(HttpRequest request) async {
    request.response.statusCode = 200;
    request.response.headers.contentType = ContentType.json;
    request.response.write(
      jsonEncode({
        'status': 'online',
        'deviceId': _deviceId,
        'platform': 'windows',
        'version': '1.0.0',
      }),
    );
    await request.response.close();
  }

  Future<void> stop() async {
    await _server?.close();
    _server = null;
  }

  void dispose() {
    _server?.close();
    _discoveredDevicesController.close();
    _fileUploadController.close();
  }
}
