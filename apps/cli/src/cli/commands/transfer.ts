import chalk from "chalk";
import cliProgress from "cli-progress";
import { existsSync, statSync } from "fs";
import inquirer from "inquirer";
import { basename, resolve } from "path";
import { apiClient } from "../../utils/api-client.js";
import { type CommandContext, debugLog } from "../../utils/context.js";
import {
  createSpinner,
  error,
  info,
  printHeader,
  printSeparator,
  success,
  warning,
} from "../../utils/ui.js";

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export async function transferFile(
  filePath: string | undefined,
  ctx: CommandContext,
): Promise<void> {
  printHeader();
  debugLog(ctx, "Starting file transfer", { filePath });

  if (!apiClient.isAuthenticated()) {
    error("You are not logged in. Please run 'syncstuff login' first.");
    process.exit(1);
  }
  debugLog(ctx, "Authentication verified");

  let targetFile = filePath;

  // If no file path provided, prompt for it
  if (!targetFile) {
    debugLog(ctx, "No file path provided, prompting user");
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "filePath",
        message: "File path to transfer:",
        validate: (input: string) => {
          if (!input) {
            return "Please enter a file path";
          }
          const resolved = resolve(input);
          if (!existsSync(resolved)) {
            return "File does not exist";
          }
          if (!statSync(resolved).isFile()) {
            return "Path is not a file";
          }
          return true;
        },
      },
    ]);
    targetFile = answers.filePath;
  }

  if (!targetFile) {
    error("No file path provided");
    process.exit(1);
  }

  const resolvedPath = resolve(targetFile);
  debugLog(ctx, "Resolved file path", { resolvedPath });

  if (!existsSync(resolvedPath)) {
    error(`File not found: ${resolvedPath}`);
    process.exit(1);
  }

  if (!statSync(resolvedPath).isFile()) {
    error(`Path is not a file: ${resolvedPath}`);
    process.exit(1);
  }

  // Get file info
  const stats = statSync(resolvedPath);
  const fileName = basename(resolvedPath);
  const fileSize = formatFileSize(stats.size);

  debugLog(ctx, "File info", {
    name: fileName,
    size: stats.size,
    formattedSize: fileSize,
    modified: stats.mtime,
  });

  printSeparator();
  console.log(chalk.cyan("File Details:"));
  console.log(`  Name: ${chalk.bold(fileName)}`);
  console.log(`  Path: ${resolvedPath}`);
  console.log(`  Size: ${chalk.yellow(fileSize)}`);
  printSeparator();

  // Get device list
  const devicesSpinner = createSpinner("Fetching available devices...");
  devicesSpinner.start();

  debugLog(ctx, "Fetching devices from API");
  const devicesResponse = await apiClient.getDevices();
  debugLog(ctx, "Devices response", devicesResponse);

  devicesSpinner.stop();

  if (
    !devicesResponse.success ||
    !devicesResponse.data ||
    devicesResponse.data.length === 0
  ) {
    if (devicesResponse.error) {
      debugLog(ctx, "Devices API error", { error: devicesResponse.error });
      error(`Failed to fetch devices: ${devicesResponse.error}`);
    } else {
      warning("No devices available.");
      info("Make sure you have at least one device connected to your account.");
      info("Run 'syncstuff devices' to see your registered devices.");
    }
    process.exit(1);
  }

  const onlineDevices = devicesResponse.data.filter(d => d.is_online);
  debugLog(ctx, "Device counts", {
    total: devicesResponse.data.length,
    online: onlineDevices.length,
  });

  if (onlineDevices.length === 0) {
    warning("All devices are offline.");
    info("Start Syncstuff on your target device to receive files.");
    process.exit(1);
  }

  // Prompt for device selection
  const deviceChoices = devicesResponse.data.map(device => ({
    name: `${device.name} (${device.platform}) - ${device.is_online ? chalk.green("Online") : chalk.red("Offline")}`,
    value: device.id,
    disabled: !device.is_online ? "Offline" : false,
  }));

  const deviceAnswer = await inquirer.prompt([
    {
      type: "list",
      name: "deviceId",
      message: "Select target device:",
      choices: deviceChoices,
    },
  ]);

  const selectedDevice = devicesResponse.data.find(
    d => d.id === deviceAnswer.deviceId,
  );
  debugLog(ctx, "Selected device", selectedDevice);

  // Transfer file
  printSeparator();
  console.log(
    `Transferring ${chalk.cyan(fileName)} to ${chalk.yellow(selectedDevice?.name || "device")}...`,
  );

  const progressBar = new cliProgress.SingleBar({
    format: `${chalk.cyan("Progress")} |${chalk.cyan("{bar}")}| {percentage}% || {value}/{total} Chunks || Speed: {speed}`,
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
  });

  try {
    debugLog(ctx, "Initiating transfer API call", {
      deviceId: deviceAnswer.deviceId,
      filePath: resolvedPath,
    });

    // Start progress bar with simulated chunks (since real API is async/one-shot for now)
    progressBar.start(100, 0, { speed: "0MB/s" });

    const transferResponse = await apiClient.transferFile(
      deviceAnswer.deviceId,
      resolvedPath,
    );

    debugLog(ctx, "Transfer response", transferResponse);

    if (transferResponse.success) {
      // Simulate progress for UI feedback
      for (let i = 0; i <= 100; i += 10) {
        progressBar.update(i, {
          speed: (Math.random() * 5 + 2).toFixed(2) + "MB/s",
        });
        await new Promise(r => setTimeout(r, 50));
      }
      progressBar.stop();

      success("\nFile transfer initiated successfully!");
      printSeparator();
      success(`Transfer ID: ${transferResponse.data?.transferId || "N/A"}`);
      info(`File: ${fileName}`);
      info(`Size: ${fileSize}`);
      info(`Target: ${selectedDevice?.name || deviceAnswer.deviceId}`);
      info("File is being synced to the target device");
      printSeparator();
    } else {
      progressBar.stop();
      error("\nTransfer failed");
      if (
        transferResponse.error?.includes("404") ||
        transferResponse.error?.includes("Not found")
      ) {
        warning("File transfer endpoint not yet implemented in API");
        info("This feature will be available soon!");
        debugLog(ctx, "API endpoint not implemented");
      } else {
        error(transferResponse.error || "Unknown error occurred");
        debugLog(ctx, "Transfer error", { error: transferResponse.error });
      }
    }
  } catch (err) {
    progressBar.stop();
    error("\nTransfer error");
    const errorMessage = err instanceof Error ? err.message : String(err);
    error(`Error: ${errorMessage}`);
    debugLog(ctx, "Exception during transfer", { error: err });
    process.exit(1);
  }
}
