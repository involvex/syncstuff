import 'dart:async';
import 'dart:convert';
import 'dart:developer' as developer;
import 'dart:io';

import 'package:network_info_plus/network_info_plus.dart';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

import '../../domain/entities/device.dart';

/// Service for discovering devices on the local network
class DiscoveryService {
  static const int _discoveryPort = 8765;
  static const int _httpDiscoveryPort = 8766; // HTTP port for probe fallback
  static const int _broadcastPort = 8767;

  final NetworkInfo _networkInfo = NetworkInfo();
  final _uuid = const Uuid();

  bool _isScanning = false;
  String? _localIp;
  String? _deviceId;
  String? _deviceName;
  final _discoveryController = StreamController<SyncDevice>.broadcast();
  final _fileUploadController =
      StreamController<Map<String, dynamic>>.broadcast();
  final List<RawDatagramSocket> _sockets = [];
  HttpServer? _httpServer;
  String _downloadPath = 'downloads';

  /// Stream of discovered devices
  Stream<SyncDevice> get discoveredDevices => _discoveryController.stream;

  /// Whether currently scanning
  bool get isScanning => _isScanning;

  /// Stream of file uploads received via HTTP
  Stream<Map<String, dynamic>> get fileUploads => _fileUploadController.stream;

  /// Set the download directory for received files
  Future<void> setDownloadPath(String path) async {
    _downloadPath = path;
    final dir = Directory(_downloadPath);
    if (!await dir.exists()) {
      await dir.create(recursive: true);
    }
  }

  /// Start discovering devices on the network
  Future<void> startDiscovery() async {
    if (_isScanning) {
      developer.log('Already scanning, skipping', name: 'DiscoveryService');
      return;
    }
    _isScanning = true;
    developer.log('=== Starting discovery ===', name: 'DiscoveryService');

    try {
      // Get local IP address with timeout
      developer.log('Getting WiFi IP...', name: 'DiscoveryService');
      final ip = await _getWifiIPWithTimeout();
      developer.log('Got WiFi IP: $ip', name: 'DiscoveryService');

      // Ensure we got an IP
      if (ip == null) {
        developer.log(
          'ERROR: No WiFi IP - cannot scan',
          name: 'DiscoveryService',
        );
        _isScanning = false;
        return;
      }

      // Load or generate stable device ID with timeout
      _deviceId = await _getSharedPreferencesWithTimeout();
      if (_deviceId == null || _deviceId!.isEmpty) {
        _deviceId = _uuid.v4();
      }
      // Get device name separately with timeout
      try {
        final prefs = await SharedPreferences.getInstance().timeout(
          const Duration(seconds: 3),
          onTimeout: () => throw TimeoutException('prefs'),
        );
        _deviceName = prefs.getString('device_name') ?? 'Mobile Device';
        if (_deviceId != null) {
          await prefs.setString('device_id', _deviceId!);
        }
      } catch (e) {
        developer.log(
          'Failed to load device name: $e',
          name: 'DiscoveryService',
        );
        _deviceName = 'Mobile Device';
      }

      _localIp = ip; // Store for filtering
      final subnet = ip.substring(0, ip.lastIndexOf('.'));
      developer.log('Phone IP=$ip, subnet=$subnet.*', name: 'DiscoveryService');

      // Start HTTP server on port 8766 so desktop can discover us
      await _startHttpServer(ip);

      // Initialize download path
      final documentsDir = await getApplicationDocumentsDirectory();
      await setDownloadPath('${documentsDir.path}/downloads');

      // Start UDP broadcast listener (won't receive our own broadcasts)
      await _startBroadcastListener();

      // Broadcast presence
      await _broadcastPresence(ip);

      // Scan local subnet for SyncStuff devices (excluding our own IP)
      developer.log('Scanning subnet: $subnet.*', name: 'DiscoveryService');
      await _scanSubnet(subnet);
      developer.log('Discovery scan complete', name: 'DiscoveryService');
    } catch (e) {
      developer.log('Discovery error: $e', name: 'DiscoveryService');
    } finally {
      _isScanning = false;
      _localIp = null;
    }
  }

  /// Stop discovery
  Future<void> stopDiscovery() async {
    _isScanning = false;
    for (final socket in _sockets) {
      socket.close();
    }
    _sockets.clear();
    await _httpServer?.close();
    _httpServer = null;
  }

  /// Get device's own info for sharing
  Future<Map<String, dynamic>> getDeviceInfo() async {
    final ip = await _networkInfo.getWifiIP();
    return {
      'id': _uuid.v4(),
      'name': 'Flutter Device', // TODO: Get from settings
      'platform': 'android',
      'ip': ip,
      'port': _discoveryPort,
      'version': '1.0.0',
    };
  }

