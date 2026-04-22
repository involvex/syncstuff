import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:syncstuff_cli/src/commands/base_command.dart';
import 'package:syncstuff_cli/src/core/config.dart';
import 'package:syncstuff_cli/src/core/logger.dart';
import 'package:syncstuff_cli/src/services/network_client.dart';

/// Serve command - start local API server
class ServeCommand extends BaseCommand {
  ServeCommand(Config config)
    : super(config, 'serve', 'Start local API server');

  HttpServer? _server;
  final _devices = <String, Map<String, dynamic>>{};
  final _transfers = <String, Map<String, dynamic>>{};
  String _clipboardContent = '';

  @override
  Future<void> execute(List<String> args) async {
    var port = config.apiPort;
    final host = config.apiHost;

    // Parse port from args
    for (var i = 0; i < args.length; i++) {
      if (args[i] == '--port' || args[i] == '-p') {
        if (i + 1 < args.length) {
          port = int.tryParse(args[i + 1]) ?? port;
        }
      }
    }

    Logger.header('Starting SyncStuff Server');
    Logger.info('Host: $host');
    Logger.info('Port: $port');
    Logger.info('URL: http://$host:$port/api\n');

    await _startServer(host, port);
  }

  Future<void> _startServer(String host, int port) async {
    try {
      _server = await HttpServer.bind(host, port);
      Logger.success('Server running at http://$host:$port');
      Logger.info('Press Ctrl+C to stop\n');

      // Handle requests
      await for (final request in _server!) {
        _handleRequest(request);
      }
    } catch (e) {
      Logger.error('Failed to start server: $e');
    }
  }

  void _handleRequest(HttpRequest request) async {
    final path = request.uri.path;
    final method = request.method;

    Logger.debug('$method $path');

    try {
      // CORS headers
      request.response.headers.set('Access-Control-Allow-Origin', '*');
      request.response.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS',
      );
      request.response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type',
      );

      if (method == 'OPTIONS') {
        request.response.statusCode = 204;
        await request.response.close();
        return;
      }

      // API Routes
      if (path == '/api/status') {
        _sendJson(request, {'status': 'ok', 'version': '0.1.0'});
      } else if (path == '/api/devices') {
        _sendJson(request, {'devices': _devices.values.toList()});
      } else if (path == '/api/clipboard') {
        if (method == 'GET') {
          _sendJson(request, {'content': _clipboardContent});
        } else if (method == 'POST') {
          final body = await _readBody(request);
          _clipboardContent = body['content'] ?? '';
          _sendJson(request, {'status': 'ok'});
        }
      } else if (path == '/api/transfers') {
        _sendJson(request, {'transfers': _transfers.values.toList()});
      } else if (path == '/api/scan') {
        // Simulate discovery
        _sendJson(request, {
          'devices': [
            {
              'name': 'CLI Server',
              'id': 'cli-001',
              'platform': 'windows',
              'ip': 'localhost',
              'connected': true,
            },
          ],
        });
      } else {
        request.response.statusCode = 404;
        _sendJson(request, {'error': 'Not found'});
      }
    } catch (e) {
      Logger.error('Request error: $e');
      request.response.statusCode = 500;
      _sendJson(request, {'error': e.toString()});
    }
  }

  Future<Map<String, dynamic>> _readBody(HttpRequest request) async {
    final content = await request
        .cast<List<int>>()
        .transform(utf8.decoder)
        .join();
    return jsonDecode(content) as Map<String, dynamic>;
  }

  void _sendJson(HttpRequest request, Map<String, dynamic> data) {
    request.response.headers.set('Content-Type', 'application/json');
    request.response.write(jsonEncode(data));
    request.response.close();
  }

  void dispose() {
    _server?.close();
  }
}

/// Status command - show connection status
class StatusCommand extends BaseCommand {
  StatusCommand(Config config)
    : super(config, 'status', 'Show connection status');

  @override
  Future<void> execute(List<String> args) async {
    Logger.header('SyncStuff Status');

    final client = NetworkClient(config.apiUrl);

    // Check server
    Logger.info('Server: ${config.apiUrl}');
    final isRunning = await client.checkServerStatus();
    if (isRunning) {
      Logger.success('Server is running');
    } else {
      Logger.warn('Server is not running');
      Logger.info('Run "syncstuff serve" to start server');
    }

    // Check devices
    Logger.info('\nConnected Devices:');
    try {
      final devices = await client.getDevices();
      if (devices.isEmpty) {
        Logger.warn('  No devices connected');
      } else {
        for (final device in devices) {
          Logger.info('  - ${device['name']} (${device['platform']})');
        }
      }
    } catch (e) {
      Logger.warn('  Unable to get devices');
    }

    // Check clipboard
    Logger.info('\nClipboard:');
    try {
      final clipboard = await client.getClipboard();
      if (clipboard != null && clipboard.isNotEmpty) {
        final preview = clipboard.length > 50
            ? '${clipboard.substring(0, 50)}...'
            : clipboard;
        Logger.info('  "$preview"');
      } else {
        Logger.info('  (empty)');
      }
    } catch (e) {
      Logger.warn('  Unable to get clipboard');
    }

    Logger.info('\nDevice ID: ${client.deviceId}');
  }
}
