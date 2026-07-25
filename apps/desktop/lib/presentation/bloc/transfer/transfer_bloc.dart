import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:uuid/uuid.dart';
import 'package:syncstuff_core_flutter/syncstuff_core_flutter.dart';

import '../../../services/desktop_file_transfer_service.dart';
import 'transfer_event.dart';
import 'transfer_state.dart';

class TransferBloc extends Bloc<TransferEvent, TransferState> {
  final DesktopFileTransferService _fileTransferService;
  final TransferRepository _transferRepository;
  final NotificationService? _notificationService;
  final _uuid = const Uuid();

  StreamSubscription<Map<String, dynamic>>? _progressSubscription;

  TransferBloc({
    required DesktopFileTransferService fileTransferService,
    TransferRepository? transferRepository,
    NotificationService? notificationService,
  }) : _fileTransferService = fileTransferService,
       _transferRepository = transferRepository ?? TransferRepository(),
       _notificationService = notificationService,
       super(const TransferState()) {
    on<LoadTransfers>(_onLoadTransfers);
    on<StartTransfer>(_onStartTransfer);
    on<CancelTransfer>(_onCancelTransfer);
    on<TransferCompleted>(_onTransferCompleted);
    on<TransferFailed>(_onTransferFailed);
    on<ClearTransferHistory>(_onClearHistory);

    _progressSubscription = _fileTransferService.progressStream.listen((data) {
      if (data['status'] == 'completed') {
        add(TransferCompleted(data['transferId'] ?? ''));
      } else if (data['status'] == 'failed') {
        add(
          TransferFailed(
            data['transferId'] ?? '',
            data['error'] ?? 'Unknown error',
          ),
        );
      }
    });
  }

  Future<void> _onLoadTransfers(
    LoadTransfers event,
    Emitter<TransferState> emit,
  ) async {
    final history = await _transferRepository.getTransferHistory();
    emit(state.copyWith(transferHistory: history));
  }

  Future<void> _onStartTransfer(
    StartTransfer event,
    Emitter<TransferState> emit,
  ) async {
    final file = File(event.filePath);
    final exists = await file.exists();
    final fileName = file.uri.pathSegments.isNotEmpty
        ? file.uri.pathSegments.last
        : event.filePath.split(Platform.pathSeparator).last;
    final fileSize = exists ? await file.length() : 0;

    debugPrint(
      '[DesktopTransferBloc] StartTransfer: deviceIp=${event.deviceIp}, file=$fileName, size=$fileSize, exists=$exists',
    );

    final transfer = FileTransfer(
      id: _uuid.v4(),
      fileName: fileName,
      fileSize: fileSize,
      filePath: event.filePath,
      type: TransferType.file,
      status: TransferStatus.inProgress,
      direction: TransferDirection.sent,
      deviceId: event.deviceIp,
      progress: 0,
      createdAt: DateTime.now(),
    );

    emit(
      state.copyWith(
        activeTransfers: [...state.activeTransfers, transfer],
        isTransferring: true,
      ),
    );

    try {
      debugPrint(
        '[DesktopTransferBloc] Calling sendFile to ${event.deviceIp}:8766',
      );
      await _fileTransferService.sendFile(
        filePath: event.filePath,
        peerIp: event.deviceIp,
        transferId: transfer.id,
        onProgress: (progress) {},
      );
      debugPrint('[DesktopTransferBloc] Transfer completed: ${transfer.id}');
      add(TransferCompleted(transfer.id));
    } catch (e) {
      debugPrint('[DesktopTransferBloc] Transfer failed: $e');
      add(TransferFailed(transfer.id, e.toString()));
    }
  }

  void _onCancelTransfer(CancelTransfer event, Emitter<TransferState> emit) {
    final updated = state.activeTransfers.map((t) {
      if (t.id == event.transferId) {
        return t.copyWith(status: TransferStatus.cancelled);
      }
      return t;
    }).toList();
    emit(state.copyWith(activeTransfers: updated));

    unawaited(
      _notificationService?.cancelNotification(event.transferId.hashCode),
    );
  }

  Future<void> _onTransferCompleted(
    TransferCompleted event,
    Emitter<TransferState> emit,
  ) async {
    final completed = state.activeTransfers.map((t) {
      if (t.id == event.transferId) {
        return t.copyWith(status: TransferStatus.completed, progress: 1.0);
      }
      return t;
    }).toList();

    final completedTransfers = completed
        .where((t) => t.status == TransferStatus.completed)
        .toList();
    final activeTransfers = completed
        .where((t) => t.status == TransferStatus.inProgress)
        .toList();

    for (final transfer in completedTransfers) {
      await _transferRepository.saveTransfer(transfer);
    }

    final history = await _transferRepository.getTransferHistory();
    emit(
      state.copyWith(
        activeTransfers: activeTransfers,
        transferHistory: history,
        isTransferring: activeTransfers.isNotEmpty,
      ),
    );

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

    for (final transfer in failedTransfers) {
      unawaited(_notificationService?.showTransferFailed(transfer));
      unawaited(_notificationService?.cancelNotification(transfer.id.hashCode));
    }
  }

  Future<void> _onClearHistory(
    ClearTransferHistory event,
    Emitter<TransferState> emit,
  ) async {
    await _transferRepository.clearHistory();
    emit(state.copyWith(transferHistory: []));
  }

  @override
  Future<void> close() {
    _progressSubscription?.cancel();
    unawaited(_notificationService?.cancelAll());
    return super.close();
  }
}
