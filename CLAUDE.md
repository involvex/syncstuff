# Syncstuff Monorepo - Technical Reference

This document provides comprehensive technical context for AI assistants working with the Syncstuff monorepo project.

## Project Overview

**Syncstuff** is a comprehensive file synchronization ecosystem built as a monorepo with multiple interconnected packages. The project enables secure peer-to-peer file transfer, clipboard synchronization, and cloud storage integration across mobile and web platforms.

## Monorepo Structure

### Workspace Packages

The project is organized into 5 main packages under `packages/`:

#### 1. `packages/app` - Mobile Application

- **Technology**: Ionic 7 + React 18 + Capacitor 6
- **Purpose**: Cross-platform mobile app (Android/iOS) with P2P file sync capabilities
- **Key Features**:
  - WebRTC-based peer-to-peer file transfers
  - mDNS device discovery (Android only)
  - QR code pairing and manual signaling
  - Cloud provider integration (Google Drive, Mega)
  - Clipboard synchronization
- **Status**: ✅ MVP functional, needs auth integration

#### 2. `packages/web` - Web Application

- **Technology**: Remix.js + Cloudflare Workers
- **Purpose**: Web dashboard and landing page
- **Key Features**:
  - User authentication and dashboard
  - Admin interface for user management
  - Landing page with marketing content
- **Status**: ✅ Basic structure complete, auth integration in progress

#### 3. `packages/api` - Backend API

- **Technology**: Cloudflare Workers
- **Purpose**: Authentication and user management API
- **Key Features**:
  - User CRUD operations
  - OAuth2 integration (GitHub, Discord)
  - Database integration with D1
- **Status**: ⚠️ Basic structure, needs full implementation

#### 4. `packages/database` - Database Layer

- **Technology**: Cloudflare D1 (SQLite)
- **Purpose**: Database schema and migrations
- **Key Features**:
  - User management tables
  - Notifications and cache tables
  - Migration system
- **Status**: ✅ Schema defined and deployed

#### 5. `packages/shared` - Shared Utilities

- **Technology**: TypeScript
- **Purpose**: Shared types and utilities across packages
- **Status**: ⚠️ Not yet implemented

## Technology Stack

### Frontend Technologies

- **React 18**: UI framework across all packages
- **Ionic 7**: Mobile UI components and theming
- **Remix.js**: Web application framework
- **Tailwind CSS**: Styling framework
- **Zustand**: State management (mobile app)

### Backend Technologies

- **Cloudflare Workers**: Serverless runtime
- **Cloudflare D1**: SQLite database
- **Cloudflare KV**: Key-value storage (planned)
- **Socket.IO**: WebSocket signaling for P2P

### Mobile Technologies

- **Capacitor 6**: Native runtime for mobile
- **WebRTC**: Peer-to-peer connections
- **mDNS/Zeroconf**: Local network discovery
- **React Router v5**: Navigation (required by Ionic)

### Development Tools

- **Bun**: Package manager and runtime
- **Vite**: Build tool for mobile app
- **TypeScript**: Type safety across all packages
- **ESLint + Prettier**: Code quality and formatting
- **Wrangler**: Cloudflare Workers CLI

## Current Implementation Status

### ✅ Complete

- **Database Schema**: Users, notifications, cache tables defined
- **Mobile App Core**: P2P file transfer, device discovery, cloud integration
- **Web Landing Page**: Hero section, features, responsive design
- **Authentication Flow**: GitHub OAuth implemented with local dev fallbacks
- **Build System**: Monorepo structure with workspace dependencies

### 🔄 In Progress

- **API Implementation**: Auth routes structure exists, needs full CRUD
- **Web Dashboard**: Basic dashboard exists, needs full feature integration
- **Shared Types**: Package structure exists, needs implementation
- **User Management**: Database schema exists, API endpoints needed

### ⚠️ Pending

- **Admin Dashboard**: UI structure exists, needs backend integration
- **Email Workers**: Infrastructure ready, needs implementation
- **Background Services**: Clipboard monitoring needs mobile background support
- **Conflict Resolution**: Cloud sync versioning strategy needed

## Key Architectural Patterns

### 1. Service Layer Architecture (Mobile App)

```
UI Components → Custom Hooks → Zustand Stores → Service Layer → Native APIs
```

**Service Categories**:

- `network/`: mDNS discovery, WebRTC signaling
- `storage/`: File I/O, local storage
- `sync/`: File transfer protocol

### 2. Dual Signaling Architecture

- **Automated**: WebSocket server for same-network P2P connections
- **Manual**: QR codes and manual signal exchange for cross-network

### 3. Authentication Flow

- **OAuth2**: GitHub and Discord integration
- **Session Management**: Cookie-based sessions with encryption
- **Local Dev**: Mock authentication for development convenience

### 4. Database Design

