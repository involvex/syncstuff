import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../bloc/settings/settings_bloc.dart';
import '../bloc/settings/settings_event.dart';
import '../bloc/settings/settings_state.dart';
import '../widgets/section_header.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocBuilder<SettingsBloc, SettingsState>(
        builder: (context, state) {
          return ListView(
            padding: const EdgeInsets.all(24),
            children: [
              _buildHeader(context),
              const SizedBox(height: 32),
              const SectionHeader(title: 'Device'),
              const SizedBox(height: 8),
              _SettingsTile(
                icon: Icons.computer,
                title: 'Device Name',
                subtitle: state.deviceName,
                onTap: () => _showDeviceNameDialog(context, state.deviceName),
              ),
              const SizedBox(height: 8),
              _SettingsTile(
                icon: Icons.folder_open,
                title: 'Download Location',
                subtitle: state.downloadPath,
                onTap: () => _pickDownloadFolder(context, state.downloadPath),
              ),
              const SizedBox(height: 32),
              const SectionHeader(title: 'Appearance'),
              const SizedBox(height: 8),
              _SettingsTile(
                icon: state.isDarkMode ? Icons.dark_mode : Icons.light_mode,
                title: 'Dark Mode',
                subtitle: state.isDarkMode
                    ? 'Using dark theme'
                    : 'Using light theme',
                trailing: Switch(
                  value: state.isDarkMode,
                  onChanged: (_) =>
                      context.read<SettingsBloc>().add(ToggleDarkMode()),
                ),
              ),
              const SizedBox(height: 32),
              const SectionHeader(title: 'Network'),
              const SizedBox(height: 8),
              _SettingsTile(
                icon: Icons.bluetooth_searching,
                title: 'Auto Pair',
                subtitle: 'Automatically discover and connect to known devices',
                trailing: Switch(
                  value: state.autoPairEnabled,
                  onChanged: (value) =>
                      context.read<SettingsBloc>().add(SetAutoPair(value)),
                ),
              ),
              const SizedBox(height: 32),
              const SectionHeader(title: 'Behavior'),
              const SizedBox(height: 8),
              _SettingsTile(
                icon: Icons.minimize,
                title: 'Minimize to Tray',
                subtitle: 'Keep app running in system tray when closed',
                trailing: Switch(
                  value: state.minimizeToTrayEnabled,
                  onChanged: (_) =>
                      context.read<SettingsBloc>().add(ToggleMinimizeToTray()),
                ),
              ),
              const SizedBox(height: 32),
              const SectionHeader(title: 'Notifications'),
              const SizedBox(height: 8),
              _SettingsTile(
                icon: Icons.notifications,
                title: 'Enable Notifications',
                subtitle: 'Show notifications for transfer events',
                trailing: Switch(
                  value: state.notificationsEnabled,
                  onChanged: (_) =>
                      context.read<SettingsBloc>().add(ToggleNotifications()),
                ),
              ),
              if (state.notificationsEnabled) ...[
                const SizedBox(height: 8),
                _SettingsTile(
                  icon: Icons.check_circle_outline,
                  title: 'Transfer Complete',
                  subtitle: 'Notify when transfer finishes',
                  trailing: Switch(
                    value: state.transferCompleteNotificationEnabled,
                    onChanged: (_) => context.read<SettingsBloc>().add(
                      ToggleTransferCompleteNotification(),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                _SettingsTile(
                  icon: Icons.error_outline,
                  title: 'Transfer Failed',
                  subtitle: 'Notify when transfer fails',
                  trailing: Switch(
                    value: state.transferFailedNotificationEnabled,
                    onChanged: (_) => context.read<SettingsBloc>().add(
                      ToggleTransferFailedNotification(),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                _SettingsTile(
                  icon: Icons.trending_up,
                  title: 'Transfer Progress',
                  subtitle: 'Show progress notifications',
                  trailing: Switch(
                    value: state.transferProgressNotificationEnabled,
                    onChanged: (_) => context.read<SettingsBloc>().add(
                      ToggleTransferProgressNotification(),
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 32),
              const SectionHeader(title: 'About'),
              const SizedBox(height: 8),
              _SettingsTile(
                icon: Icons.info_outline,
                title: 'Version',
                subtitle: '1.0.0',
              ),
              const SizedBox(height: 8),
              _SettingsTile(
                icon: Icons.code,
                title: 'Source Code',
                subtitle: 'View on GitHub',
                onTap: () {},
              ),
              const SizedBox(height: 8),
              _SettingsTile(
                icon: Icons.description_outlined,
                title: 'Licenses',
                subtitle: 'Open source licenses',
                onTap: () => showLicensePage(context: context),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Settings', style: theme.textTheme.displaySmall),
        const SizedBox(height: 4),
        Text(
          'Customize your SyncStuff experience',
          style: theme.textTheme.bodyMedium,
        ),
      ],
    );
  }

  void _showDeviceNameDialog(BuildContext context, String currentName) {
    final controller = TextEditingController(text: currentName);
    final theme = Theme.of(context);

    showDialog<void>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Device Name'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Give your device a name to identify it on the network.',
              style: theme.textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              decoration: const InputDecoration(
                labelText: 'Device Name',
                hintText: 'e.g., My Desktop',
              ),
              autofocus: true,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              if (controller.text.isNotEmpty) {
                context.read<SettingsBloc>().add(
                  SetDeviceName(controller.text),
                );
                Navigator.pop(dialogContext);
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  Future<void> _pickDownloadFolder(
    BuildContext context,
    String currentPath,
  ) async {
    try {
      final result = await FilePicker.getDirectoryPath();

      if (result != null && context.mounted) {
        context.read<SettingsBloc>().add(SetDownloadPath(result));
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Error selecting folder: $e')));
      }
    }
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;
  final Widget? trailing;

  const _SettingsTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.onTap,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: theme.colorScheme.primary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 20, color: theme.colorScheme.primary),
        ),
        title: Text(
          title,
          style: theme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        subtitle: Text(subtitle, style: theme.textTheme.bodySmall),
        trailing:
            trailing ??
            (onTap != null
                ? Icon(
                    Icons.chevron_right,
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
                  )
                : null),
        onTap: onTap,
      ),
    );
  }
}
