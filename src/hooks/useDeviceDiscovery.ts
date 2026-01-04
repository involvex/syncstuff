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
    signalingData,
    setSignalingData,
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
    },
    [deviceId, addDiscoveredDevice],
  );

  // Handle device lost
  const handleDeviceLost = useCallback(
    (deviceId: string) => {
      removeDiscoveredDevice(deviceId);
    },
    [removeDiscoveredDevice],
  );

  // Handle outgoing WebRTC signals
  const handleSignal = useCallback(
    (signal: SignalMessage) => {
      // Show the signal to the user to be manually transferred
      setSignalingData({ deviceId: signal.to, signal });
    },
    [setSignalingData],
  );

  // Start discovery and listen for signals
  const startDiscovery = useCallback(async () => {
    if (!currentDevice) {
      console.warn("Current device not initialized");
      return;
    }

    // Subscribe to WebRTC signal events
    const unsubscribeSignal = webrtcService.onSignal(handleSignal);

    if (discoveryService.isSupported()) {
      try {
        setIsDiscovering(true);
        await discoveryService.registerDevice(currentDevice);
        await discoveryService.startDiscovery();
        const unsubscribeFound =
          discoveryService.onDeviceFound(handleDeviceFound);
        const unsubscribeLost = discoveryService.onDeviceLost(handleDeviceLost);

        // Return cleanup function
        return () => {
          unsubscribeFound();
          unsubscribeLost();
          unsubscribeSignal();
        };
      } catch (error) {
        console.error("Failed to start discovery:", error);
        setIsDiscovering(false);
      }
    }
    // Return cleanup for signal listener even if discovery isn't supported
    return () => {
      unsubscribeSignal();
    };
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

  // Handle a signal submitted by the user
  const submitSignal = useCallback(
    (pastedSignal: string) => {
      try {
        const signalData = JSON.parse(pastedSignal);
        // We need to know who this signal is from to handle it.
        // For this MVP, we assume the signal is for the device currently in the signaling modal.
        if (signalingData) {
          const fullSignal: SignalMessage = {
            from: signalingData.deviceId, // The other device's ID
            to: currentDevice!.id,
            type: signalData.type === "offer" ? "offer" : "answer", // Infer type
            data: signalData,
            timestamp: new Date(),
          };
          webrtcService.handleSignal(fullSignal);
        }
      } catch (e) {
        console.error("Invalid signal data pasted:", e);
        alert("Invalid signal data. Please copy the entire JSON text.");
      }
    },
    [signalingData, currentDevice],
  );

  return {
    // State
    currentDevice,
    discoveredDevices,
    pairedDevices,
    isDiscovering,
    isSupported: discoveryService.isSupported(),
    signalingData,

    // Actions
    startDiscovery,
    stopDiscovery,
    pairDevice,
    unpairDevice,
    connectToDevice,
    submitSignal,
    setSignalingData,
    isPaired,
  };
};
