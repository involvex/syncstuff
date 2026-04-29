import 'package:nocterm/nocterm.dart';
import 'package:syncstuff_cli/src/theme.dart';
import 'package:syncstuff_cli/src/state/app_state.dart';

/// Devices view showing discovered and connected devices
class DevicesView extends StatelessComponent {
  final AppState state;

  const DevicesView({super.key, required this.state});

  @override
  Component build(BuildContext context) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(2),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with actions
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Devices', style: SyncStuffTheme.titleStyle),
                if (state.devices.isNotEmpty)
                  TextButton(
                    onPressed: () {
                      // In a real implementation, this would show device details
                      // For now, just refresh
                    },
                    label: Text('Refresh', style: SyncStuffTheme.infoStyle),
                  ),
              ],
            ),
            const Divider(height: 1),
            const SizedBox(height: 1),

            // Scanning status
            if (state.scanning) ...[
              Container(
                padding: const EdgeInsets.all(1),
                decoration: BoxDecoration(
                  color: SyncStuffTheme.warning.withOpacity(0.2),
                  border: Border.all(color: SyncStuffTheme.warning, width: 1),
                  borderRadius: BorderRadius.all(Radius.circular(3)),
                ),
                child: Row(
                  children: [
                    Text('🔍 Scanning...', style: SyncStuffTheme.warningStyle),
                    const Expanded(child: SizedBox.shrink()),
                    LinearProgressIndicator(
                      value: null, // Indeterminate
                      color: SyncStuffTheme.warning,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 1),
            ],

            // Devices list
            state.devices.isEmpty
                ? Center(
                    child: Text(
                      'No devices found.\nPress "s" to scan for devices.',
                      style: SyncStuffTheme.mutedStyle,
                      textAlign: TextAlign.center,
                    ),
                  )
                : DevicesList(devices: state.devices),
          ],
        ),
      ),
    );
  }
}

/// List of devices with selection capabilities
class DevicesList extends StatelessComponent {
  final List<Device> devices;

  const DevicesList({super.key, required this.devices});

  @override
  Component build(BuildContext context) {
    return ListView.builder(
      itemCount: devices.length,
      itemBuilder: (context, index) {
        final device = devices[index];
        return DeviceItem(device: device, index: index);
      },
    );
  }
}

/// Individual device item
class DeviceItem extends StatelessComponent {
  final Device device;
  final int index;

  const DeviceItem({super.key, required this.device, required this.index});

  @override
  Component build(BuildContext context) {
    final isOdd = index.isOdd;

    return Container(
      decoration: BoxDecoration(
        color: isOdd
            ? SyncStuffTheme.background.withOpacity(0.3)
            : Colors.transparent,
      ),
      padding: const EdgeInsets.symmetric(vertical: 1),
      child: Row(
        children: [
          // Device icon based on platform
          Text(_getPlatformIcon(device.platform)),
          const SizedBox(width: 1),
          // Device name
          Expanded(
            child: Text(
              device.name,
              style: SyncStuffTheme.bodyStyle,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: 1),
          // IP address
          Text(device.ip, style: SyncStuffTheme.mutedStyle),
          const SizedBox(width: 1),
          // Connection status
          Text(device.connected ? '🟢' : '⚪', style: TextStyle(fontSize: 12)),
        ],
      ),
    );
  }

  String _getPlatformIcon(String platform) {
    switch (platform.toLowerCase()) {
      case 'android':
        return '🤖';
      case 'ios':
        return '🍎';
      case 'windows':
        return '🪟';
      case 'macos':
        return '💻';
      case 'linux':
        return '🐧';
      case 'cli':
        return '💻';
      default:
        return '❓';
    }
  }
}
