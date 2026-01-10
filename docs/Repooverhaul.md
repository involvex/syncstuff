# Repooverhaul 

Update the Infrastructure

root dir
packages -> api  /  typescript-config / format and linter setup ? (no tsconfigs in packages)
apps -> web / backend / mobileapp  / desktop (only include tsconfig)

Similiar to turborepo setup: (Packages linked , dependson)


{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env"],
  "tasks": {
    "//#format-and-lint": {},
    "//#format-and-lint:fix": {
      "cache": false
    },
    "transit": {
      "dependsOn": ["^transit"]
    },
    "build": {
      "env": [],
      "inputs": [
        "$TURBO_DEFAULT$",
        ".env.production.local",
        ".env.local",
        ".env.production",
        ".env"
      ],
      "outputs": [".next/**", "dist/**", ".velite/**", "!.next/cache/**", "styled-system/**"],
      "dependsOn": ["^build"]
    },
    "dev": {
      "inputs": [
        "$TURBO_DEFAULT$",
        ".env.development.local",
        ".env.local",
        ".env.development",
        ".env"
      ],
      "persistent": true,
      "cache": false
    }
  }

  {
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}

  including package caching dedupes , builds that dependson 

  Fixing Scripts:

  wrong:
  
  "scripts": {
    "android": "cd packages/app && bun run android",
    "web": "cd packages/web && bun run dev",
    "api": "cd packages/api && bun run dev",
    "debug:android": "node scripts/debug-android.js",
    "debug:android:verbose": "node scripts/debug-android.js --verbose",
    "debug:android:clear": "node scripts/debug-android.js --clear",
    "debug:web": "node scripts/debug-web.js",
    "debug:web:verbose": "node scripts/debug-web.js --verbose",
    "debug:electron": "node scripts/debug-electron.js",
    "debug:electron:verbose": "node scripts/debug-electron.js --verbose",
    "debug:app": "bun run debug:android",
    "debug:cli": "cd packages/cli && bun run dev --verbose --debug",
    "logcat": "adb logcat | grep -i syncstuff",
    "logcat:clear": "adb logcat -c",
    "doctor": "node scripts/doctor.js",
    "check-secrets": "node scripts/check-secrets.js",
    "build": "bun run build:ui && bun run build:app",
    "build:ui": "cd packages/ui && bun run build",
    "build:app": "cd packages/app && bun run build",
    "build:web": "cd packages/web && bun run build",
    "build:api": "cd packages/api && bun run deploy",
    "format": "bun run format:app && bun run format:web && bun run format:ui && bun run format:api && bun run format:cli",
    "format:app": "cd packages/app && bun run format",
    "format:web": "cd packages/web && bun run format",
    "format:ui": "cd packages/ui && bun run format",
    "format:api": "cd packages/api && bun run format",
    "format:cli": "cd packages/cli && bun run format",
    "lint": "bun run lint:app && bun run lint:api && bun run lint:web && bun run lint:ui",
    "lint:app": "cd packages/app && bun run lint",
    "lint:api": "cd packages/api && bun run lint",
    "lint:web": "cd packages/web && bun run lint",
    "lint:ui": "cd packages/ui && bun run lint",
    "lint:fix": "bun run lint:fix:app && bun run lint:fix:api && bun run lint:fix:web && bun run lint:fix:ui",
    "lint:fix:app": "cd packages/app && bun run lint:fix",
    "lint:fix:api": "cd packages/api && bun run lint:fix",
    "lint:fix:web": "cd packages/web && bun run lint:fix",
    "lint:fix:ui": "cd packages/ui && bun run lint:fix",
    "typecheck": "bun run typecheck:app && bun run typecheck:shared && bun run typecheck:api && bun run typecheck:web && bun run typecheck:ui",
    "typecheck:app": "cd packages/app && bun run typecheck",
    "typecheck:shared": "cd packages/shared && bun run typecheck",
    "typecheck:api": "cd packages/api && bun run typecheck",
    "typecheck:web": "cd packages/web && bun run typecheck",
    "typecheck:ui": "cd packages/ui && bun run typecheck",
    "db:create": "cd packages/database && bun run create",
    "db:migrate": "cd packages/database && bun run migrate",
    "deploy:api": "cd packages/api && bun run deploy",
    "deploy:web": "cd packages/web && bun run deploy",
    "deploy:db": "cd packages/database && bun run deploy",
    "gradle:stop": "cd packages/app && bun run gradle:stop",
    "gradle:clean": "cd packages/app && bun run gradle:clean",
    "app:version:patch": "node scripts/bump-app-version.js --patch",
    "app:version:minor": "node scripts/bump-app-version.js --minor",
    "app:version:major": "node scripts/bump-app-version.js --major",
    "check": "bun run format && bun run lint:fix && bun run typecheck",
    "test:app": "cd packages/app && bun run test",
    "electron:dev": " bun run --cwd packages/app electron:dev",
    "electron:build": "bun run --cwd packages/app electron:build",
    "electron:start": "bun run --cwd packages/app electron:start",
    "build:cli": "bun run --cwd packages/cli build",
    "dev:cli": "bun run --cwd packages/cli dev",
    "lint:cli": "bun run --cwd packages/cli lint",
    "lint:fix:cli": "bun run --cwd packages/cli lint:fix",
    "typecheck:cli": "bun run --cwd packages/cli typecheck",
    "publish:cli": "cd packages/cli && bun run build && npm publish --access public"
  },


  utilize:
  --cwd
  "bun run --cwd workspace"

  package tsconfig example:
  ./packages/math/tsconfig.json

{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}