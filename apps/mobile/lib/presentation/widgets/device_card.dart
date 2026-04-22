import 'package:flutter/material.dart';
import '../../../domain/entities/device.dart';

class DeviceCard extends StatelessWidget {
  final SyncDevice device;
  final VoidCallback? onTap;
  final VoidCallback? onPair;
  final VoidCallback? onConnect;
  final VoidCallback? onDisconnect;

  const DeviceCard({
    super.key,
    required this.device,
    this.onTap,
    this.onPair,
    this.onConnect,
    this.onDisconnect,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              // Device Icon
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: _getStatusColor(device.status).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  _getDeviceIcon(device.platform),
                  color: _getStatusColor(device.status),
                  size: 28,
                ),
              ),
              const SizedBox(width: 16),

              // Device Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      device.name,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: _getStatusColor(device.status),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          device.status.name.toUpperCase(),
                          style: TextStyle(
                            fontSize: 12,
                            color: _getStatusColor(device.status),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Text(
                          device.platform.name.toUpperCase(),
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Action Button
              if (onPair != null)
                ElevatedButton(
                  onPressed: onPair,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                  ),
                  child: const Text('Pair'),
                )
              else if (onConnect != null)
                IconButton(
                  onPressed: onConnect,
                  icon: const Icon(Icons.link),
                  color: Theme.of(context).colorScheme.primary,
                )
              else if (onDisconnect != null)
                IconButton(
                  onPressed: onDisconnect,
                  icon: const Icon(Icons.link_off),
                  color: Colors.orange,
                ),
            ],
          ),
        ),
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

  Color _getStatusColor(DeviceStatus status) {
    switch (status) {
      case DeviceStatus.online:
        return Colors.green;
      case DeviceStatus.offline:
        return Colors.grey;
      case DeviceStatus.connecting:
        return Colors.orange;
    }
  }
}
