import chalk from "chalk";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createBox, printHeader, printSeparator } from "../../utils/ui.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function showversion() {
  printHeader();

  try {
    const packagePath = join(__dirname, "../../../package.json");
    const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
    const version = packageJson.version;

    const versionBox = createBox(
      chalk.cyan.bold("Syncstuff CLI\n\n") +
        chalk.bold("Version:") +
        ` ${chalk.green(version)}\n` +
        chalk.bold("Package:") +
        ` @involvex/syncstuff-cli`,
      {
        title: "Version Information",
        titleAlignment: "center",
      },
    );

    console.log(versionBox);
    printSeparator();
  } catch {
    console.log(chalk.yellow("Version: 0.0.1 (unable to read package.json)"));
  }
}
