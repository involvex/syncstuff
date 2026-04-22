import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:uuid/uuid.dart';

import '../../../domain/entities/clipboard.dart';
import '../../../data/services/clipboard_sync_service.dart';
import '../../../data/services/p2p_service.dart';
import 'clipboard_event.dart';
import 'clipboard_state.dart';

class ClipboardBloc extends Bloc<ClipboardEvent, ClipboardState> {
  final ClipboardSyncService? _clipboardService;
  final _uuid = const Uuid();

  StreamSubscription<ClipboardItem>? _clipboardSubscription;

  ClipboardBloc({
    ClipboardSyncService? clipboardService,
    P2PService? p2pService,
  }) : _clipboardService =
           clipboardService ?? ClipboardSyncService(p2pService ?? P2PService()),
       super(const ClipboardState()) {
    on<LoadClipboardItems>(_onLoadItems);
    on<AddClipboardItem>(_onAddItem);
    on<DeleteClipboardItem>(_onDeleteItem);
    on<ToggleClipboardSync>(_onToggleSync);
    on<SyncClipboardToDevices>(_onSyncToDevices);
    on<ClipboardReceived>(_onClipboardReceived);

    // Listen for incoming clipboard from P2P
    _clipboardSubscription = _clipboardService!.clipboardStream.listen((item) {
      add(ClipboardReceived(item));
    });
  }

  Future<void> _onLoadItems(
    LoadClipboardItems event,
    Emitter<ClipboardState> emit,
  ) async {
    // TODO: Load from local storage
    emit(state.copyWith(items: []));
  }

  void _onAddItem(AddClipboardItem event, Emitter<ClipboardState> emit) {
    final item = ClipboardItem(
      id: _uuid.v4(),
      content: event.content,
      contentType: event.contentType,
      createdAt: DateTime.now(),
      synced: false,
    );

    emit(state.copyWith(items: [item, ...state.items]));

    // Update device clipboard
    _clipboardService?.setClipboardContent(event.content);

    // If sync is enabled, broadcast to paired devices
    if (state.syncEnabled) {
      add(SyncClipboardToDevices(item.id));
    }
  }

  void _onDeleteItem(DeleteClipboardItem event, Emitter<ClipboardState> emit) {
    final updated = state.items.where((i) => i.id != event.id).toList();
    emit(state.copyWith(items: updated));
  }

  void _onToggleSync(ToggleClipboardSync event, Emitter<ClipboardState> emit) {
    final newEnabled = !state.syncEnabled;

    if (newEnabled) {
      _clipboardService?.enable();
    } else {
      _clipboardService?.disable();
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

    // Broadcast to connected peers
    await _clipboardService?.broadcastClipboard(item.content);

    // Mark as synced
    final updated = state.items.map((i) {
      if (i.id == event.itemId) {
        return i.copyWith(synced: true);
      }
      return i;
    }).toList();

    emit(state.copyWith(items: updated, isSyncing: false));
  }

  void _onClipboardReceived(
    ClipboardReceived event,
    Emitter<ClipboardState> emit,
  ) {
    // Check if we already have this content
    if (state.items.any((i) => i.content == event.item.content)) {
      return;
    }

    // Add the received item
    final receivedItem = event.item.copyWith(synced: true);
    emit(state.copyWith(items: [receivedItem, ...state.items]));

    // Set system clipboard
    _clipboardService?.setClipboardContent(event.item.content);
  }

  @override
  Future<void> close() {
    _clipboardSubscription?.cancel();
    _clipboardService?.dispose();
    return super.close();
  }
}

class ClipboardReceived extends ClipboardEvent {
  final ClipboardItem item;

  const ClipboardReceived(this.item);

  @override
  List<Object?> get props => [item];
}
