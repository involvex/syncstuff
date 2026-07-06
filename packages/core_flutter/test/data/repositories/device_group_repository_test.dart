import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:syncstuff_core/src/domain/entities/device_group.dart';
import 'package:syncstuff_core_flutter/src/data/datasources/database_helper.dart';
import 'package:syncstuff_core_flutter/src/data/datasources/device_group_local_datasource.dart';
import 'package:syncstuff_core_flutter/src/data/repositories/device_group_repository.dart';

Future<void> _setupTestDb() async {
  sqfliteFfiInit();
  final db = await databaseFactoryFfi.openDatabase(
    inMemoryDatabasePath,
    options: OpenDatabaseOptions(
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE device_groups (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            createdAt TEXT NOT NULL,
            updatedAt TEXT
          )
        ''');
        await db.execute('''
          CREATE TABLE device_group_members (
            groupId TEXT NOT NULL,
            deviceId TEXT NOT NULL,
            PRIMARY KEY (groupId, deviceId),
            FOREIGN KEY (groupId) REFERENCES device_groups(id) ON DELETE CASCADE,
            FOREIGN KEY (deviceId) REFERENCES devices(id) ON DELETE CASCADE
          )
        ''');
        await db.execute('''
          CREATE TABLE devices (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            platform TEXT NOT NULL,
            ipAddress TEXT,
            port INTEGER,
            lastSeen TEXT,
            isPaired INTEGER NOT NULL DEFAULT 0
          )
        ''');
      },
    ),
  );
  DatabaseHelper.setTestDatabase(db);
}

void main() {
  group('DeviceGroupRepository', () {
    late DeviceGroupRepository repository;

    setUp(() async {
      await _setupTestDb();
      // Clear all tables to ensure clean state
      final db = await DatabaseHelper().database;
      await db.delete('device_group_members');
      await db.delete('device_groups');
      repository = DeviceGroupRepository(
        dataSource: DeviceGroupLocalDataSource(),
      );
    });

    tearDown(() {
      DatabaseHelper.reset();
    });

    test('getAllGroups returns empty list initially', () async {
      final groups = await repository.getAllGroups();
      expect(groups, isEmpty);
    });

    test('saveGroup and getAllGroups', () async {
      final group = DeviceGroup(
        id: 'g1',
        name: 'Test Group',
        description: 'A test group',
        createdAt: DateTime(2026, 1, 1),
      );

      await repository.saveGroup(group);
      final groups = await repository.getAllGroups();

      expect(groups.length, 1);
      expect(groups.first.id, 'g1');
      expect(groups.first.name, 'Test Group');
      expect(groups.first.description, 'A test group');
    });

    test('getGroupById returns group', () async {
      final group = DeviceGroup(
        id: 'g1',
        name: 'Findable',
        deviceIds: ['d1'],
        createdAt: DateTime(2026, 1, 1),
      );

      await repository.saveGroup(group);
      final found = await repository.getGroupById('g1');

      expect(found, isNotNull);
      expect(found!.name, 'Findable');
      expect(found.deviceIds, ['d1']);
    });

    test('getGroupById returns null for nonexistent id', () async {
      final found = await repository.getGroupById('nonexistent');
      expect(found, isNull);
    });

    test('deleteGroup removes group', () async {
      final group = DeviceGroup(
        id: 'g1',
        name: 'To Delete',
        deviceIds: ['d1', 'd2'],
        createdAt: DateTime(2026, 1, 1),
      );

      await repository.saveGroup(group);
      await repository.deleteGroup('g1');

      final groups = await repository.getAllGroups();
      expect(groups, isEmpty);
    });

    test('addDeviceToGroup adds device', () async {
      final group = DeviceGroup(
        id: 'g1',
        name: 'Group',
        createdAt: DateTime(2026, 1, 1),
      );

      await repository.saveGroup(group);
      await repository.addDeviceToGroup('g1', 'd1');

      final updated = await repository.getGroupById('g1');
      expect(updated!.deviceIds, contains('d1'));
      expect(updated.updatedAt, isNotNull);
    });

    test('addDeviceToGroup does not duplicate device', () async {
      final group = DeviceGroup(
        id: 'g1',
        name: 'Group',
        deviceIds: ['d1'],
        createdAt: DateTime(2026, 1, 1),
      );

      await repository.saveGroup(group);
      await repository.addDeviceToGroup('g1', 'd1');

      final updated = await repository.getGroupById('g1');
      expect(updated!.deviceIds, ['d1']);
    });

    test('addDeviceToGroup does nothing for nonexistent group', () async {
      await repository.addDeviceToGroup('nonexistent', 'd1');
      final groups = await repository.getAllGroups();
      expect(groups, isEmpty);
    });

    test('removeDeviceFromGroup removes device', () async {
      final group = DeviceGroup(
        id: 'g1',
        name: 'Group',
        deviceIds: ['d1', 'd2'],
        createdAt: DateTime(2026, 1, 1),
      );

      await repository.saveGroup(group);
      await repository.removeDeviceFromGroup('g1', 'd1');

      final updated = await repository.getGroupById('g1');
      expect(updated!.deviceIds, ['d2']);
      expect(updated.updatedAt, isNotNull);
    });

    test('removeDeviceFromGroup does nothing for nonexistent group', () async {
      await repository.removeDeviceFromGroup('nonexistent', 'd1');
      final groups = await repository.getAllGroups();
      expect(groups, isEmpty);
    });

    test('removeDeviceFromGroup is safe if device not in group', () async {
      final group = DeviceGroup(
        id: 'g1',
        name: 'Group',
        deviceIds: ['d1'],
        createdAt: DateTime(2026, 1, 1),
      );

      await repository.saveGroup(group);
      await repository.removeDeviceFromGroup('g1', 'd999');

      final updated = await repository.getGroupById('g1');
      expect(updated!.deviceIds, ['d1']);
    });
  });
}
