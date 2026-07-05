import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:uuid/uuid.dart';

import '../../domain/entities/device.dart';

/// Service for QR code generation and parsing
class QRCodeService {
  static const String _scheme = 'syncstuff';
  static const String _host = 'connect';

  /// Generate a QR code data string for device pairing
  String generatePairingQR({
    required String deviceId,
    required String deviceName,
    required String ipAddress,
    required int port,
  }) {
    final uri = Uri(
      scheme: _scheme,
      host: _host,
      queryParameters: {
        'id': deviceId,
        'name': deviceName,
        'ip': ipAddress,
        'port': port.toString(),
        'platform': 'android',
        'version': '1.0.0',
      },
    );

    return uri.toString();
  }

  /// Parse a QR code data string to get device info
  Map<String, dynamic>? parsePairingQR(String data) {
    try {
      final uri = Uri.parse(data);

      if (uri.scheme != _scheme || uri.host != _host) {
        return null;
      }

      final params = uri.queryParameters;
      return {
        'id': params['id'] ?? const Uuid().v4(),
        'name': params['name'] ?? 'Unknown Device',
        'ipAddress': params['ip'],
        'port': int.tryParse(params['port'] ?? '8765') ?? 8765,
        'platform': _parsePlatform(params['platform']),
      };
    } catch (e) {
      return null;
    }
  }

  /// Check if a string is a valid SyncStuff QR code
  bool isValidPairingQR(String data) {
    try {
      final uri = Uri.parse(data);
      return uri.scheme == _scheme && uri.host == _host;
    } catch (e) {
      return false;
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
}

/// Widget for displaying a pairing QR code
class PairingQRDisplay extends StatelessWidget {
  final String deviceId;
  final String deviceName;
  final String ipAddress;
  final int port;
  final double size;

  const PairingQRDisplay({
    super.key,
    required this.deviceId,
    required this.deviceName,
    required this.ipAddress,
    this.port = 8765,
    this.size = 200,
  });

  @override
  Widget build(BuildContext context) {
    final qrService = QRCodeService();
    final qrData = qrService.generatePairingQR(
      deviceId: deviceId,
      deviceName: deviceName,
      ipAddress: ipAddress,
      port: port,
    );

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        QrImageView(
          data: qrData,
          version: QrVersions.auto,
          size: size,
          backgroundColor: Colors.white,
          errorCorrectionLevel: QrErrorCorrectLevel.M,
        ),
        const SizedBox(height: 16),
        Text(
          deviceName,
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Text(
          '$ipAddress:$port',
          style: Theme.of(
            context,
          ).textTheme.bodySmall?.copyWith(color: Colors.grey),
        ),
      ],
    );
  }
}
