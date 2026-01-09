import { PushNotifications } from "@capacitor/push-notifications";
import { useSettingsStore } from "../../store/settings.store";
import type { SyncNotification } from "../../types/network.types";
import {
  isElectron,
  showElectronNotification,
} from "../../utils/electron.utils";
import { isNative } from "../../utils/platform.utils";
import { webrtcService } from "../network/webrtc.service";

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  requireInteraction?: boolean;
  silent?: boolean;
  shouldSync?: boolean; // New option to control if notification should be synced
}

class NotificationService {
  private permissionGranted = false;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  async initialize(): Promise<void> {
    if (isNative()) {
      const status = await PushNotifications.checkPermissions();
      this.permissionGranted = status.receive === "granted";
    } else {
      // Check if notifications are supported
      if (!("Notification" in window)) {
        console.warn("Notifications are not supported in this browser");
        return;
      }
      // Check current permission
      this.permissionGranted = Notification.permission === "granted";
    }

    // Register service worker for persistent notifications (if available on web)
    if (!isNative() && "serviceWorker" in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.ready;
      } catch (error) {
        console.warn("Service worker not available:", error);
      }
    }

    // Request permission if not already granted/denied
    if (!this.permissionGranted) {
      // For web, check if it's default
      if (!isNative() && Notification.permission === "default") {
        await this.requestPermission();
      }
    }

    // Setup sync listeners
    this.setupSyncListeners();
  }

  private setupSyncListeners(): void {
    webrtcService.onDataReceived((deviceId, message: unknown) => {
      const msg = message as { type: string; payload: SyncNotification };
      if (msg.type === "notification") {
        const notification = msg.payload;
        this.showNotification({
          title: `[${notification.originDeviceName}] ${notification.title}`,
          body: notification.body,
          data: { ...notification, fromRemote: true },
          shouldSync: false, // Don't re-sync remote notifications
        });
      }
    });
  }

  async requestPermission(): Promise<boolean> {
    if (isNative()) {
      const status = await PushNotifications.requestPermissions();
      this.permissionGranted = status.receive === "granted";
      return this.permissionGranted;
    }

    if (!("Notification" in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === "granted";
      return this.permissionGranted;
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      return false;
    }
  }

  async showNotification(options: NotificationOptions): Promise<void> {
    if (!this.permissionGranted) {
      const granted = await this.requestPermission();
      if (!granted) {
        console.warn("Notification permission not granted");
        return;
      }
    }

    try {
      const notificationOptions: NotificationOptions = {
        icon: options.icon || "/icons/icon-192x192.png",
        badge: options.badge || "/icons/icon-96x96.png",
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        ...options,
      };

      if (isNative()) {
        // Local Notifications for native
        // Note: local-notifications plugin would be better, but we only have push-notifications currently.
        // For now, we logging as we might need addLocalNotification call.
        console.log(
          "Showing native notification:",
          options.title,
          options.body,
        );
      } else if (isElectron()) {
        // Use Electron IPC
        await showElectronNotification(
          options.title,
          options.body,
          true, // onClick
        );
      } else if (this.serviceWorkerRegistration) {
        // Use service worker for persistent notifications
        await this.serviceWorkerRegistration.showNotification(
          options.title,
          notificationOptions,
        );
      } else {
        // Fallback to regular Notification API
        const notification = new Notification(
          options.title,
          notificationOptions,
        );

        // Auto-close after 5 seconds unless requireInteraction is true
        if (!notificationOptions.requireInteraction) {
          setTimeout(() => {
            notification.close();
          }, 5000);
        }

        // Handle click
        notification.onclick = event => {
          event.preventDefault();
          window.focus();
          if (notificationOptions.data?.url) {
            window.open(notificationOptions.data.url as string, "_blank");
          }
          notification.close();
        };
      }

      // Sync to other devices if requested
      if (options.shouldSync !== false) {
        this.syncNotification(options);
      }
    } catch (error) {
      console.error("Failed to show notification:", error);
    }
  }

  private async syncNotification(options: NotificationOptions): Promise<void> {
    const { deviceId, deviceName } = useSettingsStore.getState();
    if (!deviceId) return;

    const syncMsg = {
      type: "notification",
      payload: {
        id: Math.random().toString(36).substring(7),
        title: options.title,
        body: options.body,
        icon: options.icon,
        originDeviceId: deviceId,
        originDeviceName: deviceName,
        platform: isNative() ? "android" : "web",
        timestamp: new Date().toISOString(),
        actionUrl: options.data?.url as string,
      } as SyncNotification,
    };

    webrtcService.broadcastData(syncMsg);
  }

  async showSyncNotification(
    type: "success" | "error" | "info",
    message: string,
  ): Promise<void> {
    await this.showNotification({
      title: `Sync ${type === "success" ? "Complete" : type === "error" ? "Failed" : "Update"}`,
      body: message,
      icon: `/icons/icon-192x192.png`,
      tag: `sync-${type}`,
      requireInteraction: type === "error",
    });
  }

  async showCloudAccountNotification(
    provider: string,
    action: "connected" | "disconnected" | "error",
  ): Promise<void> {
    const messages = {
      connected: `Successfully connected to ${provider}`,
      disconnected: `Disconnected from ${provider}`,
      error: `Failed to connect to ${provider}`,
    };

    await this.showNotification({
      title: "Cloud Account",
      body: messages[action],
      icon: `/icons/icon-192x192.png`,
      tag: `cloud-${provider}-${action}`,
    });
  }

  async showDeviceNotification(
    deviceName: string,
    action: "connected" | "disconnected" | "file-received",
  ): Promise<void> {
    const messages = {
      connected: `${deviceName} is now connected`,
      disconnected: `${deviceName} disconnected`,
      "file-received": `Received file from ${deviceName}`,
    };

    await this.showNotification({
      title: "Device Update",
      body: messages[action],
      icon: `/icons/icon-192x192.png`,
      tag: `device-${action}`,
      requireInteraction: action === "file-received",
    });
  }

  async showTransferNotification(
    status: "started" | "progress" | "completed" | "failed",
    fileName?: string,
    progress?: number,
  ): Promise<void> {
    const titles = {
      started: "Transfer Started",
      progress: "Transferring...",
      completed: "Transfer Complete",
      failed: "Transfer Failed",
    };

    let body = "";
    if (status === "progress" && progress !== undefined) {
      body = `${fileName || "File"}: ${Math.round(progress)}%`;
    } else if (fileName) {
      body = fileName;
    } else {
      body = titles[status];
    }

    await this.showNotification({
      title: titles[status],
      body,
      icon: `/icons/icon-192x192.png`,
      tag: `transfer-${status}`,
      data: { fileName, progress },
      requireInteraction: status === "completed" || status === "failed",
    });
  }

  isPermissionGranted(): boolean {
    return this.permissionGranted;
  }

  async checkPermission(): Promise<"granted" | "denied" | "default"> {
    if (!("Notification" in window)) {
      return "denied";
    }
    return Notification.permission as "granted" | "denied" | "default";
  }

  async clearNotification(tagOrId: string): Promise<void> {
    if (isNative()) {
      // Capacitor Push Notifications doesn't support clearing by ID easily yet
      // but we can remove all delivered
      // await PushNotifications.removeAllDeliveredNotifications();
      console.log("Cleared notification locally:", tagOrId);
    } else if (this.serviceWorkerRegistration) {
      const notifications =
        await this.serviceWorkerRegistration.getNotifications({ tag: tagOrId });
      notifications.forEach(n => n.close());
    }
  }
}

export const notificationService = new NotificationService();
