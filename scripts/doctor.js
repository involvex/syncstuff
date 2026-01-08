const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🩺 SyncStuff Doctor - Diagnosing environment...\n");

const checkCommand = (cmd) => {
  try {
    execSync(cmd, { stdio: "ignore" });
    return true;
  } catch (e) {
    return false;
  }
};

// 1. Check basic tools
console.log("--- 🛠️ Tools ---");
console.log(`Node: ${process.version}`);
console.log(
  `Bun: ${checkCommand("bun --version") ? "✅ Found" : "❌ Not Found"}`
);
console.log(
  `ADB: ${checkCommand("adb version") ? "✅ Found" : "❌ Not Found"}`
);
console.log(
  `Git: ${checkCommand("git --version") ? "✅ Found" : "❌ Not Found"}`
);

// 2. Check workspaces
console.log("\n--- 📦 Workspaces ---");
const packages = ["app", "web", "api", "cli", "database", "shared"];
packages.forEach((pkg) => {
  const pkgPath = path.join(__dirname, "..", "packages", pkg, "package.json");
  if (fs.existsSync(pkgPath)) {
    console.log(`✅ ${pkg}: Found`);
  } else {
    console.log(`❌ ${pkg}: Missing`);
  }
});

// 3. Check Android specifically
console.log("\n--- 🤖 Android ---");
const androidPath = path.join(__dirname, "..", "packages", "app", "android");
if (fs.existsSync(androidPath)) {
  console.log("✅ Android folder: Found");
  try {
    const localProps = fs.readFileSync(
      path.join(androidPath, "local.properties"),
      "utf8"
    );
    console.log("✅ local.properties: Found");
  } catch (e) {
    console.log("⚠️ local.properties: Missing (Needed for Android builds)");
  }
} else {
  console.log("❌ Android folder: Missing");
}

// 4. Check Signaling Server
console.log("\n--- 📡 Connectivity ---");
const signalingPath = path.join(
  __dirname,
  "..",
  "packages",
  "app",
  "signaling-server.cjs"
);
if (fs.existsSync(signalingPath)) {
  console.log("✅ Signaling Server script: Found");
} else {
  console.log("❌ Signaling Server script: Missing");
}

console.log("\n--- 📋 Recommendation ---");
console.log(
  'If you see ❌, please ensure you have run "bun install" and have the necessary tools installed.'
);
console.log('To debug Android, try: "bun run debug:android"');
console.log(
  "To check Web port (3000), make sure no other process is using it.\n"
);
