import 'package:equatable/equatable.dart';

enum TransferType { file, folder }

enum TransferStatus { pending, inProgress, completed, failed, cancelled }

enum TransferDirection { sent, received }

class FileTransfer extends Equatable {
  final String id;
  final String fileName;
  final int fileSize;
  final String? filePath;
  final TransferType type;
  final TransferStatus status;
  final TransferDirection direction;
  final String? deviceId;
  final double progress;
  final DateTime createdAt;
  final DateTime? completedAt;
  final String? error;

  const FileTransfer({
    required this.id,
    required this.fileName,
    required this.fileSize,
    this.filePath,
    required this.type,
    required this.status,
    required this.direction,
    this.deviceId,
    this.progress = 0.0,
    required this.createdAt,
    this.completedAt,
    this.error,
  });

  FileTransfer copyWith({
    String? id,
    String? fileName,
    int? fileSize,
    String? filePath,
    TransferType? type,
    TransferStatus? status,
    TransferDirection? direction,
    String? deviceId,
    double? progress,
    DateTime? createdAt,
    DateTime? completedAt,
    String? error,
  }) {
    return FileTransfer(
      id: id ?? this.id,
      fileName: fileName ?? this.fileName,
      fileSize: fileSize ?? this.fileSize,
      filePath: filePath ?? this.filePath,
      type: type ?? this.type,
      status: status ?? this.status,
      direction: direction ?? this.direction,
      deviceId: deviceId ?? this.deviceId,
      progress: progress ?? this.progress,
      createdAt: createdAt ?? this.createdAt,
      completedAt: completedAt ?? this.completedAt,
      error: error ?? this.error,
    );
  }

  String get formattedSize {
    if (fileSize < 1024) return '$fileSize B';
    if (fileSize < 1024 * 1024) {
      return '${(fileSize / 1024).toStringAsFixed(1)} KB';
    }
    if (fileSize < 1024 * 1024 * 1024) {
      return '${(fileSize / (1024 * 1024)).toStringAsFixed(1)} MB';
    }
    return '${(fileSize / (1024 * 1024 * 1024)).toStringAsFixed(2)} GB';
  }

  @override
  List<Object?> get props => [
    id,
    fileName,
    fileSize,
    filePath,
    type,
    status,
    direction,
    deviceId,
    progress,
    createdAt,
    completedAt,
    error,
  ];
}
