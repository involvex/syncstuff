import { useSettingsStore } from "../../store/settings.store";
import { Capacitor } from "@capacitor/core";

type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  args: unknown[];
}

class LoggerService {
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 1000; // Keep last 1000 log entries
  private listeners: Array<(entry: LogEntry) => void> = [];

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

  private addToBuffer(
    level: LogLevel,
    message: string,
    ...args: unknown[]
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      args,
    };

    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(entry));
  }

  /**
   * Subscribe to log entries (useful for debug UI)
   */
  subscribe(listener: (entry: LogEntry) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get recent log entries
   */
  getLogs(limit?: number): LogEntry[] {
    if (limit) {
      return this.logBuffer.slice(-limit);
    }
    return [...this.logBuffer];
  }

  /**
   * Clear log buffer
   */
  clearLogs(): void {
    this.logBuffer = [];
  }

  /**
   * Android native logging support
   */
  private logToAndroid(
    level: LogLevel,
    message: string,
    ...args: unknown[]
  ): void {
    if (Capacitor.getPlatform() === "android") {
      try {
        // Use Android Log class via Capacitor bridge if available
        // This would require a custom Capacitor plugin, but for now we'll use console
        // which Android WebView captures in logcat
        const formatted = this.formatMessage(level, message, ...args);
        const tag = "Syncstuff";

        // Android logcat will capture console logs with proper tags
        switch (level) {
          case "DEBUG":
            console.debug(`[${tag}] ${formatted}`);
            break;
          case "INFO":
            console.info(`[${tag}] ${formatted}`);
            break;
          case "WARN":
            console.warn(`[${tag}] ${formatted}`);
            break;
          case "ERROR":
            console.error(`[${tag}] ${formatted}`);
            break;
        }
      } catch (_e) {
        // Fallback to regular console if Android logging fails
        console.log(this.formatMessage(level, message), ...args);
      }
    }
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.settings.devMode && this.settings.verboseLogging) {
      const formatted = this.formatMessage("DEBUG", message);
      console.debug(formatted, ...args);
      this.logToAndroid("DEBUG", message, ...args);
      this.addToBuffer("DEBUG", message, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.settings.devMode) {
      const formatted = this.formatMessage("INFO", message);
      console.info(formatted, ...args);
      this.logToAndroid("INFO", message, ...args);
      this.addToBuffer("INFO", message, ...args);
    } else {
      // Minimal logging in non-dev mode
      const minimal = `[Syncstuff] ${message}`;
      console.log(minimal);
      this.addToBuffer("INFO", message, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    const formatted = this.formatMessage("WARN", message);
    console.warn(formatted, ...args);
    this.logToAndroid("WARN", message, ...args);
    this.addToBuffer("WARN", message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    const formatted = this.formatMessage("ERROR", message);
    console.error(formatted, ...args);
    this.logToAndroid("ERROR", message, ...args);
    this.addToBuffer("ERROR", message, ...args);
  }

  /**
   * Special tracer for WebRTC handshake logic
   */
  traceHandshake(message: string, ...args: unknown[]): void {
    if (this.settings.devMode && this.settings.traceHandshake) {
      const formatted = `[HANDSHAKE] ${message}`;
      console.log(
        `%c${formatted}`,
        "color: #3b82f6; font-weight: bold;",
        ...args,
      );
      this.logToAndroid("DEBUG", `[HANDSHAKE] ${message}`, ...args);
      this.addToBuffer("DEBUG", `[HANDSHAKE] ${message}`, ...args);
    }
  }

  /**
   * Network request logger
   */
  logNetwork(
    method: string,
    url: string,
    status?: number,
    error?: string,
  ): void {
    if (this.settings.devMode && this.settings.verboseLogging) {
      const message = error
        ? `Network ${method} ${url} - Error: ${error}`
        : `Network ${method} ${url} - Status: ${status}`;
      this.info(message);
    }
  }

  /**
   * WebSocket logger
   */
  logWebSocket(event: string, data?: unknown): void {
    if (this.settings.devMode && this.settings.verboseLogging) {
      const message = data
        ? `WebSocket ${event}: ${JSON.stringify(data)}`
        : `WebSocket ${event}`;
      this.debug(message);
    }
  }
}

export const logger = new LoggerService();
export type { LogEntry };
