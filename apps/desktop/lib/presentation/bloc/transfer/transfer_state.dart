import 'package:equatable/equatable.dart';
import '../../../domain/entities/transfer.dart';

class TransferState extends Equatable {
  final List<FileTransfer> activeTransfers;
  final List<FileTransfer> transferHistory;
  final bool isTransferring;
  final String? error;

  const TransferState({
    this.activeTransfers = const [],
    this.transferHistory = const [],
    this.isTransferring = false,
    this.error,
  });

  TransferState copyWith({
    List<FileTransfer>? activeTransfers,
    List<FileTransfer>? transferHistory,
    bool? isTransferring,
    String? error,
  }) {
    return TransferState(
      activeTransfers: activeTransfers ?? this.activeTransfers,
      transferHistory: transferHistory ?? this.transferHistory,
      isTransferring: isTransferring ?? this.isTransferring,
      error: error,
    );
  }

  @override
  List<Object?> get props => [
    activeTransfers,
    transferHistory,
    isTransferring,
    error,
  ];
}
