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
import 'presentation/bloc/device_group/device_group_bloc.dart';
import 'presentation/bloc/device_group/device_group_event.dart';
import 'presentation/bloc/clipboard/clipboard_bloc.dart';
import 'presentation/bloc/clipboard/clipboard_event.dart';
import 'data/repositories/device_group_repository.dart';
import 'presentation/pages/home_page.dart';
import 'presentation/theme/app_theme.dart';

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
        BlocProvider<DeviceGroupBloc>(
          create: (context) => DeviceGroupBloc(
            repository: getIt<DeviceGroupRepository>(),
            transferBloc: context.read<TransferBloc>(),
            deviceBloc: context.read<DeviceBloc>(),
          )..add(LoadDeviceGroups()),
        ),
        BlocProvider<ClipboardBloc>(
          create: (_) => getIt<ClipboardBloc>()..add(LoadClipboardItems()),
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
