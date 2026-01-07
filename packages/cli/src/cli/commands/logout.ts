import { apiClient } from "../../utils/api-client.js";
import { error, printHeader, printSeparator, success } from "../../utils/ui.js";

export async function logout(): Promise<void> {
  printHeader();

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
