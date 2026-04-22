# SyncStuff CLI

A Dart-based command-line interface with interactive Nocterm TUI for SyncStuff - P2P file synchronization and clipboard sharing.

## Features

- **Interactive TUI**: Beautiful Nocterm-based terminal interface with navigation
- **Keyboard Navigation**: Arrow keys, number keys 1-6 for quick view switching
- **Device Management**: List, connect, and manage connected devices
- **File Transfer**: Send and receive files between devices
- **Clipboard Sync**: Share clipboard content across devices
- **Network Scanning**: Discover devices on local network
- **Local Server**: Run a local API server for the mobile app to connect
- **Native Executable**: Compiles to standalone .exe without Dart runtime

## Installation

### From Source

```bash
cd apps/cli_dart
dart pub get
dart compile exe bin/main.dart -o syncstuff.exe
```

### Run with Hot Reload (Development)

```bash
dart run bin/main.dart
```

## Usage

### Interactive TUI (Default)
```bash
syncstuff
```

**Keyboard Controls:**
- `↑↓` or `1-6` - Navigate between views
- `Enter` - Execute typed command
- `Esc` - Quit application
- `s` - Scan network
- `t` - Toggle server

**Views:**
1. 📊 Status - System overview
2. 📱 Devices - Connected devices
3. 📁 Transfer - File transfers
4. 📋 Clipboard - Clipboard content
5. 🖥️ Server - Server control & logs
6. ❓ Help - Keyboard shortcuts

### Command Mode
```bash
syncstuff status
syncstuff help
syncstuff scan
```

## Commands

| Command | Description |
|---------|-------------|
| `status` | Show system status |
| `scan` | Discover local network devices |
| `serve` | Start local API server |
| `help` | Show help message |

## Options

| Flag | Description |
|------|-------------|
| `-h, --help` | Show help message |
| `-v, --version` | Show version |

## Building Native Executables

```bash
# Windows
dart compile exe bin/main.dart -o syncstuff.exe

# macOS/Linux  
dart compile exe bin/main.dart -o syncstuff
```

## Troubleshooting

**TUI not responding:**
- Run in a real terminal (PowerShell, CMD, Terminal.app)
- Not supported in some IDE terminals
- Try command mode: `syncstuff status`

**Hotkeys not working:**
- Make sure terminal supports arrow keys
- Try number keys 1-6 for navigation

## Connecting to Mobile App

1. Start the server in TUI: navigate to Server view, press `t`
2. Or use command: `syncstuff serve`
3. In the mobile app, connect to `http://<your-ip>:8765/api`

## License

MIT