import 'package:shared_preferences/shared_preferences.dart';

class SettingsLocalDataSource {
  final SharedPreferences _prefs;

  SettingsLocalDataSource(this._prefs);

  static const String _darkModeKey = 'dark_mode';
  static const String _deviceNameKey = 'device_name';
  static const String _autoSyncKey = 'auto_sync';
  static const String _autoStartKey = 'auto_start';
  static const String _downloadPathKey = 'download_path';
  static const String _autoPairKey = 'auto_pair';
  static const String _deviceIdKey = 'device_id';

  bool getDarkMode() => _prefs.getBool(_darkModeKey) ?? false;
  Future<void> setDarkMode(bool value) => _prefs.setBool(_darkModeKey, value);

  String getDeviceName() =>
      _prefs.getString(_deviceNameKey) ?? 'Desktop Device';
  Future<void> setDeviceName(String value) =>
      _prefs.setString(_deviceNameKey, value);

  bool getAutoSync() => _prefs.getBool(_autoSyncKey) ?? true;
  Future<void> setAutoSync(bool value) => _prefs.setBool(_autoSyncKey, value);

  bool getAutoStart() => _prefs.getBool(_autoStartKey) ?? false;
  Future<void> setAutoStart(bool value) => _prefs.setBool(_autoStartKey, value);

  String getDownloadPath() => _prefs.getString(_downloadPathKey) ?? '';
  Future<void> setDownloadPath(String value) =>
      _prefs.setString(_downloadPathKey, value);

  bool getAutoPair() => _prefs.getBool(_autoPairKey) ?? true;
  Future<void> setAutoPair(bool value) => _prefs.setBool(_autoPairKey, value);

  String? getDeviceId() => _prefs.getString(_deviceIdKey);
  Future<void> setDeviceId(String value) =>
      _prefs.setString(_deviceIdKey, value);

  Future<void> clear() => _prefs.clear();
}
