import 'package:syncstuff_core/syncstuff_core.dart';

class DeviceRepository
{
    final DeviceLocalDataSource _localDataSource;

    DeviceRepository({DeviceLocalDataSource? localDataSource})
      : _localDataSource = localDataSource ?? DeviceLocalDataSource();

    Future<List<SyncDevice>> getPairedDevices() async
    {
        return await _localDataSource.getPairedDevices();
    }

    Future<List<SyncDevice>> getAllDevices() async
    {
        return await _localDataSource.getAllDevices();
    }

    Future<SyncDevice?> getDeviceById(String id) async
    {
        return await _localDataSource.getDeviceById(id);
    }

    Future<void> saveDevice(SyncDevice device) async
    {
        await _localDataSource.saveDevice(device);
    }

    Future<void> updateDevice(SyncDevice device) async
    {
        await _localDataSource.updateDevice(device);
    }

    Future<void> deleteDevice(String id) async
    {
        await _localDataSource.deleteDevice(id);
    }

    Future<void> setDevicePaired(String id, bool isPaired) async
    {
        await _localDataSource.setDevicePaired(id, isPaired);
    }

    Future<void> pairDevice(SyncDevice device) async
    {
        final pairedDevice = device.copyWith(isPaired: true);
        await _localDataSource.saveDevice(pairedDevice);
    }

    Future<void> unpairDevice(String id) async
    {
        await _localDataSource.setDevicePaired(id, false);
    }
}
