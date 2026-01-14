import chalk from "chalk";
import { apiClient } from "../../utils/api-client.js";
import { type CommandContext, debugLog } from "../../utils/context.js";
import {
  createBox,
  createSpinner,
  error,
  printHeader,
  printSeparator,
} from "../../utils/ui.js";

export async function whoami(ctx: CommandContext): Promise<void> {
  printHeader();
  debugLog(ctx, "Fetching user profile");

  if (!apiClient.isAuthenticated()) {
    error("You are not logged in. Please run 'syncstuff login' first.");
    process.exit(1);
  }

  const spinner = createSpinner("Fetching user profile...");
  spinner.start();

  try {
    const response = await apiClient.getProfile();

    if (response.success && response.data) {
      spinner.succeed("Profile loaded");
      printSeparator();

      const user = response.data;

      const profileBox = createBox(
        chalk.cyan.bold("User Profile\n\n") +
          `${chalk.bold("ID:")}        ${user.id}\n` +
          `${chalk.bold("Email:")}      ${user.email}\n` +
          `${chalk.bold("Username:")}   ${user.username}\n` +
          (user.full_name
            ? `${chalk.bold("Full Name:")}  ${user.full_name}\n`
            : "") +
          `${chalk.bold("Role:")}       ${chalk.yellow(user.role)}\n` +
          `${chalk.bold("Status:")}     ${chalk.green(user.status)}\n` +
          `${chalk.bold("Created:")}    ${new Date(user.created_at).toLocaleString()}\n` +
          `${chalk.bold("Updated:")}    ${new Date(user.updated_at).toLocaleString()}`,
        {
          title: "Syncstuff Account",
          titleAlignment: "center",
        },
      );

      console.log(profileBox);
      printSeparator();
    } else {
      spinner.fail("Failed to fetch profile");
      error(response.error || "Unknown error");
      process.exit(1);
    }
  } catch (err) {
    spinner.fail("Error fetching profile");
    error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}
