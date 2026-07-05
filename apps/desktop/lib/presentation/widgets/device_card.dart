import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

enum DeviceConnectionStatus
{
    connected, disconnected, connecting
}

class DeviceCard extends StatelessWidget
{
    final String name;
    final String platform;
    final String? ipAddress;
    final DeviceConnectionStatus status;
    final VoidCallback? onTap;
    final VoidCallback? onConnect;
    final bool isDesktop;

    const DeviceCard({
        super.key,
        required this.name,
        required this.platform,
        this.ipAddress,
        this.status = DeviceConnectionStatus.disconnected,
        this.onTap,
        this.onConnect,
        this.isDesktop = false
    });

    IconData get _platformIcon 
    {
        switch (platform.toLowerCase())
        {
            case 'android':
                return Icons.phone_android;
            case 'ios':
                return Icons.phone_iphone;
            case 'windows':
                return Icons.desktop_windows;
            case 'macos':
                return Icons.laptop_mac;
            case 'linux':
                return Icons.computer;
            default:
                return Icons.devices;
        }
    }

    Color get _statusColor 
    {
        switch (status)
        {
            case DeviceConnectionStatus.connected:
                return AppColors.connected;
            case DeviceConnectionStatus.connecting:
                return AppColors.connecting;
            case DeviceConnectionStatus.disconnected:
                return AppColors.disconnected;
        }
    }

    String get _statusText 
    {
        switch (status)
        {
            case DeviceConnectionStatus.connected:
                return 'Connected';
            case DeviceConnectionStatus.connecting:
                return 'Connecting...';
            case DeviceConnectionStatus.disconnected:
                return 'Available';
        }
    }

    @override
    Widget build(BuildContext context) 
    {
        final theme = Theme.of(context);
        final isDark = theme.brightness == Brightness.dark;

        return Card(
            child: InkWell(
                onTap: onTap,
                borderRadius: BorderRadius.circular(12),
                child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                        children: [
                            Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                    color: theme.colorScheme.primary.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(10)
                                ),
                                child: Icon(
                                    _platformIcon,
                                    size: 28,
                                    color: theme.colorScheme.primary
                                )
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                                child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                        Text(
                                            name,
                                            style: theme.textTheme.titleMedium?.copyWith(
                                                fontWeight: FontWeight.w600
                                            )
                                        ),
                                        const SizedBox(height: 4),
                                        Row(
                                            children: [
                                                Container(
                                                    width: 8,
                                                    height: 8,
                                                    decoration: BoxDecoration(
                                                        color: _statusColor,
                                                        shape: BoxShape.circle
                                                    )
                                                ),
                                                const SizedBox(width: 6),
                                                Text(
                                                    _statusText,
                                                    style: theme.textTheme.bodySmall?.copyWith(
                                                        color: _statusColor
                                                    )
                                                ),
                                                if (ipAddress != null) ...[
                                                    const SizedBox(width: 12),
                                                    Text(
                                                        ipAddress!,
                                                        style: theme.textTheme.bodySmall?.copyWith(
                                                            color: isDark
                                                                ? AppColors.textMutedDark
                                                                : AppColors.textMutedLight
                                                        )
                                                    )
                                                ]
                                            ]
                                        )
                                    ]
                                )
                            ),
                            if (onConnect != null &&
                                status != DeviceConnectionStatus.connected)
                            ElevatedButton(
                                onPressed: onConnect,
                                child: Text(
                                    status == DeviceConnectionStatus.connecting
                                        ? 'Connecting'
                                        : 'Connect'
                                )
                            ),
                            if (status == DeviceConnectionStatus.connected)
                            Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 6
                                ),
                                decoration: BoxDecoration(
                                    color: AppColors.success.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(20)
                                ),
                                child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                        const Icon(
                                            Icons.check_circle,
                                            size: 16,
                                            color: AppColors.success
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                            'Connected',
                                            style: theme.textTheme.labelSmall?.copyWith(
                                                color: AppColors.success,
                                                fontWeight: FontWeight.w500
                                            )
                                        )
                                    ]
                                )
                            )
                        ]
                    )
                )
            )
        );
    }
}
