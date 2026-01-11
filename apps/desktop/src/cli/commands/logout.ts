import { apiClient } from "../../utils/api-client.js";
import { type CommandContext, debugLog } from "../../utils/context.js";
import { error, printHeader, printSeparator, success } from "../../utils/ui.js";

export async function logout(ctx: CommandContext): Promise<void> {
  printHeader();
  debugLog(ctx, "Starting logout flow");

  if (!apiClient.isAuthenticated()) {
    error("You are not logged in");
    process.exit(1);
  }

  try {
    await apiClient.logout();
    printSeparator();
    success("Logged out successfully");
    printSeparator();
  } catch (err) {
    error(`Logout error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}
