import 'package:nocterm/nocterm.dart';
import 'package:syncstuff_cli/src/theme.dart';
import 'package:syncstuff_cli/src/state/app_state.dart';

/// Command palette similar to VSCode's command palette
class CommandPalette extends StatelessComponent {
  final AppState state;
  final ValueChanged<String> onCommandSelected;
  final VoidCallback onCancelled;

  const CommandPalette({
    super.key,
    required this.state,
    required this.onCommandSelected,
    required this.onCancelled,
  });

  // Available commands
  static final List<Map<String, dynamic>> _commands = [
    {
      'id': 'scan',
      'label': 'Scan for devices',
      'description': 'Discover devices on the local network',
    },
    {
      'id': 'server:start',
      'label': 'Start server',
      'description': 'Start the local API server',
    },
    {
      'id': 'server:stop',
      'label': 'Stop server',
      'description': 'Stop the local API server',
    },
    {
      'id': 'server:toggle',
      'label': 'Toggle server',
      'description': 'Start or stop the server',
    },
    {
      'id': 'clipboard:get',
      'label': 'Get clipboard',
      'description': 'Retrieve clipboard content from connected device',
    },
    {
      'id': 'clipboard:set',
      'label': 'Set clipboard',
      'description': 'Set clipboard content on connected device',
    },
    {
      'id': 'help',
      'label': 'Show help',
      'description': 'Display keyboard shortcuts and help',
    },
    {
      'id': 'quit',
      'label': 'Quit application',
      'description': 'Exit the SyncStuff CLI',
    },
  ];

  @override
  Component build(BuildContext context) {
    // Filter commands based on current state
    final visibleCommands = _commands.where((cmd) {
      // Hide start/stop when not applicable
      if (cmd['id'] == 'server:start' && state.serverRunning) return false;
      if (cmd['id'] == 'server:stop' && !state.serverRunning) return false;
      return true;
    }).toList();

    // Find selected index
    final selectedIndex = state.commandPaletteVisible
        ? (_commands.indexWhere(
                (cmd) => cmd['id'] == state.commandPaletteVisible,
              ) ??
              0)
        : 0;

    return Focusable(
      focused: true,
      onKeyEvent: (event) {
        // Handle escape to close palette
        if (event.logicalKey == LogicalKey.escape) {
          onCancelled();
          return true;
        }
        // Handle enter to execute command
        if (event.logicalKey == LogicalKey.enter) {
          if (selectedIndex < visibleCommands.length) {
            final commandId = visibleCommands[selectedIndex]['id'] as String;
            onCommandSelected(commandId);
          }
          onCancelled();
          return true;
        }
        // Handle arrow keys for navigation
        if (event.logicalKey == LogicalKey.arrowDown) {
          final newIndex = (selectedIndex + 1) % visibleCommands.length;
          // Update state to track selection (we'd need to modify state for this)
          // For now, just return true to indicate we handled it
          return true;
        }
        if (event.logicalKey == LogicalKey.arrowUp) {
          final newIndex =
              (selectedIndex - 1 + visibleCommands.length) %
              visibleCommands.length;
          return true;
        }
        return false;
      },
      child: Container(
        width: 50,
        decoration: SyncStuffTheme.cardDecoration,
        padding: const EdgeInsets.all(1),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.symmetric(vertical: 1),
              child: Text('Command Palette', style: SyncStuffTheme.titleStyle),
            ),
            const Divider(height: 1),
            // Command list
            Expanded(
              child: ListView.builder(
                itemCount: visibleCommands.length,
                itemBuilder: (context, index) {
                  final command = visibleCommands[index];
                  final bool isSelected = index == selectedIndex;
                  return Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 1,
                      vertical: 0,
                    ),
                    child: Row(
                      children: [
                        // Selection indicator
                        Text(
                          isSelected ? '▶' : ' ',
                          style: TextStyle(
                            color: isSelected
                                ? SyncStuffTheme.primary
                                : SyncStuffTheme.muted,
                          ),
                        ),
                        const SizedBox(width: 1),
                        // Command label
                        Expanded(
                          child: Text(
                            command['label'] as String,
                            style: TextStyle(
                              color: isSelected
                                  ? SyncStuffTheme.foreground
                                  : SyncStuffTheme.muted,
                              fontWeight: isSelected
                                  ? FontWeight.bold
                                  : FontWeight.normal,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 1),
                        // Command description (muted, smaller)
                        if (!isSelected)
                          Text(
                            command['description'] as String,
                            style: SyncStuffTheme.mutedStyle.copyWith(
                              fontSize: 10,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                      ],
                    ),
                  );
                },
              ),
            ),
            // Footer with hint
            Container(
              padding: const EdgeInsets.symmetric(vertical: 1),
              child: Text(
                '↑↓ to navigate, Enter to run, Esc to cancel',
                style: SyncStuffTheme.mutedStyle.copyWith(fontSize: 10),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
