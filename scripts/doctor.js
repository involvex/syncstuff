const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const issues = [];
const fixes = [];

console.log(
  `${colors.cyan}${colors.bright}🩺 SyncStuff Doctor - Diagnosing environment...${colors.reset}\n`,
);

const checkCommand = (cmd, silent = true) => {
  try {
    execSync(cmd, { stdio: silent ? "ignore" : "inherit" });
    return true;
  } catch (e) {
    return false;
  }
};

const getCommandVersion = cmd => {
  try {
    const output = execSync(cmd, { encoding: "utf8" }).trim();
    return output.split("\n")[0];
  } catch (e) {
    return null;
  }
};

const checkPort = port => {
  try {
    const result = execSync(`netstat -ano | findstr :${port}`, {
      encoding: "utf8",
    });
    return result.trim().length > 0;
  } catch (e) {
    return false;
  }
};

// 1. Check basic tools
console.log(`${colors.blue}--- 🛠️ Tools ---${colors.reset}`);
const nodeVersion = process.version;
console.log(`Node: ${colors.green}${nodeVersion}${colors.reset}`);

const bunVersion = getCommandVersion("bun --version");
if (bunVersion) {
  console.log(`Bun: ${colors.green}✅ ${bunVersion}${colors.reset}`);
} else {
  console.log(`Bun: ${colors.red}❌ Not Found${colors.reset}`);
  issues.push("Bun is not installed. Install from https://bun.sh");
  fixes.push("Install Bun: curl -fsSL https://bun.sh/install | bash");
}

const adbVersion = getCommandVersion("adb version");
if (adbVersion) {
  console.log(
    `ADB: ${colors.green}✅ ${adbVersion.split("\n")[0]}${colors.reset}`,
  );

  // Check if device is connected
  try {
    const devices = execSync("adb devices", { encoding: "utf8" });
    const deviceCount = devices
      .split("\n")
      .filter(line => line.includes("device") && !line.includes("List")).length;
    if (deviceCount > 0) {
      console.log(
        `  ${colors.green}  → ${deviceCount} device(s) connected${colors.reset}`,
      );
    } else {
      console.log(`  ${colors.yellow}  → No devices connected${colors.reset}`);
      issues.push("No Android devices/emulators connected");
      fixes.push("Connect a device via USB or start an emulator");
    }
  } catch (e) {
    console.log(`  ${colors.yellow}  → Could not check devices${colors.reset}`);
  }
} else {
  console.log(`ADB: ${colors.red}❌ Not Found${colors.reset}`);
  issues.push("ADB is not installed. Install Android SDK Platform Tools");
  fixes.push(
    "Install Android SDK Platform Tools from https://developer.android.com/studio/releases/platform-tools",
  );
}

const gitVersion = getCommandVersion("git --version");
if (gitVersion) {
  console.log(`Git: ${colors.green}✅ ${gitVersion}${colors.reset}`);
} else {
  console.log(`Git: ${colors.red}❌ Not Found${colors.reset}`);
  issues.push("Git is not installed");
  fixes.push("Install Git from https://git-scm.com/downloads");
}

// 2. Check workspaces
console.log(`\n${colors.blue}--- 📦 Workspaces ---${colors.reset}`);
const packages = ["app", "web", "api", "cli", "database", "shared"];
packages.forEach(pkg => {
  const pkgPath = path.join(__dirname, "..", "packages", pkg, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkgJson = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      console.log(
        `${colors.green}✅ ${pkg}:${colors.reset} Found (v${pkgJson.version || "?"})`,
      );

      // Check if node_modules exists
      const nodeModulesPath = path.join(
        __dirname,
        "..",
        "packages",
        pkg,
        "node_modules",
      );
      if (!fs.existsSync(nodeModulesPath)) {
        console.log(
          `  ${colors.yellow}  → node_modules missing${colors.reset}`,
        );
        issues.push(`${pkg}: node_modules not found`);
        fixes.push("Run: bun install");
      }
    } catch (e) {
      console.log(`${colors.green}✅ ${pkg}:${colors.reset} Found`);
    }
  } else {
    console.log(`${colors.red}❌ ${pkg}: Missing${colors.reset}`);
    issues.push(`${pkg} package is missing`);
  }
});

