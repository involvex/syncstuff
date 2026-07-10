import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:syncstuff_core_flutter/syncstuff_core_flutter.dart';

import 'core/theme/app_theme.dart';
import 'data/services/discovery_service.dart';
import 'data/services/p2p_service.dart';
import 'data/services/file_transfer_service.dart';
import 'data/services/clipboard_sync_service.dart';
import 'presentation/pages/splash_page.dart';

final GetIt getIt = GetIt.instance;

Future<void> setupDependencies() async {
  getIt.registerLazySingleton<DiscoveryService>(() => DiscoveryService());
  getIt.registerLazySingleton<P2PService>(() => P2PService());
  getIt.registerLazySingleton<FileTransferService>(
    () => FileTransferService(getIt<P2PService>()),
  );
  getIt.registerLazySingleton<ClipboardSyncService>(
    () => ClipboardSyncService(getIt<P2PService>()),
  );
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final prefs = await SharedPreferences.getInstance();
  await setupDependencies();

  final notificationService = NotificationService();
  await notificationService.requestPermission();

  runApp(SyncStuffApp(prefs: prefs, notificationService: notificationService));
}

class SyncStuffApp extends StatelessWidget {
  final SharedPreferences prefs;
  final NotificationService notificationService;

  const SyncStuffApp({
    super.key,
    required this.prefs,
    required this.notificationService,
  });

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SyncStuff',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      home: SplashPage(
        prefs: prefs,
        notificationService: notificationService,
      ),
    );
  }
}
