import chalk from "chalk";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Check if a newer version of the CLI is available on npm
 */
export async function checkForUpdates(): Promise<void> {
  try {
    // Get current version from package.json
    const packagePath = join(__dirname, "../../package.json");
    const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
    const currentVersion = packageJson.version;
    const packageName = packageJson.name;

    // Fetch latest version from npm registry
    const response = await fetch(
      `https://registry.npmjs.org/${packageName}/latest`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(3000), // 3 second timeout
      },
    );

    if (!response.ok) {
      return; // Silently fail if npm check fails
    }

    const data = (await response.json()) as { version: string };
    const latestVersion = data.version;

    // Compare versions
    if (latestVersion && latestVersion !== currentVersion) {
      const isNewer = compareVersions(latestVersion, currentVersion) > 0;

      if (isNewer) {
        console.log("");
        console.log(
          chalk.yellow.bold("╭─────────────────────────────────────────╮"),
        );
        console.log(
          chalk.yellow.bold("│") +
            chalk.yellow("  Update available! ") +
            chalk.gray(`${currentVersion}`) +
            chalk.yellow(" → ") +
            chalk.green.bold(`${latestVersion}`) +
            chalk.yellow.bold("  │"),
        );
        console.log(
          chalk.yellow.bold("│") +
            chalk.cyan(`  Run: npm i -g ${packageName}`) +
            " ".repeat(7) +
            chalk.yellow.bold("│"),
        );
        console.log(
          chalk.yellow.bold("╰─────────────────────────────────────────╯"),
        );
        console.log("");
      }
    }
  } catch {
    // Silently fail - update check is not critical
  }
}

/**
 * Compare two semantic versions
 * Returns: positive if a > b, negative if a < b, 0 if equal
 */
function compareVersions(a: string, b: string): number {
  const partsA = a.split(".").map(Number);
  const partsB = b.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    const partA = partsA[i] || 0;
    const partB = partsB[i] || 0;
    if (partA !== partB) {
      return partA - partB;
    }
  }
  return 0;
}
