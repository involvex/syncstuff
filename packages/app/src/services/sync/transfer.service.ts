import { useTransferStore } from "../../store/transfer.store";
import type {
  FileChunkPayload,
  FileOfferPayload,
  FileTransfer,
  TransferMessage,
} from "../../types/transfer.types";
import {
  decryptData,
  encryptData,
  generateFileId,
} from "../../utils/crypto.utils";
import { webrtcService } from "../network/webrtc.service";
import { fileManagerService } from "../storage/file-manager.service";

// Max chunk size (16KB is safe for WebRTC data channels)
const CHUNK_SIZE = 16 * 1024;
// Temporary shared key for MVP - in production this should be derived from pairing
const ENCRYPTION_KEY = "syncstuff-secure-transfer-key";

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

    console.log(`Initiating file transfer ${transferId} to ${deviceId}`);

    // Send Offer
    const offerPayload: FileOfferPayload = {
      fileId: transferId,
      name: file.name,
      size: file.size,
      mimeType: file.type,
    };

    console.log(`Sending FILE_OFFER for ${file.name} to ${deviceId}`);
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
        console.log(
          `Received FILE_ACCEPT for ${message.transferId} from ${deviceId}`,
        );
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

    console.log(
      `Received file offer for ${payload.name} from ${deviceId}. Auto-accepting.`,
    );

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

          // Strip Data URL prefix if present for cleaner encryption
          const base64Content = data.includes(",") ? data.split(",")[1] : data;

          // Encrypt the chunk
          const encryptedData = encryptData(base64Content, ENCRYPTION_KEY);

          this.sendMessage(deviceId, {
            type: "FILE_CHUNK",
            transferId,
            payload: {
              chunkId,
              data: encryptedData, // Send encrypted data
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
  private async handleFileChunk(message: TransferMessage) {
    const { getState } = useTransferStore;
    const transfer = getState().activeTransfers.find(
      t => t.id === message.transferId,
    );
    if (!transfer) return;

    const payload = message.payload as FileChunkPayload;

    try {
      // Decrypt the data
      const decryptedBase64 = decryptData(payload.data, ENCRYPTION_KEY);

      if (!decryptedBase64) {
        throw new Error("Decryption failed");
      }

      await fileManagerService.writeFileChunk(
        transfer.file.name,
        decryptedBase64,
        true, // append
      );

      // Approximate size since we don't have original byte length easily from base64 string without decoding
      // But for progress bar, this is "good enough" or we can calculate from base64 length
      const chunkSize = (decryptedBase64.length * 3) / 4;

      const newTransferredBytes =
        transfer.progress.transferredBytes + chunkSize;

      getState().updateTransferProgress(
        message.transferId,
        newTransferredBytes,
      );

      if (payload.isLast) {
        getState().updateTransferStatus(message.transferId, "completed");
      }
    } catch (e) {
      console.error("Failed to handle file chunk", e);
      getState().updateTransferStatus(
        message.transferId,
        "failed",
        "Failed to write file chunk",
      );
    }
  }

  private sendMessage(deviceId: string, message: TransferMessage) {
    webrtcService.sendData(deviceId, message);
  }
}

export const transferService = new TransferService();
