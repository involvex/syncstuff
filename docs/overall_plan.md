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

- [x] improve device sync between @package.json @packages/app/electron @packages/cli
- [x] improve file transfer between @packages/app @packages/app/electron @packages/cli (WebRTC stability)
- [x] improve qr code / auth code / pairing (metadata & queue)
- [x] fix stop discovery button not working in the app
- [ ] add local network devices connecting / syncing (UDP Broadcast)
- [ ] file sharing with bluetooth

- fix app version bumping

- update dependencies for @packages/app

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

- implement into @packages/app: (No Paid)

@capacitor/preferences (store settings)
@capacitor/push-notifications (push notifications)
@capacitor/share (share files)

@aparajita/capacitor-dark-mode (dark mode)

@byteowls/capacitor-filesharer (file sharing)

Update dependencies for @packages/app
────────────────────────────────┬─────────┬────────┬────────┐
│ Package │ Current │ Update │ Latest │
├─────────────────────────────────┼─────────┼────────┼────────┤
│ react │ 18.2.0 │ 18.2.0 │ 19.2.3 │  
├─────────────────────────────────┼─────────┼────────┼────────┤
│ react-dom │ 18.2.0 │ 18.2.0 │ 19.2.3 │
├─────────────────────────────────┼─────────┼────────┼────────┤
│ react-router │ 5.3.4 │ 5.3.4 │ 7.12.0 │
├─────────────────────────────────┼─────────┼────────┼────────┤
│ react-router-dom │ 5.3.4 │ 5.3.4 │ 7.12.0 │
├─────────────────────────────────┼─────────┼────────┼────────┤
│ @types/react (dev) │ 18.2.0 │ 18.2.0 │ 19.2.7 │
├─────────────────────────────────┼─────────┼────────┼────────┤
│ @types/react-dom (dev) │ 18.2.0 │ 18.2.0 │ 19.2.3 │
├─────────────────────────────────┼─────────┼────────┼────────┤
│ eslint-plugin-react-hooks (dev) │ 5.2.0 │ 5.2.0 │ 7.0.1 │
└─────────────────────────────────┴─────────┴────────┴────────┘

Update dependencies for @packages/web

┌─────────────────────────────┬─────────┬─────────┬────────┐
│ Package │ Current │ Update │ Latest │
├─────────────────────────────┼─────────┼─────────┼────────┤
│ @remix-run/cloudflare │ 2.17.2 │ 2.17.2 │ 2.17.3 │
├─────────────────────────────┼─────────┼─────────┼────────┤  
│ @remix-run/cloudflare-pages │ 2.17.2 │ 2.17.2 │ 2.17.3 │
├─────────────────────────────┼─────────┼─────────┼────────┤
│ @remix-run/react │ 2.17.2 │ 2.17.2 │ 2.17.3 │
├─────────────────────────────┼─────────┼─────────┼────────┤
│ @remix-run/server-runtime │ 2.17.2 │ 2.17.2 │ 2.17.3 │
├─────────────────────────────┼─────────┼─────────┼────────┤
│ react │ 18.2.0 │ 18.3.1 │ 19.2.3 │
├─────────────────────────────┼─────────┼─────────┼────────┤
│ react-dom │ 18.2.0 │ 18.3.1 │ 19.2.3 │
├─────────────────────────────┼─────────┼─────────┼────────┤
│ @remix-run/dev (dev) │ 2.17.2 │ 2.17.2 │ 2.17.3 │
├─────────────────────────────┼─────────┼─────────┼────────┤
│ @types/react (dev) │ 18.2.0 │ 18.3.27 │ 19.2.7 │
├─────────────────────────────┼─────────┼─────────┼────────┤
│ @types/react-dom (dev) │ 18.2.0 │ 18.3.7 │ 19.2.3 │
├─────────────────────────────┼─────────┼─────────┼────────┤
│ tailwindcss (dev) │ 3.4.19 │ 3.4.19 │ 4.1.18 │
├─────────────────────────────┼─────────┼─────────┼────────┤
│ vite (dev) │ 5.4.14 │ 5.4.14 │ 7.3.1 │
└─────────────────────────────┴─────────┴─────────┴────────┘

