import 'package:syncstuff_cli/src/commands/base_command.dart';
import 'package:syncstuff_cli/src/core/config.dart';
import 'package:syncstuff_cli/src/core/logger.dart';
import 'package:syncstuff_cli/src/services/network_client.dart';

/// Scan command - discover local network devices
class ScanCommand extends BaseCommand {
  ScanCommand(Config config)
    : super(config, 'scan', 'Discover local network devices');

  @override
  Future<void> execute(List<String> args) async {
    Logger.header('Scanning Network');
    Logger.info('Looking for SyncStuff devices...\n');

    try {
      final client = NetworkClient(config.apiUrl);
      final devices = await client.scanNetwork();

      if (devices.isEmpty) {
        Logger.warn('No devices found');
        Logger.info(
          'Make sure SyncStuff mobile app is running and connected to the same network',
        );
        return;
      }

      final rows = <List<String>>[
        ['Name', 'ID', 'Platform', 'IP', 'Status'],
      ];

      for (final device in devices) {
        rows.add([
          device['name'] ?? 'Unknown',
          (device['id'] as String?)?.substring(0, 8) ?? '-',
          device['platform'] ?? 'Unknown',
          device['ip'] ?? '-',
          device['connected'] == true ? '🟢' : '⚪',
        ]);
      }

      Logger.success('Found ${devices.length} device(s)');
      Logger.table(rows);
    } catch (e) {
      Logger.error('Scan failed: $e');
    }
  }
}
