#!/usr/bin/env node

/**
 * Enhanced Version Bump Script for Syncstuff
 *
 * Features:
 * - Pre-flight checks (clean working directory, typecheck)
 * - Support for major, minor, and patch version bumps
 * - Annotated git tags with release notes
 * - Rollback capability on failure
 * - Optional push to remote
 * - Dry-run mode for preview
 *
 * Usage:
 *   bun run app:version:patch           # Bump patch version (default)
 *   bun run app:version:minor           # Bump minor version
 *   bun run app:version:major           # Bump major version
 *   bun run app:version:patch --push    # Bump and push to remote
 *   bun run app:version:patch --dry-run # Preview without executing
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ Error: ${message}`, "red");
  process.exit(1);
}

function success(message) {
  log(`✅ ${message}`, "green");
}

function info(message) {
  log(`ℹ️  ${message}`, "cyan");
}

function warning(message) {
  log(`⚠️  ${message}`, "yellow");
}

// Parse command-line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const shouldPush = args.includes("--push");
const versionType =
  args
    .find((arg) => ["--major", "--minor", "--patch"].includes(arg))
    ?.replace("--", "") || "patch";

// Paths
const appPackagePath = path.join(
  __dirname,
  "..",
  "packages",
  "app",
  "package.json"
);
const buildGradlePath = path.join(
  __dirname,
  "..",
  "packages",
  "app",
  "android",
  "app",
  "build.gradle"
);
const electronPackagePath = path.join(
  __dirname,
  "..",
  "packages",
  "app",
  "electron",
  "package.json"
);
const androidManifestPath = path.join(
  __dirname,
  "..",
  "packages",
  "app",
  "android",
  "app",
  "src",
  "main",
  "AndroidManifest.xml"
);
const rootDir = path.join(__dirname, "..");

/**
 * Execute a shell command with error handling
 */
function exec(command, options = {}) {
  try {
    const result = execSync(command, {
      cwd: rootDir,
      encoding: "utf-8",
      stdio: options.silent ? "pipe" : "inherit",
      ...options,
    });
    return result ? result.trim() : "";
  } catch (err) {
    if (options.ignoreError) {
      return "";
    }
    throw err;
  }
}

/**
 * Check if git working directory is clean
 */
function checkGitStatus() {
  info("Checking git working directory...");

  const status = exec("git status --porcelain", { silent: true });

  if (status) {
    error(
      "Git working directory is not clean. Commit or stash your changes first.\n\nModified files:\n" +
        status
    );
  }

  success("Git working directory is clean");
}

/**
 * Get current git branch
 */
function getCurrentBranch() {
  return exec("git branch --show-current", { silent: true });
}

/**
 * Run typecheck before bumping version
 */
function runTypecheck() {
  info("Running typecheck...");

  try {
    exec("cd packages/app && bun run typecheck");
    success("Typecheck passed");
  } catch (err) {
    error("Typecheck failed. Fix type errors before bumping version.");
  }
}

/**
 * Calculate new version based on current version and bump type
 */
