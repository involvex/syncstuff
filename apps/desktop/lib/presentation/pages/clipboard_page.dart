import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../bloc/clipboard/clipboard_bloc.dart';
import '../bloc/clipboard/clipboard_event.dart';
import '../bloc/clipboard/clipboard_state.dart';
import '../widgets/empty_state.dart';

class ClipboardPage extends StatelessWidget {
  const ClipboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(context),
          _buildSyncBanner(context),
          Expanded(
            child: BlocBuilder<ClipboardBloc, ClipboardState>(
              builder: (context, state) {
                if (state.items.isEmpty) {
                  return EmptyState(
                    icon: Icons.content_paste_off,
                    title: 'No clipboard history',
                    subtitle: 'Copied text will appear here',
                    action: ElevatedButton.icon(
                      onPressed: () => _addClipboardItem(context),
                      icon: const Icon(Icons.add),
                      label: const Text('Add Item'),
                    ),
                  );
                }

                return _buildClipboardList(context, state);
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _addClipboardItem(context),
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Clipboard', style: theme.textTheme.displaySmall),
              const SizedBox(height: 4),
              Text(
                'Sync clipboard across devices',
                style: theme.textTheme.bodyMedium,
              ),
            ],
          ),
          BlocBuilder<ClipboardBloc, ClipboardState>(
            builder: (context, state) {
              return Row(
                children: [
                  if (state.isSyncing)
                    Padding(
                      padding: const EdgeInsets.only(right: 12),
                      child: SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: theme.colorScheme.primary,
                        ),
                      ),
                    ),
                  Text('Sync', style: theme.textTheme.bodyMedium),
                  const SizedBox(width: 8),
                  Switch(
                    value: state.syncEnabled,
                    onChanged: (_) {
                      context.read<ClipboardBloc>().add(ToggleClipboardSync());
                    },
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSyncBanner(BuildContext context) {
    return BlocBuilder<ClipboardBloc, ClipboardState>(
      builder: (context, state) {
        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 24),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: state.syncEnabled
                ? Colors.green.withValues(alpha: 0.08)
                : Colors.grey.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: state.syncEnabled
                  ? Colors.green.withValues(alpha: 0.2)
                  : Colors.grey.withValues(alpha: 0.2),
            ),
          ),
          child: Row(
            children: [
              Icon(
                state.syncEnabled ? Icons.sync : Icons.sync_disabled,
                size: 20,
                color: state.syncEnabled ? Colors.green : Colors.grey,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  state.syncEnabled
                      ? 'Clipboard sync enabled - Changes will be sent to paired devices'
                      : 'Clipboard sync disabled',
                  style: TextStyle(
                    color: state.syncEnabled
                        ? Colors.green[700]
                        : Colors.grey[600],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildClipboardList(BuildContext context, ClipboardState state) {
    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: state.items.length,
      itemBuilder: (context, index) {
        final item = state.items[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: Icon(
              item.contentType == 'text' ? Icons.text_fields : Icons.image,
            ),
            title: Text(
              item.content,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            subtitle: Text(
              _formatDateTime(item.createdAt),
              style: TextStyle(
                color: Theme.of(
                  context,
                ).colorScheme.onSurface.withValues(alpha: 0.6),
                fontSize: 12,
              ),
            ),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (item.synced)
                  const Icon(Icons.cloud_done, color: Colors.green, size: 20),
                IconButton(
                  icon: const Icon(Icons.delete_outline),
                  onPressed: () {
                    context.read<ClipboardBloc>().add(
                      DeleteClipboardItem(item.id),
                    );
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  String _formatDateTime(DateTime dt) {
    return '${dt.day}/${dt.month}/${dt.year} ${dt.hour}:${dt.minute.toString().padLeft(2, '0')}';
  }

  void _addClipboardItem(BuildContext context) {
    final controller = TextEditingController();
    unawaited(
      showDialog<void>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Add Clipboard Item'),
          content: TextField(
            controller: controller,
            decoration: const InputDecoration(
              hintText: 'Enter text to add to clipboard',
            ),
            maxLines: 4,
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                if (controller.text.isNotEmpty) {
                  context.read<ClipboardBloc>().add(
                    AddClipboardItem(
                      content: controller.text,
                      contentType: 'text',
                    ),
                  );
                }
                Navigator.pop(context);
              },
              child: const Text('Add'),
            ),
          ],
        ),
      ),
    );
  }
}
