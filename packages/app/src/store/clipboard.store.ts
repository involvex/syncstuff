import { create } from "zustand";
import type {
  ClipboardContent,
  ClipboardSync,
  ClipboardSyncStatus,
} from "../types/clipboard.types";
import { useSettingsStore } from "./settings.store";

interface ClipboardStore {
  clipboardHistory: ClipboardContent[];
  activeSync: ClipboardSync | null;
  pendingApproval: ClipboardSync[];
  isMonitoring: boolean;
  lastClipboardContent: string | null;

  // History management
  addToHistory: (content: ClipboardContent) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;

  // Sync management
  setActiveSync: (sync: ClipboardSync | null) => void;
  updateSyncStatus: (
    id: string,
    status: ClipboardSyncStatus,
    error?: string,
  ) => void;
  updateSyncProgress: (id: string, transferredBytes: number) => void;

  // Approval management
  addPendingApproval: (sync: ClipboardSync) => void;
  removePendingApproval: (id: string) => void;
  clearPendingApprovals: () => void;

  // Monitoring state
  setMonitoring: (isMonitoring: boolean) => void;
  setLastClipboardContent: (content: string | null) => void;
}

export const useClipboardStore = create<ClipboardStore>(set => ({
  clipboardHistory: [],
  activeSync: null,
  pendingApproval: [],
  isMonitoring: false,
  lastClipboardContent: null,

  addToHistory: content =>
    set(state => {
      // Trigger cloud backup if enabled
      const settings = useSettingsStore.getState();
      if (settings.clipboardCloudBackup) {
        import("../services/cloud/features/clipboard-backup.service").then(
          module => {
            module.cloudClipboardBackupService.backupToCloud(content);
          },
        );
      }

      // Limit history to 50 items (configurable)
      const maxItems = 50;
      const newHistory = [content, ...state.clipboardHistory];
      return {
        clipboardHistory: newHistory.slice(0, maxItems),
      };
    }),

  clearHistory: () => set({ clipboardHistory: [] }),

  removeFromHistory: id =>
    set(state => ({
      clipboardHistory: state.clipboardHistory.filter(item => item.id !== id),
    })),

  setActiveSync: sync => set({ activeSync: sync }),

  updateSyncStatus: (id, status, error) =>
    set(state => {
      if (!state.activeSync || state.activeSync.id !== id) {
        return state;
      }

      const updatedSync: ClipboardSync = {
        ...state.activeSync,
        status,
        error,
        completedAt: ["completed", "failed", "rejected"].includes(status)
          ? new Date()
          : undefined,
      };

      // Clear active sync if completed/failed/rejected
      if (["completed", "failed", "rejected"].includes(status)) {
        return { activeSync: null };
      }

      return { activeSync: updatedSync };
    }),

  updateSyncProgress: (id, transferredBytes) =>
    set(state => {
      if (!state.activeSync || state.activeSync.id !== id) {
        return state;
      }

      const percentage = Math.min(
        100,
        (transferredBytes / state.activeSync.totalBytes) * 100,
      );

      return {
        activeSync: {
          ...state.activeSync,
          transferredBytes,
          progress: percentage,
        },
      };
    }),

  addPendingApproval: sync =>
    set(state => ({
      pendingApproval: [...state.pendingApproval, sync],
    })),

  removePendingApproval: id =>
    set(state => ({
      pendingApproval: state.pendingApproval.filter(sync => sync.id !== id),
    })),

  clearPendingApprovals: () => set({ pendingApproval: [] }),

  setMonitoring: isMonitoring => set({ isMonitoring }),

  setLastClipboardContent: content => set({ lastClipboardContent: content }),
}));
