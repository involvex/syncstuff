import chalk from "chalk";
import { type CommandContext, debugLog } from "../../utils/context.js";
import { type LocalDevice, networkScanner } from "../../utils/network.js";
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
 * Scan local network for SyncStuff devices
 * This works without cloud authentication
 */
export async function scanLocal(
  args: string[],
  ctx: CommandContext,
): Promise<void> {
  const timeout = args.includes("--timeout")
    ? Number.parseInt(args[args.indexOf("--timeout") + 1] || "10", 10)
    : 10;
  const continuous = args.includes("--watch") || args.includes("-w");

  printHeader();
  debugLog(ctx, "Scan command", { timeout, continuous });

  console.log(chalk.cyan("Scanning local network for SyncStuff devices..."));
  console.log(
    chalk.gray(`Timeout: ${timeout} seconds. Use --timeout N to change.\n`),
  );

  if (continuous) {
    await continuousScan(ctx, timeout);
  } else {
    await singleScan(ctx, timeout);
  }
}

async function singleScan(ctx: CommandContext, timeout: number): Promise<void> {
  const spinner = createSpinner("Scanning network...");
  spinner.start();

  try {
    const devices = await networkScanner.scan(timeout * 1000);

    if (devices.length === 0) {
      spinner.info("No devices found on local network");
      printSeparator();
      info("Make sure SyncStuff is running on other devices on this network.");
      info("Devices must be on the same local network (Wi-Fi or Ethernet).");
      printSeparator();
      return;
    }

    spinner.succeed(`Found ${devices.length} device(s) on local network`);
    printSeparator();

    displayDevices(devices);

    printSeparator();
    success(`Scan complete. Found ${devices.length} device(s).`);
    info("Use 'syncstuff transfer <file>' to send files to these devices.");
    printSeparator();
  } catch (err) {
    spinner.fail("Network scan failed");
    error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    debugLog(ctx, "Scan error", { error: err });
  }
}

async function continuousScan(
  ctx: CommandContext,
  timeout: number,
): Promise<void> {
  console.log(chalk.cyan("Watch mode enabled. Press Ctrl+C to exit.\n"));

  // Handle Ctrl+C gracefully
  process.on("SIGINT", () => {
    console.log("\n");
    info("Scan stopped by user");
    process.exit(0);
  });

  const knownDevices = new Map<string, LocalDevice>();

  while (true) {
    const spinner = createSpinner("Scanning...");
    spinner.start();

    try {
      const devices = await networkScanner.scan(timeout * 1000);

      // Check for new devices
      for (const device of devices) {
        if (!knownDevices.has(device.id)) {
          spinner.succeed(`New device found: ${chalk.cyan(device.name)}`);
          knownDevices.set(device.id, device);
        }
      }

      // Check for lost devices
      for (const [id, device] of knownDevices.entries()) {
        if (!devices.find(d => d.id === id)) {
          warning(`Device lost: ${device.name}`);
          knownDevices.delete(id);
        }
      }

      if (devices.length > 0) {
        spinner.stop();
        console.clear();
        printHeader();
        console.log(
          chalk.cyan(
            `Watch mode - ${new Date().toLocaleTimeString()} - Press Ctrl+C to exit.\n`,
          ),
        );
        displayDevices(devices);
      } else {
        spinner.info("No devices found. Retrying...");
      }
    } catch (err) {
      spinner.fail("Scan error, retrying...");
      debugLog(ctx, "Watch scan error", { error: err });
    }

    // Wait before next scan
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

function displayDevices(devices: LocalDevice[]): void {
  const tableData = devices.map(device => [
    `${device.id.substring(0, 8)}...`,
    device.name,
    device.platform,
    `${device.ip}:${device.port}`,
    device.version,
    chalk.green("Available"),
  ]);

  const table = createTable(tableData, [
    "ID",
    "Name",
    "Platform",
    "Address",
    "Version",
    "Status",
  ]);

  console.log(table);
}
