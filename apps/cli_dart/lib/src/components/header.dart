import 'package:nocterm/nocterm.dart';
import 'package:syncstuff_cli/src/theme.dart';
import 'package:syncstuff_cli/src/state/app_state.dart';

/// Header component showing app title and version
class Header extends StatelessComponent {
  final AppState state;

  const Header({super.key, required this.state});

  @override
  Component build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 1, horizontal: 1),
      child: Row(
        children: [
          // App title
          Text('⚡ SyncStuff CLI', style: SyncStuffTheme.titleStyle),
          const Expanded(child: SizedBox.shrink()),
          // Status indicators
          Row(
            children: [
              // Server status
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: state.serverRunning
                      ? SyncStuffTheme.success.withOpacity(0.2)
                      : SyncStuffTheme.error.withOpacity(0.2),
                  border: Border.all(
                    color: state.serverRunning
                        ? SyncStuffTheme.success
                        : SyncStuffTheme.error,
                    width: 1,
                  ),
                  borderRadius: BorderRadius.all(Radius.circular(3)),
                ),
                child: Text(
                  state.serverRunning ? '● Server' : '○ Server',
                  style: TextStyle(
                    color: state.serverRunning
                        ? SyncStuffTheme.success
                        : SyncStuffTheme.error,
                    fontSize: 12,
                  ),
                ),
              ),
              const SizedBox(width: 1),
              // Device count
              Text(
                '📱 ${state.devices.length}',
                style: SyncStuffTheme.bodyStyle,
              ),
              const SizedBox(width: 1),
              // Local IP
              Text('🌐 ${state.localIp}', style: SyncStuffTheme.mutedStyle),
            ],
          ),
        ],
      ),
    );
  }
}
