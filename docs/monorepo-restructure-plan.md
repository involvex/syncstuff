# Enterprise Monorepo Restructure Plan

## Executive Summary

This document outlines a comprehensive plan to transform the SyncStuff repository into an enterprise-grade monorepo architecture using Turborepo, following the structure specified in `docs/Repooverhaul.md`.

## Current Repository Analysis

### Existing Structure
```
packages/
├── api/           # Cloudflare Worker API
├── app/           # Main React/Ionic app (mobile + electron)
├── cli/           # CLI tool
├── database/      # Database migrations
├── shared/        # Shared utilities
├── ui/            # UI components library
└── web/           # Remix website
```

### Current Issues
- Mixed packages and apps in same directory
- Extensive use of `cd directory && bun run` patterns
- No Turborepo configuration
- TypeScript configs exist in packages (violates requirement)
- Repetitive scripts across packages
- No centralized code quality tooling
- Manual dependency management

## Target Architecture

### Directory Structure
```
apps/
├── web/           # Remix website (has tsconfig.json)
├── backend/       # API + Database (has tsconfig.json)
├── mobileapp/     # React/Ionic app (has tsconfig.json)
└── desktop/       # Electron app (has tsconfig.json)

packages/
├── api/           # API utilities (no tsconfig.json)
├── typescript-config/  # Centralized TS configs
├── format-and-linter-setup/  # ESLint, Prettier, Stylelint
├── ui/            # UI components (no tsconfig.json)
├── shared/        # Shared utilities (no tsconfig.json)
└── database/      # Database utilities (no tsconfig.json)
```

