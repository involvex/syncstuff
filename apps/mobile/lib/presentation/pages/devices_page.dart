import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../../../domain/entities/device.dart';
import '../bloc/device/device_bloc.dart';
import '../bloc/device/device_event.dart';
import '../bloc/device/device_state.dart';
import '../widgets/device_card.dart';
import '../../data/services/qr_code_service.dart';

class DevicesPage extends StatefulWidget {
  const DevicesPage({super.key});

  @override
  State<DevicesPage> createState() => _DevicesPageState();
}

class _DevicesPageState extends State<DevicesPage> {
  final QRCodeService _qrService = QRCodeService();
  MobileScannerController? _scannerController;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Devices'),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner),
            onPressed: () => _showQRScanner(context),
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<DeviceBloc>().add(StartDiscovery());
            },
          ),
        ],
      ),
      body: BlocBuilder<DeviceBloc, DeviceState>(
        builder: (context, state) {
          if (state.discoveryStatus == DiscoveryStatus.discovering) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Searching for devices...'),
                ],
              ),
            );
          }

          return CustomScrollView(
            slivers: [
              // Paired Devices Section
              if (state.pairedDevices.isNotEmpty) ...[
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
                    child: Text(
                      'Paired Devices',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                SliverList(
                  delegate: SliverChildBuilderDelegate((context, index) {
                    final device = state.pairedDevices[index];
                    return DeviceCard(
                      device: device,
                      onTap: () => _showDeviceDetails(context, device),
                      onConnect: device.status == DeviceStatus.offline
                          ? () => context.read<DeviceBloc>().add(
                              ConnectToDevice(device),
                            )
                          : null,
                      onDisconnect: device.status == DeviceStatus.online
                          ? () => context.read<DeviceBloc>().add(
                              DisconnectFromDevice(device.id),
                            )
                          : null,
                    );
                  }, childCount: state.pairedDevices.length),
                ),
              ],

              // Discovered Devices Section
              if (state.discoveredDevices.isNotEmpty) ...[
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.fromLTRB(16, 24, 16, 8),
                    child: Text(
                      'Nearby Devices',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                SliverList(
                  delegate: SliverChildBuilderDelegate((context, index) {
                    final device = state.discoveredDevices[index];
                    return DeviceCard(
                      device: device,
                      onTap: () => _showDeviceDetails(context, device),
                      onPair: () =>
                          context.read<DeviceBloc>().add(PairDevice(device)),
                    );
                  }, childCount: state.discoveredDevices.length),
                ),
              ],

              // Empty State
              if (state.pairedDevices.isEmpty &&
                  state.discoveredDevices.isEmpty)
                SliverFillRemaining(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.devices_other,
                          size: 80,
                          color: Theme.of(
                            context,
                          ).colorScheme.primary.withValues(alpha: 0.5),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'No devices found',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Tap the scan button to search for nearby devices',
                          style: Theme.of(
                            context,
                          ).textTheme.bodyMedium?.copyWith(color: Colors.grey),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton.icon(
                          onPressed: () {
                            context.read<DeviceBloc>().add(StartDiscovery());
                          },
                          icon: const Icon(Icons.search),
                          label: const Text('Scan for Devices'),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showMyQRCode(context),
        child: const Icon(Icons.qr_code),
      ),
    );
  }

  void _showMyQRCode(BuildContext context) {
    // TODO: Get actual device info from settings
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Scan to Pair', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              child: PairingQRDisplay(
                deviceId: 'device-123',
                deviceName: 'My Flutter Device',
                ipAddress: '192.168.1.100',
                port: 8765,
                size: 200,
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Show this QR code to another device to pair',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  void _showQRScanner(BuildContext context) {
    _scannerController = MobileScannerController(
      detectionSpeed: DetectionSpeed.normal,
      facing: CameraFacing.back,
    );

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (context) => SizedBox(
        height: MediaQuery.of(context).size.height * 0.6,
        child: Column(
          children: [
            AppBar(
              title: const Text('Scan QR Code'),
              automaticallyImplyLeading: false,
              actions: [
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () {
                    _scannerController?.dispose();
                    Navigator.pop(context);
                  },
                ),
              ],
            ),
            Expanded(
              child: MobileScanner(
                controller: _scannerController!,
                onDetect: (capture) {
                  final List<Barcode> barcodes = capture.barcodes;
                  for (final barcode in barcodes) {
                    if (barcode.rawValue != null) {
                      final data = barcode.rawValue!;
                      if (_qrService.isValidPairingQR(data)) {
                        _scannerController?.dispose();
                        Navigator.pop(context);
                        context.read<DeviceBloc>().add(ConnectViaQR(data));
                        return;
                      }
                    }
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showDeviceDetails(BuildContext context, SyncDevice device) {
    showModalBottomSheet<void>(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Theme.of(
                      context,
                    ).colorScheme.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    _getDeviceIcon(device.platform),
                    size: 32,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        device.name,
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      Text(
                        device.platform.name.toUpperCase(),
                        style: Theme.of(
                          context,
                        ).textTheme.bodySmall?.copyWith(color: Colors.grey),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            _buildInfoRow('Status', device.status.name),
            if (device.ipAddress != null)
              _buildInfoRow('IP Address', device.ipAddress!),
            if (device.lastSeen != null)
              _buildInfoRow('Last Seen', _formatDateTime(device.lastSeen!)),
            const SizedBox(height: 24),
            Row(
              children: [
                if (!device.isPaired)
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        context.read<DeviceBloc>().add(PairDevice(device));
                        Navigator.pop(context);
                      },
                      child: const Text('Pair'),
                    ),
                  ),
                if (device.isPaired) ...[
                  Expanded(
                    child: ElevatedButton(
                      onPressed: device.status == DeviceStatus.offline
                          ? () {
                              context.read<DeviceBloc>().add(
                                ConnectToDevice(device),
                              );
                              Navigator.pop(context);
                            }
                          : null,
                      child: Text(
                        device.status == DeviceStatus.connecting
                            ? 'Connecting...'
                            : 'Connect',
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        context.read<DeviceBloc>().add(UnpairDevice(device.id));
                        Navigator.pop(context);
                      },
                      child: const Text('Unpair'),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value),
        ],
      ),
    );
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

  String _formatDateTime(DateTime dt) {
    return '${dt.day}/${dt.month}/${dt.year} ${dt.hour}:${dt.minute.toString().padLeft(2, '0')}';
  }
}
