/**
 * Electron-specific utilities and integrations
 * Used when the app is running in Electron desktop mode
 */

declare global {
  interface Window {
    electron?: {
      // Window controls
      windowMinimize: () => Promise<void>;
      windowMaximize: () => Promise<void>;
      windowClose: () => Promise<void>;
      windowShow: () => Promise<void>;
      windowHide: () => Promise<void>;

      // Tray
      traySet: (options: { tooltip?: string }) => Promise<void>;

      // Notifications
      showNotification: (options: {
        title: string;
        body: string;
        icon?: string;
        onClick?: boolean;
      }) => Promise<{ success: boolean }>;

      // File system
      fs: {
        readFile: (filePath: string) => Promise<{
          success: boolean;
          data?: string;
          error?: string;
        }>;
        writeFile: (
          filePath: string,
          content: string,
        ) => Promise<{ success: boolean; error?: string }>;
        exists: (filePath: string) => Promise<{
          success: boolean;
          exists?: boolean;
          error?: string;
        }>;
      };

      // Device sync
      sync: {
        deviceConnected: (deviceInfo: {
          name: string;
          id: string;
        }) => Promise<{ success: boolean }>;
        deviceDisconnected: (deviceInfo: {
          name: string;
          id: string;
        }) => Promise<{ success: boolean }>;
        transferStarted: (transferInfo: {
          fileName: string;
          size: number;
        }) => Promise<{ success: boolean }>;
        transferComplete: (transferInfo: {
          fileName: string;
          size: number;
        }) => Promise<{ success: boolean }>;
        transferFailed: (transferInfo: {
          fileName: string;
          error: string;
        }) => Promise<{ success: boolean }>;
      };

      // Updates
      checkForUpdates: () => Promise<{
        success: boolean;
        updateAvailable: boolean;
      }>;

      // Event listeners
      on: (channel: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (
        channel: string,
        callback: (...args: unknown[]) => void,
      ) => void;

      // Platform info
      platform: string;
      isElectron: boolean;
    };
  }
}

/**
 * Check if the app is running in Electron
 */
export function isElectron(): boolean {
  return typeof window !== "undefined" && window.electron?.isElectron === true;
}

/**
 * Get the current platform
 */
export function getPlatform(): string {
  if (isElectron()) {
    return window.electron?.platform || "unknown";
  }
  return "web";
}

/**
 * Show a native notification (Electron only)
 */
export async function showElectronNotification(
  title: string,
  body: string,
  onClick = false,
): Promise<void> {
  if (isElectron() && window.electron) {
    await window.electron.showNotification({ title, body, onClick });
  }
}

/**
 * Notify Electron about device connection
 */
export async function notifyDeviceConnected(
  name: string,
  id: string,
): Promise<void> {
  if (isElectron() && window.electron) {
    await window.electron.sync.deviceConnected({ name, id });
  }
}

/**
 * Notify Electron about device disconnection
 */
export async function notifyDeviceDisconnected(
  name: string,
  id: string,
): Promise<void> {
  if (isElectron() && window.electron) {
    await window.electron.sync.deviceDisconnected({ name, id });
  }
}

/**
 * Notify Electron about transfer start
 */
export async function notifyTransferStarted(
  fileName: string,
  size: number,
): Promise<void> {
  if (isElectron() && window.electron) {
    await window.electron.sync.transferStarted({ fileName, size });
  }
}

/**
 * Notify Electron about transfer completion
 */
export async function notifyTransferComplete(
  fileName: string,
  size: number,
): Promise<void> {
  if (isElectron() && window.electron) {
    await window.electron.sync.transferComplete({ fileName, size });
  }
}

/**
 * Notify Electron about transfer failure
 */
export async function notifyTransferFailed(
  fileName: string,
  error: string,
): Promise<void> {
  if (isElectron() && window.electron) {
    await window.electron.sync.transferFailed({ fileName, error });
  }
}
