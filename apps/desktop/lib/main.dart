import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:window_manager/window_manager.dart';

import 'app.dart';
import 'core/di/service_locator.dart';
import 'services/desktop_http_server.dart';
import 'services/desktop_file_transfer_service.dart';
import 'services/system_tray_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await windowManager.ensureInitialized();

  await setupServiceLocator();

  final systemTrayService = getIt<SystemTrayService>();
  await systemTrayService.init();

  final httpServer = getIt<DesktopHttpServer>();
  await httpServer.start();

  final prefs = getIt<SharedPreferences>();
  final downloadPath = prefs.getString('download_path') ?? 'downloads';
  httpServer.setDownloadPath(downloadPath);
  getIt<DesktopFileTransferService>().setDownloadPath(downloadPath);

  final minimizeToTray = prefs.getBool('minimize_to_tray') ?? true;
  systemTrayService.setMinimizeToTray(minimizeToTray);

  const windowOptions = WindowOptions(
    size: Size(1280, 720),
    center: true,
    title: 'SyncStuff',
    titleBarStyle: TitleBarStyle.normal,
  );
  await windowManager.waitUntilReadyToShow(windowOptions, () async {
    await windowManager.show();
    await windowManager.focus();
  });

  runApp(const SyncStuffDesktopApp());
}
