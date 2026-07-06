import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../domain/entities/transfer.dart';
import '../bloc/transfer/transfer_bloc.dart';
import '../bloc/transfer/transfer_event.dart';
import '../bloc/transfer/transfer_state.dart';
import '../bloc/device/device_bloc.dart';
import '../widgets/transfer_card.dart';
import '../widgets/empty_state.dart';

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
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(context),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: TabBar(
              controller: _tabController,
              tabs: const [
                Tab(text: 'Active'),
                Tab(text: 'Completed'),
                Tab(text: 'Failed'),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: BlocBuilder<TransferBloc, TransferState>(
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
                    _buildTransferList(
                      context,
                      activeTransfers,
                      isActive: true,
                    ),
                    _buildTransferList(
                      context,
                      completedTransfers,
                      isActive: false,
                    ),
                    _buildTransferList(
                      context,
                      failedTransfers,
                      isActive: false,
                    ),
                  ],
                );
              },
            ),
          ),
        ],
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

  Widget _buildHeader(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Transfers', style: theme.textTheme.displaySmall),
          const SizedBox(height: 4),
          Text(
            'Send and receive files with your devices',
            style: theme.textTheme.bodyMedium,
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
      return EmptyState(
        icon: isActive ? Icons.swap_horiz : Icons.history,
        title: isActive ? 'No active transfers' : 'No transfers yet',
        subtitle: isActive
            ? 'Send a file to get started'
            : 'Completed and failed transfers will appear here',
        action: isActive
            ? ElevatedButton.icon(
                onPressed: () => _pickAndSendFiles(context),
                icon: const Icon(Icons.send),
                label: const Text('Send Files'),
              )
            : null,
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: transfers.length,
      itemBuilder: (context, index) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: TransferCard(
          fileName: transfers[index].fileName,
          fileSize: transfers[index].fileSize,
          type: transfers[index].direction == TransferDirection.sent
              ? TransferUiType.sent
              : TransferUiType.received,
          status: _mapStatus(transfers[index].status),
          progress: transfers[index].progress,
          deviceName: transfers[index].deviceName,
          timestamp: transfers[index].createdAt,
          onCancel: isActive
              ? () {
                  context.read<TransferBloc>().add(
                    CancelTransfer(transfers[index].id),
                  );
                }
              : null,
          onRetry: !isActive && transfers[index].status == TransferStatus.failed
              ? () {}
              : null,
          onOpen: transfers[index].status == TransferStatus.completed
              ? () => _openFileLocation(transfers[index].filePath)
              : null,
        ),
      ),
    );
  }

  TransferUiStatus _mapStatus(TransferStatus status) {
    switch (status) {
      case TransferStatus.pending:
        return TransferUiStatus.pending;
      case TransferStatus.inProgress:
        return TransferUiStatus.inProgress;
      case TransferStatus.completed:
        return TransferUiStatus.completed;
      case TransferStatus.failed:
      case TransferStatus.cancelled:
        return TransferUiStatus.failed;
    }
  }

  Future<void> _pickAndSendFiles(BuildContext context) async {
    final deviceState = context.read<DeviceBloc>().state;
    final connectedDevice = deviceState.pairedDevices.isNotEmpty
        ? deviceState.pairedDevices.first
        : null;

    if (connectedDevice == null) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('No connected devices. Pair with a device first.'),
          ),
        );
      }
      return;
    }

    try {
      final result = await FilePicker.pickFiles(allowMultiple: true);

      if (result != null && result.files.isNotEmpty && context.mounted) {
        for (final file in result.files) {
          if (file.path != null) {
            context.read<TransferBloc>().add(
              StartTransfer(
                deviceIp: connectedDevice.ipAddress ?? '',
                filePath: file.path!,
              ),
            );
          }
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error picking files: $e')));
      }
    }
  }

  Future<void> _pickAndSendFolder(BuildContext context) async {
    final deviceState = context.read<DeviceBloc>().state;
    final connectedDevice = deviceState.pairedDevices.isNotEmpty
        ? deviceState.pairedDevices.first
        : null;

    if (connectedDevice == null) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('No connected devices. Pair with a device first.'),
          ),
        );
      }
      return;
    }

    try {
      final directoryPath = await FilePicker.getDirectoryPath();

      if (directoryPath != null && context.mounted) {
        final transferBloc = context.read<TransferBloc>();
        final dir = Directory(directoryPath);
        if (await dir.exists()) {
          await for (final entity in dir.list(recursive: true)) {
            if (entity is File) {
              transferBloc.add(
                StartTransfer(
                  deviceIp: connectedDevice.ipAddress ?? '',
                  filePath: entity.path,
                ),
              );
            }
          }
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error picking folder: $e')));
      }
    }
  }

  void _openFileLocation(String? filePath) {
    if (filePath == null) return;

    if (Platform.isWindows) {
      Process.run('explorer', ['/select,', filePath]);
    }
  }
}
