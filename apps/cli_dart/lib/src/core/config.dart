import 'dart:io';
import 'dart:convert';
import 'package:path/path.dart' as path;

/// Configuration management for SyncStuff CLI
class Config {
  final String apiHost;
  final int apiPort;
  final String? deviceId;
  final String? deviceName;
  final bool autoConnect;

  Config({
    this.apiHost = 'localhost',
    this.apiPort = 8765,
    this.deviceId,
    this.deviceName,
    this.autoConnect = true,
  });

  String get apiUrl => 'http://$apiHost:$apiPort/api';

  static Config load() {
    final configPath = _configPath();
    if (FileSystemEntity.typeSync(configPath) == FileSystemEntityType.file) {
      try {
        final content = File(configPath).readAsStringSync();
        final json = jsonDecode(content) as Map<String, dynamic>;
        return Config(
          apiHost: json['apiHost'] as String? ?? 'localhost',
          apiPort: json['apiPort'] as int? ?? 8765,
          deviceId: json['deviceId'] as String?,
          deviceName: json['deviceName'] as String?,
          autoConnect: json['autoConnect'] as bool? ?? true,
        );
      } catch (e) {
        // Return default on parse error
      }
    }
    return Config();
  }

  void save() {
    final configPath = _configPath();
    final dir = Directory(path.dirname(configPath));
    if (!dir.existsSync()) {
      dir.createSync(recursive: true);
    }
    File(configPath).writeAsStringSync(
      jsonEncode({
        'apiHost': apiHost,
        'apiPort': apiPort,
        'deviceId': deviceId,
        'deviceName': deviceName,
        'autoConnect': autoConnect,
      }),
    );
  }

  static String _configPath() {
    final home =
        Platform.environment['HOME'] ??
        Platform.environment['USERPROFILE'] ??
        '.';
    return path.join(home, '.config', 'syncstuff', 'config.json');
  }

  Config copyWith({
    String? apiHost,
    int? apiPort,
    String? deviceId,
    String? deviceName,
    bool? autoConnect,
  }) {
    return Config(
      apiHost: apiHost ?? this.apiHost,
      apiPort: apiPort ?? this.apiPort,
      deviceId: deviceId ?? this.deviceId,
      deviceName: deviceName ?? this.deviceName,
      autoConnect: autoConnect ?? this.autoConnect,
    );
  }
}
