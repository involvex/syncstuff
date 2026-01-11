import { Device } from "@capacitor/device";
import { Haptics } from "@capacitor/haptics";
import { useDeviceStore } from "../../store/device.store";
import type {
  BatteryStatus,
  PingMessage,
  SyncMessage,
} from "../../types/network.types";
import { logger } from "../logging/logger.service";
import { webrtcService } from "../network/webrtc.service";
import { notificationService } from "../notifications/notification.service";

class RemoteActionService {
  private batteryInterval: ReturnType<typeof setInterval> | null = null;

  initialize() {
    webrtcService.onDataReceived((deviceId, data) => {
      this.handleIncomingMessage(deviceId, data as SyncMessage);
    });

    // Start battery reporting
    this.startBatteryReporting();
  }

  private handleIncomingMessage(deviceId: string, message: SyncMessage) {
    if (!message || !message.type) return;

    switch (message.type) {
      case "battery":
        this.handleBatteryUpdate(deviceId, message.payload as BatteryStatus);
        break;
      case "ring_device":
        this.handleRingRequest(deviceId);
        break;
      case "ping":
        this.handlePing(deviceId, message.payload as PingMessage);
        break;
      case "pong":
        this.handlePong(deviceId, message.payload as PingMessage);
        break;
    }
  }

  private handleBatteryUpdate(deviceId: string, status: BatteryStatus) {
    logger.debug(
      `Battery update from ${deviceId}: ${Math.round(status.level * 100)}% (${status.charging ? "Charging" : "Discharging"})`,
    );
    useDeviceStore.getState().updatePairedDevice(deviceId, {
      battery: status,
    });
  }

  private async handleRingRequest(deviceId: string) {
    const device = useDeviceStore
      .getState()
      .pairedDevices.find(d => d.id === deviceId);
    const name = device?.name || "Remote Device";

    notificationService.showNotification({
      title: "Find My Device",
      body: `${name} is looking for this device!`,
      shouldSync: false,
    });

    // Vibrate
    try {
      await Haptics.vibrate();
    } catch (e) {
      console.warn("Haptics not available", e);
    }
  }

  private handlePing(deviceId: string, payload: PingMessage) {
    logger.info(`Ping from ${deviceId}: ${payload.message}`);
    this.sendPong(deviceId);
  }

  private handlePong(deviceId: string, payload: PingMessage) {
    logger.info(`Pong from ${deviceId}: ${payload.message}`);
  }

  private async startBatteryReporting() {
    if (this.batteryInterval) clearInterval(this.batteryInterval);

    // Initial report
    await this.reportBattery();

    // Report every 5 minutes
    this.batteryInterval = setInterval(
      () => {
        this.reportBattery();
      },
      1000 * 60 * 5,
    );
  }

  private async reportBattery() {
    try {
      const info = await Device.getBatteryInfo();
      const status: BatteryStatus = {
        level: info.batteryLevel ?? 0,
        charging: info.isCharging ?? false,
      };

      webrtcService.broadcastData({
        type: "battery",
        payload: status,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      // Quietly fail as battery info might not be available on all browsers/platforms
      logger.debug("Failed to report battery status", e);
    }
  }

  sendPing(deviceId: string) {
    webrtcService.sendData(deviceId, {
      type: "ping",
      payload: {
        deviceId: useDeviceStore.getState().currentDevice?.id || "unknown",
        message:
          "Hello from " +
          (useDeviceStore.getState().currentDevice?.name || "Unknown"),
      },
      timestamp: new Date().toISOString(),
    });
  }

  sendPong(deviceId: string) {
    webrtcService.sendData(deviceId, {
      type: "pong",
      payload: {
        deviceId: useDeviceStore.getState().currentDevice?.id || "unknown",
        message: "Greetings back!",
      },
      timestamp: new Date().toISOString(),
    });
  }

  async ringDevice(deviceId: string) {
    webrtcService.sendData(deviceId, {
      type: "ring_device",
      payload: {},
      timestamp: new Date().toISOString(),
    });
  }
}

export const remoteActionService = new RemoteActionService();
