import 'dart:async';

import 'package:flutter/services.dart';
import 'package:uuid/uuid.dart';

import '../../domain/entities/clipboard.dart';
import 'p2p_service.dart';

/// Service for clipboard synchronization
class ClipboardSyncService {
  static const Duration _pollInterval = Duration(seconds: 2);

  final P2PService _p2pService;
  final _uuid = const Uuid();

  Timer? _pollTimer;
  String? _lastClipboardContent;
  bool _isEnabled = false;

  final _clipboardController = StreamController<ClipboardItem>.broadcast();

  /// Stream of clipboard changes
  Stream<ClipboardItem> get clipboardStream => _clipboardController.stream;

  ClipboardSyncService(this._p2pService) {
    // Listen for clipboard messages from P2P
    _p2pService.messages.listen(_handleClipboardMessage);
  }

  /// Enable clipboard monitoring
  void enable() {
    if (_isEnabled) return;
    _isEnabled = true;

    // Start polling clipboard
    _pollTimer = Timer.periodic(_pollInterval, (_) => _checkClipboard());

    // Get initial clipboard content
    _checkClipboard();
  }

  /// Disable clipboard monitoring
  void disable() {
    _isEnabled = false;
    _pollTimer?.cancel();
    _pollTimer = null;
  }

  /// Whether clipboard sync is enabled
  bool get isEnabled => _isEnabled;

  /// Get current clipboard content
  Future<String?> getClipboardContent() async {
    try {
      final data = await Clipboard.getData(Clipboard.kTextPlain);
      return data?.text;
    } catch (e) {
      return null;
    }
  }

  /// Set clipboard content
  Future<void> setClipboardContent(String content) async {
    await Clipboard.setData(ClipboardData(text: content));
    _lastClipboardContent = content;
  }

  /// Send clipboard content to connected peers
  Future<void> broadcastClipboard(String content) async {
    final item = ClipboardItem(
      id: _uuid.v4(),
      content: content,
      contentType: 'text',
      createdAt: DateTime.now(),
      synced: true,
    );

    // Send via P2P
    await _p2pService.sendClipboard(content);

    // Also emit locally
    _clipboardController.add(item);
  }

  /// Manually sync current clipboard
  Future<void> syncNow() async {
    final content = await getClipboardContent();
    if (content != null && content.isNotEmpty) {
      await broadcastClipboard(content);
    }
  }

  void _checkClipboard() async {
    if (!_isEnabled) return;

    try {
      final content = await getClipboardContent();
      if (content != null &&
          content.isNotEmpty &&
          content != _lastClipboardContent) {
        _lastClipboardContent = content;

        // Create clipboard item
        final item = ClipboardItem(
          id: _uuid.v4(),
          content: content,
          contentType: 'text',
          createdAt: DateTime.now(),
          synced: false,
        );

        // Emit to stream
        _clipboardController.add(item);

        // Broadcast to peers
        await broadcastClipboard(content);
      }
    } catch (e) {
      // Ignore clipboard errors
    }
  }

  void _handleClipboardMessage(Map<String, dynamic> data) {
    if (data['type'] != 'clipboard') return;

    final content = data['content'] as String?;
    if (content == null || content.isEmpty) return;

    // Don't apply our own broadcasts
    if (content == _lastClipboardContent) return;

    // Update clipboard and emit event
    _lastClipboardContent = content;
    setClipboardContent(content);

    final item = ClipboardItem(
      id: _uuid.v4(),
      content: content,
      contentType: 'text',
      createdAt: DateTime.now(),
      deviceId: data['deviceId'] as String?,
      synced: true,
    );

    _clipboardController.add(item);
  }

  void dispose() {
    disable();
    _clipboardController.close();
  }
}
