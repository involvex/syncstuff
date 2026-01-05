/**
 * Clipboard Types
 * Type definitions for clipboard synchronization
 */

export type ClipboardContentType = "text" | "image";

export interface ClipboardContent {
  id: string;
  type: ClipboardContentType;
  content: string; // Text content or base64 image data
  mimeType?: string; // For images: image/png, image/jpeg
  size: number; // Content size in bytes
  deviceId: string; // Source device
  deviceName: string; // Source device name
  timestamp: Date;
  synced: boolean; // Whether this was synced to/from another device
}

export type ClipboardSyncStatus =
  | "pending"
  | "syncing"
  | "completed"
  | "failed"
  | "rejected";

export interface ClipboardSync {
  id: string; // Unique sync ID
  content: ClipboardContent;
  deviceId: string; // Target/source device
  direction: "send" | "receive";
  status: ClipboardSyncStatus;
  progress: number; // 0-100 percentage for large content
  transferredBytes: number;
  totalBytes: number;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

// Message types for clipboard sync protocol
export type ClipboardMessageType =
  | "CLIPBOARD_OFFER"
  | "CLIPBOARD_ACCEPT"
  | "CLIPBOARD_REJECT"
  | "CLIPBOARD_CHUNK"
  | "CLIPBOARD_COMPLETE"
  | "CLIPBOARD_ERROR";

export interface ClipboardMessage<T = unknown> {
  type: ClipboardMessageType;
  syncId: string;
  payload: T;
}

// Payload types for each message type
export interface ClipboardOfferPayload {
  contentId: string;
  contentType: ClipboardContentType;
  size: number;
  mimeType?: string;
  preview?: string; // Text preview or thumbnail for images (max 100 chars/bytes)
  deviceName: string;
}

export interface ClipboardAcceptPayload {
  contentId: string;
}

export interface ClipboardRejectPayload {
  contentId: string;
  reason?: string;
}

export interface ClipboardChunkPayload {
  chunkId: number;
  data: string; // Base64-encoded chunk
  isLast: boolean;
}

export interface ClipboardCompletePayload {
  contentId: string;
  checksum?: string;
}

export interface ClipboardErrorPayload {
  contentId: string;
  error: string;
}

// Store state
export interface ClipboardState {
  clipboardHistory: ClipboardContent[];
  activeSync: ClipboardSync | null;
  pendingApproval: ClipboardSync[];
  isMonitoring: boolean;
  lastClipboardContent: string | null; // To detect changes
}

// Settings
export interface ClipboardSettings {
  autoSync: boolean;
  syncImages: boolean;
  showPreview: boolean;
  maxHistoryItems: number;
}
