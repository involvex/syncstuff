import 'package:nocterm/nocterm.dart';
import 'package:syncstuff_cli/src/theme.dart';
import 'package:syncstuff_cli/src/state/app_state.dart';

/// Status bar showing current actions and hints
class StatusBar extends StatelessComponent {
  final AppState state;

  const StatusBar({super.key, required this.state});

  @override
  Component build(BuildContext context) {
    final hints = <String>[
      if (state.commandPaletteVisible) 'Esc: Close',
      if (!state.commandPaletteVisible) 's: Scan  t: Server  Esc: Quit',
    ];

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 1, horizontal: 1),
      decoration: BoxDecoration(
        color: SyncStuffTheme.background.withOpacity(0.8),
        border: Border(top: BorderSide(color: SyncStuffTheme.muted, width: 1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Left side - current action or status
          Expanded(
            child: Text(
              state.scanning
                  ? 'Scanning network...'
                  : state.serverRunning
                  ? 'Server running on port ${state.serverPort}'
                  : 'Ready',
              style: SyncStuffTheme.mutedStyle,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          // Right side - hints
          Text(hints.join('  '), style: SyncStuffTheme.mutedStyle),
        ],
      ),
    );
  }
}
