import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:syncstuff_core/src/domain/entities/device_group.dart';
import 'package:syncstuff_core_flutter/src/data/datasources/database_helper.dart';
import 'package:syncstuff_core_flutter/src/data/datasources/device_group_local_datasource.dart';

Future<void> _setupTestDb() async {
  sqfliteFfiInit();
  final db = await databaseFactoryFfi.openDatabase(
    inMemoryDatabasePath,
    options: OpenDatabaseOptions(
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE transfers (
            id TEXT PRIMARY KEY,
            fileName TEXT NOT NULL,
            fileSize INTEGER NOT NULL,
            filePath TEXT,
            type TEXT NOT NULL,
            status TEXT NOT NULL,
            direction TEXT NOT NULL,
            deviceId TEXT,
            deviceName TEXT,
            progress REAL NOT NULL,
            createdAt TEXT NOT NULL,
            completedAt TEXT,
            error TEXT
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
        await db.execute('''
          CREATE TABLE clipboard_items (
            id TEXT PRIMARY KEY,
            content TEXT NOT NULL,
            contentType TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            deviceId TEXT,
            deviceName TEXT,
            synced INTEGER NOT NULL DEFAULT 0
          )
        ''');
        await db.execute('''
          CREATE TABLE settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
          )
        ''');
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
      },
    ),
  );
  DatabaseHelper.setTestDatabase(db);
}

void main() {
  group('DeviceGroupLocalDataSource', () {
    late DeviceGroupLocalDataSource dataSource;

    setUp(() async {
      await _setupTestDb();
      dataSource = DeviceGroupLocalDataSource();
    });

    tearDown(() {
      DatabaseHelper.reset();
    });

    test('getAllGroups returns empty list initially', () async {
      final groups = await dataSource.getAllGroups();
      expect(groups, isEmpty);
    });

    test('saveGroup and getAllGroups', () async {
      final group = DeviceGroup(
        id: 'g1',
        name: 'Test Group',
        description: 'A test group',
        createdAt: DateTime(2026, 1, 1),
      );

      await dataSource.saveGroup(group);
      final groups = await dataSource.getAllGroups();

      expect(groups.length, 1);
      expect(groups.first.id, 'g1');
      expect(groups.first.name, 'Test Group');
      expect(groups.first.description, 'A test group');
      expect(groups.first.deviceIds, isEmpty);
    });

    test('saveGroup with device members', () async {
      final group = DeviceGroup(
        id: 'g1',
        name: 'Group With Devices',
        deviceIds: ['d1', 'd2'],
        createdAt: DateTime(2026, 1, 1),
      );

      await dataSource.saveGroup(group);
      final groups = await dataSource.getAllGroups();

      expect(groups.length, 1);
      expect(groups.first.deviceIds, ['d1', 'd2']);
    });

    test('saveGroup replaces existing group', () async {
      final group1 = DeviceGroup(
        id: 'g1',
        name: 'Original',
        deviceIds: ['d1'],
        createdAt: DateTime(2026, 1, 1),
      );
      final group2 = DeviceGroup(
        id: 'g1',
        name: 'Updated',
        deviceIds: ['d1', 'd2', 'd3'],
        createdAt: DateTime(2026, 1, 1),
        updatedAt: DateTime(2026, 6, 1),
      );

      await dataSource.saveGroup(group1);
      await dataSource.saveGroup(group2);
      final groups = await dataSource.getAllGroups();

      expect(groups.length, 1);
      expect(groups.first.name, 'Updated');
      expect(groups.first.deviceIds, ['d1', 'd2', 'd3']);
    });

    test('getGroupById returns group', () async {
      final group = DeviceGroup(
        id: 'g1',
        name: 'Findable',
        deviceIds: ['d1'],
        createdAt: DateTime(2026, 1, 1),
      );

      await dataSource.saveGroup(group);
      final found = await dataSource.getGroupById('g1');

      expect(found, isNotNull);
      expect(found!.name, 'Findable');
      expect(found.deviceIds, ['d1']);
    });

    test('getGroupById returns null for nonexistent id', () async {
      final found = await dataSource.getGroupById('nonexistent');
      expect(found, isNull);
    });

    test('deleteGroup removes group and members', () async {
      final group = DeviceGroup(
        id: 'g1',
        name: 'To Delete',
        deviceIds: ['d1', 'd2'],
        createdAt: DateTime(2026, 1, 1),
      );

      await dataSource.saveGroup(group);
      await dataSource.deleteGroup('g1');

      final groups = await dataSource.getAllGroups();
      expect(groups, isEmpty);
    });

    test('deleteGroup does not affect other groups', () async {
      final group1 = DeviceGroup(
        id: 'g1',
        name: 'Keep',
        createdAt: DateTime(2026, 1, 1),
      );
      final group2 = DeviceGroup(
        id: 'g2',
        name: 'Delete',
        createdAt: DateTime(2026, 1, 2),
      );

      await dataSource.saveGroup(group1);
      await dataSource.saveGroup(group2);
      await dataSource.deleteGroup('g2');

      final groups = await dataSource.getAllGroups();
      expect(groups.length, 1);
      expect(groups.first.id, 'g1');
    });

    test('getAllGroups returns groups ordered by createdAt DESC', () async {
      await dataSource.saveGroup(
        DeviceGroup(id: 'g1', name: 'First', createdAt: DateTime(2026, 1, 1)),
      );
      await dataSource.saveGroup(
        DeviceGroup(id: 'g2', name: 'Second', createdAt: DateTime(2026, 6, 1)),
      );
      await dataSource.saveGroup(
        DeviceGroup(id: 'g3', name: 'Third', createdAt: DateTime(2026, 3, 1)),
      );

      final groups = await dataSource.getAllGroups();
      expect(groups.map((g) => g.id), ['g2', 'g3', 'g1']);
    });

    test('handles group with null description and updatedAt', () async {
      final group = DeviceGroup(
        id: 'g1',
        name: 'Minimal',
        createdAt: DateTime(2026, 1, 1),
      );

      await dataSource.saveGroup(group);
      final found = await dataSource.getGroupById('g1');

      expect(found, isNotNull);
      expect(found!.description, isNull);
      expect(found.updatedAt, isNull);
    });

    test('updateGroup modifies existing group', () async {
      final group = DeviceGroup(
        id: 'g1',
        name: 'Original',
        description: 'Old desc',
        createdAt: DateTime(2026, 1, 1),
      );

      await dataSource.saveGroup(group);

      final updated = group.copyWith(
        name: 'Modified',
        description: 'New desc',
        deviceIds: ['d1'],
        updatedAt: DateTime(2026, 6, 1),
      );
      await dataSource.saveGroup(updated);

      final found = await dataSource.getGroupById('g1');
      expect(found, isNotNull);
      expect(found!.name, 'Modified');
      expect(found.description, 'New desc');
      expect(found.deviceIds, ['d1']);
      expect(found.updatedAt, isNotNull);
    });
  });
}
