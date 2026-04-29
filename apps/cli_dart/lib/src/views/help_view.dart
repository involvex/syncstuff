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
            Text(
              'Help & Keyboard Shortcuts',
              style: SyncStuffTheme.titleStyle,
            ),
            const Divider(height: 1),
            const SizedBox(height: 1),
            
            # SyncStuff CLI - Help

## Navigation
- **↑/↓** or **j/k** - Navigate between views
- **1-6** - Jump directly to a view
- **Enter** - Activate selected item
- **Esc** - Close menu/palette or quit

## Views
- **1 📊 Status** - System overview and server status
- **2 📱 Devices** - Discovered and connected devices
- **3 📁 Transfer** - File transfer operations
- **4 📋 Clipboard** - Clipboard sharing controls
- **5 🖥️ Server** - Server control and logs
- **6 ❓ Help** - This help screen

## Actions
- **s** - Scan for devices on local network
- **t** - Toggle server on/off
- **:** - Open command palette (VSCode-style)
- **Esc** - Quit application

## Command Palette (:-prefix)
Once opened with `:`, you can:
- **↑/↓** - Navigate commands
- **Enter** - Execute selected command
- **Esc** - Close palette

Available commands:
- Scan for devices
- Start/Stop/Toggle server
- Get/Set clipboard
- Show help
- Quit application

## Device Connection
When devices are discovered:
- Green indicator (🟢) = Connected
- White indicator (⚪) = Discovered but not connected

## Server Information
When server is running:
- HTTP API available on port+1
- TCP device discovery on main port
- WebSocket endpoint for real-time updates

## File Transfer
Select a device from the devices view to initiate file transfers.

## Clipboard Sync
Enable clipboard synchronization in settings for real-time sharing.

## Notes
- This TUI requires a proper terminal that supports ANSI colors
- Some IDE terminals may not support all features
- For best experience, use PowerShell, CMD, Windows Terminal, or similar