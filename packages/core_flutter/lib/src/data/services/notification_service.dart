import 'dart:io' show Platform;

import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:syncstuff_core/syncstuff_core.dart';

class NotificationService {
  final FlutterLocalNotificationsPlugin _plugin;
  bool _initialized = false;
  bool _supported = true;

  NotificationService({FlutterLocalNotificationsPlugin? plugin})
    : _plugin = plugin ?? FlutterLocalNotificationsPlugin() {
    if (Platform.isWindows) {
      _supported = false;
    }
  }

  bool get isInitialized => _initialized;

  Future<bool> requestPermission() async {
    if (!_supported) return false;
    if (!_initialized) await init();

    try {
      final android = _plugin
          .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin
          >();
      if (android != null) {
        final granted = await android.requestNotificationsPermission();
        return granted ?? false;
      }

      final ios = _plugin
          .resolvePlatformSpecificImplementation<
            IOSFlutterLocalNotificationsPlugin
          >();
      if (ios != null) {
        final granted = await ios.requestPermissions(
          alert: true,
          badge: true,
          sound: true,
        );
        return granted ?? false;
      }

      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void> init() async {
    if (!_supported || _initialized) return;

    const androidSettings = AndroidInitializationSettings(
      '@mipmap/ic_launcher',
    );
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const settings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    try {
      await _plugin.initialize(settings);
      _initialized = true;
    } catch (_) {
      _supported = false;
    }
  }

  Future<void> showTransferComplete(FileTransfer transfer) async {
    if (!_supported) return;
    if (!_initialized) await init();
    if (!_initialized) return;

    const androidDetails = AndroidNotificationDetails(
      'transfer_complete',
      'Transfer Complete',
      channelDescription: 'File transfer completed',
      importance: Importance.defaultImportance,
      priority: Priority.defaultPriority,
    );

    const details = NotificationDetails(android: androidDetails);

    final title = transfer.direction == TransferDirection.sent
        ? 'Transfer Sent'
        : 'Transfer Received';
    final body = '${transfer.fileName} (${transfer.formattedSize})';

    try {
      await _plugin.show(transfer.id.hashCode, title, body, details);
    } catch (_) {}
  }

  Future<void> showTransferFailed(FileTransfer transfer) async {
    if (!_supported) return;
    if (!_initialized) await init();
    if (!_initialized) return;

    const androidDetails = AndroidNotificationDetails(
      'transfer_failed',
      'Transfer Failed',
      channelDescription: 'File transfer failed',
      importance: Importance.high,
      priority: Priority.high,
    );

    const details = NotificationDetails(android: androidDetails);

    try {
      await _plugin.show(
        transfer.id.hashCode,
        'Transfer Failed',
        '${transfer.fileName}: ${transfer.error ?? "Unknown error"}',
        details,
      );
    } catch (_) {}
  }

  Future<void> showTransferProgress(FileTransfer transfer) async {
    if (!_supported) return;
    if (!_initialized) await init();
    if (!_initialized) return;

    final androidDetails = AndroidNotificationDetails(
      'transfer_progress',
      'Transfer Progress',
      channelDescription: 'File transfer in progress',
      importance: Importance.low,
      priority: Priority.low,
      progress: (transfer.progress * 100).toInt(),
      showProgress: true,
      maxProgress: 100,
    );

    final details = NotificationDetails(android: androidDetails);

    try {
      await _plugin.show(
        transfer.id.hashCode,
        'Transferring ${transfer.fileName}',
        '${(transfer.progress * 100).toInt()}% complete',
        details,
      );
    } catch (_) {}
  }

  Future<void> cancelNotification(int id) async {
    if (!_supported || !_initialized) return;
    try {
      await _plugin.cancel(id);
    } catch (_) {}
  }

  Future<void> cancelAll() async {
    if (!_supported || !_initialized) return;
    try {
      await _plugin.cancelAll();
    } catch (_) {}
  }
}
