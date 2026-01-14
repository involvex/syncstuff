export interface CommandContext {
  debug: boolean;
}

export interface ParsedArgs {
  command: string | undefined;
  flags: {
    debug: boolean;
    help: boolean;
  };
  commandArgs: string[];
}

/**
 * Parse command line arguments to extract global flags
 * Global flags: -d/--debug, -h/--help
 */
export function parseArgs(args: string[]): ParsedArgs {
  const flags = {
    debug: false,
    help: false,
  };

  const remainingArgs: string[] = [];

  for (const arg of args) {
    if (arg === "-d" || arg === "--debug") {
      flags.debug = true;
    } else if (arg === "-h" || arg === "--help") {
      flags.help = true;
    } else {
      remainingArgs.push(arg);
    }
  }

  return {
    command: remainingArgs[0],
    flags,
    commandArgs: remainingArgs.slice(1),
  };
}

/**
 * Debug logging - only outputs when debug mode is enabled
 */
export function debugLog(ctx: CommandContext, ...args: unknown[]): void {
  if (ctx.debug) {
    console.log("[DEBUG]", ...args);
  }
}

/**
 * Debug info logging
 */
export function debugInfo(ctx: CommandContext, ...args: unknown[]): void {
  if (ctx.debug) {
    console.log("[DEBUG INFO]", ...args);
  }
}

/**
 * Debug error logging
 */
export function debugError(ctx: CommandContext, ...args: unknown[]): void {
  if (ctx.debug) {
    console.error("[DEBUG ERROR]", ...args);
  }
}
