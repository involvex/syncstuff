import 'package:sqflite/sqflite.dart';
import 'package:syncstuff_core/syncstuff_core.dart';
import 'package:syncstuff_core_flutter/src/data/datasources/database_helper.dart';

class DeviceGroupLocalDataSource {
  final DatabaseHelper _databaseHelper;

  DeviceGroupLocalDataSource({DatabaseHelper? databaseHelper})
    : _databaseHelper = databaseHelper ?? DatabaseHelper();

  Future<List<DeviceGroup>> getAllGroups() async {
    final db = await _databaseHelper.database;
    final groups = await db.query('device_groups', orderBy: 'createdAt DESC');

    final result = <DeviceGroup>[];
    for (final group in groups) {
      final members = await db.query(
        'device_group_members',
        where: 'groupId = ?',
        whereArgs: [group['id']],
      );
      result.add(
        DeviceGroup(
          id: group['id'] as String,
          name: group['name'] as String,
          description: group['description'] as String?,
          deviceIds: members.map((m) => m['deviceId'] as String).toList(),
          createdAt: DateTime.parse(group['createdAt'] as String),
          updatedAt: group['updatedAt'] != null
              ? DateTime.parse(group['updatedAt'] as String)
              : null,
        ),
      );
    }
    return result;
  }

  Future<DeviceGroup?> getGroupById(String id) async {
    final db = await _databaseHelper.database;
    final maps = await db.query(
      'device_groups',
      where: 'id = ?',
      whereArgs: [id],
    );
    if (maps.isEmpty) return null;

    final group = maps.first;
    final members = await db.query(
      'device_group_members',
      where: 'groupId = ?',
      whereArgs: [id],
    );
    return DeviceGroup(
      id: group['id'] as String,
      name: group['name'] as String,
      description: group['description'] as String?,
      deviceIds: members.map((m) => m['deviceId'] as String).toList(),
      createdAt: DateTime.parse(group['createdAt'] as String),
      updatedAt: group['updatedAt'] != null
          ? DateTime.parse(group['updatedAt'] as String)
          : null,
    );
  }

  Future<void> saveGroup(DeviceGroup group) async {
    final db = await _databaseHelper.database;
    await db.insert('device_groups', {
      'id': group.id,
      'name': group.name,
      'description': group.description,
      'createdAt': group.createdAt.toIso8601String(),
      'updatedAt': group.updatedAt?.toIso8601String(),
    }, conflictAlgorithm: ConflictAlgorithm.replace);

    await db.delete(
      'device_group_members',
      where: 'groupId = ?',
      whereArgs: [group.id],
    );
    for (final deviceId in group.deviceIds) {
      await db.insert('device_group_members', {
        'groupId': group.id,
        'deviceId': deviceId,
      });
    }
  }

  Future<void> deleteGroup(String id) async {
    final db = await _databaseHelper.database;
    await db.delete('device_groups', where: 'id = ?', whereArgs: [id]);
    await db.delete(
      'device_group_members',
      where: 'groupId = ?',
      whereArgs: [id],
    );
  }
}
