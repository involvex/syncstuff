import 'dart:async';
import 'dart:io';
import 'dart:convert';

import 'desktop_http_server.dart';

class DesktopDiscoveryService {
  final DesktopHttpServer _httpServer;
  final _discoveredDevicesController =
      StreamController<Map<String, dynamic>>.broadcast();

  bool _isDiscovering = false;
  Timer? _discoveryTimer;
  Timer? _broadcastTimer;
  RawDatagramSocket? _udpSocket;
  String? _localIp;

  static const int _broadcastPort = 8767;

  DesktopDiscoveryService(this._httpServer);

  Stream<Map<String, dynamic>> get discoveredDevices =>
      _discoveredDevicesController.stream;
  bool get isDiscovering => _isDiscovering;

  Future<void> startDiscovery() async {
    if (_isDiscovering) return;
    _isDiscovering = true;

    await _httpServer.start();
    _localIp = _httpServer.localIp;

    // Start UDP broadcast listener
    await _startBroadcastListener();

    // Broadcast presence
    await _broadcastPresence();

    // Scan network
    await _scanNetwork();

    // Periodic scan and broadcast
    _discoveryTimer = Timer.periodic(
      const Duration(seconds: 10),
      (_) => _scanNetwork(),
    );
    _broadcastTimer = Timer.periodic(
      const Duration(seconds: 3),
      (_) => _broadcastPresence(),
    );
  }

  Future<void> stopDiscovery() async {
    _isDiscovering = false;
    _discoveryTimer?.cancel();
    _discoveryTimer = null;
    _broadcastTimer?.cancel();
    _broadcastTimer = null;
    _udpSocket?.close();
    _udpSocket = null;
  }

  Future<void> _startBroadcastListener() async {
    try {
      _udpSocket = await RawDatagramSocket.bind(
        InternetAddress.anyIPv4,
        _broadcastPort,
        reuseAddress: true,
      );
      _udpSocket!.broadcastEnabled = true;

      _udpSocket!.listen((event) {
        if (event == RawSocketEvent.read) {
          final datagram = _udpSocket!.receive();
          if (datagram != null) {
            _handleBroadcastMessage(datagram.data, datagram.address);
          }
        }
      });
    } catch (e) {
      print('Failed to start broadcast listener: $e');
    }
  }

  void _handleBroadcastMessage(List<int> data, InternetAddress address) {
    // Ignore messages from our own IP
    if (address.address == _localIp) return;

    try {
      final message = utf8.decode(data);
      final info = jsonDecode(message) as Map<String, dynamic>;

      if (info['type'] == 'announce') {
        final deviceInfo = {
          'id': info['id'],
          'name': info['name'],
          'platform': info['platform'],
          'ip': address.address,
          'port': info['port'],
          'version': info['version'],
        };
        _discoveredDevicesController.add(deviceInfo);
      }
    } catch (_) {}
  }

  Future<void> _broadcastPresence() async {
    try {
      final socket = await RawDatagramSocket.bind(
        InternetAddress.anyIPv4,
        0,
        reuseAddress: true,
      );
      socket.broadcastEnabled = true;

      final message = jsonEncode({
        'type': 'announce',
        'id': _httpServer.deviceId,
        'name': _httpServer.deviceName,
        'platform': 'windows',
        'ip': _localIp,
        'port': 8766,
        'version': '1.0.0',
      });

      // Broadcast to all devices on local network
      final broadcastAddress = InternetAddress('255.255.255.255');
      socket.send(utf8.encode(message), broadcastAddress, _broadcastPort);

      // Also send to subnet broadcast
      if (_localIp != null) {
        final subnetParts = _localIp!.split('.');
        final subnetBroadcast =
            '${subnetParts[0]}.${subnetParts[1]}.${subnetParts[2]}.255';
        socket.send(
          utf8.encode(message),
          InternetAddress(subnetBroadcast),
          _broadcastPort,
        );
      }

      socket.close();
    } catch (e) {
      print('Failed to broadcast presence: $e');
    }
  }

  Future<void> _scanNetwork() async {
    if (_localIp == null) return;

    final parts = _localIp!.split('.');
    final subnet = '${parts[0]}.${parts[1]}.${parts[2]}';

    // Scan in parallel batches of 10
    final futures = <Future<void>>[];
    for (int i = 1; i <= 254; i += 10) {
      final batch = <String>[];
      for (int j = 0; j < 10 && i + j <= 254; j++) {
        batch.add('$subnet.${i + j}');
      }
      futures.add(_scanBatch(batch));
    }

    await Future.wait(futures);
  }

  Future<void> _scanBatch(List<String> ips) async {
    final futures = ips.map((ip) => _probeDevice(ip));
    await Future.wait(futures);
  }

  Future<void> _probeDevice(String ip) async {
    if (ip == _localIp) return;

    try {
      final client = HttpClient();
      final uri = Uri.parse('http://$ip:8766/api/probe');
      final request = await client
          .getUrl(uri)
          .timeout(const Duration(milliseconds: 200));
      final response = await request.close().timeout(
        const Duration(milliseconds: 200),
      );
      if (response.statusCode == 200) {
        final body = await response.transform(utf8.decoder).join();
        final data = jsonDecode(body) as Map<String, dynamic>;
        if (data['id'] != _httpServer.deviceId) {
          _discoveredDevicesController.add(data);
        }
      }
      client.close();
    } catch (_) {}
  }

  Future<void> announcePresence() async {
    await _httpServer.start();
    _localIp = _httpServer.localIp;
    await _broadcastPresence();
  }

  void dispose() {
    stopDiscovery();
    _discoveredDevicesController.close();
  }
}