- **SQLite Schema**: Matches mobile app requirements
- **Cloudflare D1**: Serverless SQLite with migrations
- **User Roles**: Support for user, admin, moderator roles

## Development Workflow

### Essential Commands

```bash
# Package Management
bun install                    # Install dependencies
bun run build                  # Build all packages
bun run build:app              # Build mobile app
bun run build:web              # Build web app
bun run build:api              # Deploy API

# Code Quality
bun run lint                   # Run ESLint across all packages
bun run lint:fix               # Auto-fix linting issues
bun run typecheck              # TypeScript type checking
bun run format                 # Format code with Prettier

# Development
bun run web                    # Start web dev server
bun run api                    # Start API dev server
bun run android                # Build and run Android app
bun run start:signaling        # Start WebSocket signaling server
```

### Testing Strategy

- **Unit Tests**: Vitest for mobile app components
- **E2E Tests**: Cypress for web application
- **P2P Testing**: Requires three processes (signaling server, web, mobile)

### Deployment Pipeline

- **Web**: Cloudflare Workers with assets
- **API**: Cloudflare Workers
- **Database**: Cloudflare D1 with migrations
- **Mobile**: Manual build and distribution

## Configuration Details

### Environment Variables

```bash
# API Configuration
GITHUB_OAUTH_CLIENT_ID=Ov23li5ZRzCQoPWMN21O
GITHUB_OAUTH_CLIENT_SECRET=your-secret-here
SESSION_SECRET=your-session-secret
API_URL=https://syncstuff-api.involvex.workers.dev

# Database
DATABASE_URL=cloudflare-d1://syncstuff-db
```

### Cloudflare Configuration

- **Workers**: API and web application deployed separately
- **D1 Database**: Single database shared across services
- **KV Storage**: Planned for caching and temporary data
- **Observability**: Full request tracing and logging enabled

### Mobile App Configuration

- **Capacitor**: Android and iOS native builds
- **Java Version**: JDK 17 required for Android builds
- **Native Plugins**: Barcode scanning, file system, network discovery

## Dependencies and Their Purposes

### Core Dependencies

- `@ionic/react`: Mobile UI framework
- `simple-peer`: WebRTC peer connections
- `socket.io`: WebSocket signaling
- `capacitor-zeroconf`: mDNS device discovery
- `@capacitor-mlkit/barcode-scanning`: QR code scanning

### Development Dependencies

- `@types/*`: TypeScript type definitions
- `eslint-*`: Code linting and quality
- `prettier-*`: Code formatting
- `wrangler`: Cloudflare Workers tooling

## Current Blockers and Challenges

### 1. Authentication Integration

- Mobile app needs to integrate with `packages/api` auth system
- Session management across mobile and web platforms
- OAuth2 flow completion for all providers

### 2. Database Access Patterns

- Mobile app currently uses local SQLite
- Need to implement API client for remote database access
- Data synchronization strategy between local and remote

### 3. Real-time Communication

- WebSocket signaling server needs production deployment
- P2P connection reliability across different network conditions
- Background service support for clipboard monitoring

### 4. Cloud Provider Integration

- OAuth2 flows for Google Drive and Mega need completion
- File conflict resolution strategies
- Background sync capabilities

## Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled across all packages
- **ESLint**: Comprehensive rules for React, TypeScript, and accessibility
- **Prettier**: Consistent formatting with Tailwind CSS plugin
- **Import Organization**: Automatic import sorting and organization

### Architecture Principles

- **Separation of Concerns**: Clear boundaries between packages
- **Service Layer**: Business logic isolated from UI components
- **Type Safety**: Comprehensive TypeScript coverage
- **Mobile-First**: Responsive design with mobile optimization

### Testing Requirements

- **Pre-commit**: Format, lint, and typecheck must pass
- **Unit Tests**: Cover core business logic and utilities
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Critical user journeys across platforms

## Next Steps for Development

### Immediate Priorities

1. Complete API authentication endpoints
2. Integrate mobile app with backend auth system
3. Implement shared types package
4. Deploy signaling server to production

### Medium-term Goals

1. Complete admin dashboard functionality
2. Implement email notification system
3. Add background service support for mobile
4. Enhance cloud provider integrations

### Long-term Vision

1. Desktop application (Electron/Tauri)
2. Advanced conflict resolution
3. Enterprise features (SSO, audit logs)
4. Performance optimization and scaling

## Troubleshooting Guide

### Common Issues

- **P2P Connection Failures**: Check signaling server is running
- **Mobile Build Errors**: Ensure JDK 17 is installed
- **Database Migrations**: Run `bun run db:migrate` for schema updates
- **TypeScript Errors**: Run `bun run typecheck` to identify issues

### Development Tips

- Always start signaling server before testing P2P features
- Use local development fallbacks for OAuth during development
- Test on actual devices for native feature validation
- Monitor Cloudflare observability for production issues

This reference provides the foundation for understanding and contributing to the Syncstuff monorepo project effectively.
