import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'app.dart';
import 'core/di/service_locator.dart';
import 'services/desktop_http_server.dart';
import 'services/desktop_file_transfer_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await setupServiceLocator();

  final httpServer = getIt<DesktopHttpServer>();
  await httpServer.start();

  final prefs = getIt<SharedPreferences>();
  final downloadPath = prefs.getString('download_path') ?? 'downloads';
  httpServer.setDownloadPath(downloadPath);
  getIt<DesktopFileTransferService>().setDownloadPath(downloadPath);

  runApp(const SyncStuffDesktopApp());
}
