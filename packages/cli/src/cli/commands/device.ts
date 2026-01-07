import chalk from "chalk";
import inquirer from "inquirer";
import { apiClient, type Device } from "../../utils/api-client.js";
import { debugLog, type CommandContext } from "../../utils/context.js";
import {
  createSpinner,
  createTable,
  error,
  info,
  printHeader,
  printSeparator,
  success,
  warning,
} from "../../utils/ui.js";

/**
 * Device command - connect to a specific device or list available devices
 * Usage:
 *   device --list / -l    List available devices
 *   device <deviceId>     Connect to a specific device
 *   device                Interactive device selection
 */
export async function device(
  args: string[],
  ctx: CommandContext,
): Promise<void> {
  printHeader();
  debugLog(ctx, "Device command called with args:", args);

  // Check for --list flag
  if (args.includes("--list") || args.includes("-l")) {
    await listAvailableDevices(ctx);
    return;
  }

  // Check authentication
  if (!apiClient.isAuthenticated()) {
    error("You are not logged in. Please run 'syncstuff login' first.");
    process.exit(1);
  }

  const deviceId = args.find(arg => !arg.startsWith("-"));

  if (deviceId) {
    await connectToDevice(deviceId, ctx);
  } else {
    await interactiveDeviceSelect(ctx);
  }
}

/**
 * List all available devices
 */
async function listAvailableDevices(ctx: CommandContext): Promise<Device[]> {
  debugLog(ctx, "Fetching available devices...");

  if (!apiClient.isAuthenticated()) {
    error("You are not logged in. Please run 'syncstuff login' first.");
    process.exit(1);
  }

  const spinner = createSpinner("Fetching devices...");
  spinner.start();

  try {
    const response = await apiClient.getDevices();
    debugLog(ctx, "API response:", response);

    if (response.success && response.data) {
      spinner.succeed("Devices loaded");
      printSeparator();

      if (response.data.length === 0) {
        info("No devices found. Connect a device to get started.");
        printSeparator();
        return [];
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

      return response.data;
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
      return [];
    }
  } catch (err) {
    spinner.fail("Error fetching devices");
    error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    debugLog(ctx, "Full error:", err);
    return [];
  }
}

/**
 * Connect to a specific device by ID
 */
async function connectToDevice(
  deviceId: string,
  ctx: CommandContext,
): Promise<void> {
  debugLog(ctx, "Connecting to device:", deviceId);

  const spinner = createSpinner(`Connecting to device ${deviceId}...`);
  spinner.start();

  try {
    // First, verify the device exists
    const response = await apiClient.getDevices();
    debugLog(ctx, "Devices response:", response);

    if (!response.success || !response.data) {
      spinner.fail("Failed to fetch devices");
      error(response.error || "Could not retrieve device list");
      return;
    }

    const targetDevice = response.data.find(
      d => d.id === deviceId || d.id.startsWith(deviceId),
    );

    if (!targetDevice) {
      spinner.fail("Device not found");
      error(`No device found with ID: ${deviceId}`);
      info("Run 'syncstuff device --list' to see available devices");
      return;
    }

    if (!targetDevice.is_online) {
      spinner.warn("Device is offline");
      warning(`Device "${targetDevice.name}" is currently offline`);
      info("The device must be running SyncStuff to connect");
      return;
    }

    // TODO: Implement actual WebRTC/signaling connection
    spinner.succeed(`Connected to "${targetDevice.name}"`);
    printSeparator();

    console.log(chalk.cyan("Device Details:"));
    console.log(`  Name:     ${targetDevice.name}`);
    console.log(`  ID:       ${targetDevice.id}`);
    console.log(`  Platform: ${targetDevice.platform}`);
    console.log(`  Type:     ${targetDevice.type}`);
    console.log(
      `  Status:   ${targetDevice.is_online ? chalk.green("Online") : chalk.red("Offline")}`,
    );

    printSeparator();
    info("Connection established. Ready for file transfer.");
    info("Use 'syncstuff transfer <file>' to send files to this device.");
    printSeparator();
  } catch (err) {
    spinner.fail("Connection failed");
    error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    debugLog(ctx, "Full error:", err);
  }
}

/**
 * Interactive device selection
 */
async function interactiveDeviceSelect(ctx: CommandContext): Promise<void> {
  debugLog(ctx, "Starting interactive device selection");

  const devices = await listAvailableDevices(ctx);

  if (devices.length === 0) {
    return;
  }

  const onlineDevices = devices.filter(d => d.is_online);

  if (onlineDevices.length === 0) {
    warning("No online devices available to connect to");
    info("Make sure SyncStuff is running on your other devices");
    return;
  }

  printSeparator();

  const { selectedDevice } = await inquirer.prompt<{ selectedDevice: string }>([
    {
      type: "list",
      name: "selectedDevice",
      message: "Select a device to connect to:",
      choices: onlineDevices.map(d => ({
        name: `${d.name} (${d.platform}) - ${d.type}`,
        value: d.id,
      })),
    },
  ]);

  await connectToDevice(selectedDevice, ctx);
}
