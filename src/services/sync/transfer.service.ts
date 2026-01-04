import { useTransferStore } from "../../store/transfer.store";
import { webrtcService } from "../network/webrtc.service";
import type {
  FileTransfer,
  TransferMessage,
  FileOfferPayload,
  FileChunkPayload,
} from "../../types/transfer.types";
import { generateFileId } from "../../utils/crypto.utils";

// Max chunk size (16KB is safe for WebRTC data channels)
const CHUNK_SIZE = 16 * 1024;

class TransferService {
  private sendingFiles: Map<string, File> = new Map(); // Keep reference to Blob/File objects

  constructor() {
    // Listen for incoming data
    webrtcService.onDataReceived((deviceId, data) => {
      this.handleIncomingMessage(deviceId, data as TransferMessage);
    });
  }

  /**
   * Send a file to a device
   */
  async sendFile(file: File, deviceId: string) {
    const transferId = generateFileId();

    // Store file reference for reading chunks
    this.sendingFiles.set(transferId, file);

    const transfer: FileTransfer = {
      id: transferId,
      file: {
        id: transferId, // Use transfer ID as file ID for simplicity in MVP
        name: file.name,
        size: file.size,
        type: file.type,
        blob: file,
      },
      deviceId,
      type: "send",
      status: "pending",
      progress: {
        transferredBytes: 0,
        totalBytes: file.size,
        percentage: 0,
        speed: 0,
        remainingTime: 0,
      },
      createdAt: new Date(),
    };

    useTransferStore.getState().addTransfer(transfer);

    // Send Offer
    const offerPayload: FileOfferPayload = {
      fileId: transferId,
      name: file.name,
      size: file.size,
      mimeType: file.type,
    };

    this.sendMessage(deviceId, {
      type: "FILE_OFFER",
      transferId,
      payload: offerPayload,
    });
  }

  /**
   * Handle incoming messages
   */
  private handleIncomingMessage(deviceId: string, message: TransferMessage) {
    switch (message.type) {
      case "FILE_OFFER":
        this.handleFileOffer(deviceId, message);
        break;
      case "FILE_ACCEPT":
        this.startSendingChunks(message.transferId, deviceId);
        break;
      case "FILE_REJECT":
        useTransferStore
          .getState()
          .updateTransferStatus(
            message.transferId,
            "cancelled",
            "Rejected by peer",
          );
        break;
      case "FILE_CHUNK":
        this.handleFileChunk(message);
        break;
      case "CHUNK_ACK":
        // Optional: Flow control
        break;
    }
  }

  /**
   * Handle File Offer
   */
  private handleFileOffer(deviceId: string, message: TransferMessage) {
    const payload = message.payload as FileOfferPayload;

    // Auto-accept for MVP (or check settings)
    const transfer: FileTransfer = {
      id: message.transferId,
      file: {
        id: payload.fileId,
        name: payload.name,
        size: payload.size,
        type: payload.mimeType,
      },
      deviceId,
      type: "receive",
      status: "transferring",
      progress: {
        transferredBytes: 0,
        totalBytes: payload.size,
        percentage: 0,
        speed: 0,
        remainingTime: 0,
      },
      createdAt: new Date(),
    };

    useTransferStore.getState().addTransfer(transfer);

    // Send Accept
    this.sendMessage(deviceId, {
      type: "FILE_ACCEPT",
      transferId: message.transferId,
      payload: {},
    });
  }

  /**
   * Start sending file chunks
   */
  private async startSendingChunks(transferId: string, deviceId: string) {
    const file = this.sendingFiles.get(transferId);
    if (!file) return;

    useTransferStore
      .getState()
      .updateTransferStatus(transferId, "transferring");

    let offset = 0;
    let chunkId = 0;

    const readNextChunk = () => {
      if (offset >= file.size) {
        // Complete
        this.sendMessage(deviceId, {
          type: "TRANSFER_COMPLETE",
          transferId,
          payload: {},
        });
        useTransferStore
          .getState()
          .updateTransferStatus(transferId, "completed");
        this.sendingFiles.delete(transferId);
        return;
      }

      const slice = file.slice(offset, offset + CHUNK_SIZE);
      const reader = new FileReader();

      reader.onload = e => {
        if (e.target?.result) {
          const data = e.target.result as string; // Data URL or ArrayBuffer?
          // Note: readAsDataURL gives base64, convenient for JSON transport
          // Optimization: readAsArrayBuffer is better but requires binary support in webrtc service

          // For MVP, lets strip Data URL prefix if present or just send as string

          this.sendMessage(deviceId, {
            type: "FILE_CHUNK",
            transferId,
            payload: {
              chunkId,
              data, // Base64
              isLast: offset + slice.size >= file.size,
            },
          });

          offset += slice.size;
          chunkId++;
          useTransferStore
            .getState()
            .updateTransferProgress(transferId, offset);

          // Next chunk (add small delay to prevent buffer overflow/backpressure for now)
          setTimeout(readNextChunk, 10);
        }
      };

      reader.readAsDataURL(slice);
    };

    readNextChunk();
  }

  /**
   * Handle incoming file chunk
   */
  private handleFileChunk(message: TransferMessage) {
    const payload = message.payload as FileChunkPayload;

    // For MVP, we aren't stitching files yet (need FileManagerService properly connected)
    // We update progress to show it works

    // In real impl: Write chunk to disk/blob
    // const blobChunk = dataURLToBlob(payload.data);
    // ...

    // Simulating progress update based on chunk
    // Since we don't know the exact size of base64 chunk decoded without overhead,
    // we assume CHUNK_SIZE or calculate

    // Just blindly accept for MVP UI demo
    if (payload.isLast) {
      useTransferStore
        .getState()
        .updateTransferStatus(message.transferId, "completed");
    }
  }

  private sendMessage(deviceId: string, message: TransferMessage) {
    webrtcService.sendData(deviceId, message);
  }
}

export const transferService = new TransferService();
