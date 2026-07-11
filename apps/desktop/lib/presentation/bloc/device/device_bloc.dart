import 'dart:async';
import 'dart:io';
import 'dart:convert';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:syncstuff_core_flutter/syncstuff_core_flutter.dart';

import '../../../services/desktop_discovery_service.dart';
import '../../../services/desktop_http_server.dart';
import 'device_event.dart';
import 'device_state.dart';

class DeviceBloc extends Bloc<DeviceEvent, DeviceState> {
  final DesktopDiscoveryService _discoveryService;
  final DeviceRepository _deviceRepository;
  final DesktopHttpServer _httpServer;

  StreamSubscription<Map<String, dynamic>>? _discoverySubscription;
  StreamSubscription<Map<String, dynamic>>? _pairingSubscription;

  DeviceBloc({
    required DesktopDiscoveryService discoveryService,
    required DeviceRepository deviceRepository,
    required DesktopHttpServer httpServer,
  }) : _discoveryService = discoveryService,
       _deviceRepository = deviceRepository,
       _httpServer = httpServer,
       super(const DeviceState()) {
    on<LoadDevices>(_onLoadDevices);
    on<StartDiscovery>(_onStartDiscovery);
    on<StopDiscovery>(_onStopDiscovery);
    on<DeviceDiscovered>(_onDeviceDiscovered);
    on<PairDevice>(_onPairDevice);
    on<UnpairDevice>(_onUnpairDevice);
    on<ConnectToDevice>(_onConnectToDevice);
    on<DisconnectFromDevice>(_onDisconnectFromDevice);
    on<AutoConnectOnStart>(_onAutoConnectOnStart);
    on<DevicePairedByRemote>(_onDevicePairedByRemote);
    on<DeviceUnpairedByRemote>(_onDeviceUnpairedByRemote);

    _pairingSubscription = _httpServer.pairingUpdates.listen((event) {
      final type = event['type'] as String?;
      final deviceId = event['deviceId'] as String?;
      final deviceName = event['deviceName'] as String? ?? 'Unknown';

      if (deviceId == null) return;

      if (type == 'pair') {
        add(DevicePairedByRemote(deviceId: deviceId, deviceName: deviceName));
      } else if (type == 'unpair') {
        add(DeviceUnpairedByRemote(deviceId: deviceId, deviceName: deviceName));
      }
    });
  }

  Future<void> _onLoadDevices(
    LoadDevices event,
    Emitter<DeviceState> emit,
  ) async {
    final paired = await _deviceRepository.getPairedDevices();
    emit(state.copyWith(pairedDevices: paired));
    add(AutoConnectOnStart());
  }

  Future<void> _onStartDiscovery(
    StartDiscovery event,
    Emitter<DeviceState> emit,
  ) async {
    emit(state.copyWith(discoveryStatus: 'discovering'));

    await _discoveryService.startDiscovery();

    _discoverySubscription?.cancel();
    _discoverySubscription = _discoveryService.discoveredDevices.listen((data) {
      add(DeviceDiscovered(data));
    });
  }

  Future<void> _onStopDiscovery(
    StopDiscovery event,
    Emitter<DeviceState> emit,
  ) async {
    await _discoveryService.stopDiscovery();
    _discoverySubscription?.cancel();
    emit(state.copyWith(discoveryStatus: 'idle'));
  }

  void _onDeviceDiscovered(DeviceDiscovered event, Emitter<DeviceState> emit) {
    final device = SyncDevice.fromJson(event.device);
    final existing = state.discoveredDevices.indexWhere(
      (d) => d.id == device.id,
    );
    if (existing >= 0) {
      final updated = List<SyncDevice>.from(state.discoveredDevices);
      updated[existing] = device;
      emit(state.copyWith(discoveredDevices: updated));
    } else {
      emit(
        state.copyWith(discoveredDevices: [...state.discoveredDevices, device]),
      );
    }
  }

  Future<void> _onPairDevice(
    PairDevice event,
    Emitter<DeviceState> emit,
  ) async {
    final device = state.discoveredDevices.firstWhere(
      (d) => d.id == event.deviceId,
    );
    await _deviceRepository.pairDevice(device);
    final paired = await _deviceRepository.getPairedDevices();
    emit(state.copyWith(pairedDevices: paired));

    _sendPairNotification(device);
  }

  Future<void> _onUnpairDevice(
    UnpairDevice event,
    Emitter<DeviceState> emit,
  ) async {
    final device = state.pairedDevices.firstWhere(
      (d) => d.id == event.deviceId,
    );
    await _deviceRepository.unpairDevice(event.deviceId);
    final paired = await _deviceRepository.getPairedDevices();
    emit(state.copyWith(pairedDevices: paired));

    _sendUnpairNotification(device);
  }

  Future<void> _sendUnpairNotification(SyncDevice device) async {
    try {
      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 3);

      final uri = Uri.parse(
        'http://${device.ipAddress}:${device.port ?? 8766}/api/unpair',
      );
      final request = await client.postUrl(uri);
      request.headers.contentType = ContentType.json;
      request.write(
        jsonEncode({
          'deviceId': _httpServer.deviceId,
          'deviceName': _httpServer.deviceName,
        }),
      );

      await request.close();
      client.close();
    } catch (e) {
      // Remote device unreachable - that's OK
    }
  }

  Future<void> _sendPairNotification(SyncDevice device) async {
    try {
      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 3);

      final uri = Uri.parse(
        'http://${device.ipAddress}:${device.port ?? 8766}/api/pair',
      );
      final request = await client.postUrl(uri);
      request.headers.contentType = ContentType.json;
      request.write(
        jsonEncode({
          'deviceId': _httpServer.deviceId,
          'deviceName': _httpServer.deviceName,
        }),
      );

      await request.close();
      client.close();
    } catch (e) {
      // Remote device unreachable - that's OK
    }
  }

  Future<void> _onConnectToDevice(
    ConnectToDevice event,
    Emitter<DeviceState> emit,
  ) async {
    emit(state.copyWith(connectingDeviceId: event.deviceId));
    await Future.delayed(const Duration(seconds: 1));
    emit(state.copyWith(connectingDeviceId: null));
  }

  Future<void> _onDisconnectFromDevice(
    DisconnectFromDevice event,
    Emitter<DeviceState> emit,
  ) async {}

  Future<void> _onAutoConnectOnStart(
    AutoConnectOnStart event,
    Emitter<DeviceState> emit,
  ) async {
    final paired = await _deviceRepository.getPairedDevices();
    if (paired.isNotEmpty) {
      add(StartDiscovery());
    }
  }

  void _onDevicePairedByRemote(
    DevicePairedByRemote event,
    Emitter<DeviceState> emit,
  ) {
    emit(
      state.copyWith(
        lastNotification: '${event.deviceName} paired with this device',
      ),
    );
  }

  void _onDeviceUnpairedByRemote(
    DeviceUnpairedByRemote event,
    Emitter<DeviceState> emit,
  ) {
    emit(
      state.copyWith(
        lastNotification: '${event.deviceName} unpaired from this device',
      ),
    );
  }

  @override
  Future<void> close() {
    _discoverySubscription?.cancel();
    _pairingSubscription?.cancel();
    return super.close();
  }
}
