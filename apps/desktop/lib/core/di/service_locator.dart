import 'dart:io';
import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';

import '../../services/desktop_discovery_service.dart';
import '../../services/desktop_file_transfer_service.dart';
import '../../services/desktop_http_server.dart';
import '../../services/desktop_clipboard_sync_service.dart';
import '../../data/repositories/device_repository.dart';
import '../../data/repositories/transfer_repository.dart';
import '../../presentation/bloc/device/device_bloc.dart';
import '../../presentation/bloc/transfer/transfer_bloc.dart';
import '../../presentation/bloc/settings/settings_bloc.dart';

final getIt = GetIt.instance;

Future<void> setupServiceLocator() async {
  if (Platform.isWindows || Platform.isLinux || Platform.isMacOS) {
    sqfliteFfiInit();
    databaseFactory = databaseFactoryFfi;
  }

  final prefs = await SharedPreferences.getInstance();
  getIt.registerSingleton<SharedPreferences>(prefs);

  var deviceId = prefs.getString('device_id');
  if (deviceId == null || deviceId.isEmpty) {
    deviceId = DateTime.now().millisecondsSinceEpoch.toString();
    await prefs.setString('device_id', deviceId);
  }
  final deviceName = prefs.getString('device_name') ?? 'Desktop Device';

  getIt.registerLazySingleton<DesktopHttpServer>(
    () => DesktopHttpServer(deviceId: deviceId, deviceName: deviceName),
  );
  getIt.registerLazySingleton<DesktopDiscoveryService>(
    () => DesktopDiscoveryService(getIt<DesktopHttpServer>()),
  );
  getIt.registerLazySingleton<DesktopFileTransferService>(
    () => DesktopFileTransferService(),
  );
  getIt.registerLazySingleton<DesktopClipboardSyncService>(
    () => DesktopClipboardSyncService(
      httpServer: getIt<DesktopHttpServer>(),
      discoveryService: getIt<DesktopDiscoveryService>(),
    ),
  );
  getIt.registerLazySingleton<DeviceRepository>(() => DeviceRepository());
  getIt.registerLazySingleton<TransferRepository>(() => TransferRepository());

  getIt.registerFactory<DeviceBloc>(
    () => DeviceBloc(
      discoveryService: getIt<DesktopDiscoveryService>(),
      deviceRepository: getIt<DeviceRepository>(),
    ),
  );

  getIt.registerFactory<TransferBloc>(
    () => TransferBloc(
      fileTransferService: getIt<DesktopFileTransferService>(),
      transferRepository: getIt<TransferRepository>(),
    ),
  );

  getIt.registerFactory<SettingsBloc>(() => SettingsBloc(prefs));
}
