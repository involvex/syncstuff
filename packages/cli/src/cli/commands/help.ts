export async function showHelp() {
  console.log("Help Menu:");
  console.log("=".repeat(50));
  console.log("Commands:");
  console.log("=".repeat(50));
  console.log("help - Show this help menu");
  console.log("exit - Exit the program");
  console.log("clear - Clear the screen");
  console.log("version - Show the version of the program");
  console.log("=".repeat(50));
  console.log("Account Management:");
  console.log("=".repeat(50));
  console.log("login - Login to an account");
  console.log("whoami - view userdetails");
  console.log("logout - Logout of an account");
  console.log("=".repeat(50));
  console.log("Device Management:");
  console.log("=".repeat(50));
  console.log("devices - List all devices");
  console.log("device - Manage a device");
  console.log("transfer <file> - Transfer a file");
  console.log("=".repeat(50));
}
