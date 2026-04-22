import 'package:shared_preferences/shared_preferences.dart';
import '../datasources/settings_local_datasource.dart';

class SettingsRepository {
  late final SettingsLocalDataSource _localDataSource;

  SettingsRepository(SharedPreferences prefs) {
    _localDataSource = SettingsLocalDataSource(prefs);
  }

  bool getDarkMode() => _localDataSource.getDarkMode();
  Future<void> setDarkMode(bool value) => _localDataSource.setDarkMode(value);

  String getDeviceName() => _localDataSource.getDeviceName();
  Future<void> setDeviceName(String value) =>
      _localDataSource.setDeviceName(value);

  bool getAutoSync() => _localDataSource.getAutoSync();
  Future<void> setAutoSync(bool value) => _localDataSource.setAutoSync(value);

  bool getAutoStart() => _localDataSource.getAutoStart();
  Future<void> setAutoStart(bool value) => _localDataSource.setAutoStart(value);

  String getDownloadPath() => _localDataSource.getDownloadPath();
  Future<void> setDownloadPath(String value) =>
      _localDataSource.setDownloadPath(value);

  bool getAutoPair() => _localDataSource.getAutoPair();
  Future<void> setAutoPair(bool value) => _localDataSource.setAutoPair(value);

  String? getDeviceId() => _localDataSource.getDeviceId();
  Future<void> setDeviceId(String value) => _localDataSource.setDeviceId(value);

  Future<void> clear() => _localDataSource.clear();
}
