import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:uuid/uuid.dart';
import 'package:syncstuff_cli/src/core/logger.dart';

/// Network client for communicating with SyncStuff services
class NetworkClient {
  final String baseUrl;
  final _uuid = const Uuid();
  String? _deviceId;
  WebSocketChannel? _wsChannel;

  NetworkClient(this.baseUrl);

  /// Get or create device ID
  String get deviceId {
    _deviceId ??= _uuid.v4();
    return _deviceId!;
  }

  /// Fetch list of connected devices
  Future<List<Map<String, dynamic>>> getDevices() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/devices'));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return (data['devices'] as List?)?.cast<Map<String, dynamic>>() ?? [];
      }
      return [];
    } catch (e) {
      // Return empty list if API not available
      return [];
    }
  }

  /// Scan local network for devices
  Future<List<Map<String, dynamic>>> scanNetwork() async {
    Logger.debug('Scanning network at $baseUrl...');

    final devices = <Map<String, dynamic>>[];

    try {
      // Try to get devices from API
      final apiDevices = await getDevices();
      if (apiDevices.isNotEmpty) {
        devices.addAll(apiDevices);
      }
    } catch (e) {
      Logger.debug('API not available, trying direct discovery');
    }

    // TODO: Implement mDNS/UDP broadcast discovery
    return devices;
  }

  /// Connect to a device via WebSocket
  Future<void> connectToDevice(
    String deviceId,
    void Function(dynamic) onMessage,
  ) async {
    final wsUrl = baseUrl.replaceFirst('http', 'ws') + '/ws?device=$deviceId';
    _wsChannel = WebSocketChannel.connect(Uri.parse(wsUrl));

    _wsChannel!.stream.listen(
      onMessage,
      onError: (e) => Logger.error('WebSocket error: $e'),
      onDone: () => Logger.debug('WebSocket connection closed'),
    );

    Logger.success('Connected to device: $deviceId');
  }

  /// Send message via WebSocket
  Future<void> sendMessage(Map<String, dynamic> message) async {
    if (_wsChannel != null) {
      _wsChannel!.sink.add(jsonEncode(message));
    }
  }

  /// Disconnect WebSocket
  void disconnect() {
    _wsChannel?.sink.close();
    _wsChannel = null;
  }

  /// Upload a file
  Future<Map<String, dynamic>> uploadFile(
    String filePath,
    String targetDeviceId,
  ) async {
    // TODO: Implement file upload
    Logger.info('Uploading file: $filePath to device: $targetDeviceId');
    return {'status': 'pending', 'file': filePath, 'target': targetDeviceId};
  }

  /// Download a file
  Future<void> downloadFile(String fileId, String savePath) async {
    // TODO: Implement file download
    Logger.info('Downloading file: $fileId to: $savePath');
  }

  /// Get clipboard content
  Future<String?> getClipboard() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/clipboard'));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['content'] as String?;
      }
    } catch (e) {
      Logger.debug('Clipboard API not available');
    }
    return null;
  }

  /// Set clipboard content
  Future<void> setClipboard(String content) async {
    try {
      await http.post(
        Uri.parse('$baseUrl/clipboard'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'content': content}),
      );
    } catch (e) {
      Logger.error('Failed to set clipboard: $e');
    }
  }

  /// Check server status
  Future<bool> checkServerStatus() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/status'));
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  void dispose() {
    disconnect();
  }
}
