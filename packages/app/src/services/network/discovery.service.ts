import type { PluginListenerHandle } from "@capacitor/core";
import {
  ZeroConf,
  type ZeroConfService,
  type ZeroConfWatchResult,
} from "capacitor-zeroconf";
import type { Device } from "../../types/device.types";
import {
  SYNCSTUFF_SERVICE_DOMAIN,
  SYNCSTUFF_SERVICE_PORT,
  SYNCSTUFF_SERVICE_TYPE,
  type DiscoveredDevice,
  type ServiceTxtRecord,
} from "../../types/network.types";
import { isNative } from "../../utils/platform.utils";

type DeviceFoundCallback = (device: DiscoveredDevice) => void;
type DeviceLostCallback = (deviceId: string) => void;

class DiscoveryService {
  private isRunning = false;
  private listenerHandle: PluginListenerHandle | null = null;
  private onDeviceFoundCallbacks: Set<DeviceFoundCallback> = new Set();
  private onDeviceLostCallbacks: Set<DeviceLostCallback> = new Set();

  /**
   * Check if the platform supports mDNS discovery
   */
  isSupported(): boolean {
    return isNative(); // Only works on native platforms (iOS/Android)
  }

  /**
   * Start discovering devices on the network
   */
  async startDiscovery(): Promise<void> {
    if (!this.isSupported()) {
      console.warn("mDNS discovery not supported on this platform");
      return;
    }

    if (this.isRunning) {
      console.warn("Discovery already running");
      return;
    }

    try {
      // Watch for services
      await ZeroConf.watch({
        domain: SYNCSTUFF_SERVICE_DOMAIN,
        type: SYNCSTUFF_SERVICE_TYPE,
      });

      this.isRunning = true;

      // Listen for discover events and store the handle for cleanup
      this.listenerHandle = await ZeroConf.addListener(
        "discover",
        (result: ZeroConfWatchResult) => {
          if (result.action === "added" || result.action === "resolved") {
            this.handleServiceAdded(result);
          } else if (result.action === "removed") {
            this.handleServiceRemoved(result);
          }
        },
      );

      console.log("Device discovery started");
    } catch (error) {
      console.error("Failed to start discovery:", error);
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Stop discovering devices
   */
  async stopDiscovery(): Promise<void> {
    if (!this.isRunning) {
      console.log("Discovery not running, nothing to stop");
      return;
    }

    console.log("Stopping discovery...");

    try {
      // Step 1: Unregister device first (if registered)
      try {
        await ZeroConf.stop();
        console.log("Device unregistered");
      } catch (error) {
        console.warn("Failed to unregister device:", error);
        // Continue with cleanup even if this fails
      }

      // Step 2: Remove the listener to prevent any more callbacks
      if (this.listenerHandle) {
        try {
          await this.listenerHandle.remove();
          this.listenerHandle = null;
          console.log("Discovery listener removed");
        } catch (error) {
          console.warn("Failed to remove listener:", error);
          this.listenerHandle = null;
        }
      }

      // Step 3: Clear all callbacks to prevent memory leaks
      this.onDeviceFoundCallbacks.clear();
      this.onDeviceLostCallbacks.clear();

      // Step 4: Stop watching for services
      try {
        await ZeroConf.unwatch({
          domain: SYNCSTUFF_SERVICE_DOMAIN,
          type: SYNCSTUFF_SERVICE_TYPE,
        });
        console.log("ZeroConf unwatch complete");
      } catch (error) {
        console.warn("Failed to unwatch:", error);
        // Continue with cleanup
      }

      // Step 5: Close the ZeroConf connection (only if everything else succeeded)
      try {
        await ZeroConf.close();
        console.log("ZeroConf closed");
      } catch (error) {
        console.warn("Failed to close ZeroConf:", error);
        // This is often expected if already closed
      }

      // Step 6: Mark as stopped
      this.isRunning = false;
      console.log("Device discovery stopped successfully");
    } catch (error) {
      console.error("Unexpected error while stopping discovery:", error);

      // Force reset state even on error to allow restart
      this.isRunning = false;
      this.listenerHandle = null;
      this.onDeviceFoundCallbacks.clear();
      this.onDeviceLostCallbacks.clear();

      console.log("Discovery state force reset despite error");
    }
  }

  /**
   * Register this device as a service
   */
  async registerDevice(currentDevice: Device): Promise<void> {
    if (!this.isSupported()) {
      console.warn("mDNS registration not supported on this platform");
      return;
    }

    try {
      const props: Record<string, string> = {
        version: "1.0",
        platform: currentDevice.platform,
        deviceId: currentDevice.id,
        deviceName: currentDevice.name,
      };

      await ZeroConf.register({
        domain: SYNCSTUFF_SERVICE_DOMAIN,
        type: SYNCSTUFF_SERVICE_TYPE,
        name: `${currentDevice.name}-${currentDevice.id.substring(0, 8)}`,
        port: SYNCSTUFF_SERVICE_PORT,
        props,
      });

      console.log("Device registered:", currentDevice.name);
    } catch (error) {
      console.error("Failed to register device:", error);
      throw error;
    }
  }

  /**
   * Unregister this device
   */
  async unregisterDevice(): Promise<void> {
    if (!this.isSupported()) {
      return;
    }

    try {
      await ZeroConf.stop();
      console.log("Device unregistered");
    } catch (error) {
      console.error("Failed to unregister device:", error);
    }
  }

  /**
   * Subscribe to device found events
   */
  onDeviceFound(callback: DeviceFoundCallback): () => void {
    this.onDeviceFoundCallbacks.add(callback);
    return () => {
      this.onDeviceFoundCallbacks.delete(callback);
    };
  }

  /**
   * Subscribe to device lost events
   */
  onDeviceLost(callback: DeviceLostCallback): () => void {
    this.onDeviceLostCallbacks.add(callback);
    return () => {
      this.onDeviceLostCallbacks.delete(callback);
    };
  }

  /**
   * Handle service added event
   */
  private handleServiceAdded(result: ZeroConfWatchResult): void {
    const service = result.service;
    if (!service) return;

    try {
      const txtRecord = service.txtRecord as unknown as ServiceTxtRecord;

      // Don't discover ourselves
      const currentDeviceId = txtRecord.deviceId;
      if (!currentDeviceId) return;

      const device: DiscoveredDevice = {
        id: txtRecord.deviceId,
        name: txtRecord.deviceName || service.name,
        platform: (txtRecord.platform as Device["platform"]) || "web",
        status: "discovered",
        lastSeen: new Date(),
        ipAddress: service.ipv4Addresses?.[0] || service.ipv6Addresses?.[0],
        port: service.port,
        service: service as ZeroConfService,
      };

      this.onDeviceFoundCallbacks.forEach(callback => callback(device));
    } catch (error) {
      console.error("Error handling service added:", error);
    }
  }

  /**
   * Handle service removed event
   */
  private handleServiceRemoved(result: ZeroConfWatchResult): void {
    const service = result.service;
    if (!service) return;

    try {
      const txtRecord = service.txtRecord as unknown as ServiceTxtRecord;
      const deviceId = txtRecord?.deviceId;

      if (deviceId) {
        this.onDeviceLostCallbacks.forEach(callback => callback(deviceId));
      }
    } catch (error) {
      console.error("Error handling service removed:", error);
    }
  }

  /**
   * Get discovery status
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }
}

// Export singleton instance
export const discoveryService = new DiscoveryService();
