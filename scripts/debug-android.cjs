#!/usr/bin/env node
/**
 * Enhanced Android Debug Script
 * Filters adb logcat output to show only relevant Syncstuff app logs
 */

const { spawn } = require("child_process");
const path = require("path");

const PACKAGE_NAME = "io.ionic.starter"; // Update with actual package name if different
const APP_TAG = "Syncstuff";
const LOG_LEVELS = ["V", "D", "I", "W", "E", "F"]; // Verbose, Debug, Info, Warn, Error, Fatal

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function colorize(level, message) {
  switch (level) {
    case "E":
    case "F":
      return `${colors.red}${message}${colors.reset}`;
    case "W":
      return `${colors.yellow}${message}${colors.reset}`;
    case "I":
      return `${colors.green}${message}${colors.reset}`;
    case "D":
      return `${colors.blue}${message}${colors.reset}`;
    case "V":
      return `${colors.dim}${message}${colors.reset}`;
    default:
      return message;
  }
}

function parseLogLine(line) {
  // Android logcat format: MM-DD HH:MM:SS.mmm PID TID LEVEL TAG: MESSAGE
  const logPattern =
    /(\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\.\d{3})\s+(\d+)\s+(\d+)\s+([VDIWEF])\s+([^:]+):\s+(.+)/;
  const match = line.match(logPattern);

  if (!match) {
    return null;
  }

  const [, timestamp, pid, tid, level, tag, message] = match;
  return { timestamp, pid, tid, level, tag, message };
}

function shouldShowLog(log) {
  if (!log) return false;

  // Show logs from our app package
  if (log.tag.includes(PACKAGE_NAME) || log.tag.includes(APP_TAG)) {
    return true;
  }

  // Show WebRTC related logs
  if (
    log.message.includes("WebRTC") ||
    log.message.includes("PeerConnection") ||
    log.message.includes("DataChannel")
  ) {
    return true;
  }

  // Show network related logs
  if (
    log.message.includes("socket.io") ||
    log.message.includes("signaling") ||
    log.message.includes("network")
  ) {
    return true;
  }

  // Show Capacitor logs
  if (log.tag.includes("Capacitor") || log.tag.includes("CapacitorPlugins")) {
    return true;
  }

  // Show errors and warnings from any source
  if (log.level === "E" || log.level === "F" || log.level === "W") {
    return true;
  }

  return false;
}

function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes("--verbose") || args.includes("-v");
  const clear = args.includes("--clear") || args.includes("-c");
  const level = args.find(arg => LOG_LEVELS.includes(arg)) || "I"; // Default to Info level

  console.log(
    `${colors.cyan}${colors.bright}🔍 Syncstuff Android Debug Logger${colors.reset}`,
  );
  console.log(`${colors.dim}Filtering logs for: ${APP_TAG}${colors.reset}\n`);

  // Clear logcat buffer if requested
  if (clear) {
    console.log(`${colors.yellow}Clearing logcat buffer...${colors.reset}`);
    const clearProcess = spawn("adb", ["logcat", "-c"]);
    clearProcess.on("close", () => {
      console.log(`${colors.green}Logcat cleared${colors.reset}\n`);
      startLogging(verbose, level);
    });
  } else {
    startLogging(verbose, level);
  }
}

function startLogging(verbose, level) {
  // Build logcat filter
  // Format: *:LEVEL tag1:LEVEL tag2:LEVEL
  // Show only relevant tags at specified level or higher
  const filterTags = [
    `${PACKAGE_NAME}:${level}`,
    `chromium:${level}`,
    `WebView:${level}`,
    `Capacitor:${level}`,
    "*:E", // Always show errors
    "*:F", // Always show fatal
  ];

  const logcatArgs = ["logcat", ...filterTags];

  if (verbose) {
    logcatArgs.push("-v", "time"); // Show timestamps
  }

  console.log(
    `${colors.dim}Starting logcat with filter: ${filterTags.join(" ")}${colors.reset}`,
  );
  console.log(`${colors.dim}Press Ctrl+C to stop${colors.reset}\n`);

  const logcat = spawn("adb", logcatArgs, {
    stdio: ["ignore", "pipe", "pipe"],
  });

  logcat.stdout.on("data", data => {
    const lines = data.toString().split("\n");
    lines.forEach(line => {
      if (!line.trim()) return;

      const log = parseLogLine(line);
      if (verbose || shouldShowLog(log)) {
        if (log) {
          const colored = colorize(log.level, line);
          process.stdout.write(colored + "\n");
        } else {
          process.stdout.write(line + "\n");
        }
      }
    });
  });

  logcat.stderr.on("data", data => {
    process.stderr.write(`${colors.red}${data}${colors.reset}`);
  });

  logcat.on("close", code => {
    console.log(
      `\n${colors.yellow}Logcat process exited with code ${code}${colors.reset}`,
    );
  });

  // Handle Ctrl+C gracefully
  process.on("SIGINT", () => {
    console.log(`\n${colors.yellow}Stopping logcat...${colors.reset}`);
    logcat.kill();
    process.exit(0);
  });
}

main();
