import 'package:flutter_test/flutter_test.dart';
import 'package:syncstuff_mobile/domain/entities/device.dart';

void main() {
  group('SyncDevice', () {
    test('should create device with required fields', () {
      const device = SyncDevice(
        id: 'test-id',
        name: 'Test Device',
        platform: DevicePlatform.android,
        status: DeviceStatus.online,
      );

      expect(device.id, 'test-id');
      expect(device.name, 'Test Device');
      expect(device.platform, DevicePlatform.android);
      expect(device.status, DeviceStatus.online);
      expect(device.isPaired, false);
    });

    test('should copy with new values', () {
      const device = SyncDevice(
        id: 'test-id',
        name: 'Test Device',
        platform: DevicePlatform.android,
        status: DeviceStatus.online,
      );

      final updatedDevice = device.copyWith(
        name: 'Updated Device',
        status: DeviceStatus.offline,
      );

      expect(updatedDevice.id, 'test-id');
      expect(updatedDevice.name, 'Updated Device');
      expect(updatedDevice.status, DeviceStatus.offline);
    });

    test('should support equality', () {
      const device1 = SyncDevice(
        id: 'test-id',
        name: 'Test Device',
        platform: DevicePlatform.android,
        status: DeviceStatus.online,
      );

      const device2 = SyncDevice(
        id: 'test-id',
        name: 'Test Device',
        platform: DevicePlatform.android,
        status: DeviceStatus.online,
      );

      expect(device1, equals(device2));
    });

    test('should list all platform types', () {
      expect(DevicePlatform.values.length, 8);
      expect(DevicePlatform.values.contains(DevicePlatform.android), true);
      expect(DevicePlatform.values.contains(DevicePlatform.windows), true);
      expect(DevicePlatform.values.contains(DevicePlatform.cli), true);
    });

    test('should list all status types', () {
      expect(DeviceStatus.values.length, 3);
      expect(DeviceStatus.values.contains(DeviceStatus.online), true);
      expect(DeviceStatus.values.contains(DeviceStatus.offline), true);
      expect(DeviceStatus.values.contains(DeviceStatus.connecting), true);
    });
  });
}
