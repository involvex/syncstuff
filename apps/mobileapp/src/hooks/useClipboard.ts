import { useEffect } from "react";
import { useClipboardStore } from "../store/clipboard.store";
import { clipboardSyncService } from "../services/sync/clipboard-sync.service";
import { clipboardService } from "../services/sync/clipboard.service";

/**
 * Custom hook for clipboard functionality
 * Provides interface to clipboard history, monitoring, and sync
 */
export const useClipboard = () => {
  const {
    clipboardHistory,
    activeSync,
    pendingApproval,
    isMonitoring,
    clearHistory,
    removeFromHistory,
  } = useClipboardStore();

  /**
   * Start clipboard monitoring
   */
  const startMonitoring = () => {
    clipboardSyncService.startMonitoring();
  };

  /**
   * Stop clipboard monitoring
   */
  const stopMonitoring = () => {
    clipboardSyncService.stopMonitoring();
  };

  /**
   * Copy content to clipboard
   */
  const copyToClipboard = async (
    content: string,
    type: "text" | "image" = "text",
  ) => {
    try {
      if (type === "text") {
        await clipboardService.writeText(content);
      } else if (type === "image") {
        await clipboardService.writeImage(content);
      }
      return true;
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      return false;
    }
  };

  /**
   * Read current clipboard content
   */
  const readClipboard = async () => {
    try {
      const result = await clipboardService.read();
      return result;
    } catch (error) {
      console.error("Failed to read clipboard:", error);
      return null;
    }
  };

  /**
   * Check clipboard permissions (web only)
   */
  const checkPermissions = async () => {
    try {
      return await clipboardService.checkPermissions();
    } catch (error) {
      console.error("Failed to check clipboard permissions:", error);
      return false;
    }
  };

  /**
   * Cleanup monitoring on unmount
   */
  useEffect(() => {
    return () => {
      if (isMonitoring) {
        clipboardSyncService.stopMonitoring();
      }
    };
  }, [isMonitoring]);

  return {
    // State
    clipboardHistory,
    activeSync,
    pendingApproval,
    isMonitoring,

    // Actions
    startMonitoring,
    stopMonitoring,
    clearHistory,
    removeFromHistory,
    copyToClipboard,
    readClipboard,
    checkPermissions,
  };
};
