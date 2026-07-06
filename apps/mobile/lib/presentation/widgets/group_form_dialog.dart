import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:syncstuff_core/syncstuff_core.dart';

import '../bloc/device/device_bloc.dart';
import '../bloc/device/device_state.dart';
import '../bloc/device_group/device_group_bloc.dart';
import '../bloc/device_group/device_group_event.dart';

class GroupFormDialog extends StatefulWidget {
  final DeviceGroup? existingGroup;

  const GroupFormDialog({super.key, this.existingGroup});

  @override
  State<GroupFormDialog> createState() => _GroupFormDialogState();
}

class _GroupFormDialogState extends State<GroupFormDialog> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameController;
  late final TextEditingController _descriptionController;
  late final Set<String> _selectedDeviceIds;

  bool get _isEditing => widget.existingGroup != null;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(
      text: widget.existingGroup?.name ?? '',
    );
    _descriptionController = TextEditingController(
      text: widget.existingGroup?.description ?? '',
    );
    _selectedDeviceIds = Set<String>.from(
      widget.existingGroup?.deviceIds ?? [],
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(_isEditing ? 'Edit Group' : 'Create Group'),
      content: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Group Name',
                  hintText: 'e.g., Office Devices',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter a group name';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Description (optional)',
                  hintText: 'e.g., All devices in the office',
                  border: OutlineInputBorder(),
                ),
                maxLines: 2,
              ),
              const SizedBox(height: 16),
              const Text(
                'Select Devices',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 8),
              _buildDeviceList(),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: _submit,
          child: Text(_isEditing ? 'Save' : 'Create'),
        ),
      ],
    );
  }

  Widget _buildDeviceList() {
    return BlocBuilder<DeviceBloc, DeviceState>(
      builder: (context, state) {
        final devices = state.pairedDevices;
        if (devices.isEmpty) {
          return Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Row(
              children: [
                Icon(Icons.info_outline, size: 20),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'No paired devices. Pair devices first to add them to groups.',
                    style: TextStyle(fontSize: 13),
                  ),
                ),
              ],
            ),
          );
        }

        return Container(
          constraints: const BoxConstraints(maxHeight: 200),
          decoration: BoxDecoration(
            border: Border.all(
              color: Theme.of(context).colorScheme.outline,
            ),
            borderRadius: BorderRadius.circular(8),
          ),
          child: ListView.builder(
            shrinkWrap: true,
            itemCount: devices.length,
            itemBuilder: (context, index) {
              final device = devices[index];
              final isSelected = _selectedDeviceIds.contains(device.id);
              return CheckboxListTile(
                value: isSelected,
                onChanged: (value) {
                  setState(() {
                    if (value == true) {
                      _selectedDeviceIds.add(device.id);
                    } else {
                      _selectedDeviceIds.remove(device.id);
                    }
                  });
                },
                title: Text(device.name),
                subtitle: Text(
                  device.platform.name.toUpperCase(),
                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                ),
                secondary: Icon(_getDeviceIcon(device.platform)),
                controlAffinity: ListTileControlAffinity.leading,
              );
            },
          ),
        );
      },
    );
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;

    final name = _nameController.text.trim();
    final description = _descriptionController.text.trim();

    if (_isEditing) {
      context.read<DeviceGroupBloc>().add(
        DeleteDeviceGroup(widget.existingGroup!.id),
      );
      context.read<DeviceGroupBloc>().add(
        CreateDeviceGroup(
          name: name,
          description: description.isEmpty ? null : description,
        ),
      );
    } else {
      context.read<DeviceGroupBloc>().add(
        CreateDeviceGroup(
          name: name,
          description: description.isEmpty ? null : description,
        ),
      );
    }

    Navigator.pop(context);
  }

  IconData _getDeviceIcon(DevicePlatform platform) {
    switch (platform) {
      case DevicePlatform.android:
        return Icons.android;
      case DevicePlatform.ios:
        return Icons.apple;
      case DevicePlatform.windows:
        return Icons.desktop_windows;
      case DevicePlatform.mac:
        return Icons.laptop_mac;
      case DevicePlatform.linux:
        return Icons.terminal;
      case DevicePlatform.web:
        return Icons.language;
      case DevicePlatform.cli:
        return Icons.terminal;
      case DevicePlatform.unknown:
        return Icons.devices_other;
    }
  }
}
