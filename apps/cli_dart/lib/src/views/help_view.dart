import 'package:nocterm/nocterm.dart';
import 'package:syncstuff_cli/src/theme.dart';
import 'package:syncstuff_cli/src/state/app_state.dart';

/// Help view showing keyboard shortcuts and usage information
class HelpView extends StatelessComponent {
  final AppState state;

  const HelpView({super.key, required this.state});

  @override
  Component build(BuildContext context) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(2),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Text('Help & Keyboard Shortcuts', style: SyncStuffTheme.titleStyle),
            const Divider(height: 1),
            const SizedBox(height: 1),

            // Navigation section
            _buildSection('Navigation', [
              _buildItem('↑/↓ or j/k', 'Navigate between views'),
              _buildItem('1-6', 'Jump directly to a view'),
              _buildItem('Enter', 'Activate selected item'),
              _buildItem('Esc', 'Close menu/palette or quit'),
            ]),

            // Views section
            _buildSection('Views', [
              _buildItem('1 📊 Status', 'System overview and server status'),
              _buildItem('2 📱 Devices', 'Discovered and connected devices'),
              _buildItem('3 📁 Transfer', 'File transfer operations'),
              _buildItem('4 📋 Clipboard', 'Clipboard sharing controls'),
              _buildItem('5 🖥️ Server', 'Server control and logs'),
              _buildItem('6 ❓ Help', 'This help screen'),
            ]),

            // Actions section
            _buildSection('Actions', [
              _buildItem('s', 'Scan for devices on local network'),
              _buildItem('t', 'Toggle server on/off'),
              _buildItem(':', 'Open command palette (VSCode-style)'),
              _buildItem('Esc', 'Quit application'),
            ]),

            // Command Palette section
            _buildSection('Command Palette (:-prefix)', [
              _buildItem('↑/↓', 'Navigate commands'),
              _buildItem('Enter', 'Execute selected command'),
              _buildItem('Esc', 'Close palette'),
              const SizedBox(height: 1),
              Text('Available commands:', style: SyncStuffTheme.mutedStyle),
              _buildItem('', 'Scan for devices'),
              _buildItem('', 'Start/Stop/Toggle server'),
              _buildItem('', 'Get/Set clipboard'),
              _buildItem('', 'Show help'),
              _buildItem('', 'Quit application'),
            ]),

            // Device Connection section
            _buildSection('Device Connection', [
              Text(
                'When devices are discovered:',
                style: SyncStuffTheme.bodyStyle,
              ),
              _buildItem('🟢', 'Green indicator = Connected'),
              _buildItem('⚪', 'White indicator = Discovered but not connected'),
            ]),

            // Server Information section
            _buildSection('Server Information', [
              Text('When server is running:', style: SyncStuffTheme.bodyStyle),
              _buildItem('', 'HTTP API available on port+1'),
              _buildItem('', 'TCP device discovery on main port'),
              _buildItem('', 'WebSocket endpoint for real-time updates'),
            ]),

            // File Transfer section
            _buildSection('File Transfer', [
              Text(
                'Select a device from the devices view to initiate file transfers.',
                style: SyncStuffTheme.bodyStyle,
              ),
            ]),

            // Clipboard Sync section
            _buildSection('Clipboard Sync', [
              Text(
                'Enable clipboard synchronization in settings for real-time sharing.',
                style: SyncStuffTheme.bodyStyle,
              ),
            ]),

            // Notes section
            _buildSection('Notes', [
              Text(
                '• This TUI requires a proper terminal that supports ANSI colors',
                style: SyncStuffTheme.mutedStyle,
              ),
              Text(
                '• Some IDE terminals may not support all features',
                style: SyncStuffTheme.mutedStyle,
              ),
              Text(
                '• For best experience, use PowerShell, CMD, Windows Terminal, or similar',
                style: SyncStuffTheme.mutedStyle,
              ),
            ]),
          ],
        ),
      ),
    );
  }

  Component _buildSection(String title, List<Component> children) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 2),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: SyncStuffTheme.titleStyle),
          const SizedBox(height: 1),
          ...children,
        ],
      ),
    );
  }

  Component _buildItem(String shortcut, String description) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 1),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (shortcut.isNotEmpty) ...[
            Text(shortcut.padRight(20), style: SyncStuffTheme.infoStyle),
            const SizedBox(width: 1),
          ],
          Expanded(child: Text(description, style: SyncStuffTheme.bodyStyle)),
        ],
      ),
    );
  }
}
