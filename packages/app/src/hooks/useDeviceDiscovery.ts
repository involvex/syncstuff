import { useCallback, useEffect } from "react";
import { discoveryService } from "../services/network/discovery.service";
import { webrtcService } from "../services/network/webrtc.service";
import { useDeviceStore } from "../store/device.store";
import { useSettingsStore } from "../store/settings.store";
import type { Device } from "../types/device.types";
import type { ConnectionState, DiscoveredDevice } from "../types/network.types";
import {
  notifyDeviceConnected,
  notifyDeviceDisconnected,
} from "../utils/electron.utils";
import { getPlatform } from "../utils/platform.utils";

/**
 * Hook to manage device discovery and connections
 */
export const useDeviceDiscovery = () => {
  const {
    currentDevice,
    setCurrentDevice,
    discoveredDevices,
    addDiscoveredDevice,
    removeDiscoveredDevice,
    clearDiscoveredDevices,
    pairedDevices,
    addPairedDevice,
    removePairedDevice,
    isPaired,
    loadPairedDevices,
    isDiscovering,
    setIsDiscovering,
  } = useDeviceStore();

  const { deviceName, deviceId, initialized } = useSettingsStore();

  // Initialize current device and WebRTC service
  useEffect(() => {
    if (initialized && deviceId && !currentDevice) {
      const device: Device = {
        id: deviceId,
        name: deviceName,
        platform: getPlatform(),
        status: "connected",
        lastSeen: new Date(),
      };

      setCurrentDevice(device);
      webrtcService.initialize(deviceId);
    }
  }, [initialized, deviceId, deviceName, currentDevice, setCurrentDevice]);

  // Load paired devices from storage
  useEffect(() => {
    loadPairedDevices();
  }, [loadPairedDevices]);

  const handleDeviceFound = useCallback(
    (device: DiscoveredDevice) => {
      addDiscoveredDevice(device);
      // Notify Electron if running in desktop mode
      notifyDeviceConnected(device.name, device.id).catch(err =>
        console.warn("Failed to notify Electron:", err),
      );
    },
    [addDiscoveredDevice],
  );

  const handleDeviceLost = useCallback(
    (deviceId: string) => {
      const device = discoveredDevices.find(d => d.id === deviceId);
      removeDiscoveredDevice(deviceId);
      // Notify Electron if running in desktop mode
      if (device) {
        notifyDeviceDisconnected(device.name, device.id).catch(err =>
          console.warn("Failed to notify Electron:", err),
        );
      }
    },
    [removeDiscoveredDevice, discoveredDevices],
  );

  // Subscribe to discovery events
  useEffect(() => {
    if (discoveryService.isSupported()) {
      const unsubscribeFound =
        discoveryService.onDeviceFound(handleDeviceFound);
      const unsubscribeLost = discoveryService.onDeviceLost(handleDeviceLost);

      return () => {
        unsubscribeFound();
        unsubscribeLost();
      };
    }
  }, [handleDeviceFound, handleDeviceLost]);

  // Sync WebRTC connection state to device store
  useEffect(() => {
    const handleStateChange = (
      deviceId: string,
      connectionState: ConnectionState,
      metadata?: { name?: string; platform?: string },
    ) => {
      console.log(
        `Connection state change for ${deviceId}: ${connectionState}`,
      );

      const matchedPaired = pairedDevices.find(d => d.id === deviceId);
      const matchedDiscovered = discoveredDevices.find(d => d.id === deviceId);

      if (matchedPaired) {
        // Update paired device status
        useDeviceStore.setState(state => ({
          pairedDevices: state.pairedDevices.map(d =>
            d.id === deviceId
              ? {
                  ...d,
                  status:
                    connectionState === "connected"
                      ? "connected"
                      : connectionState === "failed" ||
                          connectionState === "closed"
                        ? "disconnected"
                        : "connecting",
                }
              : d,
          ),
        }));
      } else if (matchedDiscovered) {
        // Update discovered device status
        addDiscoveredDevice({
          ...matchedDiscovered,
          status:
            connectionState === "connected"
              ? "connected"
              : connectionState === "failed" || connectionState === "closed"
                ? "disconnected"
                : "connecting",
        } as DiscoveredDevice);
      } else if (
        connectionState === "connecting" ||
        connectionState === "connected"
      ) {
        // Unknown device connected? Add to discovered for now
        addDiscoveredDevice({
          id: deviceId,
          name: metadata?.name || "Unknown Device",
          platform: (metadata?.platform as any) || "web",
          status: connectionState === "connected" ? "connected" : "connecting",
          lastSeen: new Date(),
        } as any);
      }
    };

    const unsubscribe =
      webrtcService.onConnectionStateChange(handleStateChange);
    return () => unsubscribe();
  }, [pairedDevices, discoveredDevices, addDiscoveredDevice]);

  // Start discovery
  const startDiscovery = useCallback(async () => {
    if (!currentDevice) {
      console.warn("Current device not initialized");
      return;
    }

    if (discoveryService.isSupported()) {
      try {
        setIsDiscovering(true);
        await discoveryService.registerDevice(currentDevice);
        await discoveryService.startDiscovery();
      } catch (error) {
        console.error("Failed to start discovery:", error);
        setIsDiscovering(false);
      }
    }
  }, [currentDevice, setIsDiscovering]);

  // Stop discovery
  const stopDiscovery = useCallback(async () => {
    try {
      if (discoveryService.isSupported()) {
        await discoveryService.stopDiscovery();
        await discoveryService.unregisterDevice();
      }
      clearDiscoveredDevices();
      setIsDiscovering(false);
    } catch (error) {
      console.error("Failed to stop discovery:", error);
    }
  }, [clearDiscoveredDevices, setIsDiscovering]);

  // Pair with a device
  const pairDevice = useCallback(
    async (device: Device) => {
      await addPairedDevice(device);
    },
    [addPairedDevice],
  );

  // Unpair a device
  const unpairDevice = useCallback(
    async (deviceId: string) => {
      await removePairedDevice(deviceId);
      webrtcService.closeConnection(deviceId);
    },
    [removePairedDevice],
  );

  // Initiate a connection to a device
  const connectToDevice = useCallback(
    (deviceId: string) => {
      if (!isPaired(deviceId)) {
        console.warn("Device not paired:", deviceId);
        return;
      }
      webrtcService.createOffer(deviceId);
    },
    [isPaired],
  );

  return {
    // State
    currentDevice,
    discoveredDevices,
    pairedDevices,
    isDiscovering,
    isSupported: discoveryService.isSupported(),

    // Actions
    startDiscovery,
    stopDiscovery,
    pairDevice,
    unpairDevice,
    connectToDevice,
    isPaired,
  };
};
