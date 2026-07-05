import 'package:equatable/equatable.dart';

enum DevicePlatform {
  android,
  ios,
  windows,
  mac,
  linux,
  web,
  cli,
  unknown;

  String get displayName {
    switch (this) {
      case DevicePlatform.android:
        return 'Android';
      case DevicePlatform.ios:
        return 'iOS';
      case DevicePlatform.windows:
        return 'Windows';
      case DevicePlatform.mac:
        return 'macOS';
      case DevicePlatform.linux:
        return 'Linux';
      case DevicePlatform.web:
        return 'Web';
      case DevicePlatform.cli:
        return 'CLI';
      case DevicePlatform.unknown:
        return 'Unknown';
    }
  }

  String get icon {
    switch (this) {
      case DevicePlatform.android:
        return '📱';
      case DevicePlatform.ios:
        return '📱';
      case DevicePlatform.windows:
        return '🖥️';
      case DevicePlatform.mac:
        return '🍎';
      case DevicePlatform.linux:
        return '🐧';
      case DevicePlatform.web:
        return '🌐';
      case DevicePlatform.cli:
        return '💻';
      case DevicePlatform.unknown:
        return '❓';
    }
  }
}

enum DeviceStatus {
  online,
  offline,
  connecting;

  String get displayName {
    switch (this) {
      case DeviceStatus.online:
        return 'Online';
      case DeviceStatus.offline:
        return 'Offline';
      case DeviceStatus.connecting:
        return 'Connecting...';
    }
  }
}

class SyncDevice extends Equatable {
  final String id;
  final String name;
  final DevicePlatform platform;
  final DeviceStatus status;
  final String? ipAddress;
  final int? port;
  final DateTime? lastSeen;
  final bool isPaired;

  const SyncDevice({
    required this.id,
    required this.name,
    required this.platform,
    required this.status,
    this.ipAddress,
    this.port,
    this.lastSeen,
    this.isPaired = false,
  });

  SyncDevice copyWith({
    String? id,
    String? name,
    DevicePlatform? platform,
    DeviceStatus? status,
    String? ipAddress,
    int? port,
    DateTime? lastSeen,
    bool? isPaired,
  }) {
    return SyncDevice(
      id: id ?? this.id,
      name: name ?? this.name,
      platform: platform ?? this.platform,
      status: status ?? this.status,
      ipAddress: ipAddress ?? this.ipAddress,
      port: port ?? this.port,
      lastSeen: lastSeen ?? this.lastSeen,
      isPaired: isPaired ?? this.isPaired,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'platform': platform.name,
      'status': status.name,
      'ipAddress': ipAddress,
      'port': port,
      'lastSeen': lastSeen?.toIso8601String(),
      'isPaired': isPaired,
    };
  }

  factory SyncDevice.fromJson(Map<String, dynamic> json) {
    return SyncDevice(
      id: json['id'] as String,
      name: json['name'] as String,
      platform: DevicePlatform.values.firstWhere(
        (e) => e.name == json['platform'],
        orElse: () => DevicePlatform.unknown,
      ),
      status: DeviceStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => DeviceStatus.offline,
      ),
      ipAddress: json['ipAddress'] as String?,
      port: json['port'] as int?,
      lastSeen: json['lastSeen'] != null
          ? DateTime.parse(json['lastSeen'] as String)
          : null,
      isPaired: json['isPaired'] as bool? ?? false,
    );
  }

  @override
  List<Object?> get props => [
    id,
    name,
    platform,
    status,
    ipAddress,
    port,
    lastSeen,
    isPaired,
  ];
}
