import 'package:syncstuff_core_flutter/src/data/datasources/device_group_local_datasource.dart';
import 'package:syncstuff_core/syncstuff_core.dart';

class DeviceGroupRepository {
  final DeviceGroupLocalDataSource _dataSource;

  DeviceGroupRepository({DeviceGroupLocalDataSource? dataSource})
    : _dataSource = dataSource ?? DeviceGroupLocalDataSource();

  Future<List<DeviceGroup>> getAllGroups() => _dataSource.getAllGroups();

  Future<DeviceGroup?> getGroupById(String id) => _dataSource.getGroupById(id);

  Future<void> saveGroup(DeviceGroup group) => _dataSource.saveGroup(group);

  Future<void> deleteGroup(String id) => _dataSource.deleteGroup(id);

  Future<void> addDeviceToGroup(String groupId, String deviceId) async {
    final group = await _dataSource.getGroupById(groupId);
    if (group == null) return;
    if (group.deviceIds.contains(deviceId)) return;

    await _dataSource.saveGroup(
      group.copyWith(
        deviceIds: [...group.deviceIds, deviceId],
        updatedAt: DateTime.now(),
      ),
    );
  }

  Future<void> removeDeviceFromGroup(String groupId, String deviceId) async {
    final group = await _dataSource.getGroupById(groupId);
    if (group == null) return;

    await _dataSource.saveGroup(
      group.copyWith(
        deviceIds: group.deviceIds.where((id) => id != deviceId).toList(),
        updatedAt: DateTime.now(),
      ),
    );
  }
}
