import { create } from "zustand";
import type { FileTransfer, TransferStatus } from "../types/transfer.types";

interface TransferStore {
  activeTransfers: FileTransfer[];
  transferHistory: FileTransfer[];

  addTransfer: (transfer: FileTransfer) => void;
  updateTransferStatus: (
    id: string,
    status: TransferStatus,
    error?: string,
  ) => void;
  updateTransferProgress: (id: string, transferredBytes: number) => void;
  removeTransfer: (id: string) => void;
  clearHistory: () => void;
}

export const useTransferStore = create<TransferStore>(set => ({
  activeTransfers: [],
  transferHistory: [],

  addTransfer: transfer =>
    set(state => ({
      activeTransfers: [...state.activeTransfers, transfer],
    })),

  updateTransferStatus: (id, status, error) =>
    set(state => {
      const active = state.activeTransfers.map(t =>
        t.id === id
          ? {
              ...t,
              status,
              error,
              completedAt: status === "completed" ? new Date() : undefined,
            }
          : t,
      );

      // Move to history if completed/failed/cancelled
      if (["completed", "failed", "cancelled"].includes(status)) {
        const completedTransfer = active.find(t => t.id === id);
        const remainingActive = active.filter(t => t.id !== id);

        return {
          activeTransfers: remainingActive,
          transferHistory: completedTransfer
            ? [completedTransfer, ...state.transferHistory]
            : state.transferHistory,
        };
      }

      return { activeTransfers: active };
    }),

  updateTransferProgress: (id, transferredBytes) =>
    set(state => ({
      activeTransfers: state.activeTransfers.map(t => {
        if (t.id !== id) return t;

        const percentage = Math.min(
          100,
          (transferredBytes / t.file.size) * 100,
        );

        return {
          ...t,
          progress: {
            ...t.progress,
            transferredBytes,
            percentage,
          },
        };
      }),
    })),

  removeTransfer: id =>
    set(state => ({
      activeTransfers: state.activeTransfers.filter(t => t.id !== id),
      transferHistory: state.transferHistory.filter(t => t.id !== id),
    })),

  clearHistory: () => set({ transferHistory: [] }),
}));
