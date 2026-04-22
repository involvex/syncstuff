import 'package:equatable/equatable.dart';
import '../../../domain/entities/device.dart';

abstract class DeviceEvent extends Equatable {
  const DeviceEvent();

  @override
  List<Object?> get props => [];
}

class LoadDevices extends DeviceEvent {}

class StartDiscovery extends DeviceEvent {}

class StopDiscovery extends DeviceEvent {}

class PairDevice extends DeviceEvent {
  final SyncDevice device;

  const PairDevice(this.device);

  @override
  List<Object?> get props => [device];
}

class UnpairDevice extends DeviceEvent {
  final String deviceId;

  const UnpairDevice(this.deviceId);

  @override
  List<Object?> get props => [deviceId];
}

class ConnectToDevice extends DeviceEvent {
  final SyncDevice device;

  const ConnectToDevice(this.device);

  @override
  List<Object?> get props => [device];
}

class DisconnectFromDevice extends DeviceEvent {
  final String deviceId;

  const DisconnectFromDevice(this.deviceId);

  @override
  List<Object?> get props => [deviceId];
}

class DeviceDiscovered extends DeviceEvent {
  final SyncDevice device;

  const DeviceDiscovered(this.device);

  @override
  List<Object?> get props => [device];
}

class DeviceStatusChanged extends DeviceEvent {
  final String deviceId;
  final DeviceStatus status;

  const DeviceStatusChanged(this.deviceId, this.status);

  @override
  List<Object?> get props => [deviceId, status];
}

class ConnectViaQR extends DeviceEvent {
  final String qrData;

  const ConnectViaQR(this.qrData);

  @override
  List<Object?> get props => [qrData];
}
