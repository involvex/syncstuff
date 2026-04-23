import 'package:equatable/equatable.dart';

class ClipboardItem extends Equatable {
  final String id;
  final String content;
  final String contentType;
  final DateTime createdAt;
  final String? deviceId;
  final String? deviceName;
  final bool synced;

  const ClipboardItem({
    required this.id,
    required this.content,
    required this.contentType,
    required this.createdAt,
    this.deviceId,
    this.deviceName,
    this.synced = false,
  });

  ClipboardItem copyWith({
    String? id,
    String? content,
    String? contentType,
    DateTime? createdAt,
    String? deviceId,
    String? deviceName,
    bool? synced,
  }) {
    return ClipboardItem(
      id: id ?? this.id,
      content: content ?? this.content,
      contentType: contentType ?? this.contentType,
      createdAt: createdAt ?? this.createdAt,
      deviceId: deviceId ?? this.deviceId,
      deviceName: deviceName ?? this.deviceName,
      synced: synced ?? this.synced,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'content': content,
      'contentType': contentType,
      'createdAt': createdAt.toIso8601String(),
      'deviceId': deviceId,
      'deviceName': deviceName,
      'synced': synced,
    };
  }

  factory ClipboardItem.fromJson(Map<String, dynamic> json) {
    return ClipboardItem(
      id: json['id'] as String,
      content: json['content'] as String,
      contentType: json['contentType'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      deviceId: json['deviceId'] as String?,
      deviceName: json['deviceName'] as String?,
      synced: json['synced'] as bool? ?? false,
    );
  }

  @override
  List<Object?> get props => [
    id,
    content,
    contentType,
    createdAt,
    deviceId,
    deviceName,
    synced,
  ];
}
