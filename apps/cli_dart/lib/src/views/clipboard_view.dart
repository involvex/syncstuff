import 'package:nocterm/nocterm.dart';
import 'package:syncstuff_cli/src/theme.dart';
import 'package:syncstuff_cli/src/state/app_state.dart';

/// Clipboard view showing clipboard content and controls
class ClipboardView extends StatelessComponent {
  final AppState state;

  const ClipboardView({super.key, required this.state});

  @override
  Component build(BuildContext context) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(2),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with actions
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Clipboard', style: SyncStuffTheme.titleStyle),
                Row(
                  children: [
                    // Get clipboard button
                    TextButton(
                      onPressed: () {
                        // In a real implementation, this would fetch from device
                      },
                      label: Text('Get', style: SyncStuffTheme.infoStyle),
                    ),
                    const SizedBox(width: 1),
                    // Set clipboard button
                    TextButton(
                      onPressed: () {
                        // In a real implementation, this would open input dialog
                      },
                      label: Text('Set', style: SyncStuffTheme.infoStyle),
                    ),
                  ],
                ),
              ],
            ),
            const Divider(height: 1),
            const SizedBox(height: 1),

            // Clipboard content display
            Container(
              decoration: SyncStuffTheme.cardDecoration,
              padding: const EdgeInsets.all(1),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Content:', style: SyncStuffTheme.bodyStyle),
                  const SizedBox(height: 1),
                  // Clipboard content area
                  Container(
                    decoration: BoxDecoration(
                      color: SyncStuffTheme.background.withOpacity(0.3),
                      border: Border.all(color: SyncStuffTheme.muted, width: 1),
                      borderRadius: BorderRadius.all(Radius.circular(3)),
                    ),
                    constraints: const BoxConstraints(minHeight: 10),
                    child: state.clipboardContent.isEmpty
                        ? Center(
                            child: Text(
                              '(empty)',
                              style: SyncStuffTheme.mutedStyle,
                            ),
                          )
                        : SelectableText(
                            state.clipboardContent,
                            style: SyncStuffTheme.bodyStyle,
                          ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 2),

            // Controls section
            Container(
              decoration: SyncStuffTheme.cardDecoration,
              padding: const EdgeInsets.all(1),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Controls', style: SyncStuffTheme.titleStyle),
                  const Divider(height: 1),
                  const SizedBox(height: 1),
                  InfoRow(
                    label: 'Sync Status',
                    value: 'Not connected',
                    valueStyle: SyncStuffTheme.warningStyle,
                  ),
                  InfoRow(
                    label: 'Auto Sync',
                    value: 'Disabled',
                    valueStyle: SyncStuffTheme.mutedStyle,
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
