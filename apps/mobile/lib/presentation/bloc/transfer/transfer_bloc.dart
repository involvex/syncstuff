import 'dart:async';
import 'dart:developer' as developer;
import 'dart:io';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:syncstuff_core_flutter/syncstuff_core_flutter.dart';
import 'package:uuid/uuid.dart';

import '../../../data/services/file_transfer_service.dart';
import '../../../data/services/p2p_service.dart';
import 'transfer_event.dart';
import 'transfer_state.dart';

class TransferBloc extends Bloc<TransferEvent, TransferState> {
  final FileTransferService? _fileTransferService;
  final TransferQueue? _transferQueue;

  StreamSubscription<FileTransfer>? _progressSubscription;
  StreamSubscription<List<FileTransfer>>? _queueSubscription;
  StreamSubscription<List<FileTransfer>>? _activeSubscription;

  TransferBloc({P2PService? p2pService, TransferQueue? transferQueue})
    : _fileTransferService = FileTransferService(p2pService ?? P2PService()),
      _transferQueue = transferQueue,
      super(const TransferState()) {
    on<LoadTransfers>(_onLoadTransfers);
    on<StartTransfer>(_onStartTransfer);
    on<CancelTransfer>(_onCancelTransfer);
    on<UpdateTransferProgress>(_onUpdateProgress);
    on<TransferCompleted>(_onTransferCompleted);
    on<TransferFailed>(_onTransferFailed);
    on<ReceiveFile>(_onReceiveFile);
    on<EnqueueTransfer>(_onEnqueue);
    on<DequeueTransfer>(_onDequeue);
    on<UpdateQueueOrder>(_onUpdateQueueOrder);

    // Listen to file transfer progress
    _progressSubscription = _fileTransferService!.progressStream.listen((
      transfer,
    ) {
      if (transfer.status == TransferStatus.inProgress) {
        add(UpdateTransferProgress(transfer.id, transfer.progress));
      } else if (transfer.status == TransferStatus.completed) {
        add(TransferCompleted(transfer.id, filePath: transfer.filePath));
        _transferQueue?.onComplete(transfer.id);
      } else if (transfer.status == TransferStatus.failed) {
        add(TransferFailed(transfer.id, transfer.error ?? 'Unknown error'));
        _transferQueue?.onComplete(transfer.id);
      }
    });

    // Listen to queue changes
    if (_transferQueue != null) {
      _queueSubscription = _transferQueue!.queueStream.listen((queue) {
        emit(state.copyWith(queuedTransfers: List.unmodifiable(queue)));
      });
      _activeSubscription = _transferQueue!.activeStream.listen((active) {
        emit(state.copyWith(activeTransfers: List.unmodifiable(active)));
      });
    }
  }

  Future<void> _onLoadTransfers(
    LoadTransfers event,
    Emitter<TransferState> emit,
  ) async {
    // Load from service
    final active = _fileTransferService!.getActiveTransfers();
    final history = _fileTransferService.getTransferHistory();

    emit(state.copyWith(activeTransfers: active, transferHistory: history));
  }

  Future<void> _onStartTransfer(
    StartTransfer event,
    Emitter<TransferState> emit,
  ) async {
    final file = File(event.filePath);
    final fileSize = await file.length();
    final fileName =
        event.fileName ?? event.filePath.split(Platform.pathSeparator).last;

    final transfer = FileTransfer(
      id: const Uuid().v4(),
      fileName: fileName,
      fileSize: fileSize,
      filePath: event.filePath,
      type: TransferType.file,
      status: TransferStatus.inProgress,
      direction: TransferDirection.sent,
      deviceId: event.deviceId,
      progress: 0,
      createdAt: DateTime.now(),
    );

    emit(
      state.copyWith(
        activeTransfers: [...state.activeTransfers, transfer],
        isTransferring: true,
      ),
    );

    // Start the file transfer via HTTP (not WebRTC)
    try {
      developer.log(
        'Starting HTTP transfer to ${event.deviceIp}',
        name: 'TransferBloc',
      );

      await _fileTransferService!.sendFileHttp(
        filePath: event.filePath,
        peerIp: event.deviceIp,
        onProgress: (progress) {
          add(UpdateTransferProgress(transfer.id, progress));
        },
      );

      add(TransferCompleted(transfer.id));
    } catch (e) {
      developer.log('HTTP transfer failed: $e', name: 'TransferBloc');
      add(TransferFailed(transfer.id, e.toString()));
    }
  }

