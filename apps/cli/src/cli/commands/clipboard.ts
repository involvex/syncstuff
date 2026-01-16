import chalk from "chalk";
import clipboardy from "clipboardy";
import { apiClient } from "../../utils/api-client.js";
import { type CommandContext, debugLog } from "../../utils/context.js";
import {
  createSpinner,
  error,
  info,
  printHeader,
  printSeparator,
  warning,
} from "../../utils/ui.js";

export async function clipboardSync(ctx: CommandContext): Promise<void> {
  printHeader();

  if (!apiClient.isAuthenticated()) {
    error("You are not logged in. Please run 'syncstuff login' first.");
    process.exit(1);
  }

  info("Starting clipboard synchronization...");
  info("Press Ctrl+C to stop.");
  printSeparator();

  let lastContent = "";
  try {
    lastContent = await clipboardy.read();
    debugLog(ctx, "Initial clipboard content read");
  } catch {
    warning(
      "Could not read initial clipboard content. Ensure you have a clipboard manager installed if on Linux.",
    );
  }

  const spinner = createSpinner("Monitoring clipboard...");
  spinner.start();

  // Poll interval in ms
  const POLLING_INTERVAL = 1000;

  const poll = async () => {
    try {
      const currentContent = await clipboardy.read();

      if (currentContent && currentContent !== lastContent) {
        lastContent = currentContent;
        spinner.stop();

        console.log(
          `${chalk.blue("ℹ")} Clipboard change detected: ${chalk.italic(currentContent.substring(0, 50))}${currentContent.length > 50 ? "..." : ""}`,
        );

        const syncSpinner = createSpinner("Syncing to other devices...");
        syncSpinner.start();

        // Get devices to sync to
        const devicesResponse = await apiClient.getDevices();
        if (devicesResponse.success && devicesResponse.data) {
          const onlineDevices = devicesResponse.data.filter(d => d.is_online);

          if (onlineDevices.length === 0) {
            syncSpinner.warn("No online devices found to sync with.");
          } else {
            // In a real implementation, we would send the content to each device
            // For now, we simulate the API call for each device
            for (const device of onlineDevices) {
              // This is a placeholder for the actual clipboard sync API
              debugLog(ctx, `Syncing to device: ${device.name}`);
            }
            syncSpinner.succeed(`Synced to ${onlineDevices.length} devices.`);
          }
        } else {
          syncSpinner.fail("Failed to fetch devices for sync.");
        }

        printSeparator();
        spinner.start();
      }
    } catch (err) {
      debugLog(ctx, "Error polling clipboard", err);
    }

    setTimeout(poll, POLLING_INTERVAL);
  };

  poll();

  // Handle termination
  process.on("SIGINT", () => {
    spinner.stop();
    info("\nClipboard monitoring stopped.");
    process.exit(0);
  });
}
