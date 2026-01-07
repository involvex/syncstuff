import chalk from "chalk";
import { apiClient } from "../../utils/api-client.js";
import { debugLog, type CommandContext } from "../../utils/context.js";
import {
  createSpinner,
  createTable,
  error,
  info,
  printHeader,
  printSeparator,
  success,
} from "../../utils/ui.js";

export async function listDevices(ctx: CommandContext): Promise<void> {
  printHeader();
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
        return;
      }

      const tableData = response.data.map(device => [
        device.id.substring(0, 8) + "...",
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
    } else {
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
    }
  } catch (err) {
    spinner.fail("Error fetching devices");
    error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}
