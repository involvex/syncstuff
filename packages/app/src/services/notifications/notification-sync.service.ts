import { useSettingsStore } from "../../store/settings.store";
import { webrtcService } from "../network/webrtc.service";
import { notificationService } from "./notification.service";

export interface NotificationSyncEvent {
  type: "DISMISS" | "READ";
  notificationId: string;
  deviceId: string;
  timestamp: number;
}

class NotificationSyncService {
  private initialized = false;

  initialize() {
    if (this.initialized) return;

    // Listen for incoming sync events
    webrtcService.onDataReceived((deviceId, data) => {
      this.handleIncomingSync(deviceId, data);
    });

    this.initialized = true;
    console.log("NotificationSyncService initialized");
  }

  /**
   * Broadcast a notification dismissal to all connected peers
   */
  async broadcastDismiss(notificationId: string) {
    const event: NotificationSyncEvent = {
      type: "DISMISS",
      notificationId,
      deviceId: useSettingsStore.getState().deviceId,
      timestamp: Date.now(),
    };

    webrtcService.broadcastData({
      type: "NOTIFICATION_SYNC",
      payload: event,
    });
  }

  /**
   * Handle incoming sync messages
   */
  private handleIncomingSync(deviceId: string, message: unknown) {
    const msg = message as { type: string; payload: unknown };
    if (msg.type !== "NOTIFICATION_SYNC") return;

    const event = msg.payload as NotificationSyncEvent;

    if (event.type === "DISMISS") {
      console.log(
        `Received notification dismiss for ${event.notificationId} from ${deviceId}`,
      );
      // Dismiss local notification if it matches
      // Note: This matches pending logic. In a real app we'd map remote IDs to local IDs
      notificationService.clearNotification(event.notificationId);
    }
  }
}

export const notificationSyncService = new NotificationSyncService();
