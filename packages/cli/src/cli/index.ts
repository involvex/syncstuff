#!/usr/bin/env node
export async function run() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log("@syncstuff/cli");
  console.log("=".repeat(50));
  console.log(`Command: ${command}`);

  if (!command || command === "--help" || command === "-h") {
    const { showHelp } = await import("./commands/help");
    showHelp();
    return;
  }

  switch (command) {
    case "login":
      {
        const { login } = await import("./commands/login");
        await login();
      }
      break;
    case "whoami":
      {
        const { whoami } = await import("./commands/whoami");
        await whoami();
      }
      break;
    case "logout":
      {
        const { logout } = await import("./commands/logout");
        await logout();
      }
      break;
    case "help":
      {
        const { showHelp } = await import("./commands/help");
        showHelp();
      }
      break;
    case "version":
    case "--version":
    case "-v": {
      const { showversion } = await import("./commands/version");
      showversion();
      return; // Exit after showing version
    }
    default:
      console.log(`❌ Unknown command: ${command}`);
      process.exit(1);
  }
}

run();
