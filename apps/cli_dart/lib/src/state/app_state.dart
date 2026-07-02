
enum AppView { status, devices, transfer, clipboard, server, help }

class Device {
  final String name;
  final String platform;
  final String ip;
  final bool connected;

  Device(this.name, this.platform, this.ip, this.connected);

  Device copyWith({
    String? name,
    String? platform,
    String? ip,
    bool? connected,
  }) {
    return Device(
      name ?? this.name,
      platform ?? this.platform,
      ip ?? this.ip,
      connected ?? this.connected,
    );
  }
}

class TransferEntry {
  final String fileName;
  final int sizeBytes;
  final String direction; // 'sending' | 'receiving'
  final String status; // 'pending' | 'in_progress' | 'complete' | 'failed'
  final String? peer;

  TransferEntry({
    required this.fileName,
    required this.sizeBytes,
    required this.direction,
    required this.status,
    this.peer,
  });
}

class LogEntry {
  final DateTime timestamp;
  final String message;
  final String level; // 'info' | 'warn' | 'error' | 'debug'

  LogEntry(this.timestamp, this.message, this.level);

  String get timeStr {
    final h = timestamp.hour.toString().padLeft(2, '0');
    final m = timestamp.minute.toString().padLeft(2, '0');
    final s = timestamp.second.toString().padLeft(2, '0');
    return '$h:$m:$s';
  }
}

class AppState {
  final AppView currentView;
  final List<Device> devices;
  final bool serverRunning;
  final int? serverPort;
  final String localIp;
  final bool scanning;
  final String clipboardContent;
  final List<TransferEntry> transfers;
  final List<LogEntry> serverLogs;
  final bool commandPaletteVisible;
  final String deviceId;

  const AppState({
    this.currentView = AppView.status,
    this.devices = const [],
    this.serverRunning = false,
    this.serverPort,
    this.localIp = 'unknown',
    this.scanning = false,
    this.clipboardContent = '',
    this.transfers = const [],
    this.serverLogs = const [],
    this.commandPaletteVisible = false,
    this.deviceId = '',
  });

  AppState copyWith({
    AppView? currentView,
    List<Device>? devices,
    bool? serverRunning,
    int? serverPort,
    bool clearServerPort = false,
    String? localIp,
    bool? scanning,
    String? clipboardContent,
    List<TransferEntry>? transfers,
    List<LogEntry>? serverLogs,
    bool? commandPaletteVisible,
    String? deviceId,
  }) {
    return AppState(
      currentView: currentView ?? this.currentView,
      devices: devices ?? this.devices,
      serverRunning: serverRunning ?? this.serverRunning,
      serverPort: clearServerPort ? null : (serverPort ?? this.serverPort),
      localIp: localIp ?? this.localIp,
      scanning: scanning ?? this.scanning,
      clipboardContent: clipboardContent ?? this.clipboardContent,
      transfers: transfers ?? this.transfers,
      serverLogs: serverLogs ?? this.serverLogs,
      commandPaletteVisible:
          commandPaletteVisible ?? this.commandPaletteVisible,
      deviceId: deviceId ?? this.deviceId,
    );
  }
}
