import { useEffect, useCallback } from "react";
import { useDeviceStore } from "../store/device.store";
import { useSettingsStore } from "../store/settings.store";
import { discoveryService } from "../services/network/discovery.service";
import { webrtcService } from "../services/network/webrtc.service";
import type { Device } from "../types/device.types";
import type { DiscoveredDevice, SignalMessage } from "../types/network.types";
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

  // Initialize current device
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

  // Handle device found
  const handleDeviceFound = useCallback(
    (device: DiscoveredDevice) => {
      // Don't add ourselves
      if (device.id === deviceId) return;

      addDiscoveredDevice(device);
      console.log("Device found:", device.name);
    },
    [deviceId, addDiscoveredDevice],
  );

  // Handle device lost
  const handleDeviceLost = useCallback(
    (deviceId: string) => {
      removeDiscoveredDevice(deviceId);
      console.log("Device lost:", deviceId);
    },
    [removeDiscoveredDevice],
  );

  // Handle WebRTC signals
  const handleSignal = useCallback((signal: SignalMessage) => {
    // In MVP, we'll handle signaling manually through pairing
    // In production, this would go through a signaling server
    console.log("WebRTC signal:", signal);

    // For now, just log. In Phase 3, we'll implement actual file transfer
    // which will require proper signaling
  }, []);

  // Start discovery
  const startDiscovery = useCallback(async () => {
    if (!currentDevice) {
      console.warn("Current device not initialized");
      return;
    }

    if (!discoveryService.isSupported()) {
      console.warn("Discovery not supported on this platform");
      // On web, we could show a manual pairing option
      return;
    }

    try {
      setIsDiscovering(true);

      // Register this device
      await discoveryService.registerDevice(currentDevice);

      // Start discovering other devices
      await discoveryService.startDiscovery();

      // Subscribe to discovery events
      const unsubscribeFound =
        discoveryService.onDeviceFound(handleDeviceFound);
      const unsubscribeLost = discoveryService.onDeviceLost(handleDeviceLost);

      // Subscribe to WebRTC signal events
      const unsubscribeSignal = webrtcService.onSignal(handleSignal);

      // Cleanup function
      return () => {
        unsubscribeFound();
        unsubscribeLost();
        unsubscribeSignal();
      };
    } catch (error) {
      console.error("Failed to start discovery:", error);
      setIsDiscovering(false);
    }
  }, [
    currentDevice,
    setIsDiscovering,
    handleDeviceFound,
    handleDeviceLost,
    handleSignal,
  ]);

  // Stop discovery
  const stopDiscovery = useCallback(async () => {
    try {
      await discoveryService.stopDiscovery();
      await discoveryService.unregisterDevice();
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
      console.log("Device paired:", device.name);
    },
    [addPairedDevice],
  );

  // Unpair a device
  const unpairDevice = useCallback(
    async (deviceId: string) => {
      await removePairedDevice(deviceId);
      // Also close any WebRTC connection
      webrtcService.closeConnection(deviceId);
      console.log("Device unpaired:", deviceId);
    },
    [removePairedDevice],
  );

  // Connect to a device
  const connectToDevice = useCallback(
    (deviceId: string) => {
      if (!isPaired(deviceId)) {
        console.warn("Device not paired:", deviceId);
        return;
      }

      webrtcService.createOffer(deviceId);
      console.log("Connecting to device:", deviceId);
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
