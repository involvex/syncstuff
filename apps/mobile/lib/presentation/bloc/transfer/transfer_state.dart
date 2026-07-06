import 'package:equatable/equatable.dart';
import '../../../domain/entities/transfer.dart';

class TransferState extends Equatable {
  final List<FileTransfer> activeTransfers;
  final List<FileTransfer> transferHistory;
  final List<FileTransfer> queuedTransfers;
  final bool isTransferring;
  final String? error;

  const TransferState({
    this.activeTransfers = const [],
    this.transferHistory = const [],
    this.queuedTransfers = const [],
    this.isTransferring = false,
    this.error,
  });

  TransferState copyWith({
    List<FileTransfer>? activeTransfers,
    List<FileTransfer>? transferHistory,
    List<FileTransfer>? queuedTransfers,
    bool? isTransferring,
    String? error,
  }) {
    return TransferState(
      activeTransfers: activeTransfers ?? this.activeTransfers,
      transferHistory: transferHistory ?? this.transferHistory,
      queuedTransfers: queuedTransfers ?? this.queuedTransfers,
      isTransferring: isTransferring ?? this.isTransferring,
      error: error,
    );
  }

  @override
  List<Object?> get props => [
    activeTransfers,
    transferHistory,
    queuedTransfers,
    isTransferring,
    error,
  ];
}
