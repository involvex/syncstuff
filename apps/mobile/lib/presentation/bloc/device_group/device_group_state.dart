import 'package:equatable/equatable.dart';
import 'package:syncstuff_core/syncstuff_core.dart';

class DeviceGroupState extends Equatable {
  final List<DeviceGroup> groups;
  final bool isLoading;
  final String? error;

  const DeviceGroupState({
    this.groups = const [],
    this.isLoading = false,
    this.error,
  });

  DeviceGroupState copyWith({
    List<DeviceGroup>? groups,
    bool? isLoading,
    String? error,
  }) {
    return DeviceGroupState(
      groups: groups ?? this.groups,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }

  @override
  List<Object?> get props => [groups, isLoading, error];
}
