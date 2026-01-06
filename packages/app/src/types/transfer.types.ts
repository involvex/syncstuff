export interface TransferFile {
  id: string;
  name: string;
  size: number;
  type: string;
  path?: string; // Local path if available
  blob?: Blob; // For web file picking
}

export type TransferStatus =
  | "pending"
  | "transferring"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export type TransferType = "send" | "receive";

export interface TransferProgress {
  transferredBytes: number;
  totalBytes: number;
  speed: number; // bytes/sec
  percentage: number;
  remainingTime: number; // seconds
}

export interface FileTransfer {
  id: string;
  file: TransferFile;
  deviceId: string; // Target or Source device ID
  type: TransferType;
  status: TransferStatus;
  progress: TransferProgress;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
  checksum?: string;
}

// Protocol Messages
export type TransferMessageType =
  | "FILE_OFFER"
  | "FILE_ACCEPT"
  | "FILE_REJECT"
  | "FILE_CHUNK"
  | "CHUNK_ACK"
  | "TRANSFER_COMPLETE"
  | "TRANSFER_ERROR"
  | "CLIPBOARD_OFFER"
  | "CLIPBOARD_ACCEPT"
  | "CLIPBOARD_REJECT"
  | "CLIPBOARD_CHUNK"
  | "CLIPBOARD_COMPLETE"
  | "CLIPBOARD_ERROR";

export interface TransferMessage {
  type: TransferMessageType;
  transferId: string;
  payload: unknown;
}

export interface FileOfferPayload {
  fileId: string;
  name: string;
  size: number;
  mimeType: string;
  checksum?: string;
}

export interface FileChunkPayload {
  chunkId: number;
  data: string; // Base64 or stringified buffer
  isLast: boolean;
}
