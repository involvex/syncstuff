import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:syncstuff_core_flutter/syncstuff_core_flutter.dart';

import '../../data/services/clipboard_sync_service.dart';
import '../../data/services/discovery_service.dart';
import '../../data/services/p2p_service.dart';
import '../../data/services/file_transfer_service.dart';
import '../../core/theme/app_theme.dart';
import '../bloc/device/device_bloc.dart';
import '../bloc/device/device_event.dart';
import '../bloc/transfer/transfer_bloc.dart';
import '../bloc/transfer/transfer_event.dart';
import '../bloc/clipboard/clipboard_bloc.dart';
import '../bloc/clipboard/clipboard_event.dart';
import '../bloc/device_group/device_group_bloc.dart';
import '../bloc/device_group/device_group_event.dart';
import '../bloc/settings/settings_bloc.dart';
import '../bloc/settings/settings_event.dart';
import '../bloc/settings/settings_state.dart';
import 'home_page.dart';

final GetIt getIt = GetIt.instance;

class SplashPage extends StatefulWidget {
  final SharedPreferences prefs;
  final NotificationService notificationService;

  const SplashPage({
    super.key,
    required this.prefs,
    required this.notificationService,
  });

  @override
  State<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends State<SplashPage> {
  String _statusMessage = 'Initializing...';
  bool _hasError = false;
  String _errorMessage = '';
  Timer? _timeoutTimer;
  static const _initTimeout = Duration(seconds: 15);

  @override
  void initState() {
    super.initState();
    _startInitialization();
  }

  @override
  void dispose() {
    _timeoutTimer?.cancel();
    super.dispose();
  }

  Future<void> _startInitialization() async {
    _timeoutTimer = Timer(_initTimeout, () {
      if (mounted) {
        setState(() {
          _hasError = true;
          _errorMessage =
              'Initialization timed out after ${_initTimeout.inSeconds} seconds. '
              'Check your network connection and try again.';
        });
      }
    });

    try {
      await _initializeServices();
      await _initializeBLoCs();
      if (mounted && !_hasError) {
        _navigateToHome();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _hasError = true;
          _errorMessage = 'Initialization failed: $e';
        });
      }
    }
  }

  Future<void> _initializeServices() async {
    _updateStatus('Setting up services...');
    await Future.delayed(const Duration(milliseconds: 100));
  }

  Future<void> _initializeBLoCs() async {
    _updateStatus('Loading settings...');
    await Future.delayed(const Duration(milliseconds: 100));
  }

  void _updateStatus(String message) {
    if (mounted) {
      setState(() {
        _statusMessage = message;
      });
    }
  }

  void _navigateToHome() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (context) => _HomePageWrapper(
          prefs: widget.prefs,
          notificationService: widget.notificationService,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.sync,
                  size: 80,
                  color: Colors.blue,
                ),
                const SizedBox(height: 24),
                Text(
                  'SyncStuff',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'P2P File Sync',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Colors.grey,
                  ),
                ),
                const SizedBox(height: 48),
                if (_hasError) ...[
                  Icon(
                    Icons.error_outline,
                    size: 48,
                    color: Theme.of(context).colorScheme.error,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Failed to Initialize',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: Theme.of(context).colorScheme.error,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _errorMessage,
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () {
                      setState(() {
                        _hasError = false;
                        _errorMessage = '';
                        _statusMessage = 'Retrying...';
                      });
                      _startInitialization();
                    },
                    icon: const Icon(Icons.refresh),
                    label: const Text('Retry'),
                  ),
                ] else ...[
                  const CircularProgressIndicator(),
                  const SizedBox(height: 24),
                  Text(
                    _statusMessage,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _HomePageWrapper extends StatelessWidget {
  final SharedPreferences prefs;
  final NotificationService notificationService;

  const _HomePageWrapper({
    required this.prefs,
    required this.notificationService,
  });

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
          create: (context) => TransferBloc(
            p2pService: getIt<P2PService>(),
            notificationService: notificationService,
          )..add(LoadTransfers()),
        ),
        BlocProvider<DeviceGroupBloc>(
          create: (context) => DeviceGroupBloc(
            repository: DeviceGroupRepository(),
            transferBloc: context.read<TransferBloc>(),
            deviceBloc: context.read<DeviceBloc>(),
          )..add(LoadDeviceGroups()),
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
