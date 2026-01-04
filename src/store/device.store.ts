import { create } from "zustand";
import type { Device } from "../types/device.types";
import type { PairingRequest, DiscoveredDevice } from "../types/network.types";
import { localStorageService } from "../services/storage/local-storage.service";
import { STORAGE_KEYS } from "../types/storage.types";

interface DeviceStore {
  // Current device (this device)
  currentDevice: Device | null;
  setCurrentDevice: (device: Device) => void;

  // Discovered devices (via mDNS)
  discoveredDevices: DiscoveredDevice[];
  addDiscoveredDevice: (device: DiscoveredDevice) => void;
  removeDiscoveredDevice: (deviceId: string) => void;
  updateDiscoveredDevice: (
    deviceId: string,
    updates: Partial<DiscoveredDevice>,
  ) => void;
  clearDiscoveredDevices: () => void;

  // Paired devices (manually paired)
  pairedDevices: Device[];
  addPairedDevice: (device: Device) => void;
  removePairedDevice: (deviceId: string) => void;
  isPaired: (deviceId: string) => boolean;
  loadPairedDevices: () => Promise<void>;
  savePairedDevices: () => Promise<void>;

  // Pairing requests
  pairingRequests: PairingRequest[];
  addPairingRequest: (request: PairingRequest) => void;
  updatePairingRequest: (
    requestId: string,
    updates: Partial<PairingRequest>,
  ) => void;
  removePairingRequest: (requestId: string) => void;
  getPendingRequests: () => PairingRequest[];

  // Discovery state
  isDiscovering: boolean;
  setIsDiscovering: (discovering: boolean) => void;
}

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  // Current device
  currentDevice: null,
  setCurrentDevice: device => set({ currentDevice: device }),

  // Discovered devices
  discoveredDevices: [],

  addDiscoveredDevice: device => {
    const { discoveredDevices } = get();
    const exists = discoveredDevices.find(d => d.id === device.id);

    if (!exists) {
      set({ discoveredDevices: [...discoveredDevices, device] });
    } else {
      // Update existing device
      set({
        discoveredDevices: discoveredDevices.map(d =>
          d.id === device.id ? { ...d, ...device, lastSeen: new Date() } : d,
        ),
      });
    }
  },

  removeDiscoveredDevice: deviceId => {
    set({
      discoveredDevices: get().discoveredDevices.filter(d => d.id !== deviceId),
    });
  },

  updateDiscoveredDevice: (deviceId, updates) => {
    set({
      discoveredDevices: get().discoveredDevices.map(d =>
        d.id === deviceId ? { ...d, ...updates } : d,
      ),
    });
  },

  clearDiscoveredDevices: () => set({ discoveredDevices: [] }),

  // Paired devices
  pairedDevices: [],

  addPairedDevice: async device => {
    const { pairedDevices } = get();
    if (!pairedDevices.find(d => d.id === device.id)) {
      set({ pairedDevices: [...pairedDevices, device] });
      await get().savePairedDevices();
    }
  },

  removePairedDevice: async deviceId => {
    set({
      pairedDevices: get().pairedDevices.filter(d => d.id !== deviceId),
    });
    await get().savePairedDevices();
  },

  isPaired: deviceId => {
    return get().pairedDevices.some(d => d.id === deviceId);
  },

  loadPairedDevices: async () => {
    const saved = await localStorageService.get<Device[]>(
      STORAGE_KEYS.PAIRED_DEVICES,
    );
    if (saved) {
      set({ pairedDevices: saved });
    }
  },

  savePairedDevices: async () => {
    const { pairedDevices } = get();
    await localStorageService.set(STORAGE_KEYS.PAIRED_DEVICES, pairedDevices);
  },

  // Pairing requests
  pairingRequests: [],

  addPairingRequest: request => {
    set({ pairingRequests: [...get().pairingRequests, request] });
  },

  updatePairingRequest: (requestId, updates) => {
    set({
      pairingRequests: get().pairingRequests.map(r =>
        r.id === requestId ? { ...r, ...updates } : r,
      ),
    });
  },

  removePairingRequest: requestId => {
    set({
      pairingRequests: get().pairingRequests.filter(r => r.id !== requestId),
    });
  },

  getPendingRequests: () => {
    return get().pairingRequests.filter(r => r.status === "pending");
  },

  // Discovery state
  isDiscovering: false,
  setIsDiscovering: discovering => set({ isDiscovering: discovering }),
}));
