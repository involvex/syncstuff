import type {
  ActionPerformed,
  PushNotificationSchema,
  Token,
} from "@capacitor/push-notifications";
import { PushNotifications } from "@capacitor/push-notifications";
import { isNative } from "../../utils/platform.utils";

export interface PushNotificationCallbacks {
  onRegistration?: (token: Token) => void;
  onRegistrationError?: (error: unknown) => void;
  onPushReceived?: (notification: PushNotificationSchema) => void;
  onPushActionPerformed?: (action: ActionPerformed) => void;
}

/**
 * Push Notifications Service
 * Handles registration, receiving, and acting on push notifications
 */
class PushNotificationService {
  private initialized = false;
  private callbacks: PushNotificationCallbacks = {};

  /**
   * Initialize push notifications
   */
  async initialize(callbacks?: PushNotificationCallbacks): Promise<boolean> {
    if (!isNative()) {
      console.log("Push notifications not supported on web");
      return false;
    }

    if (this.initialized) {
      return true;
    }

    this.callbacks = callbacks || {};

    // Check and request permissions
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === "prompt") {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== "granted") {
      console.warn("Push notification permission not granted");
      return false;
    }

    // Register for push notifications
    await PushNotifications.register();

    // Set up listeners
    await this.setupListeners();

    this.initialized = true;
    return true;
  }

  private async setupListeners(): Promise<void> {
    // On registration success
    await PushNotifications.addListener("registration", (token: Token) => {
      console.log("Push registration success, token:", token.value);
      this.callbacks.onRegistration?.(token);
    });

    // On registration error
    await PushNotifications.addListener("registrationError", error => {
      console.error("Push registration error:", error);
      this.callbacks.onRegistrationError?.(error);
    });

    // On push notification received (foreground)
    await PushNotifications.addListener(
      "pushNotificationReceived",
      (notification: PushNotificationSchema) => {
        console.log("Push notification received:", notification);
        this.callbacks.onPushReceived?.(notification);
      },
    );

    // On push notification action performed (user tapped)
    await PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (action: ActionPerformed) => {
        console.log("Push notification action performed:", action);
        this.callbacks.onPushActionPerformed?.(action);
      },
    );
  }

  /**
   * Get the list of delivered notifications
   */
  async getDeliveredNotifications() {
    const { notifications } =
      await PushNotifications.getDeliveredNotifications();
    return notifications;
  }

  /**
   * Remove specific delivered notifications
   */
  async removeDeliveredNotifications(ids: string[]): Promise<void> {
    const { notifications } =
      await PushNotifications.getDeliveredNotifications();
    const toRemove = notifications.filter(n => ids.includes(n.id));
    if (toRemove.length > 0) {
      await PushNotifications.removeDeliveredNotifications({
        notifications: toRemove,
      });
    }
  }

  /**
   * Remove all delivered notifications
   */
  async removeAllDeliveredNotifications(): Promise<void> {
    await PushNotifications.removeAllDeliveredNotifications();
  }

  /**
   * Clean up listeners
   */
  async destroy(): Promise<void> {
    await PushNotifications.removeAllListeners();
    this.initialized = false;
  }
}

export const pushNotificationService = new PushNotificationService();
