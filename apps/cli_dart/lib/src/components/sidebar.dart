import 'package:nocterm/nocterm.dart';
import 'package:syncstuff_cli/src/theme.dart';
import 'package:syncstuff_cli/src/state/app_state.dart';

/// Sidebar component for navigation with arrow key support
class Sidebar extends StatelessComponent {
  final AppState state;
  final ValueChanged<AppView> onViewSelected;

  const Sidebar({super.key, required this.state, required this.onViewSelected});

  @override
  Component build(BuildContext context) {
    // Define the views with their icons and labels
    final views = [
      {'view': AppView.status, 'icon': '📊', 'label': 'Status'},
      {'view': AppView.devices, 'icon': '📱', 'label': 'Devices'},
      {'view': AppView.transfer, 'icon': '📁', 'label': 'Transfer'},
      {'view': AppView.clipboard, 'icon': '📋', 'label': 'Clipboard'},
      {'view': AppView.server, 'icon': '🖥️', 'label': 'Server'},
      {'view': AppView.help, 'icon': '❓', 'label': 'Help'},
    ];

    // Find the currently selected index
    final selectedIndex = views.indexWhere(
      (item) => item['view'] as AppView == state.currentView,
    );

    return Focusable(
      focused: true,
      onKeyEvent: (event) {
        // Handle arrow key navigation
        if (event.logicalKey == LogicalKey.arrowDown) {
          final newIndex = (selectedIndex + 1) % views.length;
          onViewSelected(views[newIndex]['view'] as AppView);
          return true;
        }
        if (event.logicalKey == LogicalKey.arrowUp) {
          final newIndex = (selectedIndex - 1 + views.length) % views.length;
          onViewSelected(views[newIndex]['view'] as AppView);
          return true;
        }
        // Handle number key shortcuts (1-6)
        if (event.character != null) {
          final char = event.character!;
          final index = int.tryParse(char);
          if (index != null && index >= 1 && index <= views.length) {
            onViewSelected(views[index - 1]['view'] as AppView);
            return true;
          }
        }
        return false; // Let other keys bubble up
      },
      child: Container(
        width: 20,
        padding: const EdgeInsets.symmetric(vertical: 1),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: views.asMap().entries.map((entry) {
            final index = entry.key;
            final viewData = entry.value;
            final bool isSelected = index == selectedIndex;
            final bool isScanning =
                state.scanning && viewData['view'] == AppView.devices;

            return Padding(
              padding: const EdgeInsets.only(bottom: 1),
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
                  // Icon
                  Text(viewData['icon'] as String),
                  const SizedBox(width: 1),
                  // Label
                  Expanded(
                    child: Text(
                      viewData['label'] as String,
                      style: TextStyle(
                        color: isSelected
                            ? SyncStuffTheme.primary
                            : SyncStuffTheme.foreground,
                        fontWeight: isSelected
                            ? FontWeight.bold
                            : FontWeight.normal,
                      ),
                    ),
                  ),
                  // Scanning indicator
                  if (isScanning)
                    Text(' ●', style: TextStyle(color: SyncStuffTheme.warning)),
                ],
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}
