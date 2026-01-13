# SyncStuff Tech Stack Documentation

This document provides a comprehensive overview of the SyncStuff project's technology stack, including key technologies, frameworks, libraries, and their purposes across the monorepo.

## Project Overview

SyncStuff is a cross-platform application for synchronizing files and data across devices. The project is structured as a monorepo using pnpm workspaces, containing multiple applications and shared packages.

## Overall Architecture

### Monorepo Management
- **pnpm**: Package manager for workspace management and dependency resolution
- **Turbo**: Build system for orchestrating tasks across the monorepo (build, dev, lint, etc.)
- **TypeScript**: Primary programming language with strict type checking
- **Biome**: Code formatting and linting tool for consistent code style
- **ESLint**: Additional linting with React-specific rules
- **Prettier**: Code formatting with plugins for imports and Tailwind CSS

### Runtime Environment
- **Node.js**: Minimum version 20.0.0 required
- **Bun**: Alternative runtime with version 1.0.0+ support, used for faster builds and development

### UI Framework
- **Tamagui**: Universal UI component library for React and React Native
- **React**: Version 18.2.0 (locked across all packages)
- **React DOM**: Version 18.2.0

## Application Breakdown

### Desktop CLI Application (`apps/desktop`)

A command-line interface tool for managing SyncStuff operations.

**Key Technologies:**
- **Bun**: Runtime and build tool for the CLI
- **TypeScript**: Type-safe development
- **Inquirer**: Interactive command-line prompts
- **Chalk**: Terminal string styling
- **Ora**: Elegant terminal spinners
- **Boxen**: Terminal boxes for output formatting
- **Table**: ASCII table generation for data display

**Purpose:** Provides a CLI interface for users to interact with SyncStuff services, manage devices, and perform administrative tasks.

### Mobile Application (`apps/mobileapp`)

A hybrid mobile app built with Ionic and Capacitor for iOS and Android.

**Key Technologies:**
- **Ionic React**: Framework for building cross-platform mobile apps
- **Capacitor**: Native runtime for web apps on mobile devices
- **React Router**: Client-side routing
- **Zustand**: Lightweight state management
- **Socket.io**: Real-time bidirectional communication
- **Simple Peer**: WebRTC peer-to-peer connections
- **MegaJS**: Integration with Mega cloud storage
- **QRCode.react**: QR code generation and display
- **CryptoJS**: Cryptographic functions
- **UUID**: Unique identifier generation

**Capacitor Plugins:**
- Clipboard, Filesystem, Network, Preferences, Push Notifications
- Device info, Haptics, Keyboard, Share, Status Bar
- Barcode scanning, File sharing, Dark mode support
- Native settings, ZeroConf networking

**Testing:**
- **Vitest**: Unit testing framework
- **Cypress**: End-to-end testing
- **Testing Library**: React component testing utilities

**Purpose:** Native mobile experience for file synchronization, device pairing, clipboard sharing, and cloud integration.

### Web Application (`apps/web`)

A web-based interface deployed on Cloudflare Workers/Pages.

**Key Technologies:**
- **Remix**: Full-stack React framework optimized for web standards
- **Cloudflare Workers**: Serverless runtime for global deployment
- **Tailwind CSS**: Utility-first CSS framework
- **EmailJS**: Client-side email sending
- **Jose**: JSON Web Token handling
- **Isbot**: Bot detection for SEO optimization

**Development Tools:**
- **Wrangler**: Cloudflare development and deployment CLI
- **Vite**: Fast build tool and development server
- **React Router**: File-system based routing

**Purpose:** Web interface for SyncStuff, providing browser-based access to synchronization features and user management.

### Shared UI Package (`packages/ui`)

A reusable component library shared across applications.

**Key Technologies:**
- **TypeScript**: Type definitions for components
- **clsx**: Conditional CSS class utility
- **Tailwind Merge**: Intelligent Tailwind CSS class merging
- **Lucide React**: Icon library with React components
- **React Native**: Support for native mobile components

**Build Configuration:**
- Dual output: ESM and CommonJS modules
- TypeScript compilation for both formats
- CSS and config file copying

**Purpose:** Centralized UI components and utilities to ensure consistency across desktop, mobile, and web applications.

## Development Workflow

### Build and Development
- **Turbo**: Parallel task execution across workspaces
- **Vite**: Fast development servers for web and mobile apps
- **Bun**: Accelerated builds and package management

### Quality Assurance
- **Biome**: Fast linting and formatting
- **ESLint**: Advanced linting with React and TypeScript rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Compile-time type checking

### Deployment
- **Cloudflare Pages/Workers**: Web application hosting
- **Capacitor**: Mobile app native builds
- **Bun**: CLI tool distribution

## Integrations and Services

- **Cloud Storage**: Mega (via MegaJS)
- **Real-time Communication**: Socket.io for signaling
- **P2P Networking**: WebRTC via Simple Peer
- **Email Services**: EmailJS for contact forms
- **Authentication**: JWT handling with Jose
- **Device Discovery**: ZeroConf networking

## Cross-Platform Compatibility

The tech stack is designed for maximum cross-platform compatibility:
- **Web**: Browser-based access via Remix and Cloudflare
- **Mobile**: Native iOS/Android apps via Ionic + Capacitor
- **Desktop**: CLI tool via Bun
- **Shared Code**: UI components work across React and React Native

This architecture enables SyncStuff to provide a seamless synchronization experience across all user devices and platforms.