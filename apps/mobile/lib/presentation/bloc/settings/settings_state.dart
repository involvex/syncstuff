import 'package:equatable/equatable.dart';

class SettingsState extends Equatable {
  final bool isDarkMode;
  final String deviceName;
  final bool autoSyncEnabled;
  final bool autoStartEnabled;
  final String downloadPath;
  final bool autoPairEnabled;
  final bool notificationsEnabled;
  final bool transferCompleteNotificationEnabled;
  final bool transferFailedNotificationEnabled;
  final bool transferProgressNotificationEnabled;
  final String? error;

  const SettingsState({
    this.isDarkMode = false,
    this.deviceName = 'My Device',
    this.autoSyncEnabled = true,
    this.autoStartEnabled = false,
    this.downloadPath = 'default',
    this.autoPairEnabled = true,
    this.notificationsEnabled = true,
    this.transferCompleteNotificationEnabled = true,
    this.transferFailedNotificationEnabled = true,
    this.transferProgressNotificationEnabled = true,
    this.error,
  });

  SettingsState copyWith({
    bool? isDarkMode,
    String? deviceName,
    bool? autoSyncEnabled,
    bool? autoStartEnabled,
    String? downloadPath,
    bool? autoPairEnabled,
    bool? notificationsEnabled,
    bool? transferCompleteNotificationEnabled,
    bool? transferFailedNotificationEnabled,
    bool? transferProgressNotificationEnabled,
    String? error,
  }) {
    return SettingsState(
      isDarkMode: isDarkMode ?? this.isDarkMode,
      deviceName: deviceName ?? this.deviceName,
      autoSyncEnabled: autoSyncEnabled ?? this.autoSyncEnabled,
      autoStartEnabled: autoStartEnabled ?? this.autoStartEnabled,
      downloadPath: downloadPath ?? this.downloadPath,
      autoPairEnabled: autoPairEnabled ?? this.autoPairEnabled,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      transferCompleteNotificationEnabled:
          transferCompleteNotificationEnabled ??
          this.transferCompleteNotificationEnabled,
      transferFailedNotificationEnabled:
          transferFailedNotificationEnabled ??
          this.transferFailedNotificationEnabled,
      transferProgressNotificationEnabled:
          transferProgressNotificationEnabled ??
          this.transferProgressNotificationEnabled,
      error: error,
    );
  }

  @override
  List<Object?> get props => [
    isDarkMode,
    deviceName,
    autoSyncEnabled,
    autoStartEnabled,
    downloadPath,
    autoPairEnabled,
    notificationsEnabled,
    transferCompleteNotificationEnabled,
    transferFailedNotificationEnabled,
    transferProgressNotificationEnabled,
    error,
  ];
}
