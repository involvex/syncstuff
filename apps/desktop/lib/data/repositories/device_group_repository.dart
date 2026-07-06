import 'package:syncstuff_core_flutter/syncstuff_core_flutter.dart';

class DeviceGroupRepository {
  final DeviceGroupLocalDataSource _dataSource;

  DeviceGroupRepository({DeviceGroupLocalDataSource? dataSource})
    : _dataSource = dataSource ?? DeviceGroupLocalDataSource();

  Future<List<DeviceGroup>> getAllGroups() => _dataSource.getAllGroups();
  Future<DeviceGroup?> getGroupById(String id) => _dataSource.getGroupById(id);
  Future<void> saveGroup(DeviceGroup group) => _dataSource.saveGroup(group);
  Future<void> deleteGroup(String id) => _dataSource.deleteGroup(id);
}
