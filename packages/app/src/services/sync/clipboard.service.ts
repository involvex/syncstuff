/**
 * Clipboard Service
 * Platform-agnostic clipboard access layer
 * Handles differences between native (Capacitor) and web (navigator.clipboard) APIs
 */

import { Clipboard } from "@capacitor/clipboard";
import { isWeb } from "../../utils/platform.utils";
import type { ClipboardContentType } from "../../types/clipboard.types";

interface ClipboardReadResult {
  type: ClipboardContentType;
  content: string;
  mimeType?: string;
}

class ClipboardService {
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoringActive = false;
  private onChangeCallback: ((result: ClipboardReadResult) => void) | null =
    null;

  /**
   * Read text from clipboard
   */
  async readText(): Promise<string> {
    try {
      if (isWeb()) {
        // Web: Use navigator.clipboard API
        if (!navigator.clipboard) {
          throw new Error("Clipboard API not available");
        }
        const text = await navigator.clipboard.readText();
        return text;
      } else {
        // Native: Use Capacitor Clipboard
        const result = await Clipboard.read();
        return result.value || "";
      }
    } catch (error) {
      console.error("Failed to read clipboard text:", error);
      throw error;
    }
  }

  /**
   * Write text to clipboard
   */
  async writeText(text: string): Promise<void> {
    try {
      if (isWeb()) {
        // Web: Use navigator.clipboard API
        if (!navigator.clipboard) {
          throw new Error("Clipboard API not available");
        }
        await navigator.clipboard.writeText(text);
      } else {
        // Native: Use Capacitor Clipboard
        await Clipboard.write({ string: text });
      }
    } catch (error) {
      console.error("Failed to write clipboard text:", error);
      throw error;
    }
  }

  /**
   * Read image from clipboard (native only, returns base64)
   * On web, this requires more complex handling via ClipboardItem API
   */
  async readImage(): Promise<string | null> {
    try {
      if (isWeb()) {
        // Web: Use Clipboard API with ClipboardItem
        if (!navigator.clipboard || !navigator.clipboard.read) {
          return null; // Not supported on all browsers
        }

        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
          const imageTypes = item.types.filter(type =>
            type.startsWith("image/"),
          );

          if (imageTypes.length > 0) {
            const blob = await item.getType(imageTypes[0]);
            const base64 = await this.blobToBase64(blob);
            return base64;
          }
        }
        return null;
      } else {
        // Native: Use Capacitor Clipboard (image support varies by platform)
        // Note: Capacitor Clipboard v6 has limited image support
        // This may need platform-specific implementations
        const result = await Clipboard.read();
        if (result.type === "image" && result.value) {
          return result.value; // Assume it's base64
        }
        return null;
      }
    } catch (error) {
      console.error("Failed to read clipboard image:", error);
      return null;
    }
  }

  /**
   * Write image to clipboard (base64 data)
   */
  async writeImage(
    base64Data: string,
    mimeType: string = "image/png",
  ): Promise<void> {
    try {
      if (isWeb()) {
        // Web: Convert base64 to blob and use ClipboardItem
        if (!navigator.clipboard || !navigator.clipboard.write) {
          throw new Error("Clipboard write API not available");
        }

        const blob = await this.base64ToBlob(base64Data, mimeType);
        const clipboardItem = new ClipboardItem({ [mimeType]: blob });
        await navigator.clipboard.write([clipboardItem]);
      } else {
        // Native: Use Capacitor Clipboard
        // Note: Image writing support varies by platform
        await Clipboard.write({
          image: base64Data,
        });
      }
    } catch (error) {
      console.error("Failed to write clipboard image:", error);
      throw error;
    }
  }

  /**
   * Detect clipboard content type
   */
  async detectContentType(): Promise<ClipboardContentType> {
    try {
      if (isWeb()) {
        if (navigator.clipboard && navigator.clipboard.read) {
          const items = await navigator.clipboard.read();
          if (items.length > 0) {
            const types = items[0].types;
            if (types.some(t => t.startsWith("image/"))) {
              return "image";
            }
          }
        }
        return "text"; // Default to text on web
      } else {
        // Native: Check Capacitor Clipboard
        const result = await Clipboard.read();
        if (result.type === "image") {
          return "image";
        }
        return "text";
      }
    } catch (error) {
      console.error("Failed to detect clipboard content type:", error);
      return "text"; // Default fallback
    }
  }

  /**
   * Read clipboard content (auto-detect type)
   */
  async read(): Promise<ClipboardReadResult | null> {
    try {
      const contentType = await this.detectContentType();

      if (contentType === "image") {
        const image = await this.readImage();
        if (image) {
          return {
            type: "image",
            content: image,
            mimeType: "image/png", // Default, could be improved
          };
        }
      }

      // Fallback to text
      const text = await this.readText();
      return {
        type: "text",
        content: text,
      };
    } catch (error) {
      console.error("Failed to read clipboard:", error);
      return null;
    }
  }

  /**
   * Start monitoring clipboard for changes
   * Polls clipboard every 1000ms and calls callback when content changes
   */
  startMonitoring(
    callback: (result: ClipboardReadResult) => void,
    intervalMs: number = 1000,
  ): void {
    if (this.isMonitoringActive) {
      console.warn("Clipboard monitoring already active");
      return;
    }

    this.onChangeCallback = callback;
    this.isMonitoringActive = true;

    let lastContent: string | null = null;

    this.monitoringInterval = setInterval(async () => {
      if (!this.isMonitoringActive) {
        this.stopMonitoring();
        return;
      }

      try {
        const result = await this.read();
        if (!result) return;

        // Check if content changed
        if (result.content !== lastContent) {
          lastContent = result.content;
          if (this.onChangeCallback) {
            this.onChangeCallback(result);
          }
        }
      } catch (error) {
        console.error("Error monitoring clipboard:", error);
      }
    }, intervalMs);

    console.log("Clipboard monitoring started");
  }

  /**
   * Stop monitoring clipboard
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoringActive = false;
    this.onChangeCallback = null;
    console.log("Clipboard monitoring stopped");
  }

  /**
   * Check if monitoring is active
   */
  isMonitoring(): boolean {
    return this.isMonitoringActive;
  }

  /**
   * Check if clipboard permissions are granted (web only)
   */
  async checkPermissions(): Promise<boolean> {
    if (!isWeb()) return true; // Assume granted on native

    try {
      if (!navigator.permissions) return false;

      const readPermission = await navigator.permissions.query({
        name: "clipboard-read" as PermissionName,
      });
      const writePermission = await navigator.permissions.query({
        name: "clipboard-write" as PermissionName,
      });

      return (
        readPermission.state === "granted" &&
        writePermission.state === "granted"
      );
    } catch (error) {
      // Permissions API may not be available or clipboard permissions may not be queryable
      console.warn("Clipboard permissions check not available:", error);
      return false; // Assume not granted, will fail on actual clipboard access
    }
  }

  /**
   * Helper: Convert blob to base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data:image/png;base64, prefix if present
        const base64Data = base64.split(",")[1] || base64;
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Helper: Convert base64 to blob
   */
  private async base64ToBlob(base64: string, mimeType: string): Promise<Blob> {
    // Add data URL prefix if not present
    const dataUrl = base64.startsWith("data:")
      ? base64
      : `data:${mimeType};base64,${base64}`;

    const response = await fetch(dataUrl);
    return response.blob();
  }
}

export const clipboardService = new ClipboardService();
