#!/usr/bin/env node
import { debugLog, parseArgs, type CommandContext } from "../utils/context.js";
import { printHeader } from "../utils/ui.js";

export async function run() {
  const args = process.argv.slice(2);
  const { command, flags, commandArgs } = parseArgs(args);

  const ctx: CommandContext = { debug: flags.debug };

  // Debug mode: log parsed arguments
  debugLog(ctx, "Parsed arguments:", { command, flags, commandArgs });

  // Handle help flag - show command-specific or general help
  if (flags.help) {
    const { showHelp } = await import("./commands/help.js");
    await showHelp(command);
    return;
  }

  // Handle no command
  if (!command) {
    const { showHelp } = await import("./commands/help.js");
    await showHelp();
    return;
  }

  switch (command) {
    case "login":
      {
        const { login } = await import("./commands/login.js");
        await login(ctx);
      }
      break;
    case "whoami":
      {
        const { whoami } = await import("./commands/whoami.js");
        await whoami(ctx);
      }
      break;
    case "logout":
      {
        const { logout } = await import("./commands/logout.js");
        await logout(ctx);
      }
      break;
    case "devices":
      {
        const { listDevices } = await import("./commands/devices.js");
        await listDevices(ctx);
      }
      break;
    case "device":
      {
        const { device } = await import("./commands/device.js");
        await device(commandArgs, ctx);
      }
      break;
    case "transfer":
      {
        const { transferFile } = await import("./commands/transfer.js");
        await transferFile(commandArgs[0], ctx);
      }
      break;
    case "help":
      {
        const { showHelp } = await import("./commands/help.js");
        await showHelp(commandArgs[0]);
      }
      break;
    case "version":
    case "--version":
    case "-v": {
      const { showversion } = await import("./commands/version.js");
      showversion();
      return;
    }
    default:
      printHeader();
      console.log(`❌ Unknown command: ${command}`);
      console.log("Run 'syncstuff help' to see available commands");
      process.exit(1);
  }
}

run();
