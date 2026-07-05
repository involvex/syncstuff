import 'package:equatable/equatable.dart';

class SettingsState extends Equatable
{
    final bool isDarkMode;
    final String deviceName;
    final String downloadPath;
    final bool autoPairEnabled;
    final String? error;

    const SettingsState({
        this.isDarkMode = false,
        this.deviceName = 'My PC',
        this.downloadPath = 'downloads',
        this.autoPairEnabled = true,
        this.error
    });

    SettingsState copyWith({
        bool? isDarkMode,
        String? deviceName,
        String? downloadPath,
        bool? autoPairEnabled,
        String? error
    }) 
    {
        return SettingsState(
            isDarkMode: isDarkMode ?? this.isDarkMode,
            deviceName: deviceName ?? this.deviceName,
            downloadPath: downloadPath ?? this.downloadPath,
            autoPairEnabled: autoPairEnabled ?? this.autoPairEnabled,
            error: error
        );
    }

    @override
    List<Object?> get props => [
        isDarkMode,
        deviceName,
        downloadPath,
        autoPairEnabled,
        error
    ];
}
