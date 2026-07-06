import 'dart:async';
import 'dart:io';
import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:uuid/uuid.dart';
import 'package:syncstuff_core/syncstuff_core.dart';

import 'desktop_http_server.dart';
import 'desktop_discovery_service.dart';

class DesktopClipboardSyncService {
  final DesktopHttpServer _httpServer;
  final DesktopDiscoveryService _discoveryService;
  final ClipboardRepository _clipboardRepository;
  final _uuid = const Uuid();

  Timer? _pollTimer;
  String? _lastClipboardContent;
  bool _isRunning = false;
  bool _syncEnabled = true;

  static const Duration _pollInterval = Duration(seconds: 2);

  DesktopClipboardSyncService({
    required DesktopHttpServer httpServer,
    required DesktopDiscoveryService discoveryService,
    ClipboardRepository? clipboardRepository,
  }) : _httpServer = httpServer,
       _discoveryService = discoveryService,
       _clipboardRepository = clipboardRepository ?? ClipboardRepository();

  bool get isRunning => _isRunning;
  bool get syncEnabled => _syncEnabled;

  Stream<List<ClipboardItem>> get historyStream => _historyController.stream;
  final _historyController = StreamController<List<ClipboardItem>>.broadcast();

  void start() {
    if (_isRunning) return;
    _isRunning = true;

    _pollTimer = Timer.periodic(_pollInterval, (_) => _checkClipboard());

    _httpServer.clipboardUpdates.listen(_handlePeerClipboard);

    _checkClipboard();
    _loadHistory();
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

  Future<void> _loadHistory() async {
    final history = await _clipboardRepository.getHistory(limit: 100);
    _historyController.add(history);
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

        final item = ClipboardItem(
          id: _uuid.v4(),
          content: content,
          contentType: 'text',
          createdAt: DateTime.now(),
          deviceId: _httpServer.deviceId,
          deviceName: _httpServer.deviceName,
          synced: true,
        );
        await _clipboardRepository.addItem(item);
        await _loadHistory();

        await _broadcastToPeers(content);
      }
    } catch (e) {
      // Clipboard access failed
    }
  }

  Future<void> _broadcastToPeers(String content) async {
    final devices = <Map<String, dynamic>>[];

    final subscription = _discoveryService.discoveredDevices.listen((device) {
      devices.add(device);
    });

    await Future.delayed(Duration(milliseconds: 100));
    await subscription.cancel();

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
    final deviceName = event['deviceName'] as String?;

    if (deviceId == _httpServer.deviceId) return;

    if (content != null && content != _lastClipboardContent) {
      _setClipboardContent(content);

      final item = ClipboardItem(
        id: _uuid.v4(),
        content: content,
        contentType: 'text',
        createdAt: DateTime.now(),
        deviceId: deviceId,
        deviceName: deviceName,
        synced: true,
      );
      _clipboardRepository.addItem(item).then((_) => _loadHistory());
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

    final item = ClipboardItem(
      id: _uuid.v4(),
      content: content,
      contentType: 'text',
      createdAt: DateTime.now(),
      deviceId: _httpServer.deviceId,
      deviceName: _httpServer.deviceName,
      synced: true,
    );
    await _clipboardRepository.addItem(item);
    await _loadHistory();

    await _broadcastToPeers(content);
  }

  Future<List<ClipboardItem>> getHistory({int limit = 100}) async {
    return await _clipboardRepository.getHistory(limit: limit);
  }

  Future<void> deleteHistoryItem(String id) async {
    await _clipboardRepository.deleteItem(id);
    await _loadHistory();
  }

  Future<void> clearHistory() async {
    await _clipboardRepository.clearHistory();
    await _loadHistory();
  }

  void dispose() {
    stop();
    _historyController.close();
  }
}
