import 'package:shared_preferences/shared_preferences.dart';

class SettingsLocalDataSource {
  static const String _keyDarkMode = 'dark_mode';
  static const String _keyDeviceName = 'device_name';
  static const String _keyAutoSync = 'auto_sync';
  static const String _keyAutoStart = 'auto_start';
  static const String _keyDownloadPath = 'download_path';
  static const String _keyAutoPair = 'auto_pair';
  static const String _keyDeviceId = 'device_id';

  final SharedPreferences _prefs;

  SettingsLocalDataSource(this._prefs);

  bool getDarkMode() => _prefs.getBool(_keyDarkMode) ?? false;
  Future<void> setDarkMode(bool value) => _prefs.setBool(_keyDarkMode, value);

  String getDeviceName() => _prefs.getString(_keyDeviceName) ?? 'My Device';
  Future<void> setDeviceName(String value) =>
      _prefs.setString(_keyDeviceName, value);

  bool getAutoSync() => _prefs.getBool(_keyAutoSync) ?? false;
  Future<void> setAutoSync(bool value) => _prefs.setBool(_keyAutoSync, value);

  bool getAutoStart() => _prefs.getBool(_keyAutoStart) ?? false;
  Future<void> setAutoStart(bool value) => _prefs.setBool(_keyAutoStart, value);

  String getDownloadPath() => _prefs.getString(_keyDownloadPath) ?? 'default';
  Future<void> setDownloadPath(String value) =>
      _prefs.setString(_keyDownloadPath, value);

  bool getAutoPair() => _prefs.getBool(_keyAutoPair) ?? true;
  Future<void> setAutoPair(bool value) => _prefs.setBool(_keyAutoPair, value);

  String? getDeviceId() => _prefs.getString(_keyDeviceId);
  Future<void> setDeviceId(String value) =>
      _prefs.setString(_keyDeviceId, value);

  Future<void> clear() => _prefs.clear();
}
