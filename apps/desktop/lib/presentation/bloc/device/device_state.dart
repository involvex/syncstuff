import 'package:equatable/equatable.dart';
import '../../../domain/entities/device.dart';

class DeviceState extends Equatable {
  final List<SyncDevice> discoveredDevices;
  final List<SyncDevice> pairedDevices;
  final String discoveryStatus;
  final String? connectingDeviceId;
  final String? error;
  final String? lastNotification;

  const DeviceState({
    this.discoveredDevices = const [],
    this.pairedDevices = const [],
    this.discoveryStatus = 'idle',
    this.connectingDeviceId,
    this.error,
    this.lastNotification,
  });

  DeviceState copyWith({
    List<SyncDevice>? discoveredDevices,
    List<SyncDevice>? pairedDevices,
    String? discoveryStatus,
    String? connectingDeviceId,
    String? error,
    String? lastNotification,
  }) {
    return DeviceState(
      discoveredDevices: discoveredDevices ?? this.discoveredDevices,
      pairedDevices: pairedDevices ?? this.pairedDevices,
      discoveryStatus: discoveryStatus ?? this.discoveryStatus,
      connectingDeviceId: connectingDeviceId,
      error: error,
      lastNotification: lastNotification,
    );
  }

  @override
  List<Object?> get props => [
    discoveredDevices,
    pairedDevices,
    discoveryStatus,
    connectingDeviceId,
    error,
    lastNotification,
  ];
}
