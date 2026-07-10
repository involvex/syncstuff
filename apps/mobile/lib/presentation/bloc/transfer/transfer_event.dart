import 'package:equatable/equatable.dart';

import '../../../domain/entities/transfer.dart';

abstract class TransferEvent extends Equatable {
  const TransferEvent();

  @override
  List<Object?> get props => [];
}

class LoadTransfers extends TransferEvent {}

class StartTransfer extends TransferEvent {
  final String deviceId;
  final String deviceIp; // CLI's IP address
  final String filePath;
  final String? fileName;
  final int? fileSize;

  const StartTransfer({
    required this.deviceId,
    required this.deviceIp,
    required this.filePath,
    this.fileName,
    this.fileSize,
  });

  @override
  List<Object?> get props => [deviceId, deviceIp, filePath, fileName, fileSize];
}

class CancelTransfer extends TransferEvent {
  final String transferId;

  const CancelTransfer(this.transferId);

  @override
  List<Object?> get props => [transferId];
}

class UpdateTransferProgress extends TransferEvent {
  final String transferId;
  final double progress;
  final int? bytesTransferred;
  final int? totalBytes;

  const UpdateTransferProgress(
    this.transferId,
    this.progress, {
    this.bytesTransferred,
    this.totalBytes,
  });

  @override
  List<Object?> get props => [
    transferId,
    progress,
    bytesTransferred,
    totalBytes,
  ];
}

class TransferCompleted extends TransferEvent {
  final String transferId;
  final String? filePath;

  const TransferCompleted(this.transferId, {this.filePath});

  @override
  List<Object?> get props => [transferId, filePath];
}

class TransferFailed extends TransferEvent {
  final String transferId;
  final String error;

  const TransferFailed(this.transferId, this.error);

  @override
  List<Object?> get props => [transferId, error];
}

class EnqueueTransfer extends TransferEvent {
  final String filePath;
  final String deviceIp;
  final String? deviceId;
  final TransferPriority priority;

  const EnqueueTransfer({
    required this.filePath,
    required this.deviceIp,
    this.deviceId,
    this.priority = TransferPriority.normal,
  });

  @override
  List<Object?> get props => [filePath, deviceIp, deviceId, priority];
}

class DequeueTransfer extends TransferEvent {
  final String transferId;

  const DequeueTransfer(this.transferId);

  @override
  List<Object?> get props => [transferId];
}

class UpdateQueueOrder extends TransferEvent {
  final List<FileTransfer> reorderedQueue;

  const UpdateQueueOrder(this.reorderedQueue);

  @override
  List<Object?> get props => [reorderedQueue];
}

class QueueUpdated extends TransferEvent {
  final List<FileTransfer> queue;

  const QueueUpdated(this.queue);

  @override
  List<Object?> get props => [queue];
}

class ActiveTransfersUpdated extends TransferEvent {
  final List<FileTransfer> active;

  const ActiveTransfersUpdated(this.active);

  @override
  List<Object?> get props => [active];
}

class ReceiveFile extends TransferEvent {
  final String deviceId;
  final String transferId;
  final String fileName;
  final int fileSize;

  const ReceiveFile({
    required this.deviceId,
    required this.transferId,
    required this.fileName,
    required this.fileSize,
  });

  @override
  List<Object?> get props => [deviceId, transferId, fileName, fileSize];
}
