## 📖 Documentation

Detailed implementation plans and status reports are now organized in the [docs/](file:///d:/repos/ionic/syncstuff/docs) directory:

- **[Overall Plan](file:///d:/repos/ionic/syncstuff/docs/overall_plan.md)**: Project vision and roadmap.
- **[Implementation Status](file:///d:/repos/ionic/syncstuff/docs/implementation.md)**: Current focus and progress.
- **[App Guide](file:///d:/repos/ionic/syncstuff/docs/app)**: Mobile application details.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-1.0+-green)](https://bun.sh)
[![npm version](https://badge.fury.io/js/@involvex%2Fsyncstuff-cli.svg)](https://badge.fury.io/js/@involvex%2Fsyncstuff-cli)

Syncstuff is a comprehensive file synchronization ecosystem that enables secure peer-to-peer file transfer, clipboard synchronization, and cloud storage integration across mobile and web platforms.

[Syncstuff-Web](https://syncstuff-web.involvex.workers.dev/)

## 🚀 Features

### Core Capabilities

- **Peer-to-Peer File Transfer**: Direct file sharing between devices using WebRTC
- **Universal Clipboard**: Copy on one device, paste on another seamlessly
- **Cloud Integration**: Support for Google Drive, Mega, and custom cloud providers
- **Cross-Platform**: Works on Android, iOS, and web browsers
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
├── packages/
│   ├── app/          # Mobile application (Ionic + React)
│   ├── app/electron/ # Electron application (Bun)
│   ├── web/          # Web dashboard (Remix.js)
│   ├── ui/           # Shared UI component library (Tamagui)
│   ├── api/          # Backend API (Cloudflare Workers)
│   ├── database/     # Database schema and migrations
│   └── shared/       # Shared types and utilities
│   └── cli/          # Command line interface (Bun)
└── docs/
    ├── CLAUDE.md     # Technical reference for AI assistants
    └── README.md     # This file
```

### Technology Stack

- **Frontend**: React 18, Ionic 8, Tailwind CSS, Tamagui
- **Mobile**: Capacitor 8, WebRTC, mDNS
- **Backend**: Cloudflare Workers, D1 (SQLite), R2 (Storage)
- **Database**: Cloudflare D1 with migrations
- **Build Tools**: Bun, Vite, Wrangler
- **Type Safety**: TypeScript with strict mode

## 📦 Installation

### Prerequisites

- **Node.js**: Version 20 or higher
- **Bun**: Latest version (package manager)
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

   # Build and run mobile app
   bun run android
   ```

## 🛠️ Development

### Package Management

```bash
# Install dependencies
bun install

# Build specific packages
bun run build:app    # Mobile app
bun run build:web    # Web application
bun run build:api    # Backend API
bun run build:ui     # UI Library

# Development commands
bun run web          # Web dev server
bun run api          # API dev server
bun run android      # Mobile app with live reload
```

### Code Quality

```bash
# Lint and format code
bun run lint         # Run ESLint for all packages
bun run lint:fix     # Auto-fix linting issues
bun run format       # Format with Prettier
bun run typecheck    # TypeScript type checking

# Pre-commit checks
bun run check        # Format + lint + typecheck
```

### Testing

```bash
# Unit tests
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
# Build production APK
bun run build
ionic cap run android --prod --release
```

## 📱 Mobile App Features

### Device Discovery

- **Local Network**: Automatic mDNS discovery on Android
- **QR Code Pairing**: Cross-network device pairing
- **Manual Connection**: Direct IP-based connections

### File Transfer

- **Chunked Transfer**: Efficient large file handling
- **Progress Tracking**: Real-time transfer progress
- **Resume Support**: Continue interrupted transfers

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
4. Run tests and linting (`bun run check`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Follow TypeScript strict mode
- Use ESLint and Prettier for code formatting
- Write comprehensive tests for new features
- Update documentation for API changes

## 📋 Current Status

### ✅ Complete

- [x] Mobile app P2P file transfer
- [x] Device discovery and pairing
- [x] Cloud provider integration framework
- [x] Web landing page and dashboard
- [x] Database schema and migrations
- [x] Authentication flow with OAuth2
- [x] Shared UI Library (@syncstuff/ui)
- [x] Admin dashboard completion
- [x] R2 Storage integration

### 🔄 In Progress

- [ ] Background service support
- [ ] Email notification system
- [ ] Desktop application (Electron/Tauri)
- [ ] Integration Tests for P2P

### ⚠️ Planned

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

**Mobile Build Errors**

- Ensure JDK 17 is installed and configured
- Run `bun run gradle:clean` to clean build cache
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

- **Ionic Team** for the excellent mobile framework
- **Cloudflare** for Workers and D1 database
- **Simple Peer** for WebRTC implementation
- **Tamagui** for the shared UI components
- **All contributors** who have helped shape this project

---

**Syncstuff** - Making file synchronization seamless across all your devices.

- [npm](https://www.npmjs.com/package/@involvex/syncstuff-cli)
- [GitHub](https://github.com/involvex/syncstuff)
