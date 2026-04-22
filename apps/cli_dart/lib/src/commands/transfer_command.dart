import 'package:syncstuff_cli/src/commands/base_command.dart';
import 'package:syncstuff_cli/src/core/config.dart';
import 'package:syncstuff_cli/src/core/logger.dart';
import 'package:syncstuff_cli/src/services/network_client.dart';

/// Transfer commands - send/receive files
class TransferCommand extends BaseCommand {
  TransferCommand(Config config)
    : super(config, 'transfer', 'Send/receive files');

  @override
  Future<void> execute(List<String> args) async {
    if (args.isEmpty) {
      Logger.error('Usage: syncstuff transfer [send|receive|list]');
      return;
    }

    switch (args[0]) {
      case 'send':
        return await _sendFile(args);
      case 'receive':
        return await _receiveFile(args);
      case 'list':
        return await _listTransfers();
      default:
        Logger.error('Unknown transfer command: ${args[0]}');
    }
  }

  Future<void> _sendFile(List<String> args) async {
    if (args.length < 3) {
      Logger.error('Usage: syncstuff transfer send <file-path> <device-id>');
      return;
    }

    final filePath = args[1];
    final deviceId = args[2];

    Logger.header('Sending File');
    Logger.info('File: $filePath');
    Logger.info('To: $deviceId');

    try {
      final client = NetworkClient(config.apiUrl);
      final result = await client.uploadFile(filePath, deviceId);

      Logger.success('Transfer initiated');
      Logger.info('Transfer ID: ${result['status']}');
    } catch (e) {
      Logger.error('Failed to send file: $e');
    }
  }

  Future<void> _receiveFile(List<String> args) async {
    if (args.length < 3) {
      Logger.error(
        'Usage: syncstuff transfer receive <transfer-id> <save-path>',
      );
      return;
    }

    final transferId = args[1];
    final savePath = args[2];

    Logger.header('Receiving File');
    Logger.info('Transfer ID: $transferId');
    Logger.info('Save to: $savePath');

    try {
      final client = NetworkClient(config.apiUrl);
      await client.downloadFile(transferId, savePath);
      Logger.success('File downloaded');
    } catch (e) {
      Logger.error('Failed to receive file: $e');
    }
  }

  Future<void> _listTransfers() async {
    Logger.header('Active Transfers');

    // TODO: Get actual transfer list
    final rows = <List<String>>[
      ['ID', 'File', 'Status', 'Progress', 'Speed'],
    ];

    rows.add(['abc123', 'document.pdf', 'Uploading', '45%', '2.1 MB/s']);
    rows.add(['def456', 'photo.jpg', 'Waiting', '0%', '-']);

    Logger.table(rows);
  }
}
