## 📖 Documentation

Detailed implementation plans and status reports are now organized in the [docs/](file:///d:/repos/ionic/syncstuff/docs) directory:

- **[Overall Plan](file:///d:/repos/ionic/syncstuff/docs/overall_plan.md)**: Project vision and roadmap.
- **[Implementation Status](file:///d:/repos/ionic/syncstuff/docs/implementation.md)**: Current focus and progress.
- **[App Guide](file:///d:/repos/ionic/syncstuff/docs/app)**: Mobile application details.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-1.0+-green)](https://bun.sh)
[![Flutter](https://img.shields.io/badge/Flutter-3.x-blue)](https://flutter.dev)

Syncstuff is a comprehensive file synchronization ecosystem that enables secure peer-to-peer file transfer, clipboard synchronization, and cloud storage integration across mobile and web platforms.

[Syncstuff-Web](https://syncstuff-web.involvex.workers.dev/)

## 🚀 Features

### Core Capabilities

- **Peer-to-Peer File Transfer**: Direct file sharing between devices using WebRTC
- **Universal Clipboard**: Copy on one device, paste on another seamlessly
- **Cloud Integration**: Support for Google Drive, Mega, and custom cloud providers
- **Cross-Platform**: Works on Android, iOS, Windows, and web browsers
- **No Cloud Required**: P2P transfers work without internet connectivity

### Advanced Features

- **mDNS Device Discovery**: Automatic local network device detection
- **QR Code Pairing**: Easy device pairing across different networks
- **Real-time Notifications**: Instant sync status updates
- **Multi-Provider Support**: Flexible cloud storage integration
- **Background Sync**: Continuous clipboard and file synchronization

## 🏗️ Architecture

### Monorepo Structure

```
syncstuff-monorepo/
├── apps/
│   ├── mobile/       # Flutter mobile application
│   ├── cli/          # TypeScript CLI (Bun)
│   ├── cli_dart/     # Dart CLI (native exe)
│   └── web/          # Web dashboard (Remix.js)
├── packages/
│   ├── ui/           # Shared UI component library
│   ├── api/          # Backend API (Cloudflare Workers)
│   ├── database/     # Database schema and migrations
│   └── shared/       # Shared types and utilities
└── docs/
    ├── CLAUDE.md     # Technical reference for AI assistants
    └── README.md     # This file
```

### Technology Stack

- **Mobile**: Flutter 3.x, Dart 3.x, flutter_bloc, WebRTC
- **CLI (Dart)**: Native executable, no runtime needed
- **CLI (Bun)**: TypeScript CLI for web/API integration
- **Frontend**: React 18, Remix, Tailwind CSS
- **Backend**: Cloudflare Workers, D1 (SQLite), R2 (Storage)
- **Database**: Cloudflare D1 with migrations
- **Build Tools**: Bun, Flutter, Wrangler
- **Type Safety**: TypeScript with strict mode, Dart with strict linting

## 📦 Installation

### Prerequisites

- **Node.js**: Version 20 or higher (for web/CLI packages)
- **Bun**: Latest version (package manager)
- **Flutter**: 3.x with Dart 3.x
- **Java**: JDK 17 (for Android builds)

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/involvex/syncstuff.git
   cd syncstuff
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Build all packages**

   ```bash
   bun run build
   ```

4. **Start development servers**

   ```bash
   # Start WebSocket signaling server (required for P2P)
   bun run start:signaling

   # Start web development server
   bun run web

   # Run mobile app (Flutter)
   cd apps/mobile
   flutter run
   ```

## 🛠️ Development

### Mobile App (Flutter)

```bash
cd apps/mobile

# Run on connected device/emulator
flutter run

# Build APK
flutter build apk

# Build Windows desktop
flutter build windows

# Run analyzer
flutter analyze

# Run tests
flutter test
```

### Package Management

```bash
# Install dependencies
bun install

# Build specific packages
bun run build:web    # Web application
bun run build:api    # Backend API
bun run build:ui     # UI Library

# Development commands
bun run web          # Web dev server
bun run api          # API dev server
```

### Code Quality

```bash
# Lint and format code (TypeScript/JS)
bun run lint         # Run ESLint for all packages
bun run lint:fix     # Auto-fix linting issues
bun run format       # Format with Prettier
bun run typecheck    # TypeScript type checking

# Flutter analysis
cd apps/mobile
flutter analyze     # Run Flutter analyzer with strict rules

# Pre-commit checks
bun run check        # Format + lint + typecheck
```

### Testing

```bash
# Flutter tests
cd apps/mobile
flutter test

# Unit tests (legacy)
bun run test.unit

# E2E tests
bun run test.e2e

# P2P testing (requires multiple devices)
bun run start:signaling  # Start signaling server
bun run dev              # Start web app
# Open mobile app on device
```

## 🚀 Deployment

### Web Application

```bash
# Deploy to Cloudflare Workers
bun run deploy:web
```

### API

```bash
# Deploy API to Cloudflare Workers
bun run deploy:api
```

### Database

```bash
# Deploy database schema
bun run deploy:db
```

### Mobile App

```bash
cd apps/mobile

# Build production APK
flutter build apk --release

# Build iOS (requires macOS)
flutter build ios --release

# Build Windows desktop
flutter build windows --release
```

## 📱 Mobile App Features

### Device Discovery

- **Local Network**: Automatic mDNS discovery on Android
- **UDP Broadcast**: Device announcements on local network
- **QR Code Pairing**: Cross-network device pairing
- **Manual Connection**: Direct IP-based connections

### File Transfer

- **WebRTC P2P**: Direct peer-to-peer file transfer
- **Chunked Transfer**: Efficient large file handling (16KB chunks)
- **Progress Tracking**: Real-time transfer progress
- **Resume Support**: Continue interrupted transfers

### Clipboard Sync

- **Real-time Sync**: Instant clipboard content sharing
- **Automatic Detection**: Monitor clipboard changes
- **Cross-device Paste**: Copy on one device, paste on another

### Cloud Integration

- **Google Drive**: OAuth2 integration with file management
- **Mega**: Encrypted cloud storage support
- **Custom Providers**: Extensible cloud provider architecture

## 🌐 Web Dashboard

### User Management

- **Authentication**: GitHub and Discord OAuth2
- **Profile Management**: User settings and preferences
- **Admin Interface**: User role management and monitoring

### Monitoring

- **Activity Logs**: Real-time sync activity tracking
- **Device Status**: Connected devices and connection health
- **Transfer History**: Complete file transfer logs

## 🔧 Configuration

### Environment Variables

Create `.env` files for each package:

**API Configuration** (`packages/api/.env`):

```bash
GITHUB_OAUTH_CLIENT_ID=your-client-id
GITHUB_OAUTH_CLIENT_SECRET=your-client-secret
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret
```

**Web Configuration** (`packages/web/.env`):

```bash
API_URL=https://syncstuff-api.involvex.workers.dev
GITHUB_OAUTH_CALLBACK=https://syncstuff-web.involvex.workers.dev/auth/callback?provider=github
```

### Database Setup

```bash
# Create database
bun run db:create

# Apply migrations
bun run db:migrate

# View database schema
bun run db:studio
```

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`bun run check` or `flutter analyze`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Follow TypeScript strict mode for web/CLI packages
- Use Flutter strict linting with comprehensive rules
- Write comprehensive tests for new features
- Update documentation for API changes

## 📋 Current Status

### ✅ Complete

- [x] Flutter mobile app with P2P file transfer
- [x] Device discovery (UDP broadcast, mDNS)
- [x] QR code device pairing
- [x] WebRTC peer-to-peer connections
- [x] Clipboard synchronization service
- [x] Chunked file transfer protocol
- [x] BLoC state management architecture
- [x] Clean Architecture implementation
- [x] Web landing page and dashboard
- [x] Database schema and migrations
- [x] Authentication flow with OAuth2
- [x] Shared UI Library (@syncstuff/ui)
- [x] Admin dashboard completion

### 🔄 In Progress

- [ ] Fix Flutter analyzer strict lint errors
- [ ] Add unit tests for services and BLoCs
- [ ] Add widget tests for UI components
- [ ] Add app icons and splash screen
- [ ] Build Windows desktop client
- [ ] Update dependencies to latest versions

### ⚠️ Planned

- [ ] Background service support
- [ ] Email notification system
- [ ] Conflict resolution strategies
- [ ] Enterprise features (SSO, audit logs)
- [ ] Performance optimization
- [ ] Additional cloud providers

## 🐛 Troubleshooting

### Common Issues

**P2P Connection Failures**

- Ensure signaling server is running: `bun run start:signaling`
- Check devices are on same network or use QR code pairing
- Verify firewall settings allow WebSocket connections

**Flutter Build Errors**

- Ensure Flutter 3.x and Dart 3.x are installed
- Run `flutter clean` to clean build cache
- Check Android SDK and build tools versions

**Mobile Build Errors**

- Ensure JDK 17 is installed and configured
- Run `flutter clean` to clean build cache
- Check Android SDK and build tools versions

**Database Issues**

- Run migrations: `bun run db:migrate`
- Check D1 database binding in Cloudflare Workers
- Verify schema compatibility with mobile app

### Getting Help

- Check the [Technical Reference](CLAUDE.md) for detailed implementation details
- Review existing [Issues](https://github.com/involvex/syncstuff/issues) for similar problems

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Flutter Team** for the excellent cross-platform framework
- **Ionic Team** for the previous mobile framework
- **Cloudflare** for Workers and D1 database
- **Simple Peer** for WebRTC implementation
- **Tamagui** for the shared UI components
- **All contributors** who have helped shape this project

---

**Syncstuff** - Making file synchronization seamless across all your devices.

- [npm](https://www.npmjs.com/package/@involvex/syncstuff-cli)
- [GitHub](https://github.com/involvex/syncstuff)