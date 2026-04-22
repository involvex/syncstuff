import 'package:equatable/equatable.dart';

class ClipboardItem extends Equatable {
  final String id;
  final String content;
  final String contentType;
  final DateTime createdAt;
  final String? deviceId;
  final bool synced;

  const ClipboardItem({
    required this.id,
    required this.content,
    required this.contentType,
    required this.createdAt,
    this.deviceId,
    this.synced = false,
  });

  ClipboardItem copyWith({
    String? id,
    String? content,
    String? contentType,
    DateTime? createdAt,
    String? deviceId,
    bool? synced,
  }) {
    return ClipboardItem(
      id: id ?? this.id,
      content: content ?? this.content,
      contentType: contentType ?? this.contentType,
      createdAt: createdAt ?? this.createdAt,
      deviceId: deviceId ?? this.deviceId,
      synced: synced ?? this.synced,
    );
  }

  @override
  List<Object?> get props => [
    id,
    content,
    contentType,
    createdAt,
    deviceId,
    synced,
  ];
}
