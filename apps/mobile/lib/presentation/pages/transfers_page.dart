import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:file_picker/file_picker.dart';

import '../../domain/entities/transfer.dart';
import '../bloc/transfer/transfer_bloc.dart';
import '../bloc/transfer/transfer_event.dart';
import '../bloc/transfer/transfer_state.dart';
import '../bloc/device/device_bloc.dart';

class TransfersPage extends StatefulWidget {
  const TransfersPage({super.key});

  @override
  State<TransfersPage> createState() => _TransfersPageState();
}

class _TransfersPageState extends State<TransfersPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Transfer Manager'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Active'),
            Tab(text: 'Completed'),
            Tab(text: 'Failed'),
          ],
        ),
      ),
      body: BlocBuilder<TransferBloc, TransferState>(
        builder: (context, state) {
          final activeTransfers = state.activeTransfers
              .where((t) => t.status == TransferStatus.inProgress)
              .toList();
          final completedTransfers = state.transferHistory
              .where((t) => t.status == TransferStatus.completed)
              .toList();
          final failedTransfers = state.transferHistory
              .where(
                (t) =>
                    t.status == TransferStatus.failed ||
                    t.status == TransferStatus.cancelled,
              )
              .toList();

          return TabBarView(
            controller: _tabController,
            children: [
              _buildTransferList(context, activeTransfers, isActive: true),
              _buildTransferList(context, completedTransfers, isActive: false),
              _buildTransferList(context, failedTransfers, isActive: false),
            ],
          );
        },
      ),
      floatingActionButton: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          FloatingActionButton.small(
            heroTag: 'folder',
            onPressed: () => _pickAndSendFolder(context),
            child: const Icon(Icons.folder),
          ),
          const SizedBox(height: 8),
          FloatingActionButton.extended(
            heroTag: 'files',
            onPressed: () => _pickAndSendFiles(context),
            icon: const Icon(Icons.send),
            label: const Text('Send Files'),
          ),
        ],
      ),
    );
  }

  Widget _buildTransferList(
    BuildContext context,
    List<FileTransfer> transfers, {
    required bool isActive,
  }) {
    if (transfers.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isActive ? Icons.swap_horiz : Icons.history,
              size: 80,
              color: Theme.of(
                context,
              ).colorScheme.primary.withValues(alpha: 0.5),
            ),
            const SizedBox(height: 16),
            Text(
              isActive ? 'No active transfers' : 'No transfers yet',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              isActive
                  ? 'Send a file to start transferring'
                  : 'Transfers will appear here',
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(color: Colors.grey),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: transfers.length,
      itemBuilder: (context, index) {
        return _buildTransferItem(
          context,
          transfers[index],
          isActive: isActive,
        );
      },
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

  Future<void> _pickAndSendFiles(BuildContext context) async {
    final deviceState = context.read<DeviceBloc>().state;
    if (deviceState.pairedDevices.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('No paired devices. Pair a device first.'),
        ),
      );
      return;
    }

    final result = await FilePicker.pickFiles(allowMultiple: true);
    if (result != null && result.files.isNotEmpty && context.mounted) {
      final device = deviceState.pairedDevices.first;
      final deviceId = device.id;
      final deviceIp = device.ipAddress ?? '';

      for (final file in result.files) {
        if (file.path != null) {
          context.read<TransferBloc>().add(
            StartTransfer(
              deviceId: deviceId,
              deviceIp: deviceIp,
              filePath: file.path!,
            ),
          );
        }
      }
    }
  }

  Future<void> _pickAndSendFolder(BuildContext context) async {
    final deviceState = context.read<DeviceBloc>().state;
    if (deviceState.pairedDevices.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('No paired devices. Pair a device first.'),
        ),
      );
      return;
    }

    final directoryPath = await FilePicker.getDirectoryPath();
    if (directoryPath != null && context.mounted) {
      final device = deviceState.pairedDevices.first;
      final deviceId = device.id;
      final deviceIp = device.ipAddress ?? '';

      final dir = Directory(directoryPath);
      if (await dir.exists()) {
        await for (final entity in dir.list(recursive: true)) {
          if (entity is File) {
            if (context.mounted) {
              context.read<TransferBloc>().add(
                StartTransfer(
                  deviceId: deviceId,
                  deviceIp: deviceIp,
                  filePath: entity.path,
                ),
              );
            }
          }
        }
      }
    }
  }
}
