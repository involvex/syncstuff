# Syncstuff Monorepo

## Workspaces

- packages/app
- packages/api
- packages/shared
- packages/web
- packages/database

## Implementation Plan

Develop a comprehensive full-stack application ecosystem comprising a web platform and a connected mobile Android app, utilizing a monorepo structure with the following workspaces: packages/web (frontend web app), packages/api (backend API), packages/app (mobile app), packages/shared (shared utilities and types), and packages/database (database schemas and migrations). Implement robust user authentication across all platforms, including secure login, registration, password reset, and multi-factor authentication (MFA). Set up a Cloudflare-based database solution (e.g., Cloudflare D1 for relational data or Workers KV for key-value storage) to securely manage user accounts, storing encrypted credentials, detailed profiles (e.g., name, email, avatar, preferences), roles (e.g., user, admin, moderator), and account statuses (e.g., active, suspended). Build a scalable backend API using Cloudflare Workers (or an equivalent serverless framework like Vercel Edge Functions), integrating with the database for full CRUD operations on user data, authentication endpoints (e.g., JWT-based sessions), admin functionalities (e.g., user role management, bulk actions, audit logs), and additional features like email notifications via Cloudflare Email Workers. Develop a responsive web frontend using a modern framework like React or Vue.js, featuring signup and login forms with validation, user profile management (e.g., editing details, changing passwords, uploading avatars), and an admin dashboard with advanced controls (e.g., paginated user lists, role assignments, status toggles, analytics). Ensure seamless integration with the mobile Android app, built using React Native or Flutter, which mirrors web functionalities for authentication, profile management, and admin access where applicable, with offline capabilities and push notifications. Incorporate shared packages for common logic, such as authentication helpers, API clients, and data models, to maintain consistency. Prioritize security through measures like HTTPS, input sanitization, rate limiting, encryption (e.g., bcrypt for passwords), and compliance with standards like GDPR and OWASP. Design for scalability with caching (e.g., Cloudflare Cache), load balancing, and efficient database queries. Follow best practices for user experience, modern, responsive UI designs.

## Commands

- bun run build:app
- bun run build:web
- bun run build:api
- bun run lint
- bun run typecheck
- bun run format

## Needs to be fixed

- Entry points for wrangler setup for packages/api packages/web

## Needs to be done

packages/database:

- packages/database sql schema (schema.sql) needs to be changed for this setup

packages/web:

- Build the full webpage Dashboard/Auth/Admin/Frontpage

packages/app

- App works, just needs integration into the Monorepo setup(Auth)

## Instructions

- Keep Code clean, typesafe

- Always format, lint, typecheck before commiting

- Write a Implementation.md to keep current implementationstatus uptodate

## Tech

- using Bun for packagemanagement

## Futureplan

- Implement tests for each workspace

- add connecting with qr / auth codes to seemlessly connect

- add local network devices connecting / syncing

- file sharing with bluetooth

- fix stop discovery button not working in the app

- improve device sync between @package.json @packages/app/electron @packages/cli

- improve file transfer between @packages/app @packages/app/electron @packages/cli

- improve qr code / auth code / pairing

- fix app version bumping

- fix app build process

- update dependencies for @packages/app

- update dependencies for @packages/app/electron

- update dependencies for @packages/cli

file:///D:/repos/ionic/syncstuff/node_modules/.bun/@capacitor+filesystem@8.0.0+15e98482558ccfe6/node_modules/@capacitor/filesystem/android/src/main/kotlin/com/capacitorjs/plugins/filesystem/LegacyFilesystemImplementation.kt:66:29 Java type mismatch: inferred type is 'String?', but 'String' was expected.
Using flatDir should be avoided because it doesn't support any meta-data formats.

- fix deprecated @capacitor/filesystem

  file:///D:/repos/ionic/syncstuff/node_modules/.bun/@capacitor+filesystem@8.0.0+15e98482558ccfe6/node_modules/@capacitor/filesystem/android/src/main/kotlin/com/capacitorjs/plugins/filesystem/FilesystemPlugin.kt:335:31 'fun downloadFile(call: PluginCall): Unit' is deprecated. Use @capacitor/file-transfer plugin instead.

- app permissions configuration

- app permissions request

- add notification permission request
- notification sync between @packages/app @packages/app/electron @packages/cli

- add push notification support

- password reset

- improve user experience (dark mode, better layout, better ui) for @packages/web @packages/app

- implement contact formular @packages/web (email, name, message, discord, recaptcha)

- implement user profile @packages/web (edit profile, change password, delete account)

- implement About @packages/web (About, Premium, Campaigns, Blog, Affiliate Program, FAQ)

- implement Premium @packages/web (Premium, Campaigns, Blog, Affiliate Program, FAQ)

- implement Campaigns @packages/web (Campaigns, Blog, Affiliate Program, FAQ)

- implement Blog @packages/web (Blog, Affiliate Program, FAQ)

- implement Affiliate Program @packages/web (Affiliate Program, FAQ)

- implement FAQ @packages/web (FAQ)

- Implement Cloudstorage service (offer for premium users), using cloudflare storage (free tier to start with(no implementation cost))