  Future<void> _startBroadcastListener() async {
    try {
      final socket = await RawDatagramSocket.bind(
        InternetAddress.anyIPv4,
        _broadcastPort,
      );

      socket.broadcastEnabled = true;
      _sockets.add(socket);

      socket.listen((event) {
        if (event == RawSocketEvent.read) {
          final datagram = socket.receive();
          if (datagram != null) {
            _handleDiscoveryMessage(datagram.data, datagram.address);
          }
        }
      });
    } catch (e) {
      developer.log(
        'Failed to start broadcast listener: $e',
        name: 'DiscoveryService',
      );
    }
  }

  Future<void> _startHttpServer(String localIp) async {
    try {
      _httpServer = await HttpServer.bind(
        InternetAddress.anyIPv4,
        _httpDiscoveryPort,
      );
      developer.log(
        'HTTP server started on port $_httpDiscoveryPort',
        name: 'DiscoveryService',
      );

      _httpServer!.listen((request) async {
        try {
          final path = request.uri.path;
          developer.log(
            'HTTP request: ${request.method} $path',
            name: 'DiscoveryService',
          );
          if (request.method == 'GET' && path == '/api/probe') {
            request.response.statusCode = 200;
            request.response.headers.contentType = ContentType.json;
            request.response.write(
              jsonEncode({
                'id': _deviceId,
                'name': _deviceName,
                'platform': 'android',
                'ip': localIp,
                'port': _httpDiscoveryPort,
                'version': '1.0.0',
              }),
            );
            await request.response.close();
          } else if (request.method == 'POST' && path == '/api/upload') {
            await _handleUpload(request);
          } else {
            request.response.statusCode = 404;
            await request.response.close();
          }
        } catch (e, stack) {
          developer.log(
            'HTTP request handler error: $e\n$stack',
            name: 'DiscoveryService',
          );
          try {
            request.response.statusCode = 500;
            request.response.write('Internal error');
            await request.response.close();
          } catch (_) {}
        }
      });
    } catch (e) {
      developer.log(
        'Failed to start HTTP server: $e',
        name: 'DiscoveryService',
      );
    }
  }

  Future<void> _handleUpload(HttpRequest request) async {
    developer.log(
      'Received upload request: ${request.method} ${request.uri}',
      name: 'DiscoveryService',
    );
    try {
      final fileName = request.uri.queryParameters['name'] ?? 'unknown';
      final downloadsDir = Directory(_downloadPath);
      if (!await downloadsDir.exists()) {
        await downloadsDir.create(recursive: true);
      }
      final file = File('${downloadsDir.path}/$fileName');
      final sink = file.openWrite();
      await for (final chunk in request) {
        sink.add(chunk);
      }
      await sink.close();

      _fileUploadController.add({
        'name': fileName,
        'path': file.path,
        'size': await file.length(),
      });

      request.response.statusCode = 200;
      request.response.headers.contentType = ContentType.json;
      request.response.write(jsonEncode({'success': true, 'path': file.path}));
    } catch (e) {
      developer.log('Upload failed: $e', name: 'DiscoveryService');
      request.response.statusCode = 500;
      request.response.headers.contentType = ContentType.json;
      request.response.write(jsonEncode({'error': e.toString()}));
    }
    try {
      await request.response.close();
    } catch (e) {
      developer.log('Response close failed: $e', name: 'DiscoveryService');
    }
  }

  Future<void> _broadcastPresence(String localIp) async {
    try {
      final socket = await RawDatagramSocket.bind(InternetAddress.anyIPv4, 0);
      socket.broadcastEnabled = true;
      _sockets.add(socket);

      final message = jsonEncode({
        'type': 'announce',
        'id': _deviceId,
        'name': _deviceName,
        'platform': 'android',
        'ip': localIp,
        'port': _discoveryPort,
      });

      // Broadcast to all devices on local network
      final broadcastAddress = InternetAddress('255.255.255.255');
      socket.send(utf8.encode(message), broadcastAddress, _broadcastPort);

      // Also send to the specific subnet broadcast
      final subnetParts = localIp.split('.');
      final subnetBroadcast =
          '${subnetParts[0]}.${subnetParts[1]}.${subnetParts[2]}.255';
      socket.send(
        utf8.encode(message),
        InternetAddress(subnetBroadcast),
        _broadcastPort,
      );
    } catch (e) {
      developer.log(
        'Failed to broadcast presence: $e',
        name: 'DiscoveryService',
      );
    }
  }

