import 'dart:io';

import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:system_tray/system_tray.dart';
import 'package:window_manager/window_manager.dart';

class SystemTrayService {
  SystemTray? _systemTray;
  final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();

  bool _minimizeToTrayEnabled = true;
  bool _isInitialized = false;

  bool get minimizeToTrayEnabled => _minimizeToTrayEnabled;

  void setMinimizeToTray(bool enabled) {
    _minimizeToTrayEnabled = enabled;
  }

  Future<void> init() async {
    if (_isInitialized) return;

    _systemTray = SystemTray();

    await _systemTray!.initSystemTray(
      title: 'SyncStuff',
      iconPath: _getIconPath(),
    );

    _buildMenu();

    _systemTray!.registerSystemTrayEventHandler(_onSystemTrayEvent);

    await _initNotifications();

    _isInitialized = true;
  }

  String _getIconPath() {
    if (Platform.isWindows) {
      return 'windows/runner/resources/app_icon.ico';
    }
    return 'assets/icons/app_icon.ico';
  }

  void _buildMenu() {
    final menu = [
      MenuItem(label: 'Show', onClicked: show),
      MenuItem(label: 'Hide', onClicked: hide),
      MenuSeparator(),
      MenuItem(label: 'Quit', onClicked: quit),
    ];

    _systemTray!.setContextMenu(menu);
  }

  Future<void> _initNotifications() async {
    const androidSettings = AndroidInitializationSettings(
      '@mipmap/ic_launcher',
    );
    const initSettings = InitializationSettings(android: androidSettings);
    await _notifications.initialize(initSettings);
  }

  void _onSystemTrayEvent(String eventName) {
    switch (eventName) {
      case 'leftMouseUp':
        restore();
        break;
      case 'rightMouseUp':
        _systemTray?.popUpContextMenu();
        break;
      case 'leftMouseDblClk':
        restore();
        break;
    }
  }

  Future<void> restore() async {
    await windowManager.show();
    await windowManager.focus();
    await windowManager.setSkipTaskbar(false);
  }

  Future<void> show() async {
    await windowManager.show();
    await windowManager.setSkipTaskbar(false);
  }

  Future<void> hide() async {
    await windowManager.hide();
    await windowManager.setSkipTaskbar(true);
  }

  Future<void> minimizeToTray() async {
    if (!_minimizeToTrayEnabled) return;

    await windowManager.hide();
    await windowManager.setSkipTaskbar(true);
    await _showTrayNotification();
  }

  Future<void> _showTrayNotification() async {
    const androidDetails = AndroidNotificationDetails(
      'syncstuff_tray',
      'SyncStuff Tray',
      channelDescription: 'Notification when app is minimized to tray',
      importance: Importance.low,
      priority: Priority.low,
    );
    const details = NotificationDetails(android: androidDetails);
    await _notifications.show(
      0,
      'SyncStuff',
      'App minimized to tray. Click to restore.',
      details,
    );
  }

  Future<void> quit() async {
    await windowManager.destroy();
  }
}
