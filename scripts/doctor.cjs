const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

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
  `${colors.cyan}${colors.bright}SyncStuff Doctor - Diagnosing environment...${colors.reset}\n`,
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

// 1. Check basic tools
console.log(`${colors.blue}--- Tools ---${colors.reset}`);
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

const flutterVersion = getCommandVersion("flutter --version");
if (flutterVersion) {
  const versionLine = flutterVersion.split("\n")[0];
  console.log(`Flutter: ${colors.green}✅ ${versionLine}${colors.reset}`);
} else {
  console.log(`Flutter: ${colors.red}❌ Not Found${colors.reset}`);
  issues.push("Flutter is not installed. Install from https://flutter.dev");
  fixes.push("Install Flutter SDK from https://flutter.dev/docs/get-started/install");
}

const dartVersion = getCommandVersion("dart --version");
if (dartVersion) {
  console.log(`Dart: ${colors.green}✅ ${dartVersion}${colors.reset}`);
} else {
  console.log(`Dart: ${colors.red}❌ Not Found${colors.reset}`);
  issues.push("Dart is not installed (included with Flutter SDK)");
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
console.log(`\n${colors.blue}--- Workspaces ---${colors.reset}`);
const apps = [
  { name: "web", dir: "apps/web", type: "npm" },
  { name: "mobile", dir: "apps/mobile", type: "flutter" },
  { name: "desktop", dir: "apps/desktop", type: "flutter" },
  { name: "cli_dart", dir: "apps/cli_dart", type: "dart" },
];
const packages = [
  { name: "ui", dir: "packages/ui" },
  { name: "api", dir: "packages/api" },
  { name: "database", dir: "packages/database" },
  { name: "shared", dir: "packages/shared" },
  { name: "core", dir: "packages/core" },
  { name: "telemetry", dir: "packages/telemetry" },
];

apps.forEach(({ name, dir, type }) => {
  if (type === "flutter" || type === "dart") {
    const pubspecPath = path.join(__dirname, "..", dir, "pubspec.yaml");
    if (fs.existsSync(pubspecPath)) {
      console.log(`${colors.green}✅ ${name}:${colors.reset} Found`);
    } else {
      console.log(`${colors.red}❌ ${name}: Missing${colors.reset}`);
      issues.push(`${name} app is missing`);
    }
  } else {
    const pkgJsonPath = path.join(__dirname, "..", dir, "package.json");
    if (fs.existsSync(pkgJsonPath)) {
      try {
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
        console.log(
          `${colors.green}✅ ${name}:${colors.reset} Found (v${pkgJson.version || "?"})`,
        );
      } catch (e) {
        console.log(`${colors.green}✅ ${name}:${colors.reset} Found`);
      }
    } else {
      console.log(`${colors.red}❌ ${name}: Missing${colors.reset}`);
      issues.push(`${name} app is missing`);
    }
  }
});

packages.forEach(({ name, dir }) => {
  const pkgJsonPath = path.join(__dirname, "..", dir, "package.json");
  const pubspecPath = path.join(__dirname, "..", dir, "pubspec.yaml");
  if (fs.existsSync(pkgJsonPath)) {
    try {
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
      console.log(
        `${colors.green}✅ ${name}:${colors.reset} Found (v${pkgJson.version || "?"})`,
      );
    } catch (e) {
      console.log(`${colors.green}✅ ${name}:${colors.reset} Found`);
    }
  } else if (fs.existsSync(pubspecPath)) {
    console.log(`${colors.green}✅ ${name}:${colors.reset} Found (Dart package)`);
  } else {
    console.log(`${colors.red}❌ ${name}: Missing${colors.reset}`);
    issues.push(`${name} package is missing`);
  }
});

// 3. Check node_modules
console.log(`\n${colors.blue}--- Dependencies ---${colors.reset}`);
const nodeModulesPath = path.join(__dirname, "..", "node_modules");
if (fs.existsSync(nodeModulesPath)) {
  console.log(`${colors.green}✅ node_modules: Found${colors.reset}`);
} else {
  console.log(`${colors.red}❌ node_modules: Missing${colors.reset}`);
  issues.push("node_modules not found");
  fixes.push("Run: bun install");
}

// 4. Check Flutter dependencies
["mobile", "desktop", "cli_dart"].forEach(app => {
  const lockPath = path.join(__dirname, "..", "apps", app, "pubspec.lock");
  if (fs.existsSync(lockPath)) {
    console.log(`${colors.green}✅ ${app} dependencies: Found${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠️  ${app} dependencies: Not resolved${colors.reset}`);
    issues.push(`${app} pubspec.lock missing`);
    fixes.push(`Run: cd apps/${app} && flutter pub get`);
  }
});

// 5. Check for sensitive data
console.log(`\n${colors.blue}--- Security ---${colors.reset}`);
const envFiles = [".env", ".env.local", ".env.production"];
let envFound = false;
envFiles.forEach(envFile => {
  const envPath = path.join(__dirname, "..", envFile);
  if (fs.existsSync(envPath)) {
    console.log(
      `${colors.yellow}⚠️  Found ${envFile} file (should be in .gitignore)${colors.reset}`,
    );
    envFound = true;
  }
});
if (!envFound) {
  console.log(
    `${colors.green}✅ No .env files in root (good)${colors.reset}`,
  );
}

// Summary
console.log(`\n${colors.blue}--- Summary ---${colors.reset}`);
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

  console.log(`\n${colors.cyan}Suggested fixes:${colors.reset}\n`);
  fixes.forEach((fix, i) => {
    console.log(`  ${i + 1}. ${colors.bright}${fix}${colors.reset}`);
  });
  console.log();
}

console.log(`${colors.cyan}Useful commands:${colors.reset}`);
console.log(`  Start web: ${colors.bright}bun run dev:web${colors.reset}`);
console.log(`  Start mobile: ${colors.bright}bun run dev:mobile${colors.reset}`);
console.log(`  Start desktop: ${colors.bright}bun run dev:desktop${colors.reset}`);
console.log(`  Start CLI: ${colors.bright}bun run dev:cli_dart${colors.reset}`);
console.log(`  Run doctor: ${colors.bright}bun run doctor${colors.reset}\n`);