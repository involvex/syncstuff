# SyncStuff CLI

SyncStuff CLI is a command line interface for the [SyncStuff](https://syncstuff-web.involvex.workers.dev/) service.

[![npm version](https://badge.fury.io/js/@involvex%2Fsyncstuff-cli.svg)](https://badge.fury.io/js/@involvex%2Fsyncstuff-cli)

## Installation

```bash
npm install -g @involvex/syncstuff-cli
```

## Usage

```bash
syncstuff help              # Show help
syncstuff help <command>    # Show help for a specific command
syncstuff --version / -v    # Show CLI version
```

### Global Flags

All commands support the following global flags:

| Flag          | Description                           |
| ------------- | ------------------------------------- |
| `-h, --help`  | Show help for any command             |
| `-d, --debug` | Enable debug mode with verbose output |

**Examples:**

```bash
syncstuff devices -d        # List devices with debug output
syncstuff device -h         # Show help for device command
syncstuff --debug login     # Login with debug output
```

### Authentication

```bash
syncstuff login             # Login to your account
syncstuff whoami            # Display your user profile
syncstuff logout            # Logout from your account
```

### Device Management

```bash
# List all devices
syncstuff devices

# Device command with subcommands
syncstuff device --list     # List available devices (alias: -l)
syncstuff device            # Interactive device selection
syncstuff device <id>       # Connect to a specific device by ID
```

### File Transfer

```bash
syncstuff transfer <file>   # Transfer a file to a connected device
```

## Debug Mode

Enable debug mode to see detailed output including API requests, config state, and command execution details:

```bash
syncstuff -d devices        # Debug flag before command
syncstuff devices -d        # Debug flag after command
```

## Sponsor

[![Sponsor](https://img.shields.io/badge/Sponsor-involvex-ff69b4)](https://github.com/sponsors/involvex)

## Author

[![GitHub](https://img.shields.io/badge/GitHub-involvex-000000)](https://github.com/involvex)

## License

MIT

## Changelog

- 0.0.1
  - Initial release

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) for more information.

## Support

Support the development of SyncStuff CLI by sponsoring [involvex](https://github.com/sponsors/involvex).
or on PayPal: [involvex](https://paypal.me/involvex)
Buy me a coffee: [involvex](https://www.buymeacoffee.com/involvex)
