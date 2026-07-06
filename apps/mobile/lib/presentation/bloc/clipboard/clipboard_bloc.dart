import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:uuid/uuid.dart';
import 'package:syncstuff_core/syncstuff_core.dart';

import '../../../data/services/clipboard_sync_service.dart';
import '../../../data/services/p2p_service.dart';
import 'clipboard_event.dart';
import 'clipboard_state.dart';

class ClipboardBloc extends Bloc<ClipboardEvent, ClipboardState> {
  final ClipboardSyncService? _clipboardService;
  final ClipboardRepository _clipboardRepository;
  final _uuid = const Uuid();

  StreamSubscription<ClipboardItem>? _clipboardSubscription;

  ClipboardBloc({
    ClipboardSyncService? clipboardService,
    P2PService? p2pService,
    ClipboardRepository? clipboardRepository,
  }) : _clipboardService =
           clipboardService ?? ClipboardSyncService(p2pService ?? P2PService()),
       _clipboardRepository = clipboardRepository ?? ClipboardRepository(),
       super(const ClipboardState()) {
    on<LoadClipboardItems>(_onLoadItems);
    on<AddClipboardItem>(_onAddItem);
    on<DeleteClipboardItem>(_onDeleteItem);
    on<ToggleClipboardSync>(_onToggleSync);
    on<SyncClipboardToDevices>(_onSyncToDevices);
    on<ClipboardReceived>(_onClipboardReceived);

    _clipboardSubscription = _clipboardService!.clipboardStream.listen((item) {
      add(ClipboardReceived(item));
    });
  }

  Future<void> _onLoadItems(
    LoadClipboardItems event,
    Emitter<ClipboardState> emit,
  ) async {
    final items = await _clipboardRepository.getHistory(limit: 100);
    emit(state.copyWith(items: items));
  }

  Future<void> _onAddItem(
    AddClipboardItem event,
    Emitter<ClipboardState> emit,
  ) async {
    final item = ClipboardItem(
      id: _uuid.v4(),
      content: event.content,
      contentType: event.contentType,
      createdAt: DateTime.now(),
      deviceId: null,
      deviceName: null,
      synced: false,
    );

    await _clipboardRepository.addItem(item);
    final items = await _clipboardRepository.getHistory(limit: 100);
    emit(state.copyWith(items: items));

    unawaited(_clipboardService?.setClipboardContent(event.content));

    if (state.syncEnabled) {
      add(SyncClipboardToDevices(item.id));
    }
  }

  Future<void> _onDeleteItem(
    DeleteClipboardItem event,
    Emitter<ClipboardState> emit,
  ) async {
    await _clipboardRepository.deleteItem(event.id);
    final items = await _clipboardRepository.getHistory(limit: 100);
    emit(state.copyWith(items: items));
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

    await _clipboardService?.broadcastClipboard(item.content);

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
  ) async {
    if (state.items.any((i) => i.content == event.item.content)) {
      return;
    }

    final receivedItem = event.item.copyWith(synced: true);
    await _clipboardRepository.addItem(receivedItem);
    final items = await _clipboardRepository.getHistory(limit: 100);
    emit(state.copyWith(items: items));

    unawaited(_clipboardService?.setClipboardContent(event.item.content));
  }

  @override
  Future<void> close() {
    unawaited(_clipboardSubscription?.cancel());
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
