import { useCallback } from "react";
import { transferService } from "../services/sync/transfer.service";
import { useTransferStore } from "../store/transfer.store";

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
