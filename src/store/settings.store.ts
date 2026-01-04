import { create } from "zustand";
import type { ThemeMode } from "../types/storage.types";
import { Device } from "@capacitor/device";
import { v4 as uuidv4 } from "uuid";

interface SettingsStore {
  // Theme
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;

  // Device Info
  deviceName: string;
  deviceId: string;
  setDeviceName: (name: string) => void;

  // App Settings
  autoAcceptFiles: boolean;
  setAutoAcceptFiles: (value: boolean) => void;

  // Initialization
  initialized: boolean;
  initialize: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  // Default values
  theme: "system",
  deviceName: "",
  deviceId: "",
  autoAcceptFiles: false,
  initialized: false,

  setTheme: theme => set({ theme }),

  setDeviceName: name => set({ deviceName: name }),

  setAutoAcceptFiles: value => set({ autoAcceptFiles: value }),

  initialize: async () => {
    if (get().initialized) return;

    // Get device info from Capacitor
    const info = await Device.getInfo();
    const id = await Device.getId();

    // Generate a friendly device name based on model/manufacturer
    const model = info.model || "Unknown";
    const manufacturer = info.manufacturer || "Device";
    const defaultName = `${manufacturer} ${model}`.trim();

    // Generate a unique device ID if not available
    const deviceId = id.identifier || uuidv4();

    set({
      deviceName: defaultName,
      deviceId,
      initialized: true,
    });
  },
}));
