import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:window_manager/window_manager.dart';

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
import 'services/system_tray_service.dart';

class SyncStuffDesktopApp extends StatefulWidget {
  const SyncStuffDesktopApp({super.key});

  @override
  State<SyncStuffDesktopApp> createState() => _SyncStuffDesktopAppState();
}

class _SyncStuffDesktopAppState extends State<SyncStuffDesktopApp>
    with WindowListener {
  final SystemTrayService _systemTrayService = getIt<SystemTrayService>();

  @override
  void initState() {
    super.initState();
    windowManager.addListener(this);
    _initWindowCloseBehavior();
  }

  @override
  void dispose() {
    windowManager.removeListener(this);
    super.dispose();
  }

  void _initWindowCloseBehavior() {
    final settingsBloc = context.read<SettingsBloc>();
    final state = settingsBloc.state;
    _systemTrayService.setMinimizeToTray(state.minimizeToTrayEnabled);
  }

  @override
  void onWindowClose() async {
    final settingsBloc = context.read<SettingsBloc>();
    final state = settingsBloc.state;

    if (state.minimizeToTrayEnabled) {
      await _systemTrayService.minimizeToTray();
    } else {
      await windowManager.destroy();
    }
  }

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
      child: BlocListener<SettingsBloc, SettingsState>(
        listener: (context, state) {
          _systemTrayService.setMinimizeToTray(state.minimizeToTrayEnabled);
        },
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
      ),
    );
  }
}
