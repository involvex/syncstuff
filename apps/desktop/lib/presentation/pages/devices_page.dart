import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../domain/entities/device.dart';
import '../bloc/device/device_bloc.dart';
import '../bloc/device/device_event.dart';
import '../bloc/device/device_state.dart';
import '../widgets/device_card.dart';
import '../widgets/empty_state.dart';
import '../widgets/section_header.dart';

class DevicesPage extends StatelessWidget {
  const DevicesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(context),
          _buildDiscoveryBanner(context),
          Expanded(
            child: BlocBuilder<DeviceBloc, DeviceState>(
              builder: (context, state) {
                if (state.pairedDevices.isEmpty &&
                    state.discoveredDevices.isEmpty &&
                    state.discoveryStatus != 'discovering') {
                  return EmptyState(
                    icon: Icons.devices,
                    title: 'No devices found',
                    subtitle:
                        'Tap the scan button to discover devices on your network',
                    action: ElevatedButton.icon(
                      onPressed: () =>
                          context.read<DeviceBloc>().add(StartDiscovery()),
                      icon: const Icon(Icons.search),
                      label: const Text('Start Scanning'),
                    ),
                  );
                }

                return _buildDeviceList(context, state);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Devices', style: theme.textTheme.displaySmall),
              const SizedBox(height: 4),
              Text(
                'Manage and connect to your devices',
                style: theme.textTheme.bodyMedium,
              ),
            ],
          ),
          BlocBuilder<DeviceBloc, DeviceState>(
            builder: (context, state) {
              final isScanning = state.discoveryStatus == 'discovering';
              return Row(
                children: [
                  if (isScanning) ...[
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: theme.colorScheme.primary,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Scanning...',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.primary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                  ],
                  IconButton.outlined(
                    onPressed: () {
                      if (isScanning) {
                        context.read<DeviceBloc>().add(StopDiscovery());
                      } else {
                        context.read<DeviceBloc>().add(StartDiscovery());
                      }
                    },
                    icon: Icon(
                      isScanning ? Icons.stop : Icons.search,
                      size: 20,
                    ),
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildDiscoveryBanner(BuildContext context) {
    return BlocBuilder<DeviceBloc, DeviceState>(
      builder: (context, state) {
        if (state.discoveryStatus != 'discovering') {
          return const SizedBox.shrink();
        }

        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 24),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Theme.of(
              context,
            ).colorScheme.primary.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: Theme.of(
                context,
              ).colorScheme.primary.withValues(alpha: 0.2),
            ),
          ),
          child: Row(
            children: [
              Icon(
                Icons.wifi_tethering,
                size: 20,
                color: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(width: 12),
              Text(
                'Searching for devices on your network...',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const Spacer(),
              Text(
                '${state.discoveredDevices.length} found',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDeviceList(BuildContext context, DeviceState state) {
    final theme = Theme.of(context);

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        if (state.pairedDevices.isNotEmpty) ...[
          const SectionHeader(title: 'Paired Devices'),
          const SizedBox(height: 8),
          ...state.pairedDevices.map(
            (d) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: _buildDeviceCard(context, d, isPaired: true),
            ),
          ),
          const SizedBox(height: 24),
        ],
        if (state.discoveredDevices.isNotEmpty) ...[
          SectionHeader(
            title: 'Discovered Devices',
            trailing: Text(
              '${state.discoveredDevices.length} found',
              style: theme.textTheme.bodySmall,
            ),
          ),
          const SizedBox(height: 8),
          ...state.discoveredDevices
              .where((d) => !d.isPaired)
              .map(
                (d) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: _buildDeviceCard(context, d, isPaired: false),
                ),
              ),
        ],
      ],
    );
  }

  Widget _buildDeviceCard(
    BuildContext context,
    SyncDevice device, {
    required bool isPaired,
  }) {
    return DeviceCard(
      name: device.name,
      platform: device.platform.displayName,
      ipAddress: device.ipAddress,
      status: isPaired
          ? DeviceConnectionStatus.connected
          : DeviceConnectionStatus.disconnected,
      isDesktop: device.platform == DevicePlatform.windows,
      onConnect: isPaired
          ? null
          : () {
              context.read<DeviceBloc>().add(PairDevice(device.id));
            },
      onTap: () {
        _showDeviceDetails(context, device);
      },
    );
  }

  void _showDeviceDetails(BuildContext context, SyncDevice device) {
    final theme = Theme.of(context);

    showModalBottomSheet(
      context: context,
      backgroundColor: theme.cardTheme.color,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (bottomSheetContext) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    _getPlatformIcon(device.platform),
                    size: 32,
                    color: theme.colorScheme.primary,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(device.name, style: theme.textTheme.headlineMedium),
                      const SizedBox(height: 4),
                      Text(
                        device.platform.displayName,
                        style: theme.textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            _buildDetailRow(
              context,
              'IP Address',
              device.ipAddress ?? 'Unknown',
            ),
            _buildDetailRow(context, 'Device ID', device.id),
            if (device.isPaired)
              _buildDetailRow(context, 'Status', 'Paired')
            else
              _buildDetailRow(context, 'Status', 'Available'),
            const SizedBox(height: 24),
            if (!device.isPaired)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    context.read<DeviceBloc>().add(PairDevice(device.id));
                    Navigator.pop(bottomSheetContext);
                  },
                  child: const Text('Pair Device'),
                ),
              ),
          ],
        ),
      ),
    );
  }

  IconData _getPlatformIcon(DevicePlatform platform) {
    switch (platform) {
      case DevicePlatform.android:
        return Icons.phone_android;
      case DevicePlatform.ios:
        return Icons.phone_iphone;
      case DevicePlatform.windows:
        return Icons.desktop_windows;
      case DevicePlatform.mac:
        return Icons.laptop_mac;
      case DevicePlatform.linux:
        return Icons.computer;
      default:
        return Icons.devices;
    }
  }

  Widget _buildDetailRow(BuildContext context, String label, String value) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: theme.textTheme.bodyMedium),
          Text(
            value,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
