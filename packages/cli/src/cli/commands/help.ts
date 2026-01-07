import chalk from "chalk";
import { createBox, printHeader, printSeparator } from "../../utils/ui.js";

export async function showHelp() {
  printHeader();

  const helpContent = createBox(
    chalk.cyan.bold("Available Commands\n\n") +
      chalk.bold("Authentication:\n") +
      "  " +
      chalk.green("login") +
      "              Login to your Syncstuff account\n" +
      "  " +
      chalk.green("logout") +
      "             Logout from your account\n" +
      "  " +
      chalk.green("whoami") +
      "             Display your user profile\n\n" +
      chalk.bold("Device Management:\n") +
      "  " +
      chalk.green("devices") +
      "            List all your connected devices\n" +
      "  " +
      chalk.green("transfer <file>") +
      "    Transfer a file to a device\n\n" +
      chalk.bold("General:\n") +
      "  " +
      chalk.green("help") +
      "              Show this help message\n" +
      "  " +
      chalk.green("version") +
      "           Show CLI version\n" +
      "  " +
      chalk.green("--version, -v") +
      "    Show CLI version",
    {
      title: "Syncstuff CLI Help",
      titleAlignment: "center",
      padding: 1,
    },
  );

  console.log(helpContent);
  printSeparator();
  console.log(
    chalk.gray(
      "For more information, visit: https://github.com/involvex/syncstuff",
    ),
  );
  printSeparator();
}
