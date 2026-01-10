import { Capacitor } from "@capacitor/core";
import type { Platform } from "../types/device.types";

/**
 * Check if running in Electron environment
 */
export const isElectronEnv = (): boolean => {
  return typeof window !== "undefined" && window.electron?.isElectron === true;
};

/**
 * Get the current platform the app is running on
 */
export const getPlatform = (): Platform => {
  // Check Electron first since it also reports as "web" via Capacitor
  if (isElectronEnv()) {
    return "desktop";
  }

  const platform = Capacitor.getPlatform();

  if (platform === "android") return "android";
  if (platform === "ios") return "ios";

  return "web";
};

/**
 * Check if running on native mobile platform
 */
export const isNative = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Check if running on web (not Electron)
 */
export const isWeb = (): boolean => {
  return getPlatform() === "web";
};

/**
 * Check if running on Android
 */
export const isAndroid = (): boolean => {
  return getPlatform() === "android";
};

/**
 * Check if running on iOS
 */
export const isIOS = (): boolean => {
  return getPlatform() === "ios";
};

/**
 * Check if running on desktop (Electron)
 */
export const isDesktop = (): boolean => {
  return isElectronEnv();
};

/**
 * Get platform-specific directory for file storage
 */
export const getDefaultStorageDirectory = (): string => {
  if (isAndroid()) {
    return "Documents";
  }
  if (isIOS()) {
    return "Documents";
  }
  if (isDesktop()) {
    return "Downloads"; // Electron can access file system directly
  }
  return "Downloads"; // Web
};

/**
 * Get a human-readable platform name
 */
export const getPlatformName = (): string => {
  const platform = getPlatform();
  switch (platform) {
    case "android":
      return "Android";
    case "ios":
      return "iOS";
    case "desktop":
      return "Desktop";
    case "web":
      return "Web";
    default:
      return "Unknown";
  }
};
