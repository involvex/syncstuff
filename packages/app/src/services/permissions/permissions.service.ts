import { Network } from "@capacitor/network";
import { Capacitor } from "@capacitor/core";

export interface PermissionStatus {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
  restricted?: boolean;
}

export interface PermissionsState {
  camera: PermissionStatus;
  clipboard: PermissionStatus;
  notifications: PermissionStatus;
  storage: PermissionStatus;
  network: PermissionStatus;
  location?: PermissionStatus; // Optional, not all apps need location
}

class PermissionsService {
  private permissionsState: PermissionsState | null = null;

  async initialize(): Promise<PermissionsState> {
    if (this.permissionsState) {
      return this.permissionsState;
    }

    const platform = Capacitor.getPlatform();
    const networkStatus = await Network.getStatus();

    // Initialize permissions state
    this.permissionsState = {
      camera: await this.checkCameraPermission(),
      clipboard: await this.checkClipboardPermission(),
      notifications: await this.checkNotificationPermission(),
      storage: await this.checkStoragePermission(),
      network: {
        granted: networkStatus.connected,
        denied: !networkStatus.connected,
        prompt: false,
      },
    };

    // Add location permission for native platforms if needed
    if (platform !== "web") {
      this.permissionsState.location = await this.checkLocationPermission();
    }

    return this.permissionsState;
  }

  async getPermissionsState(): Promise<PermissionsState> {
    if (!this.permissionsState) {
      return await this.initialize();
    }
    return this.permissionsState;
  }

  async checkCameraPermission(): Promise<PermissionStatus> {
    try {
      if (typeof navigator !== "undefined" && navigator.permissions) {
        const result = await navigator.permissions.query({
          name: "camera" as PermissionName,
        });
        return {
          granted: result.state === "granted",
          denied: result.state === "denied",
          prompt: result.state === "prompt",
        };
      }
      // Fallback: assume prompt on web if permissions API not available
      return { granted: false, denied: false, prompt: true };
    } catch (error) {
      console.warn("Camera permission check failed:", error);
      return { granted: false, denied: false, prompt: true };
    }
  }

  async checkClipboardPermission(): Promise<PermissionStatus> {
    try {
      if (typeof navigator !== "undefined" && navigator.permissions) {
        const readResult = await navigator.permissions
          .query({
            name: "clipboard-read" as PermissionName,
          })
          .catch(() => null);
        const writeResult = await navigator.permissions
          .query({
            name: "clipboard-write" as PermissionName,
          })
          .catch(() => null);

        const readGranted = readResult?.state === "granted";
        const writeGranted = writeResult?.state === "granted";

        return {
          granted: readGranted && writeGranted,
          denied:
            readResult?.state === "denied" || writeResult?.state === "denied",
          prompt: !readGranted || !writeGranted,
        };
      }
      // Clipboard API might work without explicit permission on some browsers
      return { granted: true, denied: false, prompt: false };
    } catch (error) {
      console.warn("Clipboard permission check failed:", error);
      return { granted: false, denied: false, prompt: true };
    }
  }

  async checkNotificationPermission(): Promise<PermissionStatus> {
    try {
      if (typeof Notification !== "undefined") {
        const permission = Notification.permission;
        return {
          granted: permission === "granted",
          denied: permission === "denied",
          prompt: permission === "default",
        };
      }
      return { granted: false, denied: true, prompt: false };
    } catch (error) {
      console.warn("Notification permission check failed:", error);
      return { granted: false, denied: false, prompt: true };
    }
  }

  async checkStoragePermission(): Promise<PermissionStatus> {
    try {
      // Check if localStorage is available
      const testKey = "__permission_test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      return { granted: true, denied: false, prompt: false };
    } catch (_error) {
      return { granted: false, denied: true, prompt: false };
    }
  }

  async checkLocationPermission(): Promise<PermissionStatus> {
    try {
      if (typeof navigator !== "undefined" && navigator.permissions) {
        const result = await navigator.permissions.query({
          name: "geolocation" as PermissionName,
        });
        return {
          granted: result.state === "granted",
          denied: result.state === "denied",
          prompt: result.state === "prompt",
        };
      }
      return { granted: false, denied: false, prompt: true };
    } catch (error) {
      console.warn("Location permission check failed:", error);
      return { granted: false, denied: false, prompt: true };
    }
  }

  async requestCameraPermission(): Promise<boolean> {
    try {
      // For web, we can't directly request - it happens on first use
      // For native, this would use Capacitor plugins
      const status = await this.checkCameraPermission();
      return status.granted || status.prompt;
    } catch (error) {
      console.error("Failed to request camera permission:", error);
      return false;
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    try {
      if (typeof Notification !== "undefined") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
      }
      return false;
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      return false;
    }
  }

  async requestLocationPermission(): Promise<boolean> {
    try {
      return new Promise(resolve => {
        if (!navigator.geolocation) {
          resolve(false);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          () => resolve(true),
          () => resolve(false),
          { timeout: 1000 },
        );
      });
    } catch (error) {
      console.error("Failed to request location permission:", error);
      return false;
    }
  }

  async refresh(): Promise<PermissionsState> {
    this.permissionsState = null;
    return await this.initialize();
  }
}

export const permissionsService = new PermissionsService();
