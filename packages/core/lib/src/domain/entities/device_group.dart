import 'package:equatable/equatable.dart';

class DeviceGroup extends Equatable {
  final String id;
  final String name;
  final String? description;
  final List<String> deviceIds;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const DeviceGroup({
    required this.id,
    required this.name,
    this.description,
    this.deviceIds = const [],
    required this.createdAt,
    this.updatedAt,
  });

  DeviceGroup copyWith({
    String? name,
    String? description,
    List<String>? deviceIds,
    DateTime? updatedAt,
  }) {
    return DeviceGroup(
      id: id,
      name: name ?? this.name,
      description: description ?? this.description,
      deviceIds: deviceIds ?? this.deviceIds,
      createdAt: createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'description': description,
    'deviceIds': deviceIds,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt?.toIso8601String(),
  };

  factory DeviceGroup.fromJson(Map<String, dynamic> json) {
    return DeviceGroup(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      deviceIds: List<String>.from(json['deviceIds'] ?? []),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
    );
  }

  @override
  List<Object?> get props => [
    id,
    name,
    description,
    deviceIds,
    createdAt,
    updatedAt,
  ];
}
