import 'package:sqflite/sqflite.dart';
import 'package:syncstuff_core_flutter/src/data/datasources/database_helper.dart';
import 'package:syncstuff_core/syncstuff_core.dart';

class DeviceLocalDataSource {
  final DatabaseHelper _databaseHelper;

  DeviceLocalDataSource({DatabaseHelper? databaseHelper})
    : _databaseHelper = databaseHelper ?? DatabaseHelper();

  Future<List<SyncDevice>> getPairedDevices() async {
    final db = await _databaseHelper.database;
    final maps = await db.query(
      'devices',
      where: 'isPaired = ?',
      whereArgs: [1],
      orderBy: 'name ASC',
    );
    return maps.map((map) => _deviceFromMap(map)).toList();
  }

  Future<List<SyncDevice>> getAllDevices() async {
    final db = await _databaseHelper.database;
    final maps = await db.query('devices', orderBy: 'name ASC');
    return maps.map((map) => _deviceFromMap(map)).toList();
  }

  Future<SyncDevice?> getDeviceById(String id) async {
    final db = await _databaseHelper.database;
    final maps = await db.query('devices', where: 'id = ?', whereArgs: [id]);
    if (maps.isEmpty) return null;
    return _deviceFromMap(maps.first);
  }

  Future<void> saveDevice(SyncDevice device) async {
    final db = await _databaseHelper.database;
    await db.insert(
      'devices',
      _deviceToMap(device),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<void> updateDevice(SyncDevice device) async {
    final db = await _databaseHelper.database;
    await db.update(
      'devices',
      _deviceToMap(device),
      where: 'id = ?',
      whereArgs: [device.id],
    );
  }

  Future<void> deleteDevice(String id) async {
    final db = await _databaseHelper.database;
    await db.delete('devices', where: 'id = ?', whereArgs: [id]);
  }

  Future<void> setDevicePaired(String id, bool isPaired) async {
    final db = await _databaseHelper.database;
    await db.update(
      'devices',
      {'isPaired': isPaired ? 1 : 0},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Map<String, dynamic> _deviceToMap(SyncDevice device) {
    return {
      'id': device.id,
      'name': device.name,
      'platform': device.platform.name,
      'ipAddress': device.ipAddress,
      'port': device.port,
      'lastSeen': device.lastSeen?.toIso8601String(),
      'isPaired': device.isPaired ? 1 : 0,
    };
  }

  SyncDevice _deviceFromMap(Map<String, dynamic> map) {
    return SyncDevice(
      id: map['id'] as String,
      name: map['name'] as String,
      platform: DevicePlatform.values.firstWhere(
        (e) => e.name == map['platform'],
        orElse: () => DevicePlatform.unknown,
      ),
      status: DeviceStatus.offline,
      ipAddress: map['ipAddress'] as String?,
      port: map['port'] as int?,
      lastSeen: map['lastSeen'] != null
          ? DateTime.parse(map['lastSeen'] as String)
          : null,
      isPaired: (map['isPaired'] as int) == 1,
    );
  }
}
