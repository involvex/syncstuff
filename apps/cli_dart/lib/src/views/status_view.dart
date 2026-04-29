import 'package:nocterm/nocterm.dart';
import 'package:syncstuff_cli/src/theme.dart';
import 'package:syncstuff_cli/src/state/app_state.dart';

/// Status view showing system information
class StatusView extends StatelessComponent {
  final AppState state;

  const StatusView({super.key, required this.state});

  @override
  Component build(BuildContext context) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(2),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // System info card
            Container(
              decoration: SyncStuffTheme.cardDecoration,
              padding: const EdgeInsets.all(1),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('System Status', style: SyncStuffTheme.titleStyle),
                  const Divider(height: 1),
                  const SizedBox(height: 1),
                  InfoRow(
                    label: 'Status',
                    value: state.serverRunning ? '🟢 Running' : '🔴 Stopped',
                    valueStyle: TextStyle(
                      color: state.serverRunning
                          ? SyncStuffTheme.success
                          : SyncStuffTheme.error,
                    ),
                  ),
                  InfoRow(
                    label: 'Device ID',
                    value: state.deviceId.isNotEmpty
                        ? '${state.deviceId.substring(0, 8)}...'
                        : 'Not set',
                  ),
                  InfoRow(label: 'Local IP', value: state.localIp),
                  InfoRow(
                    label: 'Port',
                    value: state.serverPort?.toString() ?? 'Not running',
                  ),
                  InfoRow(
                    label: 'Connected Devices',
                    value: '${state.devices.length}',
                  ),
                  if (state.scanning) ...[
                    const SizedBox(height: 1),
                    Text(
                      'Scanning network...',
                      style: SyncStuffTheme.warningStyle,
                    ),
                    const SizedBox(height: 1),
                    LinearProgressIndicator(
                      value: null, // Indeterminate
                      color: SyncStuffTheme.warning,
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 2),
            // Recent activity log
            Container(
              decoration: SyncStuffTheme.cardDecoration,
              padding: const EdgeInsets.all(1),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Recent Activity', style: SyncStuffTheme.titleStyle),
                  const Divider(height: 1),
                  const SizedBox(height: 1),
                  // In a real implementation, we'd show actual logs
                  // For now, showing placeholder
                  state.serverLogs.isEmpty
                      ? Text(
                          'No recent activity',
                          style: SyncStuffTheme.mutedStyle,
                        )
                      : ListView.builder(
                          shrinkWrap: true,
                          itemCount: state.serverLogs.length > 5
                              ? 5
                              : state.serverLogs.length,
                          itemBuilder: (context, index) {
                            final log =
                                state.serverLogs[state.serverLogs.length -
                                    1 -
                                    index];
                            return LogEntryView(
                              timestamp: log.timeStr,
                              message: log.message,
                              level: log.level,
                            );
                          },
                        ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Helper widget for displaying key-value pairs
class InfoRow extends StatelessComponent {
  final String label;
  final String value;
  final TextStyle? valueStyle;

  const InfoRow({
    super.key,
    required this.label,
    required this.value,
    this.valueStyle,
  });

  @override
  Component build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 1),
      child: Row(
        children: [
          SizedBox(
            width: 15,
            child: Text('$label:', style: SyncStuffTheme.mutedStyle),
          ),
          Expanded(
            child: Text(value, style: valueStyle ?? SyncStuffTheme.bodyStyle),
          ),
        ],
      ),
    );
  }
}

/// Helper widget for displaying log entries
class LogEntryView extends StatelessComponent {
  final String timestamp;
  final String message;
  final String level;

  const LogEntryView({
    super.key,
    required this.timestamp,
    required this.message,
    required this.level,
  });

  @override
  Component build(BuildContext context) {
    Color levelColor;
    switch (level) {
      case 'error':
        levelColor = SyncStuffTheme.error;
        break;
      case 'warn':
      case 'warning':
        levelColor = SyncStuffTheme.warning;
        break;
      case 'info':
        levelColor = SyncStuffTheme.info;
        break;
      case 'debug':
        levelColor = SyncStuffTheme.muted;
        break;
      default:
        levelColor = SyncStuffTheme.foreground;
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 1),
      child: Row(
        children: [
          Text(
            '[$timestamp] ',
            style: SyncStuffTheme.mutedStyle.copyWith(fontSize: 10),
          ),
          Text(
            message,
            style: TextStyle(color: levelColor, fontSize: 10),
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
