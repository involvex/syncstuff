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
    with TickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
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
            Tab(text: 'Queue'),
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
              _buildQueueList(context, state.queuedTransfers),
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

  Widget _buildQueueList(
    BuildContext context,
    List<FileTransfer> queuedTransfers,
  ) {
    if (queuedTransfers.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.queue,
              size: 80,
              color: Theme.of(
                context,
              ).colorScheme.primary.withValues(alpha: 0.5),
            ),
            const SizedBox(height: 16),
            Text(
              'Queue empty',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              'Queued transfers will appear here',
              style: Theme.of(
                context,
              ).textTheme.bodyMedium?.copyWith(color: Colors.grey),
            ),
          ],
        ),
      );
    }

    return ReorderableListView.builder(
      padding: const EdgeInsets.symmetric(vertical: 8),
      itemCount: queuedTransfers.length,
      // onReorder is deprecated in Flutter 3.46+ but onReorderItem API isn't stable yet
      // ignore: deprecated_member_use
      onReorder: (oldIndex, newIndex) {
        final adjustedIndex = newIndex > oldIndex ? newIndex - 1 : newIndex;
        final transfer = queuedTransfers[oldIndex];
        final reordered = List<FileTransfer>.from(queuedTransfers);
        reordered.removeAt(oldIndex);
        reordered.insert(adjustedIndex, transfer);
        context.read<TransferBloc>().add(
          UpdateQueueOrder(reordered),
        );
      },
      itemBuilder: (context, index) {
        return _buildQueueItem(
          context,
          queuedTransfers[index],
          index,
          total: queuedTransfers.length,
        );
      },
    );
  }

  Widget _buildQueueItem(
    BuildContext context,
    FileTransfer transfer,
    int index, {
    required int total,
  }) {
    return Card(
      key: ValueKey(transfer.id),
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                _buildPriorityIcon(transfer.priority),
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
                        '${transfer.formattedSize} - ${transfer.direction.displayName}',
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.cancel, color: Colors.red),
                  onPressed: () => _cancelQueuedTransfer(context, transfer.id),
                  tooltip: 'Cancel',
                ),
                ReorderableDragStartListener(
                  index: index,
                  child: const Icon(Icons.drag_handle),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(
                  Icons.flag,
                  size: 16,
                  color: _getPriorityColor(transfer.priority),
                ),
                const SizedBox(width: 4),
                Text(
                  transfer.priority.displayName,
                  style: TextStyle(
                    fontSize: 12,
                    color: _getPriorityColor(transfer.priority),
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const Spacer(),
                Text(
                  '${index + 1} of $total',
                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPriorityIcon(TransferPriority priority) {
    final color = _getPriorityColor(priority);
    return Icon(
      Icons.flag,
      color: color,
    );
  }

  Color _getPriorityColor(TransferPriority priority) {
    switch (priority) {
      case TransferPriority.urgent:
        return Colors.red;
      case TransferPriority.high:
        return Colors.orange;
      case TransferPriority.normal:
        return Colors.blue;
      case TransferPriority.low:
        return Colors.grey;
    }
  }

  void _cancelQueuedTransfer(BuildContext context, String transferId) {
    context.read<TransferBloc>().add(DequeueTransfer(transferId));
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
                        '${transfer.formattedSize} - ${transfer.direction.displayName}',
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
      final priority = await _showPriorityDialog(context);
      if (priority == null) return;

      final device = deviceState.pairedDevices.first;
      final deviceId = device.id;
      final deviceIp = device.ipAddress ?? '';

      for (final file in result.files) {
        if (file.path != null && context.mounted) {
          context.read<TransferBloc>().add(
            EnqueueTransfer(
              deviceId: deviceId,
              deviceIp: deviceIp,
              filePath: file.path!,
              priority: priority,
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
      final priority = await _showPriorityDialog(context);
      if (priority == null) return;

      final device = deviceState.pairedDevices.first;
      final deviceId = device.id;
      final deviceIp = device.ipAddress ?? '';

      final dir = Directory(directoryPath);
      if (await dir.exists()) {
        await for (final entity in dir.list(recursive: true)) {
          if (entity is File) {
            if (context.mounted) {
              context.read<TransferBloc>().add(
                EnqueueTransfer(
                  deviceId: deviceId,
                  deviceIp: deviceIp,
                  filePath: entity.path,
                  priority: priority,
                ),
              );
            }
          }
        }
      }
    }
  }

  Future<TransferPriority?> _showPriorityDialog(BuildContext context) {
    return showModalBottomSheet<TransferPriority>(
      context: context,
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Select Priority',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              ...TransferPriority.values.map(
                (priority) => ListTile(
                  leading: Icon(Icons.flag, color: _getPriorityColor(priority)),
                  title: Text(priority.displayName),
                  subtitle: Text(_getPriorityDescription(priority)),
                  onTap: () => Navigator.of(context).pop(priority),
                ),
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Cancel'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _getPriorityDescription(TransferPriority priority) {
    switch (priority) {
      case TransferPriority.urgent:
        return 'Transfer immediately, bypass queue';
      case TransferPriority.high:
        return 'Transfer before normal priority items';
      case TransferPriority.normal:
        return 'Standard transfer order';
      case TransferPriority.low:
        return 'Transfer when queue is empty';
    }
  }
}
