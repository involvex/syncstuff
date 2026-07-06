import 'package:equatable/equatable.dart';

enum TransferType {
  file,
  folder;

  String get displayName {
    switch (this) {
      case TransferType.file:
        return 'File';
      case TransferType.folder:
        return 'Folder';
    }
  }
}

enum TransferStatus {
  pending,
  inProgress,
  completed,
  failed,
  cancelled;

  String get displayName {
    switch (this) {
      case TransferStatus.pending:
        return 'Pending';
      case TransferStatus.inProgress:
        return 'In Progress';
      case TransferStatus.completed:
        return 'Completed';
      case TransferStatus.failed:
        return 'Failed';
      case TransferStatus.cancelled:
        return 'Cancelled';
    }
  }
}

enum TransferDirection {
  sent,
  received;

  String get displayName {
    switch (this) {
      case TransferDirection.sent:
        return 'Sent';
      case TransferDirection.received:
        return 'Received';
    }
  }
}

enum TransferPriority {
  low,
  normal,
  high,
  urgent;

  String get displayName {
    switch (this) {
      case TransferPriority.low:
        return 'Low';
      case TransferPriority.normal:
        return 'Normal';
      case TransferPriority.high:
        return 'High';
      case TransferPriority.urgent:
        return 'Urgent';
    }
  }
}

class FileTransfer extends Equatable {
  final String id;
  final String fileName;
  final int fileSize;
  final String? filePath;
  final TransferType type;
  final TransferStatus status;
  final TransferDirection direction;
  final String? deviceId;
  final String? deviceName;
  final double progress;
  final DateTime createdAt;
  final DateTime? completedAt;
  final String? error;
  final TransferPriority priority;

  const FileTransfer({
    required this.id,
    required this.fileName,
    required this.fileSize,
    this.filePath,
    required this.type,
    required this.status,
    required this.direction,
    this.deviceId,
    this.deviceName,
    required this.progress,
    required this.createdAt,
    this.completedAt,
    this.error,
    this.priority = TransferPriority.normal,
  });

  String get formattedSize {
    if (fileSize < 1024) {
      return '$fileSize B';
    } else if (fileSize < 1024 * 1024) {
      return '${(fileSize / 1024).toStringAsFixed(1)} KB';
    } else if (fileSize < 1024 * 1024 * 1024) {
      return '${(fileSize / (1024 * 1024)).toStringAsFixed(1)} MB';
    } else {
      return '${(fileSize / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
    }
  }

  FileTransfer copyWith({
    String? id,
    String? fileName,
    int? fileSize,
    String? filePath,
    TransferType? type,
    TransferStatus? status,
    TransferDirection? direction,
    String? deviceId,
    String? deviceName,
    double? progress,
    DateTime? createdAt,
    DateTime? completedAt,
    String? error,
    TransferPriority? priority,
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
      deviceName: deviceName ?? this.deviceName,
      progress: progress ?? this.progress,
      createdAt: createdAt ?? this.createdAt,
      completedAt: completedAt ?? this.completedAt,
      error: error ?? this.error,
      priority: priority ?? this.priority,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'fileName': fileName,
      'fileSize': fileSize,
      'filePath': filePath,
      'type': type.name,
      'status': status.name,
      'direction': direction.name,
      'deviceId': deviceId,
      'deviceName': deviceName,
      'progress': progress,
      'createdAt': createdAt.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
      'error': error,
      'priority': priority.name,
    };
  }

  factory FileTransfer.fromJson(Map<String, dynamic> json) {
    return FileTransfer(
      id: json['id'] as String,
      fileName: json['fileName'] as String,
      fileSize: json['fileSize'] as int,
      filePath: json['filePath'] as String?,
      type: TransferType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => TransferType.file,
      ),
      status: TransferStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => TransferStatus.pending,
      ),
      direction: TransferDirection.values.firstWhere(
        (e) => e.name == json['direction'],
        orElse: () => TransferDirection.sent,
      ),
      deviceId: json['deviceId'] as String?,
      deviceName: json['deviceName'] as String?,
      progress: (json['progress'] as num).toDouble(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      completedAt: json['completedAt'] != null
          ? DateTime.parse(json['completedAt'] as String)
          : null,
      error: json['error'] as String?,
      priority: TransferPriority.values.firstWhere(
        (e) => e.name == json['priority'],
        orElse: () => TransferPriority.normal,
      ),
    );
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
    deviceName,
    progress,
    createdAt,
    completedAt,
    error,
    priority,
  ];
}
