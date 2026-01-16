/**
 * Clipboard Sync Service
 * Handles clipboard synchronization protocol over WebRTC
 * Mirrors the pattern from transfer.service.ts but for clipboard content
 */

import { Device } from "@capacitor/device";
import { v4 as uuidv4 } from "uuid";
import { useClipboardStore } from "../../store/clipboard.store";
import { useDeviceStore } from "../../store/device.store";
import { useSettingsStore } from "../../store/settings.store";
import type {
  ClipboardAcceptPayload,
  ClipboardChunkPayload,
  ClipboardCompletePayload,
  ClipboardContent,
  ClipboardContentType,
  ClipboardMessage,
  ClipboardOfferPayload,
  ClipboardSync,
} from "../../types/clipboard.types";
import { webrtcService } from "../network/webrtc.service";
import { clipboardService } from "./clipboard.service";

// Max chunk size for clipboard content (16KB is safe for WebRTC)
const CHUNK_SIZE = 16 * 1024;

// Debounce time for clipboard changes (avoid spam on rapid copy/paste)
const DEBOUNCE_MS = 500;

class ClipboardSyncService {
  private sendingContent: Map<string, string> = new Map(); // Content being sent
  private receivingContent: Map<string, string[]> = new Map(); // Chunks being received
  private lastClipboardHash: string | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Listen for incoming clipboard messages
    webrtcService.onDataReceived((deviceId, data) => {
      const message = data as { type: string };

      // Check if this is a clipboard message
      if (message.type?.startsWith("CLIPBOARD_")) {
        this.handleIncomingMessage(deviceId, data as ClipboardMessage);
      }
    });
  }

  /**
   * Initialize clipboard monitoring
   */
  async startMonitoring(): Promise<void> {
    const settings = useSettingsStore.getState();

    if (!settings.clipboardAutoSync) {
      console.log("Clipboard auto-sync is disabled");
      return;
    }

    clipboardService.startMonitoring(async result => {
      // Check battery if enabled
      if (settings.clipboardStopOnLowBattery) {
        try {
          const info = await Device.getBatteryInfo();
          if (
            info.batteryLevel !== undefined &&
            info.batteryLevel < 0.2 &&
            !info.isCharging
          ) {
            console.log("Clipboard sync paused: low battery");
            return;
          }
        } catch (error) {
          console.warn("Failed to check battery info:", error);
        }
      }

      // Debounce clipboard changes
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(() => {
        this.handleLocalClipboardChange(
          result.type,
          result.content,
          result.mimeType,
        );
      }, DEBOUNCE_MS);
    }, settings.clipboardMonitoringInterval || 1000);

    useClipboardStore.getState().setMonitoring(true);
    console.log("Clipboard monitoring started");
  }

  /**
   * Stop clipboard monitoring
   */
  stopMonitoring(): void {
    clipboardService.stopMonitoring();
    useClipboardStore.getState().setMonitoring(false);

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    console.log("Clipboard monitoring stopped");
  }

  /**
   * Handle local clipboard change
   */
  private async handleLocalClipboardChange(
    type: ClipboardContentType,
    content: string,
    mimeType?: string,
  ): Promise<void> {
    const settings = useSettingsStore.getState();
    const store = useClipboardStore.getState();

    // Skip if content hasn't changed
    const contentHash = this.hashContent(content);
    if (contentHash === this.lastClipboardHash) {
      return;
    }
    this.lastClipboardHash = contentHash;

    // Skip images if image sync is disabled
    if (type === "image" && !settings.clipboardSyncImages) {
      console.log("Image clipboard sync is disabled");
      return;
    }

    // Check content size (warn for large content > 1MB for text, > 10MB for images)
    const sizeLimit = type === "image" ? 10 * 1024 * 1024 : 1 * 1024 * 1024;
    if (content.length > sizeLimit) {
      console.warn(`Clipboard content too large: ${content.length} bytes`);
      // Could show a toast notification here
      return;
    }

    // Store in local history
    const clipboardContent: ClipboardContent = {
      id: uuidv4(),
      type,
      content,
      mimeType,
      size: content.length,
      deviceId: settings.deviceId,
      deviceName: settings.deviceName,
      timestamp: new Date(),
      synced: false,
    };

    store.addToHistory(clipboardContent);

    // Sync to all connected devices
    const devices = useDeviceStore.getState().pairedDevices;
    const connectedDevices = devices.filter(d => d.status === "connected");

    for (const device of connectedDevices) {
      await this.sendClipboardSync(clipboardContent, device.id);
    }
  }

  /**
   * Send clipboard content to a device
   */
  async sendClipboardSync(
    content: ClipboardContent,
    deviceId: string,
  ): Promise<void> {
    const syncId = uuidv4();
    const settings = useSettingsStore.getState();

    // Store content for chunked sending
    this.sendingContent.set(syncId, content.content);

    const sync: ClipboardSync = {
      id: syncId,
      content,
      deviceId,
      direction: "send",
      status: "pending",
      progress: 0,
      transferredBytes: 0,
      totalBytes: content.size,
      createdAt: new Date(),
    };

    useClipboardStore.getState().setActiveSync(sync);

    // Send offer
    const preview =
      content.type === "text" ? content.content.substring(0, 100) : "[Image]";

    const offerPayload: ClipboardOfferPayload = {
      contentId: content.id,
      contentType: content.type,
      size: content.size,
      mimeType: content.mimeType,
      preview,
      deviceName: settings.deviceName,
    };

    this.sendMessage(deviceId, {
      type: "CLIPBOARD_OFFER",
      syncId,
      payload: offerPayload,
    });

    console.log(`Sent clipboard offer to ${deviceId}:`, preview);
  }

  /**
   * Handle incoming clipboard messages
   */
  private handleIncomingMessage(
    deviceId: string,
    message: ClipboardMessage,
  ): void {
    switch (message.type) {
      case "CLIPBOARD_OFFER":
        this.handleClipboardOffer(
          deviceId,
          message as ClipboardMessage<ClipboardOfferPayload>,
        );
        break;
      case "CLIPBOARD_ACCEPT":
        this.startSendingChunks(message.syncId, deviceId);
        break;
      case "CLIPBOARD_REJECT":
        useClipboardStore
          .getState()
          .updateSyncStatus(message.syncId, "rejected");
        break;
      case "CLIPBOARD_CHUNK":
        this.handleClipboardChunk(
          message as ClipboardMessage<ClipboardChunkPayload>,
        );
        break;
      case "CLIPBOARD_COMPLETE":
        this.handleClipboardComplete(
          message as ClipboardMessage<ClipboardCompletePayload>,
        );
        break;
      case "CLIPBOARD_ERROR":
        this.handleClipboardError(message);
        break;
    }
  }

  /**
   * Handle incoming clipboard offer
   */
  private async handleClipboardOffer(
    deviceId: string,
    message: ClipboardMessage<ClipboardOfferPayload>,
  ): Promise<void> {
    const payload = message.payload;
    const settings = useSettingsStore.getState();
    const device = useDeviceStore
      .getState()
      .pairedDevices.find(d => d.id === deviceId);

    if (!device) {
      console.error("Received offer from unknown device:", deviceId);
      return;
    }

    // Create clipboard content from offer
    const content: ClipboardContent = {
      id: payload.contentId,
      type: payload.contentType,
      content: "", // Will be filled by chunks
      mimeType: payload.mimeType,
      size: payload.size,
      deviceId,
      deviceName: payload.deviceName,
      timestamp: new Date(),
      synced: true,
    };

    const sync: ClipboardSync = {
      id: message.syncId,
      content,
      deviceId,
      direction: "receive",
      status: "pending",
      progress: 0,
      transferredBytes: 0,
      totalBytes: payload.size,
      createdAt: new Date(),
    };

    // Check if auto-sync is enabled
    if (settings.clipboardAutoSync) {
      // Auto-accept
      this.acceptClipboardSync(sync, deviceId);
    } else {
      // Add to pending approval
      useClipboardStore.getState().addPendingApproval(sync);
      console.log("Clipboard sync requires manual approval");
      // Could show a notification/modal here
    }
  }

  /**
   * Accept incoming clipboard sync
   */
  acceptClipboardSync(sync: ClipboardSync, deviceId: string): void {
    useClipboardStore.getState().setActiveSync(sync);
    useClipboardStore.getState().removePendingApproval(sync.id);

    // Initialize receiving buffer
    this.receivingContent.set(sync.id, []);

    // Send accept message
    const acceptPayload: ClipboardAcceptPayload = {
      contentId: sync.content.id,
    };

    this.sendMessage(deviceId, {
      type: "CLIPBOARD_ACCEPT",
      syncId: sync.id,
      payload: acceptPayload,
    });

    console.log("Accepted clipboard sync:", sync.id);
  }

  /**
   * Reject incoming clipboard sync
   */
  rejectClipboardSync(sync: ClipboardSync, deviceId: string): void {
    useClipboardStore.getState().removePendingApproval(sync.id);

    this.sendMessage(deviceId, {
      type: "CLIPBOARD_REJECT",
      syncId: sync.id,
      payload: { contentId: sync.content.id, reason: "User rejected" },
    });

    console.log("Rejected clipboard sync:", sync.id);
  }

  /**
   * Start sending chunks
   */
  private async startSendingChunks(
    syncId: string,
    deviceId: string,
  ): Promise<void> {
    const content = this.sendingContent.get(syncId);
    if (!content) {
      console.error("No content found for sync:", syncId);
      return;
    }

    useClipboardStore.getState().updateSyncStatus(syncId, "syncing");

    const totalChunks = Math.ceil(content.length / CHUNK_SIZE);
    let sentBytes = 0;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, content.length);
      const chunk = content.substring(start, end);
      const isLast = i === totalChunks - 1;

      const chunkPayload: ClipboardChunkPayload = {
        chunkId: i,
        data: chunk,
        isLast,
      };

      this.sendMessage(deviceId, {
        type: "CLIPBOARD_CHUNK",
        syncId,
        payload: chunkPayload,
      });

      sentBytes += chunk.length;
      useClipboardStore.getState().updateSyncProgress(syncId, sentBytes);

      // Small delay to prevent overwhelming the channel
      if (!isLast) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    // Send complete message
    const completePayload: ClipboardCompletePayload = {
      contentId: this.sendingContent.get(syncId)!,
    };

    this.sendMessage(deviceId, {
      type: "CLIPBOARD_COMPLETE",
      syncId,
      payload: completePayload,
    });

    // Cleanup
    this.sendingContent.delete(syncId);
    useClipboardStore.getState().updateSyncStatus(syncId, "completed");

    console.log(`Clipboard sync completed: ${syncId}`);
  }

  /**
   * Handle incoming clipboard chunk
   */
  private handleClipboardChunk(
    message: ClipboardMessage<ClipboardChunkPayload>,
  ): void {
    const payload = message.payload;
    const chunks = this.receivingContent.get(message.syncId) || [];

    chunks[payload.chunkId] = payload.data;
    this.receivingContent.set(message.syncId, chunks);

    const activeSync = useClipboardStore.getState().activeSync;
    if (activeSync && activeSync.id === message.syncId) {
      const receivedBytes = chunks.reduce(
        (sum, chunk) => sum + chunk.length,
        0,
      );
      useClipboardStore
        .getState()
        .updateSyncProgress(message.syncId, receivedBytes);
    }
  }

  /**
   * Handle clipboard sync complete
   */
  private async handleClipboardComplete(
    message: ClipboardMessage<ClipboardCompletePayload>,
  ): Promise<void> {
    const chunks = this.receivingContent.get(message.syncId);
    if (!chunks) {
      console.error("No chunks found for sync:", message.syncId);
      return;
    }

    // Reassemble content
    const content = chunks.join("");
    const activeSync = useClipboardStore.getState().activeSync;

    if (!activeSync || activeSync.id !== message.syncId) {
      console.error("No active sync found:", message.syncId);
      return;
    }

    // Update clipboard content
    const clipboardContent: ClipboardContent = {
      ...activeSync.content,
      content,
    };

    // Write to local clipboard
    try {
      if (clipboardContent.type === "text") {
        await clipboardService.writeText(content);
      } else if (clipboardContent.type === "image") {
        await clipboardService.writeImage(
          content,
          clipboardContent.mimeType || "image/png",
        );
      }

      // Add to history
      useClipboardStore.getState().addToHistory(clipboardContent);

      // Update last hash to prevent re-syncing
      this.lastClipboardHash = this.hashContent(content);

      useClipboardStore
        .getState()
        .updateSyncStatus(message.syncId, "completed");

      console.log(
        "Clipboard content received and written:",
        clipboardContent.type,
      );
    } catch (error) {
      console.error("Failed to write clipboard:", error);
      useClipboardStore
        .getState()
        .updateSyncStatus(message.syncId, "failed", String(error));
    }

    // Cleanup
    this.receivingContent.delete(message.syncId);
  }

  /**
   * Handle clipboard sync error
   */
  private handleClipboardError(message: ClipboardMessage): void {
    const payload = message.payload as { error: string };
    useClipboardStore
      .getState()
      .updateSyncStatus(message.syncId, "failed", payload.error);
    this.receivingContent.delete(message.syncId);
    this.sendingContent.delete(message.syncId);
  }

  /**
   * Send message via WebRTC
   */
  private sendMessage(deviceId: string, message: ClipboardMessage): void {
    try {
      webrtcService.sendData(deviceId, message);
    } catch (error) {
      console.error("Failed to send clipboard message:", error);
    }
  }

  /**
   * Simple hash function for content comparison
   */
  private hashContent(content: string): string {
    // Simple hash for change detection (not cryptographic)
    let hash = 0;
    for (let i = 0; i < Math.min(content.length, 1000); i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }
}

export const clipboardSyncService = new ClipboardSyncService();
