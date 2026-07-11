import 'package:equatable/equatable.dart';

abstract class ClipboardEvent extends Equatable {
  const ClipboardEvent();

  @override
  List<Object?> get props => [];
}

class LoadClipboardItems extends ClipboardEvent {}

class AddClipboardItem extends ClipboardEvent {
  final String content;
  final String contentType;

  const AddClipboardItem({required this.content, required this.contentType});

  @override
  List<Object?> get props => [content, contentType];
}

class DeleteClipboardItem extends ClipboardEvent {
  final String id;

  const DeleteClipboardItem(this.id);

  @override
  List<Object?> get props => [id];
}

class ToggleClipboardSync extends ClipboardEvent {}

class SyncClipboardToDevices extends ClipboardEvent {
  final String itemId;

  const SyncClipboardToDevices(this.itemId);

  @override
  List<Object?> get props => [itemId];
}
