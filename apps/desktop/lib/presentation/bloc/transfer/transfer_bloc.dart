import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:uuid/uuid.dart';

import '../../../domain/entities/transfer.dart';
import '../../../data/repositories/transfer_repository.dart';
import '../../../services/desktop_file_transfer_service.dart';
import 'transfer_event.dart';
import 'transfer_state.dart';

class TransferBloc extends Bloc<TransferEvent, TransferState> {
  final DesktopFileTransferService _fileTransferService;
  final TransferRepository _transferRepository;
  final _uuid = const Uuid();

  StreamSubscription<Map<String, dynamic>>? _progressSubscription;

  TransferBloc({
    required DesktopFileTransferService fileTransferService,
    TransferRepository? transferRepository,
  }) : _fileTransferService = fileTransferService,
       _transferRepository = transferRepository ?? TransferRepository(),
       super(const TransferState()) {
    on<LoadTransfers>(_onLoadTransfers);
    on<StartTransfer>(_onStartTransfer);
    on<CancelTransfer>(_onCancelTransfer);
    on<TransferCompleted>(_onTransferCompleted);
    on<ClearTransferHistory>(_onClearHistory);

    _progressSubscription = _fileTransferService.progressStream.listen((data) {
      if (data['status'] == 'completed') {
        add(TransferCompleted(data['transferId'] ?? ''));
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
    final transfer = FileTransfer(
      id: _uuid.v4(),
      fileName: event.filePath.split('/').last,
      fileSize: 0,
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
      await _fileTransferService.sendFile(
        filePath: event.filePath,
        peerIp: event.deviceIp,
        onProgress: (progress) {},
      );
      add(TransferCompleted(transfer.id));
    } catch (e) {
      emit(state.copyWith(error: e.toString()));
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
    return super.close();
  }
}
