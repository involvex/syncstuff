import 'dart:async';
import 'dart:developer' as developer;

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:uuid/uuid.dart';

import '../../../domain/entities/device.dart';
import '../../../data/services/discovery_service.dart';
import '../../../data/services/p2p_service.dart';
import 'device_event.dart';
import 'device_state.dart';

class DeviceBloc extends Bloc<DeviceEvent, DeviceState> {
  final DiscoveryService _discoveryService;
  final P2PService _p2pService;
  final _uuid = const Uuid();

  StreamSubscription<SyncDevice>? _discoverySubscription;

  DeviceBloc({DiscoveryService? discoveryService, P2PService? p2pService})
    : _discoveryService = discoveryService ?? DiscoveryService(),
      _p2pService = p2pService ?? P2PService(),
      super(const DeviceState()) {
    on<LoadDevices>(_onLoadDevices);
    on<StartDiscovery>(_onStartDiscovery);
    on<StopDiscovery>(_onStopDiscovery);
    on<PairDevice>(_onPairDevice);
    on<UnpairDevice>(_onUnpairDevice);
    on<ConnectToDevice>(_onConnectToDevice);
    on<DisconnectFromDevice>(_onDisconnectFromDevice);
    on<DeviceDiscovered>(_onDeviceDiscovered);
    on<DeviceStatusChanged>(_onDeviceStatusChanged);
    on<ConnectViaQR>(_onConnectViaQR);

    // Listen to discovery events
    _discoverySubscription = _discoveryService.discoveredDevices.listen((
      device,
    ) {
      add(DeviceDiscovered(device));
    });

    // Listen to P2P connection events
    _p2pService.connectionState.listen((connected) {
      if (!connected && state.connectingDeviceId != null) {
        add(
          DeviceStatusChanged(state.connectingDeviceId!, DeviceStatus.offline),
        );
      }
    });
  }

  Future<void> _onLoadDevices(
    LoadDevices event,
    Emitter<DeviceState> emit,
  ) async {
    // TODO: Load paired devices from local storage
    emit(state.copyWith(discoveredDevices: [], pairedDevices: []));
  }

  Future<void> _onStartDiscovery(
    StartDiscovery event,
    Emitter<DeviceState> emit,
  ) async {
    // Clear previous discoveries before starting new scan
    emit(
      state.copyWith(
        discoveryStatus: DiscoveryStatus.discovering,
        discoveredDevices: [],
      ),
    );

    await _discoveryService.startDiscovery();

    emit(state.copyWith(discoveryStatus: DiscoveryStatus.idle));
  }

  Future<void> _onStopDiscovery(
    StopDiscovery event,
    Emitter<DeviceState> emit,
  ) async {
    await _discoveryService.stopDiscovery();
    emit(state.copyWith(discoveryStatus: DiscoveryStatus.idle));
  }

  Future<void> _onPairDevice(
    PairDevice event,
    Emitter<DeviceState> emit,
  ) async {
    final pairedDevice = event.device.copyWith(isPaired: true);
    final updatedPaired = [...state.pairedDevices, pairedDevice];
    final updatedDiscovered = state.discoveredDevices
        .where((d) => d.id != event.device.id)
        .toList();

    // TODO: Save to local storage

    emit(
      state.copyWith(
        pairedDevices: updatedPaired,
        discoveredDevices: updatedDiscovered,
      ),
    );
  }

  Future<void> _onUnpairDevice(
    UnpairDevice event,
    Emitter<DeviceState> emit,
  ) async {
    // Disconnect if connected
    final device = state.pairedDevices.firstWhere(
      (d) => d.id == event.deviceId,
      orElse: () => const SyncDevice(
        id: '',
        name: '',
        platform: DevicePlatform.unknown,
        status: DeviceStatus.offline,
      ),
    );

    if (device.status == DeviceStatus.online) {
      await _p2pService.disconnect();
    }

    final updatedPaired = state.pairedDevices
        .where((d) => d.id != event.deviceId)
        .toList();

    // TODO: Remove from local storage

    emit(state.copyWith(pairedDevices: updatedPaired));
  }

