import 'dart:async';
import 'dart:developer' as developer;
import 'dart:io';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:syncstuff_core_flutter/syncstuff_core_flutter.dart';
import 'package:uuid/uuid.dart';

import '../../../data/services/file_transfer_service.dart';
import '../../../data/services/discovery_service.dart';
import '../../../data/services/p2p_service.dart';
import 'transfer_event.dart';
import 'transfer_state.dart';

class TransferBloc extends Bloc<TransferEvent, TransferState> {
  final FileTransferService? _fileTransferService;
  final TransferQueue? _transferQueue;
  final NotificationService? _notificationService;
  final DiscoveryService? _discoveryService;

  final Map<String, String> _deviceIpMap = {};

  StreamSubscription<FileTransfer>? _progressSubscription;
  StreamSubscription<List<FileTransfer>>? _queueSubscription;
  StreamSubscription<List<FileTransfer>>? _activeSubscription;
  StreamSubscription<Map<String, dynamic>>? _fileUploadSubscription;

  TransferBloc({
    P2PService? p2pService,
    TransferQueue? transferQueue,
    NotificationService? notificationService,
    DiscoveryService? discoveryService,
  }) : _fileTransferService = FileTransferService(p2pService ?? P2PService()),
       _transferQueue = transferQueue,
       _notificationService = notificationService,
       _discoveryService = discoveryService,
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
    on<QueueUpdated>(_onQueueUpdated);
    on<ActiveTransfersUpdated>(_onActiveTransfersUpdated);

    // Listen to file transfer progress
    _progressSubscription = _fileTransferService!.progressStream.listen((
      transfer,
    ) {
      if (transfer.status == TransferStatus.inProgress) {
        add(UpdateTransferProgress(transfer.id, transfer.progress));
      }
    });

    // Listen to queue changes
    if (_transferQueue != null) {
      _queueSubscription = _transferQueue.queueStream.listen((queue) {
        add(QueueUpdated(queue));
      });
      _activeSubscription = _transferQueue.activeStream.listen((active) async {
        add(ActiveTransfersUpdated(active));
        for (final transfer in active) {
          if (transfer.direction == TransferDirection.sent &&
              transfer.status == TransferStatus.pending) {
            final peerIp = _getPeerIpForTransfer(transfer);
            if (peerIp != null) {
              add(
                StartTransfer(
                  deviceId: transfer.deviceId ?? '',
                  deviceIp: peerIp,
                  transferId: transfer.id,
                  filePath: transfer.filePath ?? '',
                  fileName: transfer.fileName,
                ),
              );
            }
          }
        }
      });
    }

    // Listen for incoming file uploads
    if (_discoveryService != null) {
      _fileUploadSubscription = _discoveryService.fileUploads.listen((upload) {
        print(
          '[TransferBloc] File upload received: ${upload['name']} (${upload['size']} bytes) from ${upload['path']}',
        );
        add(
          ReceiveFile(
            transferId: const Uuid().v4(),
            fileName: upload['name'] as String,
            fileSize: upload['size'] as int,
            deviceId: 'desktop',
          ),
        );
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
    developer.log(
      'StartTransfer: deviceId=${event.deviceId}, deviceIp=${event.deviceIp}, '
      'filePath=${event.filePath}, transferId=${event.transferId}',
      name: 'TransferBloc',
    );

    final file = File(event.filePath);
    final exists = await file.exists();
    developer.log(
      'StartTransfer: file exists=$exists',
      name: 'TransferBloc',
    );
    if (!exists) {
      developer.log(
        'StartTransfer: ERROR file not found: ${event.filePath}',
        name: 'TransferBloc',
      );
      add(
        TransferFailed(
          event.transferId ?? 'unknown',
          'File not found: ${event.filePath}',
        ),
      );
      return;
    }

    final fileSize = await file.length();
    final fileName =
        event.fileName ?? event.filePath.split(Platform.pathSeparator).last;

    final transferId = event.transferId ?? const Uuid().v4();

    final transfer = FileTransfer(
      id: transferId,
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
        'Starting HTTP transfer: $fileName ($fileSize bytes) to ${event.deviceIp}',
        name: 'TransferBloc',
      );

      await _fileTransferService!.sendFileHttp(
        filePath: event.filePath,
        peerIp: event.deviceIp,
        onProgress: (progress) {
          add(UpdateTransferProgress(transferId, progress));
        },
      );

      developer.log(
        'HTTP transfer completed successfully: $transferId',
        name: 'TransferBloc',
      );
      add(TransferCompleted(transferId));
    } catch (e) {
      developer.log('HTTP transfer failed: $e', name: 'TransferBloc');
      add(TransferFailed(transferId, e.toString()));
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

    // Cancel progress notification
    unawaited(
      _notificationService?.cancelNotification(event.transferId.hashCode),
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

    // Show progress notification
    final transfer = updated.firstWhere(
      (t) => t.id == event.transferId,
      orElse: () => updated.first,
    );
    unawaited(_notificationService?.showTransferProgress(transfer));
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

    // Show completion notification
    for (final transfer in completedTransfers) {
      unawaited(_notificationService?.showTransferComplete(transfer));
      unawaited(_notificationService?.cancelNotification(transfer.id.hashCode));
    }
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

    // Show failure notification
    for (final transfer in failedTransfers) {
      unawaited(_notificationService?.showTransferFailed(transfer));
      unawaited(_notificationService?.cancelNotification(transfer.id.hashCode));
    }
  }

  void _onReceiveFile(ReceiveFile event, Emitter<TransferState> emit) {
    developer.log(
      'ReceiveFile: ${event.fileName} (${event.fileSize} bytes) from ${event.deviceId}',
      name: 'TransferBloc',
    );

    final transfer = FileTransfer(
      id: event.transferId,
      fileName: event.fileName,
      fileSize: event.fileSize,
      type: TransferType.file,
      status: TransferStatus.completed,
      direction: TransferDirection.received,
      deviceId: event.deviceId,
      progress: 1.0,
      createdAt: DateTime.now(),
      completedAt: DateTime.now(),
    );

    emit(
      state.copyWith(
        transferHistory: [...state.transferHistory, transfer],
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

    _deviceIpMap[transfer.id] = event.deviceIp;
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

  void _onQueueUpdated(QueueUpdated event, Emitter<TransferState> emit) {
    emit(state.copyWith(queuedTransfers: List.unmodifiable(event.queue)));
  }

  void _onActiveTransfersUpdated(
    ActiveTransfersUpdated event,
    Emitter<TransferState> emit,
  ) {
    emit(state.copyWith(activeTransfers: List.unmodifiable(event.active)));
  }

  String? _getPeerIpForTransfer(FileTransfer transfer) {
    return _deviceIpMap[transfer.id];
  }

  @override
  Future<void> close() {
    unawaited(_progressSubscription?.cancel());
    unawaited(_queueSubscription?.cancel());
    unawaited(_activeSubscription?.cancel());
    unawaited(_fileUploadSubscription?.cancel());
    _fileTransferService?.dispose();
    _transferQueue?.dispose();
    unawaited(_notificationService?.cancelAll());
    return super.close();
  }
}
