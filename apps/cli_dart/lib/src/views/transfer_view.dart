import 'package:nocterm/nocterm.dart';
import 'package:syncstuff_cli/src/theme.dart';
import 'package:syncstuff_cli/src/state/app_state.dart';

/// Transfer view showing file transfers
class TransferView extends StatelessComponent {
  final AppState state;

  const TransferView({super.key, required this.state});

  @override
  Component build(BuildContext context) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(2),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('File Transfers', style: SyncStuffTheme.titleStyle),
                if (state.transfers.isNotEmpty)
                  TextButton(
                    onPressed: () {
                      // Clear completed transfers
                    },
                    label: Text(
                      'Clear Completed',
                      style: SyncStuffTheme.infoStyle,
                    ),
                  ),
              ],
            ),
            const Divider(height: 1),
            const SizedBox(height: 1),

            // Transfers list or empty state
            state.transfers.isEmpty
                ? Center(
                    child: Text(
                      'No active transfers',
                      style: SyncStuffTheme.mutedStyle,
                      textAlign: TextAlign.center,
                    ),
                  )
                : TransfersList(transfers: state.transfers),
          ],
        ),
      ),
    );
  }
}

/// List of transfers
class TransfersList extends StatelessComponent {
  final List<TransferEntry> transfers;

  const TransfersList({super.key, required this.transfers});

  @override
  Component build(BuildContext context) {
    return ListView.builder(
      itemCount: transfers.length,
      itemBuilder: (context, index) {
        final transfer = transfers[index];
        return TransferItem(transfer: transfer, index: index);
      },
    );
  }
}

/// Individual transfer item
class TransferItem extends StatelessComponent {
  final TransferEntry transfer;
  final int index;

  const TransferItem({super.key, required this.transfer, required this.index});

  @override
  Component build(BuildContext context) {
    final isOdd = index.isOdd;

    // Determine status icon and color
    final statusInfo = _getStatusInfo(transfer.status);

    return Container(
      decoration: BoxDecoration(
        color: isOdd
            ? SyncStuffTheme.background.withOpacity(0.3)
            : Colors.transparent,
      ),
      padding: const EdgeInsets.symmetric(vertical: 1),
      child: Row(
        children: [
          // Direction icon
          Text(
            transfer.direction == 'sending' ? '📤' : '📥',
            style: TextStyle(fontSize: 12),
          ),
          const SizedBox(width: 1),
          // File name
          Expanded(
            child: Text(
              transfer.fileName,
              style: SyncStuffTheme.bodyStyle,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: 1),
          // Size
          Text(
            _formatBytes(transfer.sizeBytes),
            style: SyncStuffTheme.mutedStyle,
          ),
          const SizedBox(width: 1),
          // Status
          Text(
            statusInfo.icon,
            style: TextStyle(color: statusInfo.color, fontSize: 12),
          ),
          const SizedBox(width: 1),
          // Peer info (if available)
          if (transfer.peer != null && transfer.peer!.isNotEmpty)
            Expanded(
              child: Text(
                '@${transfer.peer}',
                style: SyncStuffTheme.mutedStyle,
                overflow: TextOverflow.ellipsis,
              ),
            ),
        ],
      ),
    );
  }

  Map<String, dynamic> _getStatusInfo(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return {'icon': '⏳', 'color': SyncStuffTheme.warning};
      case 'in_progress':
        return {'icon': '🔄', 'color': SyncStuffTheme.info};
      case 'complete':
        return {'icon': '✅', 'color': SyncStuffTheme.success};
      case 'failed':
        return {'icon': '❌', 'color': SyncStuffTheme.error};
      default:
        return {'icon': '❓', 'color': SyncStuffTheme.muted};
    }
  }

  String _formatBytes(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    if (bytes < 1024 * 1024 * 1024)
      return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
  }
}
