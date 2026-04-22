# SyncStuff Tech Stack Documentation

This document provides a comprehensive overview of the SyncStuff project's technology stack, including key technologies, frameworks, libraries, and their purposes across the monorepo.

## Project Overview

SyncStuff is a cross-platform application for synchronizing files and data across devices. The project is structured as a monorepo using pnpm workspaces, containing multiple applications and shared packages.

## Overall Architecture

### Monorepo Management
- **pnpm**: Package manager for workspace management and dependency resolution
- **Turbo**: Build system for orchestrating tasks across the monorepo (build, dev, lint, etc.)
- **TypeScript**: Primary programming language with strict type checking (for web/CLI packages)
- **Dart/Flutter**: Primary mobile development stack
- **Biome**: Code formatting and linting tool for TypeScript/JS code
- **ESLint**: Additional linting with React-specific rules
- **Prettier**: Code formatting with plugins for imports and Tailwind CSS

### Runtime Environment
- **Node.js**: Minimum version 20.0.0 required
- **Bun**: Alternative runtime with version 1.0.0+ support, used for faster builds and development
- **Dart 3.x**: Flutter programming language

### UI Framework
- **Flutter**: Cross-platform UI toolkit for mobile (Android/iOS) and desktop (Windows)
- **React**: Version 18.2.0 (for web application)
- **Remix**: Full-stack React framework (web app)
- **Tamagui**: Universal UI component library (legacy, migrated to Flutter)

## Application Breakdown

### Mobile Application (`apps/mobile`) - FLUTTER

A Flutter-based cross-platform mobile app for iOS and Android with Windows desktop support. Replaced Ionic/React due to persistent routing and connectivity issues.

**Key Technologies:**
- **Flutter 3.x**: Cross-platform UI framework
- **Dart 3.x**: Programming language
- **flutter_bloc**: State management using BLoC pattern
- **get_it**: Dependency injection
- **equatable**: Value equality for BLoC states
- **flutter_webrtc**: WebRTC for peer-to-peer connections
- **qr_flutter**: QR code generation
- **mobile_scanner**: QR code scanning
- **file_picker**: File selection
- **permission_handler**: Runtime permissions
- **path_provider**: Local storage paths
- **shared_preferences**: Key-value storage
- **google_fonts**: Custom typography (Inter font)

**Core Services:**
- **DiscoveryService**: Local network device discovery via UDP broadcast and mDNS
- **P2PService**: WebRTC peer-to-peer connections with signaling
- **FileTransferService**: Chunked file transfer protocol (16KB chunks)
- **ClipboardSyncService**: Real-time clipboard synchronization
- **QRCodeService**: QR code generation and parsing for device pairing

**Architecture:**
- Clean Architecture (Presentation → Domain → Data layers)
- BLoC pattern for state management
- Repository pattern for data access

**Purpose:** P2P file synchronization, device pairing, clipboard sharing across all platforms.

### CLI Application (`apps/cli`)

A command-line interface tool for managing SyncStuff operations.

**Key Technologies:**
- **Bun**: Runtime and build tool for the CLI
- **TypeScript**: Type-safe development
- **Inquirer**: Interactive command-line prompts
- **Chalk**: Terminal string styling
- **Ora**: Elegant terminal spinners

**Purpose:** Provides a CLI interface for users to interact with SyncStuff services, manage devices, and perform administrative tasks.

### Web Application (`apps/web`)

A web-based interface deployed on Cloudflare Workers/Pages.

**Key Technologies:**
- **Remix**: Full-stack React framework optimized for web standards
- **Cloudflare Workers**: Serverless runtime for global deployment
- **Tailwind CSS**: Utility-first CSS framework

**Purpose:** Web interface for SyncStuff, providing browser-based access to synchronization features and user management.

### Shared UI Package (`packages/ui`)

A reusable component library shared across React-based applications.

**Key Technologies:**
- **TypeScript**: Type definitions for components
- **clsx**: Conditional CSS class utility
- **Tailwind Merge**: Intelligent Tailwind CSS class merging
- **Lucide React**: Icon library

**Purpose:** Centralized UI components for web application consistency.

## Development Workflow

### Build and Development
- **Turbo**: Parallel task execution across workspaces
- **Flutter**: Cross-platform builds for mobile and desktop
- **Bun**: Accelerated builds and package management for Node.js packages

### Quality Assurance
- **Biome**: Fast linting and formatting for TypeScript/JS
- **ESLint**: Advanced linting with React and TypeScript rules
- **flutter analyze**: Dart/Flutter code analysis with strict rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Compile-time type checking
- **flutter test**: Unit and widget tests

### Deployment
- **Cloudflare Pages/Workers**: Web application hosting
- **Flutter Build**: Mobile (APK/AAB/iOS) and desktop (Windows) builds
- **Bun**: CLI tool distribution

## Network Architecture

### P2P Discovery Protocol
- **Port 8765**: Device discovery service
- **Port 8766**: UDP broadcast for device announcements
- **Port 8767**: WebSocket signaling server

### QR Code Pairing
- **URI Scheme**: `syncstuff://connect`
- **Parameters**: id, name, ip, port, platform, version

### File Transfer
- **Protocol**: Chunked transfer over WebRTC data channels
- **Chunk Size**: 16KB per chunk

## Cross-Platform Compatibility

The tech stack is designed for maximum cross-platform compatibility:
- **Mobile (Android/iOS)**: Flutter app with native performance
- **Desktop (Windows)**: Flutter desktop build
- **Web**: Browser-based access via Remix and Cloudflare
- **CLI**: Terminal-based access via Bun

This architecture enables SyncStuff to provide a seamless synchronization experience across all user devices and platforms.

## Testing

### Flutter Mobile Tests
- Unit tests for domain entities (Device, Transfer, Clipboard)
- Widget tests for UI components
- Integration tests for P2P services
- Run with `flutter test`

### Legacy Tests (for React apps)
- **Vitest**: Unit testing framework
- **Cypress**: End-to-end testing
- **Testing Library**: React component testing utilities