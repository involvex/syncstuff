import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../domain/entities/device.dart';
import '../../../data/repositories/device_repository.dart';
import '../../../services/desktop_discovery_service.dart';
import 'device_event.dart';
import 'device_state.dart';

class DeviceBloc extends Bloc<DeviceEvent, DeviceState>
{
    final DesktopDiscoveryService _discoveryService;
    final DeviceRepository _deviceRepository;

    StreamSubscription<Map<String, dynamic>>? _discoverySubscription;

    DeviceBloc({
        required DesktopDiscoveryService discoveryService,
        required DeviceRepository deviceRepository
    }) : _discoveryService = discoveryService,
        _deviceRepository = deviceRepository,
        super(const DeviceState())
    {
        on<LoadDevices>(_onLoadDevices);
        on<StartDiscovery>(_onStartDiscovery);
        on<StopDiscovery>(_onStopDiscovery);
        on<DeviceDiscovered>(_onDeviceDiscovered);
        on<PairDevice>(_onPairDevice);
        on<ConnectToDevice>(_onConnectToDevice);
        on<DisconnectFromDevice>(_onDisconnectFromDevice);
        on<AutoConnectOnStart>(_onAutoConnectOnStart);
    }

    Future<void> _onLoadDevices(
        LoadDevices event,
        Emitter<DeviceState> emit
    ) async
    {
        final paired = await _deviceRepository.getPairedDevices();
        emit(state.copyWith(pairedDevices: paired));
        add(AutoConnectOnStart());
    }

    Future<void> _onStartDiscovery(
        StartDiscovery event,
        Emitter<DeviceState> emit
    ) async
    {
        emit(state.copyWith(discoveryStatus: 'discovering'));

        await _discoveryService.startDiscovery();

        _discoverySubscription?.cancel();
        _discoverySubscription = _discoveryService.discoveredDevices.listen((data)
        {
            add(DeviceDiscovered(data));
        }
        );
    }

    Future<void> _onStopDiscovery(
        StopDiscovery event,
        Emitter<DeviceState> emit
    ) async
    {
        await _discoveryService.stopDiscovery();
        _discoverySubscription?.cancel();
        emit(state.copyWith(discoveryStatus: 'idle'));
    }

    void _onDeviceDiscovered(DeviceDiscovered event, Emitter<DeviceState> emit) 
    {
        final device = SyncDevice.fromJson(event.device);
        final existing = state.discoveredDevices.indexWhere(
            (d) => d.id == device.id
        );
        if (existing >= 0) 
        {
            final updated = List<SyncDevice>.from(state.discoveredDevices);
            updated[existing] = device;
            emit(state.copyWith(discoveredDevices: updated));
        }
        else 
        {
            emit(
                state.copyWith(discoveredDevices: [...state.discoveredDevices, device])
            );
        }
    }

    Future<void> _onPairDevice(
        PairDevice event,
        Emitter<DeviceState> emit
    ) async
    {
        final device = state.discoveredDevices.firstWhere(
            (d) => d.id == event.deviceId
        );
        await _deviceRepository.pairDevice(device);
        final paired = await _deviceRepository.getPairedDevices();
        emit(state.copyWith(pairedDevices: paired));
    }

    Future<void> _onConnectToDevice(
        ConnectToDevice event,
        Emitter<DeviceState> emit
    ) async
    {
        emit(state.copyWith(connectingDeviceId: event.deviceId));
        await Future.delayed(const Duration(seconds: 1));
        emit(state.copyWith(connectingDeviceId: null));
    }

    Future<void> _onDisconnectFromDevice(
        DisconnectFromDevice event,
        Emitter<DeviceState> emit
    ) async
    {
    }

    Future<void> _onAutoConnectOnStart(
        AutoConnectOnStart event,
        Emitter<DeviceState> emit
    ) async
    {
        final paired = await _deviceRepository.getPairedDevices();
        if (paired.isNotEmpty) 
        {
            add(StartDiscovery());
        }
    }

    @override
    Future<void> close() 
    {
        _discoverySubscription?.cancel();
        return super.close();
    }
}
