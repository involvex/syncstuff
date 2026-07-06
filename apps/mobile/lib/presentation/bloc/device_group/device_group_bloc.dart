import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:syncstuff_core_flutter/syncstuff_core_flutter.dart';
import 'package:uuid/uuid.dart';

import '../transfer/transfer_bloc.dart';
import '../transfer/transfer_event.dart';
import 'device_group_event.dart';
import 'device_group_state.dart';

class DeviceGroupBloc extends Bloc<DeviceGroupEvent, DeviceGroupState> {
  final DeviceGroupRepository _repository;
  final TransferBloc _transferBloc;
  final _uuid = const Uuid();

  DeviceGroupBloc({
    required DeviceGroupRepository repository,
    required TransferBloc transferBloc,
  }) : _repository = repository,
       _transferBloc = transferBloc,
       super(const DeviceGroupState()) {
    on<LoadDeviceGroups>(_onLoad);
    on<CreateDeviceGroup>(_onCreate);
    on<DeleteDeviceGroup>(_onDelete);
    on<AddDeviceToGroup>(_onAddDevice);
    on<RemoveDeviceFromGroup>(_onRemoveDevice);
    on<SendToGroup>(_onSendToGroup);
  }

  Future<void> _onLoad(
    LoadDeviceGroups event,
    Emitter<DeviceGroupState> emit,
  ) async {
    emit(state.copyWith(isLoading: true));
    try {
      final groups = await _repository.getAllGroups();
      emit(state.copyWith(groups: groups, isLoading: false));
    } catch (e) {
      emit(state.copyWith(isLoading: false, error: e.toString()));
    }
  }

  Future<void> _onCreate(
    CreateDeviceGroup event,
    Emitter<DeviceGroupState> emit,
  ) async {
    try {
      final group = DeviceGroup(
        id: _uuid.v4(),
        name: event.name,
        description: event.description,
        createdAt: DateTime.now(),
      );
      await _repository.saveGroup(group);
      add(LoadDeviceGroups());
    } catch (e) {
      emit(state.copyWith(error: e.toString()));
    }
  }

  Future<void> _onDelete(
    DeleteDeviceGroup event,
    Emitter<DeviceGroupState> emit,
  ) async {
    try {
      await _repository.deleteGroup(event.groupId);
      add(LoadDeviceGroups());
    } catch (e) {
      emit(state.copyWith(error: e.toString()));
    }
  }

  Future<void> _onAddDevice(
    AddDeviceToGroup event,
    Emitter<DeviceGroupState> emit,
  ) async {
    try {
      await _repository.addDeviceToGroup(event.groupId, event.deviceId);
      add(LoadDeviceGroups());
    } catch (e) {
      emit(state.copyWith(error: e.toString()));
    }
  }

  Future<void> _onRemoveDevice(
    RemoveDeviceFromGroup event,
    Emitter<DeviceGroupState> emit,
  ) async {
    try {
      await _repository.removeDeviceFromGroup(event.groupId, event.deviceId);
      add(LoadDeviceGroups());
    } catch (e) {
      emit(state.copyWith(error: e.toString()));
    }
  }

  Future<void> _onSendToGroup(
    SendToGroup event,
    Emitter<DeviceGroupState> emit,
  ) async {
    try {
      final group = state.groups.firstWhere((g) => g.id == event.groupId);
      for (final deviceId in group.deviceIds) {
        _transferBloc.add(
          EnqueueTransfer(
            filePath: event.filePath,
            deviceIp: '',
            deviceId: deviceId,
          ),
        );
      }
    } catch (e) {
      emit(state.copyWith(error: e.toString()));
    }
  }
}
