import 'package:syncstuff_cli/src/commands/base_command.dart';
import 'package:syncstuff_cli/src/core/config.dart';
import 'package:syncstuff_cli/src/core/logger.dart';
import 'package:syncstuff_cli/src/services/network_client.dart';

/// Device management commands
class DeviceCommand extends BaseCommand {
  DeviceCommand(Config config)
    : super(config, 'device', 'Manage connected devices');

  @override
  Future<void> execute(List<String> args) async {
    if (args.isEmpty || args[0] == 'list') {
      return await _listDevices();
    }

    switch (args[0]) {
      case 'list':
        return await _listDevices();
      case 'info':
        return await _deviceInfo(args);
      case 'connect':
        return await _connectDevice(args);
      case 'disconnect':
        return await _disconnectDevice(args);
      default:
        Logger.error('Unknown device command: ${args[0]}');
        Logger.info('Usage: syncstuff device [list|info|connect|disconnect]');
    }
  }

  Future<void> _listDevices() async {
    Logger.header('Connected Devices');

    try {
      final client = NetworkClient(config.apiUrl);
      final devices = await client.getDevices();

      if (devices.isEmpty) {
        Logger.warn('No devices connected');
        Logger.info('Run "syncstuff scan" to discover devices');
        return;
      }

      final rows = <List<String>>[
        ['Name', 'ID', 'Platform', 'Status', 'IP'],
      ];

      for (final device in devices) {
        rows.add([
          device['name'] ?? 'Unknown',
          (device['id'] as String).substring(0, 8),
          device['platform'] ?? 'Unknown',
          device['connected'] == true ? '🟢 Connected' : '⚪ Offline',
          device['ip'] ?? '-',
        ]);
      }

      Logger.table(rows);
    } catch (e) {
      Logger.error('Failed to get devices: $e');
    }
  }

  Future<void> _deviceInfo(List<String> args) async {
    if (args.length < 2) {
      Logger.error('Usage: syncstuff device info <device-id>');
      return;
    }

    final deviceId = args[1];
    Logger.info('Getting info for device: $deviceId');
    // TODO: Implement device info
  }

  Future<void> _connectDevice(List<String> args) async {
    if (args.length < 2) {
      Logger.error('Usage: syncstuff device connect <device-id>');
      return;
    }

    final deviceId = args[1];
    Logger.info('Connecting to device: $deviceId');
    // TODO: Implement connect
  }

  Future<void> _disconnectDevice(List<String> args) async {
    if (args.length < 2) {
      Logger.error('Usage: syncstuff device disconnect <device-id>');
      return;
    }

    final deviceId = args[1];
    Logger.info('Disconnecting from device: $deviceId');
    // TODO: Implement disconnect
  }
}
