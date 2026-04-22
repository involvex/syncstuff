import 'package:equatable/equatable.dart';

class SettingsState extends Equatable {
  final bool isDarkMode;
  final String deviceName;
  final bool autoSyncEnabled;
  final bool autoStartEnabled;
  final String? error;

  const SettingsState({
    this.isDarkMode = false,
    this.deviceName = 'My Device',
    this.autoSyncEnabled = true,
    this.autoStartEnabled = false,
    this.error,
  });

  SettingsState copyWith({
    bool? isDarkMode,
    String? deviceName,
    bool? autoSyncEnabled,
    bool? autoStartEnabled,
    String? error,
  }) {
    return SettingsState(
      isDarkMode: isDarkMode ?? this.isDarkMode,
      deviceName: deviceName ?? this.deviceName,
      autoSyncEnabled: autoSyncEnabled ?? this.autoSyncEnabled,
      autoStartEnabled: autoStartEnabled ?? this.autoStartEnabled,
      error: error,
    );
  }

  @override
  List<Object?> get props => [
    isDarkMode,
    deviceName,
    autoSyncEnabled,
    autoStartEnabled,
    error,
  ];
}
