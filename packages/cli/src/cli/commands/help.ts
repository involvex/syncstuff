import chalk from "chalk";
import { createBox, printHeader, printSeparator } from "../../utils/ui.js";

const commandHelp: Record<string, string> = {
  login: `${chalk.cyan.bold("login")}

Log in to your Syncstuff account.

${chalk.bold("Usage:")}
  syncstuff login

${chalk.bold("Description:")}
  Authenticates with the Syncstuff API using your email and password.
  Your credentials are stored securely for future sessions.`,

  logout: `${chalk.cyan.bold("logout")}

Log out from your Syncstuff account.

${chalk.bold("Usage:")}
  syncstuff logout

${chalk.bold("Description:")}
  Clears your stored authentication credentials.`,

  whoami: `${chalk.cyan.bold("whoami")}

Display your user profile.

${chalk.bold("Usage:")}
  syncstuff whoami

${chalk.bold("Description:")}
  Shows information about the currently logged-in user.`,

  devices: `${chalk.cyan.bold("devices")}

List all your connected devices.

${chalk.bold("Usage:")}
  syncstuff devices

${chalk.bold("Description:")}
  Displays a table of all devices registered to your account,
  including their status, platform, and last seen time.`,

  device: `${chalk.cyan.bold("device")}

Connect to a specific device or list available devices.

${chalk.bold("Usage:")}
  syncstuff device [options] [deviceId]

${chalk.bold("Options:")}
  --list, -l    List all available devices

${chalk.bold("Examples:")}
  syncstuff device --list       List all devices
  syncstuff device              Interactive device selection
  syncstuff device abc123       Connect to device with ID abc123`,

  transfer: `${chalk.cyan.bold("transfer")}

Transfer a file to a connected device.

${chalk.bold("Usage:")}
  syncstuff transfer <file>

${chalk.bold("Description:")}
  Sends the specified file to a connected device.
  You must be connected to a device first.`,

  version: `${chalk.cyan.bold("version")}

Show CLI version.

${chalk.bold("Usage:")}
  syncstuff version
  syncstuff --version
  syncstuff -v`,
};

export async function showHelp(command?: string): Promise<void> {
  printHeader();

  // Show command-specific help if requested
  if (command && commandHelp[command]) {
    const helpContent = createBox(commandHelp[command], {
      title: `Help: ${command}`,
      titleAlignment: "center",
      padding: 1,
    });

    console.log(helpContent);
    printSeparator();
    return;
  }

  // Show general help
  const helpContent = createBox(
    chalk.cyan.bold("Available Commands\n\n") +
      chalk.bold("Authentication:\n") +
      "  " +
      chalk.green("login") +
      "               Login to your Syncstuff account\n" +
      "  " +
      chalk.green("logout") +
      "              Logout from your account\n" +
      "  " +
      chalk.green("whoami") +
      "              Display your user profile\n\n" +
      chalk.bold("Device Management:\n") +
      "  " +
      chalk.green("devices") +
      "             List all your connected devices\n" +
      "  " +
      chalk.green("device --list") +
      "       List available devices\n" +
      "  " +
      chalk.green("device <id>") +
      "         Connect to a specific device\n" +
      "  " +
      chalk.green("transfer <file>") +
      "     Transfer a file to a device\n\n" +
      chalk.bold("General:\n") +
      "  " +
      chalk.green("help [command]") +
      "      Show help (or command-specific help)\n" +
      "  " +
      chalk.green("version") +
      "             Show CLI version\n\n" +
      chalk.bold("Global Flags:\n") +
      "  " +
      chalk.yellow("-h, --help") +
      "          Show help for any command\n" +
      "  " +
      chalk.yellow("-d, --debug") +
      "         Enable debug mode\n\n" +
      chalk.gray("Examples:\n") +
      "  syncstuff devices -d     " +
      chalk.gray("List devices with debug output\n") +
      "  syncstuff device -h      " +
      chalk.gray("Show help for device command"),
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