### Key Principles
- **apps/** contain applications with tsconfig.json files
- **packages/** contain libraries without tsconfig.json files
- Centralized tooling in packages/
- Turborepo-managed task orchestration
- Workspace-aware dependency management

## Implementation Plan

### Phase 1: Directory Restructuring (Priority: High)

#### 1.1 Create New Directory Structure
```bash
# Create new directories
mkdir -p apps/{web,backend,mobileapp,desktop}
mkdir -p packages/{api,typescript-config,format-and-linter-setup,ui,shared,database}

# Move existing packages to appropriate locations
mv packages/web apps/web
mv packages/app apps/mobileapp
mv packages/cli apps/desktop  # CLI becomes desktop app
mv packages/api packages/api  # Stays in packages
mv packages/ui packages/ui    # Stays in packages
mv packages/shared packages/shared  # Stays in packages
mv packages/database packages/database  # Stays in packages
```

#### 1.2 Update Package Names and Dependencies
- Rename packages to follow new naming convention
- Update all workspace: dependencies
- Update import paths in code

### Phase 2: Turborepo Configuration (Priority: High)

#### 2.1 Create turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env*"],
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
      "outputs": [".next/**", "dist/**", ".velite/**", "styled-system/**"],
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
}
```

#### 2.2 Update Root package.json Workspaces
```json
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

### Phase 3: Script Refactoring (Priority: High)

#### 3.1 Replace cd && bun run Patterns
**Before:**
```json
{
  "scripts": {
    "web": "cd packages/web && bun run dev",
    "api": "cd packages/api && bun run dev"
  }
}
```

**After:**
```json
{
  "scripts": {
    "web": "bun run --cwd apps/web dev",
    "api": "bun run --cwd apps/backend dev"
  }
}
```

#### 3.2 Consolidate Repetitive Scripts
**Before:** Individual format/lint scripts for each package
**After:** Workspace-level scripts using Turborepo filtering

### Phase 4: TypeScript Configuration (Priority: High)

#### 4.1 Create typescript-config Package
```
packages/typescript-config/
├── package.json
├── base.json          # Strict base configuration
├── library.json       # For packages (no emit)
├── app.json          # For apps (with emit)
└── react.json        # React-specific settings
```

#### 4.2 Remove tsconfig.json from Packages
- Delete all tsconfig.json files from packages/
- Update package.json files to reference @repo/typescript-config

#### 4.3 Update App tsconfig.json Files
- Apps extend from @repo/typescript-config/app.json
- Maintain app-specific overrides

### Phase 5: Code Quality Infrastructure (Priority: Medium)

#### 5.1 Create format-and-linter-setup Package
```
packages/format-and-linter-setup/
├── package.json
├── eslint/
│   ├── base.js
│   ├── react.js
│   └── node.js
├── prettier/
│   └── config.js
└── stylelint/
    └── config.js
```

#### 5.2 Update Root ESLint Configuration
- Extend from @repo/format-and-linter-setup/eslint/base
- Remove duplicate configurations

### Phase 6: Build Pipeline & CI/CD (Priority: Medium)

#### 6.1 Environment-Specific Configurations
- Development: .env.development*
- Production: .env.production*
- Staging: .env.staging*

#### 6.2 CI/CD Pipeline Updates
```yaml
# .github/workflows/ci.yml
- name: Build
  run: bun run build
- name: Lint
  run: bun run lint
- name: Test
  run: bun run test
```

#### 6.3 Caching Strategy
- Turborepo handles build caching
- Node modules cached by CI
- Environment files tracked for cache invalidation

## Migration Scripts

### Directory Migration Script
```bash
#!/bin/bash
# scripts/migrate-structure.sh

# Create new directories
mkdir -p apps/{web,backend,mobileapp,desktop}
mkdir -p packages/{api,typescript-config,format-and-linter-setup,ui,shared,database}

# Move packages to apps
mv packages/web apps/web
mv packages/app apps/mobileapp
mv packages/cli apps/desktop
mv packages/api packages/api
mv packages/ui packages/ui
mv packages/shared packages/shared
mv packages/database packages/database

echo "Directory structure migrated successfully"
```

### Dependency Update Script
```bash
#!/bin/bash
# scripts/update-dependencies.sh

# Update workspace dependencies
find apps packages -name "package.json" -exec sed -i 's|@syncstuff/|@repo/|g' {} \;

# Update import statements
find apps packages -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs sed -i 's|@syncstuff/|@repo/|g'

echo "Dependencies updated successfully"
```

## Configuration Examples

### Root turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env*"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "persistent": true,
      "cache": false
    },
    "lint": {
      "inputs": ["src/**", "*.config.*"]
    },
    "format": {
      "inputs": ["src/**", "*.config.*"]
    },
    "typecheck": {
      "inputs": ["src/**", "tsconfig.json"]
    }
  }
}
```

### typescript-config/base.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### Root package.json Scripts
```json
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint:fix",
    "format": "turbo run format",
    "format:fix": "turbo run format:fix",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean",
    "web": "bun run --cwd apps/web dev",
    "backend": "bun run --cwd apps/backend dev",
    "mobile": "bun run --cwd apps/mobileapp dev",
    "desktop": "bun run --cwd apps/desktop dev"
  }
}
```

## Implementation Priority Order

1. **Phase 1: Directory Restructuring** (Day 1)
   - Create migration scripts
   - Execute directory moves
   - Update package names

2. **Phase 2: Turborepo Setup** (Day 1-2)
   - Install Turborepo
   - Create turbo.json
   - Update workspaces configuration

3. **Phase 3: Script Refactoring** (Day 2)
   - Replace cd && bun run patterns
   - Consolidate repetitive scripts
   - Test all scripts work

4. **Phase 4: TypeScript Configuration** (Day 2-3)
   - Create typescript-config package
   - Remove tsconfig.json from packages
   - Update app configurations

5. **Phase 5: Code Quality Infrastructure** (Day 3)
   - Create format-and-linter-setup package
   - Update ESLint configurations
   - Test linting and formatting

6. **Phase 6: CI/CD Updates** (Day 3-4)
   - Update GitHub Actions
   - Configure caching
   - Test deployment pipelines

## Risk Mitigation

### Rollback Strategy
- Keep git history intact
- Create backup branch before migration
- Test all functionality post-migration

### Testing Strategy
- Run all existing scripts post-migration
- Verify builds work in all apps
- Test dependency resolution
- Validate TypeScript compilation

### Communication Plan
- Document all breaking changes
- Update README with new structure
- Notify team of migration timeline

## Success Criteria

- [ ] All apps build successfully
- [ ] All scripts work with --cwd pattern
- [ ] Turborepo caching functions correctly
- [ ] TypeScript compilation works across all packages
- [ ] Linting and formatting unified
- [ ] CI/CD pipelines pass
- [ ] No tsconfig.json files in packages/
- [ ] Only tsconfig.json files in apps/

## Next Steps

1. Review and approve this plan
2. Create backup branch
3. Execute Phase 1 migration scripts
4. Test and validate each phase
5. Deploy to production

---

*This plan transforms the repository into a scalable, maintainable monorepo architecture following industry best practices.*