import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:syncstuff_core/syncstuff_core.dart';

import 'settings_event.dart';
import 'settings_state.dart';

class SettingsBloc extends Bloc<SettingsEvent, SettingsState> {
  final SharedPreferences _prefs;

  static const String _keyDarkMode = 'dark_mode';
  static const String _keyDeviceName = 'device_name';
  static const String _keyAutoSync = 'auto_sync';
  static const String _keyAutoStart = 'auto_start';
  static const String _keyDownloadPath = 'download_path';
  static const String _keyAutoPair = 'auto_pair';

  SettingsBloc(this._prefs) : super(const SettingsState()) {
    on<LoadSettings>(_onLoadSettings);
    on<ToggleDarkMode>(_onToggleDarkMode);
    on<SetDeviceName>(_onSetDeviceName);
    on<SetAutoSync>(_onSetAutoSync);
    on<SetAutoStart>(_onSetAutoStart);
    on<SetDownloadPath>(_onSetDownloadPath);
    on<SetAutoPair>(_onSetAutoPair);
    on<ToggleNotifications>(_onToggleNotifications);
    on<ToggleTransferCompleteNotification>(
      _onToggleTransferCompleteNotification,
    );
    on<ToggleTransferFailedNotification>(_onToggleTransferFailedNotification);
    on<ToggleTransferProgressNotification>(
      _onToggleTransferProgressNotification,
    );
  }

  Future<void> _onLoadSettings(
    LoadSettings event,
    Emitter<SettingsState> emit,
  ) async {
    final isDarkMode = _prefs.getBool(_keyDarkMode) ?? false;
    final deviceName = _prefs.getString(_keyDeviceName) ?? 'My Device';
    final autoSync = _prefs.getBool(_keyAutoSync) ?? true;
    final autoStart = _prefs.getBool(_keyAutoStart) ?? false;
    final downloadPath = _prefs.getString(_keyDownloadPath) ?? 'default';
    final autoPair = _prefs.getBool(_keyAutoPair) ?? true;
    final notificationsEnabled =
        _prefs.getBool(SettingsKeys.notificationsEnabled) ?? true;
    final transferCompleteNotification =
        _prefs.getBool(SettingsKeys.transferCompleteNotification) ?? true;
    final transferFailedNotification =
        _prefs.getBool(SettingsKeys.transferFailedNotification) ?? true;
    final transferProgressNotification =
        _prefs.getBool(SettingsKeys.transferProgressNotification) ?? true;

    emit(
      state.copyWith(
        isDarkMode: isDarkMode,
        deviceName: deviceName,
        autoSyncEnabled: autoSync,
        autoStartEnabled: autoStart,
        downloadPath: downloadPath,
        autoPairEnabled: autoPair,
        notificationsEnabled: notificationsEnabled,
        transferCompleteNotificationEnabled: transferCompleteNotification,
        transferFailedNotificationEnabled: transferFailedNotification,
        transferProgressNotificationEnabled: transferProgressNotification,
      ),
    );
  }

  Future<void> _onToggleDarkMode(
    ToggleDarkMode event,
    Emitter<SettingsState> emit,
  ) async {
    final newValue = !state.isDarkMode;
    await _prefs.setBool(_keyDarkMode, newValue);
    emit(state.copyWith(isDarkMode: newValue));
  }

  Future<void> _onSetDeviceName(
    SetDeviceName event,
    Emitter<SettingsState> emit,
  ) async {
    await _prefs.setString(_keyDeviceName, event.name);
    emit(state.copyWith(deviceName: event.name));
  }

  Future<void> _onSetAutoSync(
    SetAutoSync event,
    Emitter<SettingsState> emit,
  ) async {
    await _prefs.setBool(_keyAutoSync, event.enabled);
    emit(state.copyWith(autoSyncEnabled: event.enabled));
  }

  Future<void> _onSetAutoStart(
    SetAutoStart event,
    Emitter<SettingsState> emit,
  ) async {
    await _prefs.setBool(_keyAutoStart, event.enabled);
    emit(state.copyWith(autoStartEnabled: event.enabled));
  }

  Future<void> _onSetDownloadPath(
    SetDownloadPath event,
    Emitter<SettingsState> emit,
  ) async {
    await _prefs.setString(_keyDownloadPath, event.path);
    emit(state.copyWith(downloadPath: event.path));
  }

  Future<void> _onSetAutoPair(
    SetAutoPair event,
    Emitter<SettingsState> emit,
  ) async {
    await _prefs.setBool(_keyAutoPair, event.enabled);
    emit(state.copyWith(autoPairEnabled: event.enabled));
  }

  Future<void> _onToggleNotifications(
    ToggleNotifications event,
    Emitter<SettingsState> emit,
  ) async {
    final newValue = !state.notificationsEnabled;
    await _prefs.setBool(SettingsKeys.notificationsEnabled, newValue);
    emit(state.copyWith(notificationsEnabled: newValue));
  }

  Future<void> _onToggleTransferCompleteNotification(
    ToggleTransferCompleteNotification event,
    Emitter<SettingsState> emit,
  ) async {
    final newValue = !state.transferCompleteNotificationEnabled;
    await _prefs.setBool(SettingsKeys.transferCompleteNotification, newValue);
    emit(state.copyWith(transferCompleteNotificationEnabled: newValue));
  }

  Future<void> _onToggleTransferFailedNotification(
    ToggleTransferFailedNotification event,
    Emitter<SettingsState> emit,
  ) async {
    final newValue = !state.transferFailedNotificationEnabled;
    await _prefs.setBool(SettingsKeys.transferFailedNotification, newValue);
    emit(state.copyWith(transferFailedNotificationEnabled: newValue));
  }

  Future<void> _onToggleTransferProgressNotification(
    ToggleTransferProgressNotification event,
    Emitter<SettingsState> emit,
  ) async {
    final newValue = !state.transferProgressNotificationEnabled;
    await _prefs.setBool(SettingsKeys.transferProgressNotification, newValue);
    emit(state.copyWith(transferProgressNotificationEnabled: newValue));
  }
}
