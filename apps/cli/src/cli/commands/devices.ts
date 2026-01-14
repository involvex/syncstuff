import chalk from "chalk";
import { apiClient } from "../../utils/api-client.js";
import { type CommandContext, debugLog } from "../../utils/context.js";
import {
  createSpinner,
  createTable,
  error,
  info,
  printHeader,
  printSeparator,
  success,
} from "../../utils/ui.js";

/**
 * List devices command
 * Options:
 *   --loop    Continuously refresh devices until Ctrl+C
 */
export async function listDevices(
  args: string[],
  ctx: CommandContext,
): Promise<void> {
  const isLoop = args.includes("--loop") || args.includes("-l");

  debugLog(ctx, "Devices command", { loop: isLoop });

  if (isLoop) {
    await loopDevices(ctx);
  } else {
    printHeader();
    await fetchAndDisplayDevices(ctx);
  }
}

/**
 * Fetch and display devices once
 */
async function fetchAndDisplayDevices(ctx: CommandContext): Promise<boolean> {
  debugLog(ctx, "Fetching devices list");

  if (!apiClient.isAuthenticated()) {
    error("You are not logged in. Please run 'syncstuff login' first.");
    process.exit(1);
  }

  const spinner = createSpinner("Fetching devices...");
  spinner.start();

  try {
    const response = await apiClient.getDevices();

    if (response.success && response.data) {
      spinner.succeed("Devices loaded");
      printSeparator();

      if (response.data.length === 0) {
        info("No devices found. Connect a device to get started.");
        printSeparator();
        return true;
      }

      const tableData = response.data.map(device => [
        `${device.id.substring(0, 8)}...`,
        device.name,
        device.type,
        device.platform,
        device.is_online ? chalk.green("Online") : chalk.red("Offline"),
        new Date(device.last_seen).toLocaleString(),
      ]);

      const table = createTable(tableData, [
        "ID",
        "Name",
        "Type",
        "Platform",
        "Status",
        "Last Seen",
      ]);

      console.log(table);
      printSeparator();
      success(`Found ${response.data.length} device(s)`);
      printSeparator();
      return true;
    }
    spinner.fail("Failed to fetch devices");
    if (
      response.error?.includes("404") ||
      response.error?.includes("Not found")
    ) {
      info("Devices endpoint not yet implemented in API");
      info("This feature will be available soon!");
    } else {
      error(response.error || "Unknown error");
    }
    return false;
  } catch (err) {
    spinner.fail("Error fetching devices");
    error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

/**
 * Loop mode: continuously refresh devices
 */
async function loopDevices(ctx: CommandContext): Promise<void> {
  const REFRESH_INTERVAL = 5000; // 5 seconds

  console.clear();
  printHeader();
  console.log(chalk.cyan("Loop mode enabled. Press Ctrl+C to exit."));
  console.log(
    chalk.gray(`Refreshing every ${REFRESH_INTERVAL / 1000} seconds...\n`),
  );

  // Handle Ctrl+C gracefully
  process.on("SIGINT", () => {
    console.log("\n");
    info("Loop stopped by user");
    process.exit(0);
  });

  // Initial fetch
  await fetchAndDisplayDevices(ctx);

  // Set up refresh loop
  const interval = setInterval(async () => {
    console.clear();
    printHeader();
    console.log(chalk.cyan("Loop mode enabled. Press Ctrl+C to exit."));
    console.log(
      chalk.gray(`Last refresh: ${new Date().toLocaleTimeString()}\n`),
    );
    await fetchAndDisplayDevices(ctx);
  }, REFRESH_INTERVAL);

  // Keep the process running
  await new Promise(() => {
    // This promise never resolves - we wait for SIGINT
  });

  clearInterval(interval);
}
