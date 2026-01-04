export type ThemeMode = "light" | "dark" | "system";

export interface StorageKeys {
  THEME: "theme";
  DEVICE_NAME: "deviceName";
  DEVICE_ID: "deviceId";
  PAIRED_DEVICES: "pairedDevices";
  AUTO_ACCEPT_FILES: "autoAcceptFiles";
  TRANSFER_HISTORY: "transferHistory";
}

export const STORAGE_KEYS: StorageKeys = {
  THEME: "theme",
  DEVICE_NAME: "deviceName",
  DEVICE_ID: "deviceId",
  PAIRED_DEVICES: "pairedDevices",
  AUTO_ACCEPT_FILES: "autoAcceptFiles",
  TRANSFER_HISTORY: "transferHistory",
};

export interface StorageService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  init(): Promise<void>;
}
