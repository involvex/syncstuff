import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:file_picker/file_picker.dart';

import '../../../domain/entities/transfer.dart';
import '../bloc/transfer/transfer_bloc.dart';
import '../bloc/transfer/transfer_event.dart';
import '../bloc/transfer/transfer_state.dart';
import '../bloc/device/device_bloc.dart';

class TransfersPage extends StatelessWidget {
  const TransfersPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Transfers')),
      body: BlocBuilder<TransferBloc, TransferState>(
        builder: (context, state) {
          if (state.activeTransfers.isEmpty && state.transferHistory.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.swap_horiz,
                    size: 80,
                    color: Theme.of(
                      context,
                    ).colorScheme.primary.withValues(alpha: 0.5),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'No transfers yet',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Send files to your paired devices',
                    style: Theme.of(
                      context,
                    ).textTheme.bodyMedium?.copyWith(color: Colors.grey),
                  ),
                ],
              ),
            );
          }

          return ListView(
            children: [
              // Active Transfers
              if (state.activeTransfers.isNotEmpty) ...[
                const Padding(
                  padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Text(
                    'Active Transfers',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
                ...state.activeTransfers.map(
                  (transfer) =>
                      _buildTransferItem(context, transfer, isActive: true),
                ),
              ],

              // Transfer History
              if (state.transferHistory.isNotEmpty) ...[
                const Padding(
                  padding: EdgeInsets.fromLTRB(16, 24, 16, 8),
                  child: Text(
                    'History',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
                ...state.transferHistory.map(
                  (transfer) =>
                      _buildTransferItem(context, transfer, isActive: false),
                ),
              ],
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _pickAndSendFile(context),
        icon: const Icon(Icons.send),
        label: const Text('Send File'),
      ),
    );
  }

  Widget _buildTransferItem(
    BuildContext context,
    FileTransfer transfer, {
    required bool isActive,
  }) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  transfer.direction == TransferDirection.sent
                      ? Icons.upload
                      : Icons.download,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        transfer.fileName,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${transfer.formattedSize} - ${transfer.direction.name}',
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                    ],
                  ),
                ),
                if (isActive)
                  Text(
                    '${(transfer.progress * 100).toInt()}%',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  )
                else
                  Icon(
                    transfer.status == TransferStatus.completed
                        ? Icons.check_circle
                        : Icons.error,
                    color: transfer.status == TransferStatus.completed
                        ? Colors.green
                        : Colors.red,
                  ),
              ],
            ),
            if (isActive) ...[
              const SizedBox(height: 12),
              LinearProgressIndicator(
                value: transfer.progress,
                backgroundColor: Colors.grey[300],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Future<void> _pickAndSendFile(BuildContext context) async {
    final deviceState = context.read<DeviceBloc>().state;
    if (deviceState.pairedDevices.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('No paired devices. Pair a device first.'),
        ),
      );
      return;
    }

    final result = await FilePicker.platform.pickFiles();
    if (result != null && context.mounted) {
      final file = result.files.first;
      // For demo, send to first paired device
      final device = deviceState.pairedDevices.first;
      final deviceId = device.id;
      final deviceIp = device.ipAddress ?? '192.168.178.69'; // fallback

      context.read<TransferBloc>().add(
        StartTransfer(
          deviceId: deviceId,
          deviceIp: deviceIp,
          filePath: file.path ?? file.name,
        ),
      );
    }
  }
}
