import 'dart:async';
import 'dart:io';
import 'dart:convert';

import 'package:flutter/foundation.dart';

class DesktopHttpServer {
  HttpServer? _server;
  final _discoveredDevicesController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _fileUploadController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _clipboardUpdateController =
      StreamController<Map<String, dynamic>>.broadcast();
  final _pairingUpdateController =
      StreamController<Map<String, dynamic>>.broadcast();

  String? _localIp;
  final String deviceId;
  final String deviceName;
  String _clipboardContent = '';
  DateTime? _lastClipboardUpdate;
  String _downloadPath = Platform.environment['USERPROFILE'] != null
      ? '${Platform.environment['USERPROFILE']}\\Downloads'
      : 'downloads';

  DesktopHttpServer({String? deviceId, String? deviceName})
    : deviceId = deviceId ?? DateTime.now().millisecondsSinceEpoch.toString(),
      deviceName = deviceName ?? Platform.localHostname;

  Stream<Map<String, dynamic>> get discoveredDevices =>
      _discoveredDevicesController.stream;
  Stream<Map<String, dynamic>> get fileUploads => _fileUploadController.stream;
  Stream<Map<String, dynamic>> get clipboardUpdates =>
      _clipboardUpdateController.stream;
  Stream<Map<String, dynamic>> get pairingUpdates =>
      _pairingUpdateController.stream;
  String? get localIp => _localIp;
  bool get isRunning => _server != null;
  String get clipboardContent => _clipboardContent;
  String get downloadPath => _downloadPath;
  void setDownloadPath(String path) {
    _downloadPath = path;
  }

  Future<void> start([int port = 8766]) async {
    if (_server != null) {
      debugPrint('[DesktopHttpServer] Already running on port $port');
      return;
    }

    _localIp = await _getLocalIp();
    debugPrint('[DesktopHttpServer] Starting on $_localIp:$port');
    _server = await HttpServer.bind(InternetAddress.anyIPv4, port);
    debugPrint('[DesktopHttpServer] Server started successfully on port $port');
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
      } else if (request.method == 'GET' && path == '/api/clipboard') {
        await _handleGetClipboard(request);
      } else if (request.method == 'POST' && path == '/api/clipboard') {
        await _handleSetClipboard(request);
      } else if (request.method == 'POST' && path == '/api/pair') {
        await _handlePairNotification(request);
      } else if (request.method == 'POST' && path == '/api/unpair') {
        await _handleUnpairNotification(request);
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
        'id': deviceId,
        'name': deviceName,
        'platform': 'windows',
        'ipAddress': _localIp,
        'port': 8766,
        'version': '1.0.0',
      }),
    );
    await request.response.close();
  }

  Future<void> _handleUpload(HttpRequest request) async {
    final stopwatch = Stopwatch()..start();
    try {
      final uri = request.uri;
      final fileName = uri.queryParameters['name'] ?? 'unknown';
      debugPrint(
        '[DesktopHttpServer] Upload received: name=$fileName, from=${request.connectionInfo?.remoteAddress.address}',
      );
      final downloadsDir = Directory(_downloadPath);
      if (!await downloadsDir.exists()) {
        await downloadsDir.create(recursive: true);
      }
      debugPrint(
        '[DesktopHttpServer] Saving to: ${downloadsDir.path}/$fileName',
      );
      final file = File('${downloadsDir.path}/$fileName');
      final sink = file.openWrite(mode: FileMode.write);

      try {
        int bytesReceived = 0;
        await for (final chunk in request) {
          sink.add(chunk);
          bytesReceived += chunk.length;
        }
        await sink.close();
        stopwatch.stop();
        debugPrint(
          '[DesktopHttpServer] Upload complete: $fileName ($bytesReceived bytes) in ${stopwatch.elapsedMilliseconds}ms',
        );
        _fileUploadController.add({
          'name': fileName,
          'path': file.path,
          'size': bytesReceived,
        });
        request.response.statusCode = 200;
        request.response.headers.contentType = ContentType.json;
        request.response.write(
          jsonEncode({
            'success': true,
            'path': file.path,
            'size': bytesReceived,
          }),
        );
        await request.response.close();
      } catch (e) {
        await sink.close();
        rethrow;
      }
    } catch (e) {
      debugPrint('[DesktopHttpServer] Upload failed: $e');
      try {
        request.response.statusCode = 500;
        request.response.headers.contentType = ContentType.json;
        request.response.write(jsonEncode({'error': e.toString()}));
        await request.response.close();
      } catch (_) {}
    }
  }

  Future<void> _handleStatus(HttpRequest request) async {
    request.response.statusCode = 200;
    request.response.headers.contentType = ContentType.json;
    request.response.write(
      jsonEncode({
        'status': 'online',
        'deviceId': deviceId,
        'platform': 'windows',
        'version': '1.0.0',
      }),
    );
    await request.response.close();
  }

  Future<void> _handleGetClipboard(HttpRequest request) async {
    request.response.statusCode = 200;
    request.response.headers.contentType = ContentType.json;
    request.response.write(
      jsonEncode({
        'content': _clipboardContent,
        'lastUpdate': _lastClipboardUpdate?.toIso8601String(),
      }),
    );
    await request.response.close();
  }

  Future<void> _handleSetClipboard(HttpRequest request) async {
    try {
      final body = await request.fold<List<int>>(
        [],
        (prev, chunk) => prev..addAll(chunk),
      );
      final data = jsonDecode(utf8.decode(body)) as Map<String, dynamic>;
      final content = data['content'] as String? ?? '';

      _clipboardContent = content;
      _lastClipboardUpdate = DateTime.now();

      // Notify listeners
      _clipboardUpdateController.add({
        'content': content,
        'deviceId': deviceId,
        'deviceName': deviceName,
        'timestamp': _lastClipboardUpdate!.toIso8601String(),
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

  Future<void> stop() async {
    await _server?.close();
    _server = null;
  }

  void dispose() {
    _server?.close();
    _discoveredDevicesController.close();
    _fileUploadController.close();
    _clipboardUpdateController.close();
    _pairingUpdateController.close();
  }
}
