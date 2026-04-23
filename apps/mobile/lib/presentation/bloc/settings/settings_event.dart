import 'package:equatable/equatable.dart';

abstract class SettingsEvent extends Equatable {
  const SettingsEvent();

  @override
  List<Object?> get props => [];
}

class LoadSettings extends SettingsEvent {}

class ToggleDarkMode extends SettingsEvent {}

class SetDeviceName extends SettingsEvent {
  final String name;

  const SetDeviceName(this.name);

  @override
  List<Object?> get props => [name];
}

class SetAutoSync extends SettingsEvent {
  final bool enabled;

  const SetAutoSync(this.enabled);

  @override
  List<Object?> get props => [enabled];
}

class SetAutoStart extends SettingsEvent {
  final bool enabled;

  const SetAutoStart(this.enabled);

  @override
  List<Object?> get props => [enabled];
}

class SetDownloadPath extends SettingsEvent {
  final String path;

  const SetDownloadPath(this.path);

  @override
  List<Object?> get props => [path];
}

class SetAutoPair extends SettingsEvent {
  final bool enabled;

  const SetAutoPair(this.enabled);

  @override
  List<Object?> get props => [enabled];
}
