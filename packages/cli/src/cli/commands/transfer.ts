import chalk from "chalk";
import { existsSync, statSync } from "fs";
import inquirer from "inquirer";
import { resolve } from "path";
import { apiClient } from "../../utils/api-client.js";
import {
  createSpinner,
  error,
  info,
  printHeader,
  printSeparator,
  success,
} from "../../utils/ui.js";

export async function transferFile(filePath?: string): Promise<void> {
  printHeader();

  if (!apiClient.isAuthenticated()) {
    error("You are not logged in. Please run 'syncstuff login' first.");
    process.exit(1);
  }

  let targetFile = filePath;

  // If no file path provided, prompt for it
  if (!targetFile) {
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
  const fileSize = (stats.size / 1024 / 1024).toFixed(2);

  info(`File: ${resolvedPath}`);
  info(`Size: ${fileSize} MB`);

  // Get device list
  const devicesSpinner = createSpinner("Fetching devices...");
  devicesSpinner.start();

  const devicesResponse = await apiClient.getDevices();
  devicesSpinner.stop();

  if (
    !devicesResponse.success ||
    !devicesResponse.data ||
    devicesResponse.data.length === 0
  ) {
    error(
      "No devices available. Please ensure at least one device is connected.",
    );
    process.exit(1);
  }

  // Prompt for device selection
  const deviceChoices = devicesResponse.data.map(device => ({
    name: `${device.name} (${device.platform}) - ${device.is_online ? "Online" : "Offline"}`,
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

  // Transfer file
  const transferSpinner = createSpinner(
    `Transferring ${chalk.cyan(resolvedPath)} to device...`,
  );
  transferSpinner.start();

  try {
    const transferResponse = await apiClient.transferFile(
      deviceAnswer.deviceId,
      resolvedPath,
    );

    if (transferResponse.success) {
      transferSpinner.succeed("File transfer initiated!");
      printSeparator();
      success(`Transfer ID: ${transferResponse.data?.transferId || "N/A"}`);
      info("File is being synced to the target device");
      printSeparator();
    } else {
      transferSpinner.fail("Transfer failed");
      if (
        transferResponse.error?.includes("404") ||
        transferResponse.error?.includes("Not found")
      ) {
        info("File transfer endpoint not yet implemented in API");
        info("This feature will be available soon!");
      } else {
        error(transferResponse.error || "Unknown error");
      }
    }
  } catch (err) {
    transferSpinner.fail("Transfer error");
    error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}
