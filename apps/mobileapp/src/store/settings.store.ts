import { Device } from "@capacitor/device";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { localStorageService } from "../services/storage/local-storage.service";
import type { ThemeMode } from "../types/storage.types";
import { STORAGE_KEYS } from "../types/storage.types";
import { getPlatform } from "../utils/platform.utils";

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

  // Connection Settings
  signalingServerUrl: string;
  setSignalingServerUrl: (url: string) => void;

  // Developer Settings
  devMode: boolean;
  verboseLogging: boolean;
  traceHandshake: boolean;
  setDevMode: (value: boolean) => void;
  setVerboseLogging: (value: boolean) => void;
  setTraceHandshake: (value: boolean) => void;

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
  signalingServerUrl:
    getPlatform() === "android"
      ? "http://10.0.2.2:3001"
      : "http://localhost:3001",
  devMode: false,
  verboseLogging: false,
  traceHandshake: false,
  initialized: false,

  setTheme: theme => set({ theme }),

  setDeviceName: name => set({ deviceName: name }),

  setAutoAcceptFiles: value => set({ autoAcceptFiles: value }),

  setClipboardAutoSync: value => set({ clipboardAutoSync: value }),

  setClipboardSyncImages: value => set({ clipboardSyncImages: value }),

  setClipboardShowPreview: value => set({ clipboardShowPreview: value }),

  setClipboardCloudBackup: value => set({ clipboardCloudBackup: value }),

  setSignalingServerUrl: url => {
    set({ signalingServerUrl: url });
    localStorageService.set(STORAGE_KEYS.SIGNALING_SERVER_URL, url);
  },

  setDevMode: value => {
    set({ devMode: value });
    localStorageService.set(STORAGE_KEYS.DEV_MODE, value);
  },

  setVerboseLogging: value => {
    set({ verboseLogging: value });
    localStorageService.set(STORAGE_KEYS.VERBOSE_LOGGING, value);
  },

  setTraceHandshake: value => {
    set({ traceHandshake: value });
    localStorageService.set(STORAGE_KEYS.TRACE_HANDSHAKE, value);
  },

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
    const storedSignalingServerUrl = await localStorageService.get<string>(
      STORAGE_KEYS.SIGNALING_SERVER_URL,
    );
    const storedDevMode = await localStorageService.get<boolean>(
      STORAGE_KEYS.DEV_MODE,
    );
    const storedVerboseLogging = await localStorageService.get<boolean>(
      STORAGE_KEYS.VERBOSE_LOGGING,
    );
    const storedTraceHandshake = await localStorageService.get<boolean>(
      STORAGE_KEYS.TRACE_HANDSHAKE,
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
      signalingServerUrl:
        storedSignalingServerUrl ||
        (getPlatform() === "android"
          ? "http://10.0.2.2:3001"
          : "http://localhost:3001"),
      devMode: storedDevMode ?? false,
      verboseLogging: storedVerboseLogging ?? false,
      traceHandshake: storedTraceHandshake ?? false,
      initialized: true,
    });

    // Save newly generated/default values to storage for persistence
    await localStorageService.set(STORAGE_KEYS.DEVICE_ID, currentDeviceId);
    await localStorageService.set(STORAGE_KEYS.DEVICE_NAME, currentDeviceName);
  },
}));
