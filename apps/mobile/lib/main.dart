import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core/theme/app_theme.dart';
import 'data/services/discovery_service.dart';
import 'data/services/p2p_service.dart';
import 'data/services/file_transfer_service.dart';
import 'data/services/clipboard_sync_service.dart';
import 'presentation/bloc/device/device_bloc.dart';
import 'presentation/bloc/device/device_event.dart';
import 'presentation/bloc/transfer/transfer_bloc.dart';
import 'presentation/bloc/transfer/transfer_event.dart';
import 'presentation/bloc/clipboard/clipboard_bloc.dart';
import 'presentation/bloc/clipboard/clipboard_event.dart';
import 'presentation/bloc/settings/settings_bloc.dart';
import 'presentation/bloc/settings/settings_event.dart';
import 'presentation/bloc/settings/settings_state.dart';
import 'presentation/pages/home_page.dart';

final GetIt getIt = GetIt.instance;

Future<void> setupDependencies() async {
  // Services
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

  runApp(SyncStuffApp(prefs: prefs));
}

class SyncStuffApp extends StatelessWidget {
  final SharedPreferences prefs;

  const SyncStuffApp({super.key, required this.prefs});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<DeviceBloc>(
          create: (context) => DeviceBloc(
            discoveryService: getIt<DiscoveryService>(),
            p2pService: getIt<P2PService>(),
          )..add(LoadDevices()),
        ),
        BlocProvider<TransferBloc>(
          create: (context) =>
              TransferBloc(p2pService: getIt<P2PService>())
                ..add(LoadTransfers()),
        ),
        BlocProvider<ClipboardBloc>(
          create: (context) => ClipboardBloc(
            clipboardService: getIt<ClipboardSyncService>(),
            p2pService: getIt<P2PService>(),
          )..add(LoadClipboardItems()),
        ),
        BlocProvider<SettingsBloc>(
          create: (context) => SettingsBloc(prefs)..add(LoadSettings()),
        ),
      ],
      child: BlocBuilder<SettingsBloc, SettingsState>(
        builder: (context, state) {
          return MaterialApp(
            title: 'SyncStuff',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: state.isDarkMode ? ThemeMode.dark : ThemeMode.light,
            home: const HomePage(),
          );
        },
      ),
    );
  }
}
