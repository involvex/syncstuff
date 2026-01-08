import { useSettingsStore } from "../../store/settings.store";

type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

class LoggerService {
  private get settings() {
    return useSettingsStore.getState();
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    ..._args: unknown[]
  ): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.settings.devMode && this.settings.verboseLogging) {
      console.debug(this.formatMessage("DEBUG", message), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.settings.devMode) {
      console.info(this.formatMessage("INFO", message), ...args);
    } else {
      // Minimal logging in non-dev mode
      console.log(`[Syncstuff] ${message}`);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(this.formatMessage("WARN", message), ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(this.formatMessage("ERROR", message), ...args);
  }

  /**
   * Special tracer for WebRTC handshake logic
   */
  traceHandshake(message: string, ...args: unknown[]): void {
    if (this.settings.devMode && this.settings.traceHandshake) {
      console.log(
        `%c[HANDSHAKE] ${message}`,
        "color: #3b82f6; font-weight: bold;",
        ...args,
      );
    }
  }
}

export const logger = new LoggerService();
