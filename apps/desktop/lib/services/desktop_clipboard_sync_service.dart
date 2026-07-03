import 'dart:async';
import 'dart:io';
import 'dart:convert';

import 'package:flutter/services.dart';

import 'desktop_http_server.dart';
import 'desktop_discovery_service.dart';

class DesktopClipboardSyncService {
  final DesktopHttpServer _httpServer;
  final DesktopDiscoveryService _discoveryService;

  Timer? _pollTimer;
  String? _lastClipboardContent;
  bool _isRunning = false;
  bool _syncEnabled = true;

  static const Duration _pollInterval = Duration(seconds: 2);

  DesktopClipboardSyncService({
    required DesktopHttpServer httpServer,
    required DesktopDiscoveryService discoveryService,
  }) : _httpServer = httpServer,
       _discoveryService = discoveryService;

  bool get isRunning => _isRunning;
  bool get syncEnabled => _syncEnabled;

  void start() {
    if (_isRunning) return;
    _isRunning = true;

    // Start polling clipboard
    _pollTimer = Timer.periodic(_pollInterval, (_) => _checkClipboard());

    // Listen for incoming clipboard updates from peers
    _httpServer.clipboardUpdates.listen(_handlePeerClipboard);

    // Initial clipboard check
    _checkClipboard();
  }

  void stop() {
    _isRunning = false;
    _pollTimer?.cancel();
    _pollTimer = null;
  }

  void enable() {
    _syncEnabled = true;
    if (!_isRunning) start();
  }

  void disable() {
    _syncEnabled = false;
    stop();
  }

  Future<void> _checkClipboard() async {
    if (!_syncEnabled) return;

    try {
      final clipboardData = await Clipboard.getData(Clipboard.kTextPlain);
      final content = clipboardData?.text;

      if (content != null &&
          content.isNotEmpty &&
          content != _lastClipboardContent) {
        _lastClipboardContent = content;
        await _broadcastToPeers(content);
      }
    } catch (e) {
      // Clipboard access failed
    }
  }

  Future<void> _broadcastToPeers(String content) async {
    // Get all discovered devices
    final devices = <Map<String, dynamic>>[];

    // Listen for a short time to collect devices
    final subscription = _discoveryService.discoveredDevices.listen((device) {
      devices.add(device);
    });

    // Give it a moment to collect
    await Future.delayed(Duration(milliseconds: 100));
    await subscription.cancel();

    // Send to each peer
    for (final device in devices) {
      await _sendClipboardToPeer(device, content);
    }
  }

  Future<void> _sendClipboardToPeer(
    Map<String, dynamic> peer,
    String content,
  ) async {
    try {
      final ip = peer['ip'] as String?;
      final port = peer['port'] as int? ?? 8766;

      if (ip == null) return;

      final client = HttpClient();
      client.connectionTimeout = Duration(seconds: 2);

      final request = await client.postUrl(
        Uri.parse('http://$ip:$port/api/clipboard'),
      );

      request.headers.contentType = ContentType.json;
      request.write(
        jsonEncode({
          'content': content,
          'deviceId': _httpServer.deviceId,
          'deviceName': _httpServer.deviceName,
        }),
      );

      await request.close();
      client.close();
    } catch (e) {
      // Peer unreachable
    }
  }

  void _handlePeerClipboard(Map<String, dynamic> event) {
    final content = event['content'] as String?;
    final deviceId = event['deviceId'] as String?;

    // Don't apply our own clipboard updates
    if (deviceId == _httpServer.deviceId) return;

    if (content != null && content != _lastClipboardContent) {
      _setClipboardContent(content);
    }
  }

  Future<void> _setClipboardContent(String content) async {
    try {
      await Clipboard.setData(ClipboardData(text: content));
      _lastClipboardContent = content;
    } catch (e) {
      // Failed to set clipboard
    }
  }

  Future<void> setClipboard(String content) async {
    await _setClipboardContent(content);
    await _broadcastToPeers(content);
  }

  void dispose() {
    stop();
  }
}
