import inquirer from "inquirer";
import { apiClient } from "../../utils/api-client.js";
import { debugLog, type CommandContext } from "../../utils/context.js";
import {
  createSpinner,
  error,
  info,
  printHeader,
  printSeparator,
  success,
} from "../../utils/ui.js";

export async function login(ctx: CommandContext): Promise<void> {
  printHeader();
  debugLog(ctx, "Starting login flow");

  try {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "email",
        message: "Email address:",
        validate: (input: string) => {
          if (!input || !input.includes("@")) {
            return "Please enter a valid email address";
          }
          return true;
        },
      },
      {
        type: "password",
        name: "password",
        message: "Password:",
        mask: "*",
        validate: (input: string) => {
          if (!input || input.length < 1) {
            return "Password cannot be empty";
          }
          return true;
        },
      },
    ]);

    const spinner = createSpinner("Logging in...");
    spinner.start();

    const response = await apiClient.login(answers.email, answers.password);

    if (response.success && response.data) {
      spinner.succeed("Login successful!");
      printSeparator();
      success(
        `Welcome, ${response.data.user.username || response.data.user.email}!`,
      );
      info(`Role: ${response.data.user.role}`);
      if (response.data.user.full_name) {
        info(`Name: ${response.data.user.full_name}`);
      }
      printSeparator();
    } else {
      spinner.fail("Login failed");
      error(response.error || "Invalid credentials");
      process.exit(1);
    }
  } catch (err) {
    error(`Login error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}