  Future<void> _onCancelTransfer(
    CancelTransfer event,
    Emitter<TransferState> emit,
  ) async {
    _fileTransferService!.cancelOutgoing(event.transferId);

    final updated = state.activeTransfers.map((t) {
      if (t.id == event.transferId) {
        return t.copyWith(status: TransferStatus.cancelled);
      }
      return t;
    }).toList();

    final completed = updated
        .where((t) => t.status == TransferStatus.cancelled)
        .toList();
    final active = updated
        .where((t) => t.status == TransferStatus.inProgress)
        .toList();

    emit(
      state.copyWith(
        activeTransfers: active,
        transferHistory: [...state.transferHistory, ...completed],
        isTransferring: active.isNotEmpty,
      ),
    );
  }

  void _onUpdateProgress(
    UpdateTransferProgress event,
    Emitter<TransferState> emit,
  ) {
    final updated = state.activeTransfers.map((t) {
      if (t.id == event.transferId) {
        return t.copyWith(progress: event.progress);
      }
      return t;
    }).toList();

    emit(state.copyWith(activeTransfers: updated));
  }

  void _onTransferCompleted(
    TransferCompleted event,
    Emitter<TransferState> emit,
  ) {
    final completed = state.activeTransfers.map((t) {
      if (t.id == event.transferId) {
        return t.copyWith(
          status: TransferStatus.completed,
          progress: 1.0,
          completedAt: DateTime.now(),
          filePath: event.filePath,
        );
      }
      return t;
    }).toList();

    final completedTransfers = completed
        .where((t) => t.status == TransferStatus.completed)
        .toList();
    final activeTransfers = completed
        .where((t) => t.status == TransferStatus.inProgress)
        .toList();

    emit(
      state.copyWith(
        activeTransfers: activeTransfers,
        transferHistory: [...state.transferHistory, ...completedTransfers],
        isTransferring: activeTransfers.isNotEmpty,
      ),
    );
  }

  void _onTransferFailed(TransferFailed event, Emitter<TransferState> emit) {
    final failed = state.activeTransfers.map((t) {
      if (t.id == event.transferId) {
        return t.copyWith(status: TransferStatus.failed, error: event.error);
      }
      return t;
    }).toList();

    final failedTransfers = failed
        .where((t) => t.status == TransferStatus.failed)
        .toList();
    final activeTransfers = failed
        .where((t) => t.status == TransferStatus.inProgress)
        .toList();

    emit(
      state.copyWith(
        activeTransfers: activeTransfers,
        transferHistory: [...state.transferHistory, ...failedTransfers],
        isTransferring: activeTransfers.isNotEmpty,
        error: event.error,
      ),
    );
  }

  void _onReceiveFile(ReceiveFile event, Emitter<TransferState> emit) {
    final transfer = FileTransfer(
      id: event.transferId,
      fileName: event.fileName,
      fileSize: event.fileSize,
      type: TransferType.file,
      status: TransferStatus.inProgress,
      direction: TransferDirection.received,
      deviceId: event.deviceId,
      progress: 0,
      createdAt: DateTime.now(),
    );

    emit(
      state.copyWith(
        activeTransfers: [...state.activeTransfers, transfer],
        isTransferring: true,
      ),
    );
  }

  Future<void> _onEnqueue(
    EnqueueTransfer event,
    Emitter<TransferState> emit,
  ) async {
    final file = File(event.filePath);
    final fileSize = await file.length();
    final fileName = event.filePath.split(Platform.pathSeparator).last;

    final transfer = FileTransfer(
      id: const Uuid().v4(),
      fileName: fileName,
      fileSize: fileSize,
      filePath: event.filePath,
      type: TransferType.file,
      status: TransferStatus.pending,
      direction: TransferDirection.sent,
      deviceId: event.deviceId,
      progress: 0,
      priority: event.priority,
      createdAt: DateTime.now(),
    );

    emit(
      state.copyWith(
        queuedTransfers: [...state.queuedTransfers, transfer],
      ),
    );

    _transferQueue?.enqueue(transfer);
  }

  void _onDequeue(DequeueTransfer event, Emitter<TransferState> emit) {
    final updated = state.queuedTransfers
        .where((t) => t.id != event.transferId)
        .toList();

    emit(state.copyWith(queuedTransfers: updated));
    _transferQueue?.onCancel(event.transferId);
  }

  void _onUpdateQueueOrder(
    UpdateQueueOrder event,
    Emitter<TransferState> emit,
  ) {
    emit(state.copyWith(queuedTransfers: event.reorderedQueue));
  }

  @override
  Future<void> close() {
    unawaited(_progressSubscription?.cancel());
    unawaited(_queueSubscription?.cancel());
    unawaited(_activeSubscription?.cancel());
    _fileTransferService?.dispose();
    _transferQueue?.dispose();
    return super.close();
  }
}
