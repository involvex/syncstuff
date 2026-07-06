import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:syncstuff_core/syncstuff_core.dart';

class NotificationService {
  final FlutterLocalNotificationsPlugin _plugin;
  bool _initialized = false;

  NotificationService({FlutterLocalNotificationsPlugin? plugin})
    : _plugin = plugin ?? FlutterLocalNotificationsPlugin();

  bool get isInitialized => _initialized;

  Future<void> init() async {
    if (_initialized) return;

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

    await _plugin.initialize(settings);
    _initialized = true;
  }

  Future<void> showTransferComplete(FileTransfer transfer) async {
    if (!_initialized) await init();

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

    await _plugin.show(transfer.id.hashCode, title, body, details);
  }

  Future<void> showTransferFailed(FileTransfer transfer) async {
    if (!_initialized) await init();

    const androidDetails = AndroidNotificationDetails(
      'transfer_failed',
      'Transfer Failed',
      channelDescription: 'File transfer failed',
      importance: Importance.high,
      priority: Priority.high,
    );

    const details = NotificationDetails(android: androidDetails);

    await _plugin.show(
      transfer.id.hashCode,
      'Transfer Failed',
      '${transfer.fileName}: ${transfer.error ?? "Unknown error"}',
      details,
    );
  }

  Future<void> showTransferProgress(FileTransfer transfer) async {
    if (!_initialized) await init();

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

    await _plugin.show(
      transfer.id.hashCode,
      'Transferring ${transfer.fileName}',
      '${(transfer.progress * 100).toInt()}% complete',
      details,
    );
  }

  Future<void> cancelNotification(int id) async {
    await _plugin.cancel(id);
  }

  Future<void> cancelAll() async {
    await _plugin.cancelAll();
  }
}
