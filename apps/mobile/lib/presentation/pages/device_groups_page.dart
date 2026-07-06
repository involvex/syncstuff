import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:file_picker/file_picker.dart';
import 'package:syncstuff_core/syncstuff_core.dart';

import '../bloc/device_group/device_group_bloc.dart';
import '../bloc/device_group/device_group_event.dart';
import '../bloc/device_group/device_group_state.dart';
import '../widgets/group_card.dart';
import '../widgets/group_form_dialog.dart';

class DeviceGroupsPage extends StatelessWidget {
  const DeviceGroupsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Device Groups'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<DeviceGroupBloc>().add(LoadDeviceGroups());
            },
          ),
        ],
      ),
      body: BlocBuilder<DeviceGroupBloc, DeviceGroupState>(
        builder: (context, state) {
          if (state.isLoading) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Loading groups...'),
                ],
              ),
            );
          }

          if (state.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.error_outline,
                    size: 64,
                    color: Theme.of(context).colorScheme.error,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Error loading groups',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    state.error!,
                    style: TextStyle(color: Colors.grey[600]),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () {
                      context.read<DeviceGroupBloc>().add(LoadDeviceGroups());
                    },
                    icon: const Icon(Icons.refresh),
                    label: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          if (state.groups.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.group_outlined,
                    size: 80,
                    color: Theme.of(
                      context,
                    ).colorScheme.primary.withValues(alpha: 0.5),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'No device groups',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Create a group to send files to multiple devices at once',
                    style: Theme.of(
                      context,
                    ).textTheme.bodyMedium?.copyWith(color: Colors.grey),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () => _showCreateDialog(context),
                    icon: const Icon(Icons.add),
                    label: const Text('Create Group'),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.symmetric(vertical: 8),
            itemCount: state.groups.length,
            itemBuilder: (context, index) {
              final group = state.groups[index];
              return GroupCard(
                group: group,
                deviceCount: group.deviceIds.length,
                onEdit: () => _showEditDialog(context, group),
                onDelete: () => _confirmDelete(context, group.id),
                onSend: () => _sendToGroup(context, group.id),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showCreateDialog(context),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showCreateDialog(BuildContext context) {
    unawaited(
      showDialog<void>(
        context: context,
        builder: (context) => const GroupFormDialog(),
      ),
    );
  }

  void _showEditDialog(BuildContext context, DeviceGroup group) {
    unawaited(
      showDialog<void>(
        context: context,
        builder: (context) => GroupFormDialog(existingGroup: group),
      ),
    );
  }

  void _confirmDelete(BuildContext context, String groupId) {
    unawaited(
      showDialog<void>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Delete Group'),
          content: const Text(
            'Are you sure you want to delete this group? '
            'This will not delete the devices themselves.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () {
                context.read<DeviceGroupBloc>().add(DeleteDeviceGroup(groupId));
                Navigator.pop(context);
              },
              child: const Text('Delete'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _sendToGroup(BuildContext context, String groupId) async {
    final result = await FilePicker.pickFiles();
    if (result != null && result.files.single.path != null) {
      if (!context.mounted) return;
      context.read<DeviceGroupBloc>().add(
        SendToGroup(groupId: groupId, filePath: result.files.single.path!),
      );
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('File queued for transfer')),
      );
    }
  }
}