// 3. Check Android specifically
console.log(`\n${colors.blue}--- 🤖 Android ---${colors.reset}`);
const androidPath = path.join(__dirname, "..", "packages", "app", "android");
if (fs.existsSync(androidPath)) {
  console.log(`${colors.green}✅ Android folder: Found${colors.reset}`);

  // Check local.properties
  const localPropsPath = path.join(androidPath, "local.properties");
  try {
    const localProps = fs.readFileSync(localPropsPath, "utf8");
    console.log(`${colors.green}✅ local.properties: Found${colors.reset}`);

    // Check if ANDROID_HOME or sdk.dir is set
    if (!localProps.includes("sdk.dir") && !process.env.ANDROID_HOME) {
      console.log(
        `  ${colors.yellow}  → Android SDK path not configured${colors.reset}`,
      );
      issues.push("Android SDK path not configured in local.properties");
      fixes.push(
        "Set ANDROID_HOME environment variable or configure local.properties",
      );
    }
  } catch (e) {
    console.log(`${colors.yellow}⚠️ local.properties: Missing${colors.reset}`);
    issues.push("local.properties missing (needed for Android builds)");
    fixes.push(
      "Create local.properties in android/ folder with: sdk.dir=/path/to/android/sdk",
    );
  }

  // Check gradle wrapper
  const gradlewPath = path.join(
    androidPath,
    process.platform === "win32" ? "gradlew.bat" : "gradlew",
  );
  if (fs.existsSync(gradlewPath)) {
    console.log(`${colors.green}✅ Gradle wrapper: Found${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Gradle wrapper: Missing${colors.reset}`);
    issues.push("Gradle wrapper missing");
    fixes.push("Run: cd packages/app/android && gradle wrapper");
  }
} else {
  console.log(`${colors.red}❌ Android folder: Missing${colors.reset}`);
  issues.push("Android folder missing");
  fixes.push("Run: cd packages/app && npx cap add android");
}

// 4. Check Signaling Server
console.log(`\n${colors.blue}--- 📡 Connectivity ---${colors.reset}`);
const signalingPath = path.join(
  __dirname,
  "..",
  "packages",
  "app",
  "signaling-server.cjs",
);
if (fs.existsSync(signalingPath)) {
  console.log(
    `${colors.green}✅ Signaling Server script: Found${colors.reset}`,
  );
} else {
  console.log(
    `${colors.red}❌ Signaling Server script: Missing${colors.reset}`,
  );
  issues.push("Signaling server script missing");
}

// Check ports
console.log(`\n${colors.blue}--- 🔌 Ports ---${colors.reset}`);
const ports = [
  { name: "Web Dev Server", port: 3030, default: true },
  { name: "Signaling Server", port: 3001, default: true },
  { name: "API Server", port: 8787, default: false },
];

ports.forEach(({ name, port, default: isDefault }) => {
  const inUse = checkPort(port);
  if (inUse) {
    console.log(
      `${colors.yellow}⚠️  ${name} (${port}):${colors.reset} Port in use`,
    );
    if (isDefault) {
      issues.push(`${name} port ${port} is already in use`);
      fixes.push(
        `Stop the process using port ${port} or change the port in config`,
      );
    }
  } else {
    console.log(
      `${colors.green}✅ ${name} (${port}):${colors.reset} Available`,
    );
  }
});

// 5. Check for sensitive data in git
console.log(`\n${colors.blue}--- 🔒 Security ---${colors.reset}`);
const sensitivePatterns = [
  { pattern: /GITHUB_TOKEN/i, file: ".env" },
  { pattern: /NPM_TOKEN/i, file: ".env" },
  { pattern: /DISCORD_CLIENT_SECRET/i, file: ".env" },
  { pattern: /GITHUB_CLIENT_SECRET/i, file: ".env" },
  { pattern: /IONIC_ACCESS_TOKEN/i, file: ".env" },
  { pattern: /password.*=.*[^=]{8,}/i, file: "config files" },
];

let secretsFound = false;
const envFiles = [".env", ".env.local", ".env.production"];
envFiles.forEach(envFile => {
  const envPath = path.join(__dirname, "..", envFile);
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, "utf8");
      sensitivePatterns.forEach(({ pattern, file }) => {
        if (pattern.test(content)) {
          console.log(
            `${colors.red}⚠️  Potential secret found in ${envFile}${colors.reset}`,
          );
          secretsFound = true;
        }
      });
    } catch (e) {
      // File exists but can't read (might be in .gitignore, which is good)
    }
  }
});

if (!secretsFound) {
  console.log(
    `${colors.green}✅ No obvious secrets in tracked files${colors.reset}`,
  );
} else {
  issues.push("Potential secrets found in environment files");
  fixes.push("Ensure .env files are in .gitignore and never commit secrets");
}

// Summary
console.log(`\n${colors.blue}--- 📋 Summary ---${colors.reset}`);
if (issues.length === 0) {
  console.log(
    `${colors.green}✅ All checks passed! Environment looks good.${colors.reset}\n`,
  );
} else {
  console.log(
    `${colors.red}❌ Found ${issues.length} issue(s):${colors.reset}\n`,
  );
  issues.forEach((issue, i) => {
    console.log(`  ${i + 1}. ${colors.yellow}${issue}${colors.reset}`);
  });

  console.log(`\n${colors.cyan}💡 Suggested fixes:${colors.reset}\n`);
  fixes.forEach((fix, i) => {
    console.log(`  ${i + 1}. ${colors.bright}${fix}${colors.reset}`);
  });
  console.log();
}

console.log(`${colors.cyan}📚 Useful commands:${colors.reset}`);
console.log(
  `  • Debug Android: ${colors.bright}bun run debug:android${colors.reset}`,
);
console.log(`  • Debug Web: ${colors.bright}bun run debug:web${colors.reset}`);
console.log(
  `  • Debug Electron: ${colors.bright}bun run debug:electron${colors.reset}`,
);
console.log(`  • Run Doctor: ${colors.bright}bun run doctor${colors.reset}\n`);
