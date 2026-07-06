import 'package:test/test.dart';
import 'package:syncstuff_core/syncstuff_core.dart';

void main() {
  group('DeviceGroup', () {
    test('should create device group with required fields', () {
      final group = DeviceGroup(
        id: 'test-id',
        name: 'Test Group',
        createdAt: DateTime(2026, 1, 1),
      );

      expect(group.id, 'test-id');
      expect(group.name, 'Test Group');
      expect(group.description, isNull);
      expect(group.deviceIds, isEmpty);
      expect(group.createdAt, DateTime(2026, 1, 1));
      expect(group.updatedAt, isNull);
    });

    test('should create device group with optional fields', () {
      final group = DeviceGroup(
        id: 'test-id',
        name: 'Test Group',
        description: 'A test group',
        deviceIds: const ['device-1', 'device-2'],
        createdAt: DateTime(2026, 1, 1),
        updatedAt: DateTime(2026, 6, 1),
      );

      expect(group.description, 'A test group');
      expect(group.deviceIds, ['device-1', 'device-2']);
      expect(group.updatedAt, DateTime(2026, 6, 1));
    });

    test('should copy with new values', () {
      final group = DeviceGroup(
        id: 'test-id',
        name: 'Test Group',
        createdAt: DateTime(2026, 1, 1),
      );

      final updated = group.copyWith(
        name: 'Updated Group',
        description: 'New description',
        deviceIds: const ['device-1'],
        updatedAt: DateTime(2026, 6, 1),
      );

      expect(updated.id, 'test-id');
      expect(updated.name, 'Updated Group');
      expect(updated.description, 'New description');
      expect(updated.deviceIds, ['device-1']);
      expect(updated.createdAt, DateTime(2026, 1, 1));
      expect(updated.updatedAt, DateTime(2026, 6, 1));
    });

    test('copyWith should preserve unchanged fields', () {
      final group = DeviceGroup(
        id: 'test-id',
        name: 'Test Group',
        description: 'Description',
        deviceIds: const ['d1'],
        createdAt: DateTime(2026, 1, 1),
        updatedAt: DateTime(2026, 6, 1),
      );

      final updated = group.copyWith(name: 'New Name');

      expect(updated.id, 'test-id');
      expect(updated.name, 'New Name');
      expect(updated.description, 'Description');
      expect(updated.deviceIds, ['d1']);
      expect(updated.createdAt, DateTime(2026, 1, 1));
      expect(updated.updatedAt, DateTime(2026, 6, 1));
    });

    test('should serialize to JSON', () {
      final group = DeviceGroup(
        id: 'test-id',
        name: 'Test Group',
        description: 'A test group',
        deviceIds: const ['device-1', 'device-2'],
        createdAt: DateTime(2026, 1, 1),
        updatedAt: DateTime(2026, 6, 1),
      );

      final json = group.toJson();

      expect(json['id'], 'test-id');
      expect(json['name'], 'Test Group');
      expect(json['description'], 'A test group');
      expect(json['deviceIds'], ['device-1', 'device-2']);
      expect(json['createdAt'], DateTime(2026, 1, 1).toIso8601String());
      expect(json['updatedAt'], DateTime(2026, 6, 1).toIso8601String());
    });

    test('should serialize null optional fields to JSON', () {
      final group = DeviceGroup(
        id: 'test-id',
        name: 'Test Group',
        createdAt: DateTime(2026, 1, 1),
      );

      final json = group.toJson();

      expect(json['description'], isNull);
      expect(json['updatedAt'], isNull);
    });

    test('should deserialize from JSON', () {
      final json = {
        'id': 'test-id',
        'name': 'Test Group',
        'description': 'A test group',
        'deviceIds': ['device-1', 'device-2'],
        'createdAt': '2026-01-01T00:00:00.000',
        'updatedAt': '2026-06-01T00:00:00.000',
      };

      final group = DeviceGroup.fromJson(json);

      expect(group.id, 'test-id');
      expect(group.name, 'Test Group');
      expect(group.description, 'A test group');
      expect(group.deviceIds, ['device-1', 'device-2']);
      expect(group.createdAt, DateTime(2026, 1, 1));
      expect(group.updatedAt, DateTime(2026, 6, 1));
    });

    test('should deserialize from JSON with null optional fields', () {
      final json = {
        'id': 'test-id',
        'name': 'Test Group',
        'createdAt': '2026-01-01T00:00:00.000',
      };

      final group = DeviceGroup.fromJson(json);

      expect(group.description, isNull);
      expect(group.deviceIds, isEmpty);
      expect(group.updatedAt, isNull);
    });

    test('should round-trip through JSON', () {
      final original = DeviceGroup(
        id: 'test-id',
        name: 'Test Group',
        description: 'Description',
        deviceIds: const ['device-1', 'device-2'],
        createdAt: DateTime(2026, 1, 1),
        updatedAt: DateTime(2026, 6, 1),
      );

      final restored = DeviceGroup.fromJson(original.toJson());

      expect(restored, original);
    });

    test('should support equality', () {
      final group1 = DeviceGroup(
        id: 'test-id',
        name: 'Test Group',
        createdAt: DateTime(2026, 1, 1),
      );

      final group2 = DeviceGroup(
        id: 'test-id',
        name: 'Test Group',
        createdAt: DateTime(2026, 1, 1),
      );

      expect(group1, equals(group2));
    });

    test('should not be equal with different fields', () {
      final group1 = DeviceGroup(
        id: 'test-id',
        name: 'Group A',
        createdAt: DateTime(2026, 1, 1),
      );

      final group2 = DeviceGroup(
        id: 'test-id',
        name: 'Group B',
        createdAt: DateTime(2026, 1, 1),
      );

      expect(group1, isNot(equals(group2)));
    });

    test('should have consistent hashCode for equal objects', () {
      final group1 = DeviceGroup(
        id: 'test-id',
        name: 'Test Group',
        deviceIds: const ['d1'],
        createdAt: DateTime(2026, 1, 1),
      );

      final group2 = DeviceGroup(
        id: 'test-id',
        name: 'Test Group',
        deviceIds: const ['d1'],
        createdAt: DateTime(2026, 1, 1),
      );

      expect(group1.hashCode, group2.hashCode);
    });
  });
}
