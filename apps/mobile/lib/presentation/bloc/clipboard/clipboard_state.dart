import 'package:equatable/equatable.dart';
import '../../../domain/entities/clipboard.dart';

class ClipboardState extends Equatable {
  final List<ClipboardItem> items;
  final bool syncEnabled;
  final bool isSyncing;
  final String? error;

  const ClipboardState({
    this.items = const [],
    this.syncEnabled = false,
    this.isSyncing = false,
    this.error,
  });

  ClipboardState copyWith({
    List<ClipboardItem>? items,
    bool? syncEnabled,
    bool? isSyncing,
    String? error,
  }) {
    return ClipboardState(
      items: items ?? this.items,
      syncEnabled: syncEnabled ?? this.syncEnabled,
      isSyncing: isSyncing ?? this.isSyncing,
      error: error,
    );
  }

  @override
  List<Object?> get props => [items, syncEnabled, isSyncing, error];
}