Verify that all dependencies are up to date
Code is clean, formatted and linted and typesafe! (No any type errors/warnings/undefined variables/functions/undefined types/undefined properties)

Write tests for all features
run tests and make sure they pass

Build and run app on all platforms

Update capacitor to latest version (Read: packages/app/project-summary.md)

@electron-builder.yml • cannot find path for dependency name=undefined reference=undefined

for Enter code it alwayss says invalid code

Share Link for qr code doesnt work

le or directory 'D:\repos\ionic\syncstuff\node_modules\.bun\@capacitor+status-bar@8.0.0+15e98482558ccfe6\node_modules\@capacitor\status-bar\android\libs', not found
file or directory 'D:\repos\ionic\syncstuff\node_modules\.bun\capacitor-zeroconf@4.0.0+627b1c270a5d5c96\node_modules\capacitor-zeroconf\android\libs', not found
file or directory 'D:\repos\ionic\syncstuff\node_modules\.bun\@capacitor+android@8.0.0+15e98482558ccfe6\node_modules\@capacitor\android\capacitor\libs', not found
file or directory 'D:\repos\ionic\syncstuff\packages\app\android\capacitor-cordova-android-plugins\src\main\libs', not found
Resolve mutations for :app:packageDebug (Thread[#457,Execution worker Thread 2,5,main]) started.  
:app:packageDebug (Thread[#457,Execution worker Thread 2,5,main]) started.

> Task :app:packageDebug
> Caching disabled for task ':app:packageDebug' because:
> Build cache is disabled
> Caching has been disabled for the task
> Task ':app:packageDebug' is not up-to-date because:
> Output property 'ideModelOutputFile' file D:\repos\ionic\syncstuff\packages\app\android\app\build\outputs\apk\debug\output-metadata.json has been removed
> Output property 'incrementalFolder' file D:\repos\ionic\syncstuff\packages\app\android\app\build\intermediates\incremental\packageDebug\tmp has been removed.
> Output property 'incrementalFolder' file D:\repos\ionic\syncstuff\packages\app\android\app\build\intermediates\incremental\packageDebug\tmp\debug has been removed.
> and more...
> The input changes require a full rebuild for incremental task ':app:packageDebug'.
> Resolve mutations for :app:createDebugApkListingFileRedirect (Thread[#457,Execution worker Thread 2,5,main]) started.
> Resolve mutations for :app:assembleDebug (Thread[#460,Execution worker Thread 5,5,main]) started.  
> :app:assembleDebug (Thread[#460,Execution worker Thread 5,5,main]) started.
> :app:createDebugApkListingFileRedirect (Thread[#457,Execution worker Thread 2,5,main]) started.

> Task :app:assembleDebug
> Skipping task ':app:assembleDebug' as it has no actions.

> Task :app:createDebugApkListingFileRedirect  
> Caching disabled for task ':app:createDebugApkListingFileRedirect' because:
> Build cache is disabled
> Caching has been disabled for the task
> Task ':app:createDebugApkListingFileRedirect' is not up-to-date because:
> Output property 'redirectFile' file D:\repos\ionic\syncstuff\packages\app\android\app\build\intermediates\apk_ide_redirect_file\debug\createDebugApkListingFileRedirect\redirect.txt has been removed.  
> Build 7274d33a-9aed-4106-97bf-c2869925784a is started
> AAPT2 aapt2-8.13.2-14304508-windows Daemon #0: shutdown
> Build 7274d33a-9aed-4106-97bf-c2869925784a is close

See the complete report at file:///D:/repos/ionic/syncstuff/packages/app/android/build/reports/configuration-cache/af8qha9xwurz99pashmnvifxf/b5a1opwm517ti64q3q7rw4l1m/configuration-cache-report.html

[Incubating] Problems report is available at: file:///D:/repos/ionic/syncstuff/packages/app/android/build/reports/problems/problems-report.html

BUILD SUCCESSFUL in 27s
546 actionable tasks: 462 executed, 84 up-to-date  
Watched directory hierarchies: [D:\repos\ionic\syncstuff\packages\app\android]
Configuration cache entry stored.

fix stop discovery button not working in the app
makes the app crash
Share Link for qr code doesnt work

the device that scans the qr code get a success feedback and sees the connected devices but the "Receiver doesnt get any message or sees the connected device"

Improve UI of the Web app
(Improve the design of the web app, mobile navigation, and make it more user-friendly/ full responsive/mobile-first/modern/flat design/dark mode+light mode) - On mobile rightnow some navigation buttons arent visible
Improve UI of the Android app
(Improve the design of the Android app, mobile navigation, and make it more user-friendly/ full responsive/mobile-first/modern/flat design/dark mode+light mode)

## Debugging Android App

- Add logging to the app to help debug issues (in local development with debug setup (adb logcat + bun?))
- Debug option in Android app (when deploying debug apk version)
  (in packages/app -> bun run android --target emulator-5554 --verbose --debug)? better debugging setup possible?
  -> Sort Logs on verbose level (show only logs that are relevant to debug the app)
- Debug option in Web app
  (in packages/app -> bun run dev --verbose --debug)? better debugging setup possible?
  -> Sort Logs on verbose level (show only logs that are relevant to debug the app)
- Debug option in Electron app
  (in packages/app -> bun run electron --verbose --debug)? better debugging setup possible?
  -> Sort Logs on verbose level (show only logs that are relevant to debug the app)

  -> Setup Scripts for Debugging
  - Android App
  - Web App
  - Electron App
    in Root folder

  debug:android
  debug:web
  debug:electron
  debug:app
  debug:cli

  -> Setup Debugging Environment
  - Android App
  - Web App
  - Electron App
  - CLI

  Enable Network Debugging
  -> Trace Network Requests, Websocket Requests from local network

  Setup Adb Network Debugging / deploy app to device over wifi
  (Like on react native (npx @react-native-community/cli run-android --verbose / npx @react-native-community/cli run-android log-android ))

Add Debugging Options to the app
-> Debug option in Android app (when deploying debug apk version)
-> Debug option in Web app
-> Debug option in Electron app

Add Doctor Command to the app
(like on react native (npx react-native doctor --fix))

Add doctor command to the cli

## After development follow the best practices

- Keep the code clean and readable
- Use comments to explain the code
- Use version control
- Typesafe(no any / unknown types)
- Use proper error handling
- Use proper logging(add log levels can be enabled/disabled)
- Use proper testing
- Use proper documentation
- Use proper version control

- Use proper performance optimization
- Extendable and maintainable code for future updates

restore from git deployment the pushed wrangler.toml files for packages/web packages/app packages/database
packages/api

add git tracking for wrangler.toml files / .env files / .env.local files / wrangler.toml files / wrangler.json files

verify that no sensitive data is stored in the git repository / secrets / credentials / api keys / tokens / etc
like GITHUB_TOKEN / NPM_TOKEN / DISCORD_CLIENT_SECRET / GITHUB_CLIENT_SECRET / IONIC_ACCESS_TOKEN / etc

# Documentation

- Add documentation for the app
- Add documentation for the cli
- Add documentation for the api
- Add documentation for the database
- Add documentation for the web app
- Add documentation for the electron app
- Add documentation for the android app

mv docs in docs/ directory
Keep Root dir clear only Readme.md + Claude.md + Gemini.md

Docs Folder structure:

- docs/
  index.md + Plan.md (Overall Plan + Overview)
  - app/index.md + implementation.md + plan.md
  - cli/index.md + implementation.md + plan.md
  - api/index.md + implementation.md + plan.md
  - database/index.md + implementation.md + plan.md
  - web/index.md + implementation.md + plan.md
  - electron/index.md + implementation.md + plan.md
  - android/index.md + implementation.md + plan.md
