import boxen from "boxen";
import chalk from "chalk";
import { table } from "table";
import { apiClient } from "../../utils/api-client.js";
import { type CommandContext, debugLog } from "../../utils/context.js";
import {
  createSpinner,
  error,
  info,
  printHeader,
  printSeparator,
  success,
} from "../../utils/ui.js";

export async function showStatus(ctx: CommandContext): Promise<void> {
  printHeader();
  debugLog(ctx, "Showing status");

  if (!apiClient.isAuthenticated()) {
    info("Status: " + chalk.red("Not logged in"));
    info("Run 'syncstuff login' to get started.");
    return;
  }

  const spinner = createSpinner("Fetching status information...");
  spinner.start();

  try {
    const [profileRes, devicesRes] = await Promise.all([
      apiClient.getProfile(),
      apiClient.getDevices(),
    ]);

    spinner.stop();

    if (profileRes.success && profileRes.data) {
      const user = profileRes.data;
      console.log(
        boxen(
          `${chalk.bold("User:")} ${user.username} (${user.email})\n${chalk.bold("Role:")} ${user.role}\n${chalk.bold("Status:")} ${chalk.green(user.status)}`,
          {
            padding: 1,
            margin: 1,
            borderColor: "cyan",
            title: "Account Information",
          },
        ),
      );
    }

    if (devicesRes.success && devicesRes.data) {
      const devices = devicesRes.data;
      const onlineCount = devices.filter(d => d.is_online).length;

      console.log(
        `${chalk.bold("Devices:")} ${onlineCount} online / ${devices.length} total`,
      );

      if (devices.length > 0) {
        const deviceData = [
          [
            chalk.bold("Name"),
            chalk.bold("Platform"),
            chalk.bold("Status"),
            chalk.bold("Last Seen"),
          ],
          ...devices.map(d => [
            d.name,
            d.platform || d.type,
            d.is_online ? chalk.green("● Online") : chalk.red("○ Offline"),
            new Date(d.last_seen).toLocaleString(),
          ]),
        ];
        console.log(table(deviceData));
      }
    }

    printSeparator();
    success("SyncStuff is running and healthy.");
  } catch (err) {
    spinner.stop();
    error(
      "Failed to fetch status: " +
        (err instanceof Error ? err.message : String(err)),
    );
  }
}
