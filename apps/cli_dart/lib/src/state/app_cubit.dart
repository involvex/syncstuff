import 'dart:async';

import 'package:syncstuff_cli/src/state/app_state.dart';
import 'package:syncstuff_cli/src/services/server_service.dart';

class AppCubit {
  AppState _state = const AppState();
  final _controller = StreamController<AppState>.broadcast();

  AppState get state => _state;
  Stream<AppState> get stream => _controller.stream;

  final ServerService _serverService = ServerService();

  void emit(AppState newState) {
    _state = newState;
    _controller.add(_state);
  }

  void selectView(AppView view) {
    emit(_state.copyWith(currentView: view));
  }

  Future<void> scanNetwork() async {
    emit(_state.copyWith(scanning: true));
    await Future.delayed(const Duration(milliseconds: 500));
    final devices = [
      Device('Android Phone', 'android', '192.168.1.100', true),
      Device('Windows PC', 'windows', '192.168.1.101', false),
    ];
    emit(_state.copyWith(scanning: false, devices: devices));
  }

  Future<void> startServer() async {
    if (_state.serverRunning) return;
    final port = _state.serverPort ?? 8765;
    final localIp = await _serverService.getLocalIp();
    emit(_state.copyWith(localIp: localIp));
    _addLog('Starting server on port $port...', 'info');
    try {
      await _serverService.start(port);
      _serverService.onHttpRequest = (method, path, ip) {
        addServerLog('$method $path from $ip');
      };
      emit(
        _state.copyWith(
          serverRunning: true,
          serverPort: port,
          localIp: localIp,
        ),
      );
      _addLog('Server running on port $port (IP: $localIp)', 'info');
    } catch (e) {
      _addLog('Failed to start server: $e', 'error');
    }
  }

  Future<void> stopServer() async {
    await _serverService.stop();
    emit(_state.copyWith(serverRunning: false));
    _addLog('Server stopped', 'info');
  }

  Future<void> toggleServer() async {
    if (_state.serverRunning) {
      await stopServer();
    } else {
      await startServer();
    }
  }

  void addServerLog(String message) {
    final entry = LogEntry(DateTime.now(), message, 'info');
    final logs = [..._state.serverLogs, entry];
    if (logs.length > 500) logs.removeRange(0, logs.length - 500);
    emit(_state.copyWith(serverLogs: logs));
  }

  void _addLog(String message, String level) {
    final entry = LogEntry(DateTime.now(), message, level);
    final logs = [..._state.serverLogs, entry];
    if (logs.length > 500) logs.removeRange(0, logs.length - 500);
    emit(_state.copyWith(serverLogs: logs));
  }

  void setDeviceId(String id) {
    emit(_state.copyWith(deviceId: id));
  }

  void toggleCommandPalette() {
    emit(_state.copyWith(commandPaletteVisible: !_state.commandPaletteVisible));
  }

  void hideCommandPalette() {
    emit(_state.copyWith(commandPaletteVisible: false));
  }

  void dispose() {
    _serverService.stop();
    _controller.close();
  }
}
