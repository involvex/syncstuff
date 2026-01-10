import { Device } from "@capacitor/device";
import { Network } from "@capacitor/network";
import { Capacitor } from "@capacitor/core";
import type { Platform } from "../../types/device.types";
import { cloudManagerService } from "../cloud/cloud-manager.service";

export interface DeviceInfo {
  id: string;
  name: string;
  platform: Platform;
  model: string;
  manufacturer: string;
  osVersion: string;
  appVersion: string;
  networkType: string;
  isConnected: boolean;
  lastSeen: Date;
}

class DeviceDetectionService {
  private deviceInfo: DeviceInfo | null = null;
  private isInitialized = false;
  private syncInterval: number | null = null;

  async initialize(): Promise<DeviceInfo> {
    if (this.isInitialized && this.deviceInfo) {
      return this.deviceInfo;
    }

    try {
      const [deviceInfo, deviceId, networkStatus] = await Promise.all([
        Device.getInfo(),
        Device.getId(),
        Network.getStatus(),
      ]);

      // Get device name from settings or use default
      const deviceName =
        (await this.getStoredDeviceName()) ||
        `${deviceInfo.manufacturer || ""} ${deviceInfo.model || ""}`.trim() ||
        "Syncstuff Device";

      const platform = Capacitor.getPlatform();
      this.deviceInfo = {
        id: deviceId.identifier || this.generateDeviceId(),
        name: deviceName,
        platform: (platform === "android"
          ? "android"
          : platform === "ios"
            ? "ios"
            : "web") as Platform,
        model: deviceInfo.model || "Unknown",
        manufacturer: deviceInfo.manufacturer || "Unknown",
        osVersion: deviceInfo.osVersion || "Unknown",
        appVersion: "0.0.1", // Will be updated from package.json if needed
        networkType: networkStatus.connectionType || "unknown",
        isConnected: networkStatus.connected,
        lastSeen: new Date(),
      };

      this.isInitialized = true;

      // Auto-register device when user is logged in
      await this.autoRegisterDevice();

      // Start periodic sync
      this.startPeriodicSync();

      return this.deviceInfo;
    } catch (error) {
      console.error("Device detection initialization error:", error);
      throw error;
    }
  }

  async getDeviceInfo(): Promise<DeviceInfo> {
    if (!this.deviceInfo) {
      return await this.initialize();
    }

    // Update network status
    try {
      const networkStatus = await Network.getStatus();
      if (this.deviceInfo) {
        this.deviceInfo.networkType = networkStatus.connectionType || "unknown";
        this.deviceInfo.isConnected = networkStatus.connected;
        this.deviceInfo.lastSeen = new Date();
      }
    } catch (error) {
      console.warn("Failed to update network status:", error);
    }

    return this.deviceInfo;
  }

  private generateDeviceId(): string {
    // Generate a unique device ID if not available
    return `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private async getStoredDeviceName(): Promise<string | null> {
    try {
      const stored = localStorage.getItem("device_name");
      return stored;
    } catch {
      return null;
    }
  }

  async setDeviceName(name: string): Promise<void> {
    if (this.deviceInfo) {
      this.deviceInfo.name = name;
      localStorage.setItem("device_name", name);
      await this.syncDeviceInfo();
    }
  }

  async autoRegisterDevice(): Promise<void> {
    // Check if user is logged in with any cloud account
    const providers = cloudManagerService.getAllProviders();
    let hasAuthenticatedAccount = false;

    for (const provider of providers) {
      if (cloudManagerService.isAuthenticated(provider.type)) {
        hasAuthenticatedAccount = true;
        break;
      }
    }

    if (hasAuthenticatedAccount && this.deviceInfo) {
      try {
        await this.syncDeviceInfo();
        console.log("Device auto-registered with cloud account");
      } catch (error) {
        console.warn("Failed to auto-register device:", error);
      }
    }
  }

  private async syncDeviceInfo(): Promise<void> {
    if (!this.deviceInfo) return;

    try {
      // Try to sync with SyncStuff API if authenticated
      if (cloudManagerService.isAuthenticated("syncstuff")) {
        const API_URL = "https://syncstuff-api.involvex.workers.dev/api";
        const syncstuffProvider = cloudManagerService.getProvider("syncstuff");

        if (syncstuffProvider) {
          const token = localStorage.getItem("syncstuff_token");
          if (token) {
            await fetch(`${API_URL}/devices/register`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                deviceId: this.deviceInfo.id,
                name: this.deviceInfo.name,
                platform: this.deviceInfo.platform,
                model: this.deviceInfo.model,
                manufacturer: this.deviceInfo.manufacturer,
                osVersion: this.deviceInfo.osVersion,
                appVersion: this.deviceInfo.appVersion,
              }),
            }).catch(error => {
              console.warn("Failed to sync device info:", error);
            });
          }
        }
      }
    } catch (error) {
      console.warn("Device sync error:", error);
    }
  }

  private startPeriodicSync(): void {
    // Sync device info every 5 minutes
    this.syncInterval = window.setInterval(
      () => {
        this.syncDeviceInfo();
      },
      5 * 60 * 1000,
    );
  }

  stopPeriodicSync(): void {
    if (this.syncInterval !== null) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async refresh(): Promise<DeviceInfo> {
    this.isInitialized = false;
    return await this.initialize();
  }
}

export const deviceDetectionService = new DeviceDetectionService();
