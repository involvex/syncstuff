import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../bloc/clipboard/clipboard_bloc.dart';
import '../bloc/clipboard/clipboard_event.dart';
import '../bloc/clipboard/clipboard_state.dart';

class ClipboardPage extends StatelessWidget {
  const ClipboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Clipboard'),
        actions: [
          BlocBuilder<ClipboardBloc, ClipboardState>(
            builder: (context, state) {
              return Switch(
                value: state.syncEnabled,
                onChanged: (_) {
                  context.read<ClipboardBloc>().add(ToggleClipboardSync());
                },
              );
            },
          ),
        ],
      ),
      body: BlocBuilder<ClipboardBloc, ClipboardState>(
        builder: (context, state) {
          return Column(
            children: [
              // Sync Status Banner
              Container(
                padding: const EdgeInsets.all(16),
                color: state.syncEnabled
                    ? Colors.green.withValues(alpha: 0.1)
                    : Colors.grey.withValues(alpha: 0.1),
                child: Row(
                  children: [
                    Icon(
                      state.syncEnabled ? Icons.sync : Icons.sync_disabled,
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
              ),

              // Clipboard Items List
              Expanded(
                child: state.items.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.content_paste_off,
                              size: 80,
                              color: Theme.of(
                                context,
                              ).colorScheme.primary.withValues(alpha: 0.5),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'No clipboard history',
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Copied text will appear here',
                              style: Theme.of(context).textTheme.bodyMedium
                                  ?.copyWith(color: Colors.grey),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        itemCount: state.items.length,
                        itemBuilder: (context, index) {
                          final item = state.items[index];
                          return Card(
                            margin: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            child: ListTile(
                              leading: Icon(
                                item.contentType == 'text'
                                    ? Icons.text_fields
                                    : Icons.image,
                              ),
                              title: Text(
                                item.content,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              subtitle: Text(
                                _formatDateTime(item.createdAt),
                                style: TextStyle(
                                  color: Colors.grey[600],
                                  fontSize: 12,
                                ),
                              ),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  if (item.synced)
                                    const Icon(
                                      Icons.cloud_done,
                                      color: Colors.green,
                                      size: 20,
                                    ),
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
                      ),
              ),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _addClipboardItem(context),
        child: const Icon(Icons.add),
      ),
    );
  }

  String _formatDateTime(DateTime dt) {
    return '${dt.day}/${dt.month}/${dt.year} ${dt.hour}:${dt.minute.toString().padLeft(2, '0')}';
  }

  void _addClipboardItem(BuildContext context) {
    final controller = TextEditingController();
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
                Navigator.pop(context);
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }
}
