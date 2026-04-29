import 'package:nocterm/nocterm.dart';
import 'package:syncstuff_cli/src/theme.dart';
import 'package:syncstuff_cli/src/state/app_state.dart';

/// Server view showing server controls and scrolling logs
class ServerView extends StatelessComponent {
  final AppState state;

  const ServerView({super.key, required this.state});

  @override
  Component build(BuildContext context) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(2),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with server controls
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Server Control', style: SyncStuffTheme.titleStyle),
                Row(
                  children: [
                    // Start server button
                    if (!state.serverRunning)
                      TextButton(
                        onPressed: () {
                          // In a real implementation, this would start the server
                        },
                        label: Text(
                          'Start',
                          style: SyncStuffTheme.successStyle,
                        ),
                      ),
                    // Stop server button
                    if (state.serverRunning)
                      TextButton(
                        onPressed: () {
                          // In a real implementation, this would stop the server
                        },
                        label: Text('Stop', style: SyncStuffTheme.errorStyle),
                      ),
                    // Toggle button
                    TextButton(
                      onPressed: () {
                        // In a real implementation, this would toggle the server
                      },
                      label: Text('Toggle', style: SyncStuffTheme.infoStyle),
                    ),
                  ],
                ),
              ],
            ),
            const Divider(height: 1),
            const SizedBox(height: 1),

            // Server status card
            Container(
              decoration: SyncStuffTheme.cardDecoration,
              padding: const EdgeInsets.all(1),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Server Status', style: SyncStuffTheme.titleStyle),
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
                  InfoRow(label: 'Local IP', value: state.localIp),
                  InfoRow(
                    label: 'Port',
                    value: state.serverPort?.toString() ?? 'Not running',
                  ),
                  InfoRow(label: 'Mode', value: 'HTTP + TCP'),
                  if (state.serverRunning) ...[
                    const SizedBox(height: 1),
                    Text('API Endpoints:', style: SyncStuffTheme.bodyStyle),
                    const SizedBox(height: 1),
                    Text(
                      '  • http://${state.localIp}:${state.serverPort + 1}/api/status',
                      style: SyncStuffTheme.mutedStyle,
                    ),
                    Text(
                      '  • http://${state.localIp}:${state.serverPort + 1}/api/devices',
                      style: SyncStuffTheme.mutedStyle,
                    ),
                    Text(
                      '  • http://${state.localIp}:${state.serverPort + 1}/api/clipboard',
                      style: SyncStuffTheme.mutedStyle,
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 2),

            // Server logs section with scrolling
            Container(
              decoration: SyncStuffTheme.cardDecoration,
              padding: const EdgeInsets.all(1),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Server Logs', style: SyncStuffTheme.titleStyle),
                      TextButton(
                        onPressed: () {
                          // Clear logs
                        },
                        label: Text('Clear', style: SyncStuffTheme.infoStyle),
                      ),
                    ],
                  ),
                  const Divider(height: 1),
                  const SizedBox(height: 1),
                  // Scrollable log area
                  Container(
                    height: 20, // Fixed height for scrolling
                    decoration: BoxDecoration(
                      color: SyncStuffTheme.background.withOpacity(0.3),
                      border: Border.all(color: SyncStuffTheme.muted, width: 1),
                      borderRadius: BorderRadius.all(Radius.circular(3)),
                    ),
                    child: state.serverLogs.isEmpty
                        ? Center(
                            child: Text(
                              'No logs yet',
                              style: SyncStuffTheme.mutedStyle,
                            ),
                          )
                        : LogListView(logs: state.serverLogs),
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

/// Scrollable list of log entries
class LogListView extends StatelessComponent {
  final List<LogEntry> logs;

  const LogListView({super.key, required this.logs});

  @override
  Component build(BuildContext context) {
    return ListView.builder(
      itemCount: logs.length > 100 ? 100 : logs.length, // Show last 100 logs
      itemBuilder: (context, index) {
        // Show logs in reverse order (newest first)
        final logIndex = logs.length - 1 - index;
        final log = logs[logIndex];
        return LogEntryWidget(
          log: log,
          isFirst: index == 0,
          isLast: index == (logs.length > 100 ? 99 : logs.length - 1),
        );
      },
    );
  }
}

/// Individual log entry widget
class LogEntryWidget extends StatelessComponent {
  final LogEntry log;
  final bool isFirst;
  final bool isLast;

  const LogEntryWidget({
    super.key,
    required this.log,
    this.isFirst = false,
    this.isLast = false,
  });

  @override
  Component build(BuildContext context) {
    Color levelColor;
    switch (log.level) {
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
      padding: const EdgeInsets.symmetric(horizontal: 1),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Timestamp
          Text(
            '[${log.timeStr}] ',
            style: SyncStuffTheme.mutedStyle.copyWith(fontSize: 10),
          ),
          // Level indicator
          Container(
            width: 8,
            padding: const EdgeInsets.only(right: 1),
            child: Text(
              log.level.substring(0, 1).toUpperCase(),
              style: TextStyle(
                color: levelColor,
                fontWeight: FontWeight.bold,
                fontSize: 10,
              ),
            ),
          ),
          // Message
          Expanded(
            child: Text(
              log.message,
              style: TextStyle(color: levelColor, fontSize: 10),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
