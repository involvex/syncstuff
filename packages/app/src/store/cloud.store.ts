import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CloudAccount } from "../types/cloud.types";

interface CloudState {
  accounts: CloudAccount[];
  isLoading: boolean;
  error: string | null;

  addAccount: (account: CloudAccount) => void;
  removeAccount: (accountId: string) => void;
  updateAccount: (accountId: string, updates: Partial<CloudAccount>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCloudStore = create<CloudState>()(
  persist(
    set => ({
      accounts: [],
      isLoading: false,
      error: null,

      addAccount: account =>
        set(state => ({
          accounts: [...state.accounts, account],
          error: null,
        })),

      removeAccount: accountId =>
        set(state => ({
          accounts: state.accounts.filter(a => a.id !== accountId),
        })),

      updateAccount: (accountId, updates) =>
        set(state => ({
          accounts: state.accounts.map(a =>
            a.id === accountId ? { ...a, ...updates } : a,
          ),
        })),

      setLoading: isLoading => set({ isLoading }),
      setError: error => set({ error }),
    }),
    {
      name: "cloud-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // Use standard localStorage for now, can switch to ionic/storage wrapper if needed
      partialize: state => ({ accounts: state.accounts }), // Only persist accounts
    },
  ),
);
