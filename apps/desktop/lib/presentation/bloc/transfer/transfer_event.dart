import 'package:equatable/equatable.dart';

abstract class TransferEvent extends Equatable {
  const TransferEvent();
  @override
  List<Object?> get props => [];
}

class LoadTransfers extends TransferEvent {}

class StartTransfer extends TransferEvent {
  final String deviceIp;
  final String filePath;
  const StartTransfer({required this.deviceIp, required this.filePath});
  @override
  List<Object?> get props => [deviceIp, filePath];
}

class CancelTransfer extends TransferEvent {
  final String transferId;
  const CancelTransfer(this.transferId);
  @override
  List<Object?> get props => [transferId];
}

class TransferCompleted extends TransferEvent {
  final String transferId;
  const TransferCompleted(this.transferId);
  @override
  List<Object?> get props => [transferId];
}

class ClearTransferHistory extends TransferEvent {}