  Future<void> _scanSubnet(String subnet) async {
    // Scan common IP ranges in parallel - only common ones
    final futures = <Future<void>>[];

    // Scan only 10 IPs for testing quickly
    final scanIps = [1, 10, 20, 30, 40, 50, 60, 69, 70, 80];

    for (final i in scanIps) {
      futures.add(_checkDeviceHttp('$subnet.$i'));
    }

    await Future.wait(futures);
  }

  /// Check device via HTTP (more reliable than raw TCP)
  Future<void> _checkDeviceHttp(String ip) async {
    // Skip our own IP
    if (ip == _localIp) return;

    try {
      developer.log(
        'Probing http://$ip:$_httpDiscoveryPort/api/probe',
        name: 'DiscoveryService',
      );

      final client = HttpClient();
      client.connectionTimeout = const Duration(milliseconds: 150);

      final request = await client.getUrl(
        Uri.parse('http://$ip:$_httpDiscoveryPort/api/probe'),
      );

      final response = await request.close();

      developer.log(
        'Response from $ip: ${response.statusCode}',
        name: 'DiscoveryService',
      );

      if (response.statusCode == 200) {
        final data = await response.transform(utf8.decoder).join();
        developer.log('Response body: $data', name: 'DiscoveryService');

        final deviceInfo = jsonDecode(data) as Map<String, dynamic>;
        developer.log('Parsed JSON: $deviceInfo', name: 'DiscoveryService');

        if (deviceInfo['id'] != null) {
          developer.log(
            'Found device via HTTP: $ip - ${deviceInfo['name']}',
            name: 'DiscoveryService',
          );
          final device = _parseDevice(deviceInfo, ip);
          developer.log(
            'Created device: ${device.id} ${device.name}',
            name: 'DiscoveryService',
          );
          _discoveryController.add(device);
        }
      }
      client.close();
    } catch (e) {
      developer.log('Error probing $ip: $e', name: 'DiscoveryService');
    }
  }

  void _handleDiscoveryMessage(List<int> data, InternetAddress address) {
    // Ignore messages from our own IP
    if (address.address == _localIp) return;

    try {
      final message = utf8.decode(data);
      final info = jsonDecode(message) as Map<String, dynamic>;

      if (info['type'] == 'announce') {
        final device = _parseDevice(info, address.address);
        _discoveryController.add(device);
      }
    } catch (e) {
      // Invalid message
    }
  }

  SyncDevice _parseDevice(Map<String, dynamic> info, String ip) {
    return SyncDevice(
      id: info['id'] as String? ?? _uuid.v4(),
      name: info['name'] as String? ?? 'Unknown Device',
      platform: _parsePlatform(info['platform'] as String?),
      status: DeviceStatus.online,
      ipAddress: info['ip'] as String? ?? ip,
      port: info['port'] as int? ?? _discoveryPort,
      lastSeen: DateTime.now(),
    );
  }

  Future<String?> _getWifiIPWithTimeout() async {
    try {
      return await _networkInfo.getWifiIP().timeout(
        const Duration(seconds: 5),
        onTimeout: () {
          developer.log(
            'getWifiIP timed out after 5 seconds',
            name: 'DiscoveryService',
          );
          return null;
        },
      );
    } catch (e) {
      developer.log(
        'getWifiIP failed: $e',
        name: 'DiscoveryService',
      );
      return null;
    }
  }

  Future<String?> _getSharedPreferencesWithTimeout() async {
    try {
      final prefs = await SharedPreferences.getInstance().timeout(
        const Duration(seconds: 5),
        onTimeout: () {
          developer.log(
            'SharedPreferences timed out after 5 seconds',
            name: 'DiscoveryService',
          );
          throw TimeoutException('SharedPreferences init');
        },
      );
      return prefs.getString('device_id');
    } catch (e) {
      developer.log(
        'SharedPreferences failed: $e',
        name: 'DiscoveryService',
      );
      return null;
    }
  }

  DevicePlatform _parsePlatform(String? platform) {
    switch (platform?.toLowerCase()) {
      case 'android':
        return DevicePlatform.android;
      case 'ios':
        return DevicePlatform.ios;
      case 'windows':
        return DevicePlatform.windows;
      case 'mac':
      case 'macos':
        return DevicePlatform.mac;
      case 'linux':
        return DevicePlatform.linux;
      case 'web':
        return DevicePlatform.web;
      case 'cli':
        return DevicePlatform.cli;
      default:
        return DevicePlatform.unknown;
    }
  }

  void dispose() {
    unawaited(stopDiscovery());
    unawaited(_discoveryController.close());
    unawaited(_fileUploadController.close());
  }
}
