#!/usr/bin/env node
/**
 * Enhanced Electron Debug Script
 * Starts Electron app with enhanced logging and DevTools
 */

const { spawn } = require("child_process");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes("--verbose") || args.includes("-v");

  console.log(`${colors.cyan}${colors.bright}⚡ Syncstuff Electron Debug Mode${colors.reset}`);
  console.log(`${colors.dim}Starting Electron with enhanced logging...${colors.reset}\n`);

  // Set environment variables for enhanced debugging
  const env = {
    ...process.env,
    DEBUG: verbose ? "*" : "syncstuff:*",
    NODE_ENV: "development",
    ELECTRON_ENABLE_LOGGING: "1",
    ELECTRON_DEBUG: "true",
  };

  const appPath = path.join(__dirname, "..", "apps", "mobileapp");
  const electronProcess = spawn("bun", ["run", "electron:dev"], {
    cwd: appPath,
    env,
    stdio: "inherit",
    shell: true,
  });

  electronProcess.on("close", (code) => {
    console.log(`\n${colors.yellow}Electron process exited with code ${code}${colors.reset}`);
    process.exit(code || 0);
  });

  // Handle Ctrl+C gracefully
  process.on("SIGINT", () => {
    console.log(`\n${colors.yellow}Stopping Electron...${colors.reset}`);
    electronProcess.kill();
    process.exit(0);
  });
}

main();
