import { useCallback } from "react";
import { useTransferStore } from "../store/transfer.store";
import { transferService } from "../services/sync/transfer.service";

export const useTransfer = () => {
  const { activeTransfers, transferHistory } = useTransferStore();

  const sendFile = useCallback(async (file: File, deviceId: string) => {
    try {
      await transferService.sendFile(file, deviceId);
    } catch (error) {
      console.error("Failed to send file:", error);
    }
  }, []);

  return {
    activeTransfers,
    transferHistory,
    sendFile,
  };
};
