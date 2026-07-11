import 'package:equatable/equatable.dart';

abstract class DeviceEvent extends Equatable {
  const DeviceEvent();
  @override
  List<Object?> get props => [];
}

class LoadDevices extends DeviceEvent {}

class StartDiscovery extends DeviceEvent {}

class StopDiscovery extends DeviceEvent {}

class DeviceDiscovered extends DeviceEvent {
  final Map<String, dynamic> device;
  const DeviceDiscovered(this.device);
  @override
  List<Object?> get props => [device];
}

class PairDevice extends DeviceEvent {
  final String deviceId;
  const PairDevice(this.deviceId);
  @override
  List<Object?> get props => [deviceId];
}

class UnpairDevice extends DeviceEvent {
  final String deviceId;
  const UnpairDevice(this.deviceId);
  @override
  List<Object?> get props => [deviceId];
}

class ConnectToDevice extends DeviceEvent {
  final String deviceId;
  const ConnectToDevice(this.deviceId);
  @override
  List<Object?> get props => [deviceId];
}

class DisconnectFromDevice extends DeviceEvent {
  final String deviceId;
  const DisconnectFromDevice(this.deviceId);
  @override
  List<Object?> get props => [deviceId];
}

class AutoConnectOnStart extends DeviceEvent {}

class DevicePairedByRemote extends DeviceEvent {
  final String deviceId;
  final String deviceName;

  const DevicePairedByRemote({
    required this.deviceId,
    required this.deviceName,
  });

  @override
  List<Object?> get props => [deviceId, deviceName];
}

class DeviceUnpairedByRemote extends DeviceEvent {
  final String deviceId;
  final String deviceName;

  const DeviceUnpairedByRemote({
    required this.deviceId,
    required this.deviceName,
  });

  @override
  List<Object?> get props => [deviceId, deviceName];
}
