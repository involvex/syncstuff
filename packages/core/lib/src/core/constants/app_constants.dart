class AppConstants {
  static const String appName = 'SyncStuff';
  static const String appVersion = '1.0.0';

  static const int discoveryPort = 8765;
  static const int httpPort = 8766;
  static const int udpBroadcastPort = 8767;

  static const int chunkSize = 16 * 1024;

  static const String downloadFolderName = 'downloads';
  static const String configFolderName = '.config';
  static const String configFileName = 'config.json';

  static const Duration discoveryTimeout = Duration(seconds: 10);
  static const Duration clipboardPollInterval = Duration(seconds: 2);
  static const Duration connectionTimeout = Duration(seconds: 30);

  static const String pairingUriScheme = 'syncstuff://connect';
}
