import boxen from "boxen";
import chalk from "chalk";
import ora from "ora";
import Table from "table";

export function success(message: string): void {
  console.log(chalk.green(`✓ ${message}`));
}

export function error(message: string): void {
  console.log(chalk.red(`✗ ${message}`));
}

export function info(message: string): void {
  console.log(chalk.blue(`ℹ ${message}`));
}

export function warning(message: string): void {
  console.log(chalk.yellow(`⚠ ${message}`));
}

export function createSpinner(text: string): ReturnType<typeof ora> {
  return ora({
    text,
    spinner: "dots",
    color: "cyan",
  });
}

export function createBox(
  content: string,
  options?: Parameters<typeof boxen>[1],
): string {
  return boxen(content, {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "cyan",
    ...options,
  });
}

export function createTable(data: string[][], headers?: string[]): string {
  const tableData = headers ? [headers, ...data] : data;
  return Table.table(tableData, {
    border: Table.getBorderCharacters("norc"),
    header: headers
      ? {
          alignment: "center",
          content: headers.join(" | "),
        }
      : undefined,
  });
}

export function animateText(text: string, delay: number = 50): Promise<void> {
  return new Promise(resolve => {
    let index = 0;
    const interval = setInterval(() => {
      process.stdout.write(text[index] || "");
      index++;
      if (index >= text.length) {
        clearInterval(interval);
        process.stdout.write("\n");
        resolve();
      }
    }, delay);
  });
}

export function printHeader(): void {
  const header = chalk.cyan.bold(`
╔═══════════════════════════════════════╗
║        Syncstuff CLI v0.0.1          ║
║     Seamless Sync Across Devices      ║
╚═══════════════════════════════════════╝
  `);
  console.log(header);
}

export function printSeparator(): void {
  console.log(chalk.gray("─".repeat(50)));
}
