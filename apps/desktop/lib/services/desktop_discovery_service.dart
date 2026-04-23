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

  DesktopDiscoveryService(this._httpServer);

  Stream<Map<String, dynamic>> get discoveredDevices =>
      _discoveredDevicesController.stream;
  bool get isDiscovering => _isDiscovering;

  Future<void> startDiscovery() async {
    if (_isDiscovering) return;
    _isDiscovering = true;

    await _httpServer.start();
    await _scanNetwork();
    _discoveryTimer = Timer.periodic(
      const Duration(seconds: 10),
      (_) => _scanNetwork(),
    );
  }

  Future<void> stopDiscovery() async {
    _isDiscovering = false;
    _discoveryTimer?.cancel();
    _discoveryTimer = null;
  }

  Future<void> _scanNetwork() async {
    final localIp = _httpServer.localIp;
    if (localIp == null) return;

    final parts = localIp.split('.');
    final subnet = '${parts[0]}.${parts[1]}.${parts[2]}';

    for (int i = 1; i <= 254; i++) {
      final targetIp = '$subnet.$i';
      if (targetIp == localIp) continue;
      _probeDevice(targetIp);
    }
  }

  Future<void> _probeDevice(String ip) async {
    try {
      final client = HttpClient();
      final uri = Uri.parse('http://$ip:8766/api/probe');
      final request = await client
          .getUrl(uri)
          .timeout(const Duration(seconds: 2));
      final response = await request.close().timeout(
        const Duration(seconds: 2),
      );
      if (response.statusCode == 200) {
        final body = await response.transform(utf8.decoder).join();
        final data = jsonDecode(body) as Map<String, dynamic>;
        if (data['id'] != _httpServer.deviceId) {
          _discoveredDevicesController.add(data);
        }
      }
    } catch (_) {}
  }

  Future<void> announcePresence() async {
    await _httpServer.start();
  }

  void dispose() {
    stopDiscovery();
    _discoveredDevicesController.close();
  }
}