function calculateNewVersion(currentVersion, bumpType) {
  const [major, minor, patch] = currentVersion.split(".").map(Number);

  switch (bumpType) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

/**
 * Create annotated git tag with release notes
 */
function createAnnotatedTag(version, isDryRun) {
  const tagName = `v${version}`;
  const tagMessage = `Release ${version}

App version bump to ${version}

Changes:
- Version bumped from previous release
- See commit history for details

🚀 Released via automated version bump script
`;

  if (isDryRun) {
    info(`Would create annotated tag: ${tagName}`);
    log("\nTag message:", "yellow");
    log(tagMessage, "yellow");
    return;
  }

  // Create annotated tag with message
  const escapedMessage = tagMessage.replace(/"/g, '\\"').replace(/\n/g, "\\n");
  exec(`git tag -a ${tagName} -m "${escapedMessage}"`);
  success(`Created annotated tag: ${tagName}`);
}

/**
 * Rollback changes if something fails
 */
function rollback() {
  warning("Rolling back changes...");

  try {
    // Reset any uncommitted changes to package.json
    exec("git checkout packages/app/package.json", { ignoreError: true });

    // Remove any tags created
    const tags = exec("git tag --points-at HEAD", {
      silent: true,
      ignoreError: true,
    });
    if (tags) {
      tags.split("\n").forEach((tag) => {
        if (tag.trim()) {
          exec(`git tag -d ${tag}`, { ignoreError: true });
        }
      });
    }

    // Reset the commit if one was made
    const lastCommit = exec("git log -1 --pretty=%B", {
      silent: true,
      ignoreError: true,
    });
    if (lastCommit && lastCommit.includes("chore: bump app version")) {
      exec("git reset --hard HEAD~1", { ignoreError: true });
    }

    success("Rollback completed");
  } catch (err) {
    error(`Rollback failed: ${err.message}`);
  }
}

/**
 * Main execution function
 */
function main() {
  log("\n" + "=".repeat(60), "bright");
  log("📦 Syncstuff Version Bump Script", "bright");
  log("=".repeat(60) + "\n", "bright");

  if (isDryRun) {
    warning("DRY RUN MODE - No changes will be made\n");
  }

  // Step 1: Pre-flight checks
  const currentBranch = getCurrentBranch();
  info(`Current branch: ${currentBranch}`);

  if (!isDryRun) {
    checkGitStatus();
    runTypecheck();
  }

  // Step 2: Read current version
  if (!fs.existsSync(appPackagePath)) {
    error(`Package file not found: ${appPackagePath}`);
  }

  const appPackage = JSON.parse(fs.readFileSync(appPackagePath, "utf-8"));
  const currentVersion = appPackage.version;
  const newVersion = calculateNewVersion(currentVersion, versionType);

  // Step 3: Display version change
  log("\n📊 Version Change:", "bright");
  log(`   Current: ${currentVersion}`, "yellow");
  log(`   New:     ${newVersion}`, "green");
  log(`   Type:    ${versionType.toUpperCase()}`, "cyan");
  log("");

  if (isDryRun) {
    info("Skipping actual version bump (dry run)");
    createAnnotatedTag(newVersion, true);

    log("\n📋 Summary:", "bright");
    log(`   ✓ Would update package.json to ${newVersion}`);
    if (fs.existsSync(buildGradlePath)) {
      log(`   ✓ Would update build.gradle versionName to ${newVersion}`);
    }
    if (fs.existsSync(electronPackagePath)) {
      log(`   ✓ Would update Electron package.json to ${newVersion}`);
    }
    if (fs.existsSync(androidManifestPath)) {
      log(`   ✓ Would update AndroidManifest.xml versionName to ${newVersion}`);
      log(`   ✓ Would increment AndroidManifest.xml versionCode`);
    }
    log(`   ✓ Would create git commit`);
    log(`   ✓ Would create annotated tag v${newVersion}`);
    if (shouldPush) {
      log(`   ✓ Would push commit and tag to remote`);
    }
    log("\nRun without --dry-run to apply changes.\n", "cyan");
    return;
  }

  // Step 4: Update package.json
  try {
    info("Updating package.json...");
    appPackage.version = newVersion;
    fs.writeFileSync(
      appPackagePath,
      JSON.stringify(appPackage, null, 2) + "\n"
    );
    success(`Updated package.json to ${newVersion}`);

    // Step 4b: Update build.gradle versionName
    if (fs.existsSync(buildGradlePath)) {
      info("Updating build.gradle versionName...");
      let buildGradleContent = fs.readFileSync(buildGradlePath, "utf-8");
      
      // Update versionName in build.gradle
      // Pattern: versionName "0.0.1" or versionName = "0.0.1"
      const versionNameRegex = /versionName\s+(?:=)?\s*["']([^"']+)["']/;
      if (versionNameRegex.test(buildGradleContent)) {
        buildGradleContent = buildGradleContent.replace(
          versionNameRegex,
          `versionName "${newVersion}"`
        );
        fs.writeFileSync(buildGradlePath, buildGradleContent);
        success(`Updated build.gradle versionName to ${newVersion}`);
      } else {
        warning("Could not find versionName in build.gradle, skipping...");
      }
    } else {
      warning(`build.gradle not found at ${buildGradlePath}, skipping...`);
    }

    // Step 4c: Update Electron package.json version
    if (fs.existsSync(electronPackagePath)) {
      info("Updating Electron package.json version...");
      const electronPackage = JSON.parse(
        fs.readFileSync(electronPackagePath, "utf-8")
      );
      electronPackage.version = newVersion;
      fs.writeFileSync(
        electronPackagePath,
        JSON.stringify(electronPackage, null, 2) + "\n"
      );
      success(`Updated Electron package.json to ${newVersion}`);
    } else {
      warning(
        `Electron package.json not found at ${electronPackagePath}, skipping...`
      );
    }

    // Step 4d: Update AndroidManifest.xml versionCode and versionName
    if (fs.existsSync(androidManifestPath)) {
      info("Updating AndroidManifest.xml version...");
      let manifestContent = fs.readFileSync(androidManifestPath, "utf-8");
      
      // Update versionName in AndroidManifest.xml
      // Pattern: android:versionName="0.0.1"
      const versionNameRegex = /android:versionName=["']([^"']+)["']/;
      if (versionNameRegex.test(manifestContent)) {
        manifestContent = manifestContent.replace(
          versionNameRegex,
          `android:versionName="${newVersion}"`
        );
        success(`Updated AndroidManifest.xml versionName to ${newVersion}`);
      } else {
        warning(
          "Could not find android:versionName in AndroidManifest.xml, skipping..."
        );
      }

      // Update versionCode (increment it)
      const versionCodeRegex = /android:versionCode=["'](\d+)["']/;
      if (versionCodeRegex.test(manifestContent)) {
        const match = manifestContent.match(versionCodeRegex);
        const currentVersionCode = parseInt(match[1], 10);
        const newVersionCode = currentVersionCode + 1;
        manifestContent = manifestContent.replace(
          versionCodeRegex,
          `android:versionCode="${newVersionCode}"`
        );
        success(
          `Updated AndroidManifest.xml versionCode to ${newVersionCode}`
        );
      } else {
        warning(
          "Could not find android:versionCode in AndroidManifest.xml, skipping..."
        );
      }

      fs.writeFileSync(androidManifestPath, manifestContent);
    } else {
      warning(
        `AndroidManifest.xml not found at ${androidManifestPath}, skipping...`
      );
    }

    // Step 5: Git operations
    info("Staging changes...");
    exec(`git add ${appPackagePath}`);
    if (fs.existsSync(buildGradlePath)) {
      exec(`git add ${buildGradlePath}`);
    }
    if (fs.existsSync(electronPackagePath)) {
      exec(`git add ${electronPackagePath}`);
    }
    if (fs.existsSync(androidManifestPath)) {
      exec(`git add ${androidManifestPath}`);
    }
    success("Changes staged");

    info("Creating commit...");
    exec(`git commit -m "chore: bump app version to ${newVersion}"`);
    success(`Commit created`);

    // Step 6: Create annotated tag
    createAnnotatedTag(newVersion, false);

    // Step 7: Optional push to remote
    if (shouldPush) {
      info("Pushing to remote...");
      exec(`git push`);
      exec(`git push --tags`);
      success("Pushed commit and tags to remote");
    }

    // Step 8: Success summary
    log("\n" + "=".repeat(60), "green");
    log("✨ Version Bump Completed Successfully!", "green");
    log("=".repeat(60) + "\n", "green");

    log("📋 Summary:", "bright");
    log(`   ✓ Updated app version: ${currentVersion} → ${newVersion}`);
    if (fs.existsSync(buildGradlePath)) {
      log(`   ✓ Updated build.gradle versionName`);
    }
    if (fs.existsSync(electronPackagePath)) {
      log(`   ✓ Updated Electron package.json`);
    }
    if (fs.existsSync(androidManifestPath)) {
      log(`   ✓ Updated AndroidManifest.xml versionName and versionCode`);
    }
    log(`   ✓ Created commit: "chore: bump app version to ${newVersion}"`);
    log(`   ✓ Created tag: v${newVersion}`);

    if (!shouldPush) {
      log("\n💡 Next steps:", "cyan");
      log("   Run the following to push to remote:", "cyan");
      log(`   git push && git push --tags\n`, "bright");
    } else {
      log(`   ✓ Pushed to remote\n`);
    }
  } catch (err) {
    error(`Version bump failed: ${err.message}`);
    rollback();
  }
}

// Run the script
main();
