import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../services/desktop_discovery_service.dart';
import '../../services/desktop_file_transfer_service.dart';
import '../../services/desktop_http_server.dart';
import '../../presentation/bloc/device/device_bloc.dart';
import '../../presentation/bloc/transfer/transfer_bloc.dart';
import '../../presentation/bloc/settings/settings_bloc.dart';

final getIt = GetIt.instance;

Future<void> setupServiceLocator() async {
  final prefs = await SharedPreferences.getInstance();
  getIt.registerSingleton<SharedPreferences>(prefs);

  getIt.registerLazySingleton<DesktopHttpServer>(() => DesktopHttpServer());
  getIt.registerLazySingleton<DesktopDiscoveryService>(
    () => DesktopDiscoveryService(getIt<DesktopHttpServer>()),
  );
  getIt.registerLazySingleton<DesktopFileTransferService>(
    () => DesktopFileTransferService(getIt<DesktopHttpServer>()),
  );

  getIt.registerFactory<DeviceBloc>(
    () => DeviceBloc(
      discoveryService: getIt<DesktopDiscoveryService>(),
      httpServer: getIt<DesktopHttpServer>(),
    ),
  );

  getIt.registerFactory<TransferBloc>(
    () =>
        TransferBloc(fileTransferService: getIt<DesktopFileTransferService>()),
  );

  getIt.registerFactory<SettingsBloc>(() => SettingsBloc(prefs));
}
