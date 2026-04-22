import 'package:equatable/equatable.dart';

enum DevicePlatform { android, ios, windows, mac, linux, web, cli, unknown }

enum DeviceStatus { online, offline, connecting }

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