  Future<void> _onConnectToDevice(
    ConnectToDevice event,
    Emitter<DeviceState> emit,
  ) async {
    emit(state.copyWith(connectingDeviceId: event.device.id));

    try {
      // Initialize P2P service
      await _p2pService.initialize();

      // Connect to peer
      final connected = await _p2pService.connectToPeer(event.device);

      if (connected) {
        final updatedPaired = state.pairedDevices.map((d) {
          if (d.id == event.device.id) {
            return d.copyWith(status: DeviceStatus.online);
          }
          return d;
        }).toList();

        emit(
          state.copyWith(
            pairedDevices: updatedPaired,
            connectingDeviceId: null,
          ),
        );
      } else {
        emit(
          state.copyWith(
            connectingDeviceId: null,
            error: 'Failed to connect to device',
          ),
        );
      }
    } catch (e) {
      emit(
        state.copyWith(connectingDeviceId: null, error: 'Connection error: $e'),
      );
    }
  }

  Future<void> _onDisconnectFromDevice(
    DisconnectFromDevice event,
    Emitter<DeviceState> emit,
  ) async {
    await _p2pService.disconnect();

    final updatedPaired = state.pairedDevices.map((d) {
      if (d.id == event.deviceId) {
        return d.copyWith(status: DeviceStatus.offline);
      }
      return d;
    }).toList();

    emit(state.copyWith(pairedDevices: updatedPaired));
  }

  void _onDeviceDiscovered(DeviceDiscovered event, Emitter<DeviceState> emit) {
    // Debug: log what we received
    developer.log(
      'DeviceDiscovered: ${event.device.name} (${event.device.id}) at ${event.device.ipAddress}',
      name: 'DeviceBloc',
    );

    // Don't add if already paired
    if (state.pairedDevices.any((d) => d.id == event.device.id)) {
      developer.log('Already paired: ${event.device.id}', name: 'DeviceBloc');
      return;
    }

    final exists = state.discoveredDevices.any((d) => d.id == event.device.id);
    if (!exists) {
      developer.log(
        'Adding to discovered: ${event.device.id}',
        name: 'DeviceBloc',
      );
      emit(
        state.copyWith(
          discoveredDevices: [...state.discoveredDevices, event.device],
        ),
      );
    } else {
      developer.log(
        'Already in discovered: ${event.device.id}',
        name: 'DeviceBloc',
      );
    }
  }

  void _onDeviceStatusChanged(
    DeviceStatusChanged event,
    Emitter<DeviceState> emit,
  ) {
    final updatedDiscovered = state.discoveredDevices.map((d) {
      if (d.id == event.deviceId) {
        return d.copyWith(status: event.status);
      }
      return d;
    }).toList();

    final updatedPaired = state.pairedDevices.map((d) {
      if (d.id == event.deviceId) {
        return d.copyWith(status: event.status);
      }
      return d;
    }).toList();

    emit(
      state.copyWith(
        discoveredDevices: updatedDiscovered,
        pairedDevices: updatedPaired,
      ),
    );
  }

  Future<void> _onConnectViaQR(
    ConnectViaQR event,
    Emitter<DeviceState> emit,
  ) async {
    // Parse QR code data to get device info
    // Format: syncstuff://connect?id={id}&ip={ip}&port={port}&name={name}
    try {
      final uri = Uri.parse(event.qrData);
      if (uri.scheme != 'syncstuff' || uri.host != 'connect') {
        emit(state.copyWith(error: 'Invalid QR code'));
        return;
      }

      final params = uri.queryParameters;
      final device = SyncDevice(
        id: params['id'] ?? _uuid.v4(),
        name: params['name'] ?? 'Unknown',
        platform: DevicePlatform.unknown,
        status: DeviceStatus.offline,
        ipAddress: params['ip'],
        port: int.tryParse(params['port'] ?? '8765') ?? 8765,
        lastSeen: DateTime.now(),
      );

      // Try to connect
      add(ConnectToDevice(device));
    } catch (e) {
      emit(state.copyWith(error: 'Failed to parse QR code: $e'));
    }
  }

  @override
  Future<void> close() {
    _discoverySubscription?.cancel();
    _discoveryService.dispose();
    _p2pService.dispose();
    return super.close();
  }
}
