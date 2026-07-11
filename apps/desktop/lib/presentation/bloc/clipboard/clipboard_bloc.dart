import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:syncstuff_core/syncstuff_core.dart';

import '../../../services/desktop_clipboard_sync_service.dart';
import 'clipboard_event.dart';
import 'clipboard_state.dart';

class ClipboardBloc extends Bloc<ClipboardEvent, ClipboardState> {
  final DesktopClipboardSyncService _clipboardService;

  StreamSubscription<List<ClipboardItem>>? _historySubscription;

  ClipboardBloc({required DesktopClipboardSyncService clipboardService})
    : _clipboardService = clipboardService,
      super(const ClipboardState()) {
    on<LoadClipboardItems>(_onLoadItems);
    on<AddClipboardItem>(_onAddItem);
    on<DeleteClipboardItem>(_onDeleteItem);
    on<ToggleClipboardSync>(_onToggleSync);
    on<SyncClipboardToDevices>(_onSyncToDevices);

    _clipboardService.start();

    _historySubscription = _clipboardService.historyStream.listen((_) {
      add(LoadClipboardItems());
    });
  }

  Future<void> _onLoadItems(
    LoadClipboardItems event,
    Emitter<ClipboardState> emit,
  ) async {
    final items = await _clipboardService.getHistory(limit: 100);
    emit(state.copyWith(items: items));
  }

  Future<void> _onAddItem(
    AddClipboardItem event,
    Emitter<ClipboardState> emit,
  ) async {
    await _clipboardService.setClipboard(event.content);
    final items = await _clipboardService.getHistory(limit: 100);
    emit(state.copyWith(items: items));
  }

  Future<void> _onDeleteItem(
    DeleteClipboardItem event,
    Emitter<ClipboardState> emit,
  ) async {
    await _clipboardService.deleteHistoryItem(event.id);
    final items = await _clipboardService.getHistory(limit: 100);
    emit(state.copyWith(items: items));
  }

  void _onToggleSync(ToggleClipboardSync event, Emitter<ClipboardState> emit) {
    final newEnabled = !state.syncEnabled;

    if (newEnabled) {
      _clipboardService.enable();
    } else {
      _clipboardService.disable();
    }

    emit(state.copyWith(syncEnabled: newEnabled));
  }

  Future<void> _onSyncToDevices(
    SyncClipboardToDevices event,
    Emitter<ClipboardState> emit,
  ) async {
    emit(state.copyWith(isSyncing: true));

    final item = state.items.firstWhere(
      (i) => i.id == event.itemId,
      orElse: () => ClipboardItem(
        id: '',
        content: '',
        contentType: 'text',
        createdAt: DateTime.now(),
      ),
    );

    if (item.content.isEmpty) {
      emit(state.copyWith(isSyncing: false));
      return;
    }

    await _clipboardService.setClipboard(item.content);

    final updated = state.items.map((i) {
      if (i.id == event.itemId) {
        return i.copyWith(synced: true);
      }
      return i;
    }).toList();

    emit(state.copyWith(items: updated, isSyncing: false));
  }

  @override
  Future<void> close() {
    _historySubscription?.cancel();
    _clipboardService.dispose();
    return super.close();
  }
}
