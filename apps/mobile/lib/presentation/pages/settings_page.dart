import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:file_picker/file_picker.dart';

import '../bloc/settings/settings_bloc.dart';
import '../bloc/settings/settings_event.dart';
import '../bloc/settings/settings_state.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: BlocBuilder<SettingsBloc, SettingsState>(
        builder: (context, state) {
          return ListView(
            children: [
              _buildSectionHeader(context, 'Device'),
              _buildListTile(
                context,
                icon: Icons.phone_android,
                title: 'Device Name',
                subtitle: state.deviceName,
                onTap: () => _showDeviceNameDialog(context, state.deviceName),
              ),
              _buildListTile(
                context,
                icon: Icons.folder,
                title: 'Download Location',
                subtitle: state.downloadPath == 'default'
                    ? 'App Documents (default)'
                    : state.downloadPath,
                onTap: () => _pickDownloadLocation(context),
              ),

              const Divider(),

              _buildSectionHeader(context, 'Appearance'),
              _buildSwitchTile(
                context,
                icon: Icons.dark_mode,
                title: 'Dark Mode',
                subtitle: 'Use dark theme',
                value: state.isDarkMode,
                onChanged: (_) {
                  context.read<SettingsBloc>().add(ToggleDarkMode());
                },
              ),

              const Divider(),

              _buildSectionHeader(context, 'Sync'),
              _buildSwitchTile(
                context,
                icon: Icons.sync,
                title: 'Auto Sync',
                subtitle: 'Automatically sync files when connected',
                value: state.autoSyncEnabled,
                onChanged: (value) {
                  context.read<SettingsBloc>().add(SetAutoSync(value));
                },
              ),
              _buildSwitchTile(
                context,
                icon: Icons.power_settings_new,
                title: 'Auto Start',
                subtitle: 'Start app on device boot',
                value: state.autoStartEnabled,
                onChanged: (value) {
                  context.read<SettingsBloc>().add(SetAutoStart(value));
                },
              ),
              _buildSwitchTile(
                context,
                icon: Icons.bluetooth_searching,
                title: 'Auto Pair',
                subtitle: 'Auto discover and connect to known devices',
                value: state.autoPairEnabled,
                onChanged: (value) {
                  context.read<SettingsBloc>().add(SetAutoPair(value));
                },
              ),

              const Divider(),

              _buildSectionHeader(context, 'About'),
              _buildListTile(
                context,
                icon: Icons.info_outline,
                title: 'Version',
                subtitle: '1.0.0',
              ),
              _buildListTile(
                context,
                icon: Icons.code,
                title: 'Open Source',
                subtitle: 'View source code',
                onTap: () {},
              ),
              _buildListTile(
                context,
                icon: Icons.description,
                title: 'Licenses',
                subtitle: 'View open source licenses',
                onTap: () {
                  showLicensePage(
                    context: context,
                    applicationName: 'SyncStuff',
                    applicationVersion: '1.0.0',
                  );
                },
              ),

              const SizedBox(height: 32),
            ],
          );
        },
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: Theme.of(context).colorScheme.primary,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _buildListTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    String? subtitle,
    VoidCallback? onTap,
  }) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      subtitle: subtitle != null ? Text(subtitle) : null,
      trailing: onTap != null ? const Icon(Icons.chevron_right) : null,
      onTap: onTap,
    );
  }

  Widget _buildSwitchTile(
    BuildContext context, {
    required IconData icon,
    required String title,
    String? subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      subtitle: subtitle != null ? Text(subtitle) : null,
      trailing: Switch(value: value, onChanged: onChanged),
    );
  }

  void _showDeviceNameDialog(BuildContext context, String currentName) {
    final controller = TextEditingController(text: currentName);
    showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Device Name'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            labelText: 'Name',
            hintText: 'Enter device name',
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              if (controller.text.isNotEmpty) {
                context.read<SettingsBloc>().add(
                  SetDeviceName(controller.text),
                );
                Navigator.pop(context);
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  Future<void> _pickDownloadLocation(BuildContext context) async {
    final result = await FilePicker.platform.getDirectoryPath();
    if (result != null && context.mounted) {
      context.read<SettingsBloc>().add(SetDownloadPath(result));
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Download location set to: $result')),
      );
    }
  }
}
