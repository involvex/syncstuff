#!/usr/bin/env node
const { execFileSync } = require("child_process");
const path = require("path");

const binDir = __dirname;
const isWin = process.platform === "win32";
const exe = isWin ? "syncstuff.exe" : "syncstuff";
const exePath = path.join(binDir, exe);

try {
  execFileSync(exePath, process.argv.slice(2), {
    stdio: "inherit",
    windowsHide: false,
  });
} catch (e) {
  if (e.status != null) {
    process.exit(e.status);
  }
  console.error(
    `syncstuff-cli: executable not found at ${exePath}\nRun "bun run build:cli_dart" first.`,
  );
  process.exit(1);
}
