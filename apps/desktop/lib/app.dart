import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'core/di/service_locator.dart';
import 'presentation/bloc/device/device_bloc.dart';
import 'presentation/bloc/device/device_event.dart';
import 'presentation/bloc/transfer/transfer_bloc.dart';
import 'presentation/bloc/transfer/transfer_event.dart';
import 'presentation/bloc/settings/settings_bloc.dart';
import 'presentation/bloc/settings/settings_state.dart';
import 'presentation/bloc/settings/settings_event.dart';
import 'presentation/pages/home_page.dart';

class SyncStuffDesktopApp extends StatelessWidget {
  const SyncStuffDesktopApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<DeviceBloc>(
          create: (_) => getIt<DeviceBloc>()..add(LoadDevices()),
        ),
        BlocProvider<TransferBloc>(
          create: (_) => getIt<TransferBloc>()..add(LoadTransfers()),
        ),
        BlocProvider<SettingsBloc>(
          create: (_) => getIt<SettingsBloc>()..add(LoadSettings()),
        ),
      ],
      child: BlocBuilder<SettingsBloc, SettingsState>(
        builder: (context, state) {
          return MaterialApp(
            title: 'SyncStuff',
            debugShowCheckedModeBanner: false,
            theme: ThemeData.light(useMaterial3: true),
            darkTheme: ThemeData.dark(useMaterial3: true),
            themeMode: state.isDarkMode ? ThemeMode.dark : ThemeMode.light,
            home: const HomePage(),
          );
        },
      ),
    );
  }
}
