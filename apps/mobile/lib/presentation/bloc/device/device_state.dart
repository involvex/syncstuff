import 'package:equatable/equatable.dart';
import '../../../domain/entities/device.dart';

enum DiscoveryStatus { idle, discovering, error }

class DeviceState extends Equatable {
  final List<SyncDevice> discoveredDevices;
  final List<SyncDevice> pairedDevices;
  final DiscoveryStatus discoveryStatus;
  final String? error;
  final String? connectingDeviceId;

  const DeviceState({
    this.discoveredDevices = const [],
    this.pairedDevices = const [],
    this.discoveryStatus = DiscoveryStatus.idle,
    this.error,
    this.connectingDeviceId,
  });

  DeviceState copyWith({
    List<SyncDevice>? discoveredDevices,
    List<SyncDevice>? pairedDevices,
    DiscoveryStatus? discoveryStatus,
    String? error,
    String? connectingDeviceId,
  }) {
    return DeviceState(
      discoveredDevices: discoveredDevices ?? this.discoveredDevices,
      pairedDevices: pairedDevices ?? this.pairedDevices,
      discoveryStatus: discoveryStatus ?? this.discoveryStatus,
      error: error,
      connectingDeviceId: connectingDeviceId,
    );
  }

  @override
  List<Object?> get props => [
    discoveredDevices,
    pairedDevices,
    discoveryStatus,
    error,
    connectingDeviceId,
  ];
}
