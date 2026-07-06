import 'package:equatable/equatable.dart';

abstract class DeviceGroupEvent extends Equatable {
  const DeviceGroupEvent();

  @override
  List<Object?> get props => [];
}

class LoadDeviceGroups extends DeviceGroupEvent {}

class CreateDeviceGroup extends DeviceGroupEvent {
  final String name;
  final String? description;

  const CreateDeviceGroup({required this.name, this.description});

  @override
  List<Object?> get props => [name, description];
}

class DeleteDeviceGroup extends DeviceGroupEvent {
  final String groupId;

  const DeleteDeviceGroup(this.groupId);

  @override
  List<Object?> get props => [groupId];
}

class AddDeviceToGroup extends DeviceGroupEvent {
  final String groupId;
  final String deviceId;

  const AddDeviceToGroup({required this.groupId, required this.deviceId});

  @override
  List<Object?> get props => [groupId, deviceId];
}

class RemoveDeviceFromGroup extends DeviceGroupEvent {
  final String groupId;
  final String deviceId;

  const RemoveDeviceFromGroup({required this.groupId, required this.deviceId});

  @override
  List<Object?> get props => [groupId, deviceId];
}

class SendToGroup extends DeviceGroupEvent {
  final String groupId;
  final String filePath;

  const SendToGroup({required this.groupId, required this.filePath});

  @override
  List<Object?> get props => [groupId, filePath];
}
