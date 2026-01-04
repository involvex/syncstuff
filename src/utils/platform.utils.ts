import { Capacitor } from "@capacitor/core";
import type { Platform } from "../types/device.types";

/**
 * Get the current platform the app is running on
 */
export const getPlatform = (): Platform => {
  const platform = Capacitor.getPlatform();

  if (platform === "android") return "android";
  if (platform === "ios") return "ios";
  if (platform === "web") return "web";

  // Desktop (Electron/Tauri) will report as 'web' initially
  // This will be refined when we add desktop support
  return "web";
};

/**
 * Check if running on native mobile platform
 */
export const isNative = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Check if running on web
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
 * Check if running on desktop (Tauri)
 * For now, returns false. Will be implemented when desktop support is added.
 */
export const isDesktop = (): boolean => {
  return false; // Will be implemented in Phase 2.5
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
  return "Downloads"; // Web/Desktop
};
