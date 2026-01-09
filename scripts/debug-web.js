#!/usr/bin/env node
/**
 * Enhanced Web Debug Script
 * Starts web dev server with enhanced logging and network debugging
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

  console.log(`${colors.cyan}${colors.bright}🌐 Syncstuff Web Debug Mode${colors.reset}`);
  console.log(`${colors.dim}Starting web dev server with enhanced logging...${colors.reset}\n`);

  // Set environment variables for enhanced debugging
  const env = {
    ...process.env,
    DEBUG: verbose ? "*" : "syncstuff:*",
    NODE_ENV: "development",
    VITE_DEBUG: "true",
    VITE_VERBOSE_LOGGING: verbose ? "true" : "false",
  };

  const webPath = path.join(__dirname, "..", "packages", "web");
  const devProcess = spawn("bun", ["run", "dev"], {
    cwd: webPath,
    env,
    stdio: "inherit",
    shell: true,
  });

  devProcess.on("close", (code) => {
    console.log(`\n${colors.yellow}Web dev server exited with code ${code}${colors.reset}`);
    process.exit(code || 0);
  });

  // Handle Ctrl+C gracefully
  process.on("SIGINT", () => {
    console.log(`\n${colors.yellow}Stopping web dev server...${colors.reset}`);
    devProcess.kill();
    process.exit(0);
  });
}

main();
