import { create } from "zustand";
import type { ThemeMode } from "../types/storage.types";
import { Device } from "@capacitor/device";
import { v4 as uuidv4 } from "uuid";
import { localStorageService } from "../services/storage/local-storage.service";
import { STORAGE_KEYS } from "../types/storage.types";

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

  // Clipboard Settings
  clipboardAutoSync: boolean;
  clipboardSyncImages: boolean;
  clipboardShowPreview: boolean;
  clipboardCloudBackup: boolean;
  setClipboardAutoSync: (value: boolean) => void;
  setClipboardSyncImages: (value: boolean) => void;
  setClipboardShowPreview: (value: boolean) => void;
  setClipboardCloudBackup: (value: boolean) => void;

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
  clipboardAutoSync: false, // Default to manual approval for privacy
  clipboardSyncImages: true,
  clipboardShowPreview: true,
  clipboardCloudBackup: false,
  initialized: false,

  setTheme: theme => set({ theme }),

  setDeviceName: name => set({ deviceName: name }),

  setAutoAcceptFiles: value => set({ autoAcceptFiles: value }),

  setClipboardAutoSync: value => set({ clipboardAutoSync: value }),

  setClipboardSyncImages: value => set({ clipboardSyncImages: value }),

  setClipboardShowPreview: value => set({ clipboardShowPreview: value }),

  setClipboardCloudBackup: value => set({ clipboardCloudBackup: value }),

  initialize: async () => {
    if (get().initialized) return;

    // Ensure local storage is initialized first
    await localStorageService.init();

    // Load stored settings
    const storedTheme = await localStorageService.get<ThemeMode>(
      STORAGE_KEYS.THEME,
    );
    const storedDeviceId = await localStorageService.get<string>(
      STORAGE_KEYS.DEVICE_ID,
    );
    const storedDeviceName = await localStorageService.get<string>(
      STORAGE_KEYS.DEVICE_NAME,
    );
    const storedAutoAcceptFiles = await localStorageService.get<boolean>(
      STORAGE_KEYS.AUTO_ACCEPT_FILES,
    );
    const storedClipboardAutoSync = await localStorageService.get<boolean>(
      STORAGE_KEYS.CLIPBOARD_AUTO_SYNC,
    );
    const storedClipboardSyncImages = await localStorageService.get<boolean>(
      STORAGE_KEYS.CLIPBOARD_SYNC_IMAGES,
    );
    const storedClipboardShowPreview = await localStorageService.get<boolean>(
      STORAGE_KEYS.CLIPBOARD_SHOW_PREVIEW,
    );
    const storedClipboardCloudBackup = await localStorageService.get<boolean>(
      "clipboardCloudBackup", // Use string key directly for now or add to STORAGE_KEYS
    );

    // Get device info from Capacitor for defaults if not stored
    const info = await Device.getInfo();
    const id = await Device.getId();

    const currentDeviceId = storedDeviceId || id.identifier || uuidv4();
    const defaultName = `${info.manufacturer || ""} ${info.model || ""}`.trim();
    const currentDeviceName =
      storedDeviceName || defaultName || "Syncstuff Device";

    set({
      theme: storedTheme || "system",
      deviceName: currentDeviceName,
      deviceId: currentDeviceId,
      autoAcceptFiles: storedAutoAcceptFiles ?? false,
      clipboardAutoSync: storedClipboardAutoSync ?? false,
      clipboardSyncImages: storedClipboardSyncImages ?? true,
      clipboardShowPreview: storedClipboardShowPreview ?? true,
      clipboardCloudBackup: storedClipboardCloudBackup ?? false,
      initialized: true,
    });

    // Save newly generated/default values to storage for persistence
    await localStorageService.set(STORAGE_KEYS.DEVICE_ID, currentDeviceId);
    await localStorageService.set(STORAGE_KEYS.DEVICE_NAME, currentDeviceName);
  },
}));
