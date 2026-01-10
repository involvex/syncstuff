import { useCloudStore } from "../../store/cloud.store";
import type { CloudAccount } from "../../types/cloud.types";
import { isElectron } from "../../utils/electron.utils";
import { clipboardService } from "../sync/clipboard.service";

class ElectronSyncService {
  private syncInterval: number | null = null;
  private isSyncing = false;

  async initialize(): Promise<void> {
    if (!isElectron()) {
      return;
    }

    // Start periodic sync when accounts are linked
    this.startPeriodicSync();
  }

  async linkAccount(account: CloudAccount): Promise<void> {
    // Store account info for sync (works on all platforms)
    localStorage.setItem(
      `electron_linked_account_${account.provider}`,
      JSON.stringify(account),
    );

    // Start syncing for this account if Electron is available
    if (isElectron()) {
      await this.syncAccount(account);
    }
  }

  async unlinkAccount(provider: string): Promise<void> {
    localStorage.removeItem(`electron_linked_account_${provider}`);
  }

  async syncAccount(account: CloudAccount): Promise<void> {
    if (this.isSyncing) {
      return;
    }

    this.isSyncing = true;
    try {
      // Sync clipboard
      if (account.provider === "syncstuff") {
        await this.syncClipboard(account);
      }

      // Sync files (if implemented)
      // await this.syncFiles(account);
    } catch (error) {
      console.error(`Failed to sync account ${account.provider}:`, error);
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncClipboard(_account: CloudAccount): Promise<void> {
    try {
      // Get clipboard content
      const clipboardContent = await clipboardService.read();

      if (!clipboardContent) {
        return;
      }

      // Upload to cloud (if API supports it)
      // This would require implementing clipboard backup API
      console.log("Clipboard sync:", clipboardContent);
    } catch (error) {
      console.error("Clipboard sync error:", error);
    }
  }

  private startPeriodicSync(): void {
    // Sync every 30 seconds
    this.syncInterval = window.setInterval(() => {
      this.syncAllAccounts();
    }, 30000);
  }

  private async syncAllAccounts(): Promise<void> {
    // Get accounts from the store
    const accounts = useCloudStore.getState().accounts;
    for (const account of accounts) {
      if (account.isAuthenticated) {
        await this.syncAccount(account);
      }
    }
  }

  stopPeriodicSync(): void {
    if (this.syncInterval !== null) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export const electronSyncService = new ElectronSyncService();
