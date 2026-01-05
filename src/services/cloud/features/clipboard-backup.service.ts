import { cloudManagerService } from '../cloud-manager.service';
import { useCloudStore } from '../../../store/cloud.store';
import { useSettingsStore } from '../../../store/settings.store';
import { useClipboardStore } from '../../../store/clipboard.store';
import type { ClipboardContent } from '../../../types/clipboard.types';

export class CloudClipboardBackupService {
  private static readonly BACKUP_FOLDER_NAME = 'Syncstuff Clipboard History';

  /**
   * Backup clipboard item to all connected cloud accounts
   */
  async backupToCloud(item: ClipboardContent): Promise<void> {
    const { accounts } = useCloudStore.getState();
    const settings = useSettingsStore.getState();

    // Check if cloud backup is enabled (we need to add this setting)
    // For now, assume if an account exists, we might want to back up
    if (accounts.length === 0) return;

    // Convert content to file
    const file = this.convertClipboardToFile(item);
    if (!file) return;

    console.log(`Backing up clipboard item ${item.id} to cloud...`);

    // Upload to all connected providers (or primary)
    // Ideally, we check/create a specific folder first
    for (const account of accounts) {
      try {
        const provider = cloudManagerService.getProvider(account.provider);
        if (!provider) continue;

        // In a real app, we'd check/create the folder here.
        // For Mock/MVP, we just upload to root or a specific folder ID if we knew it.
        // Let's assume root for now or simulate folder creation logic in the provider.
        
        await provider.uploadFile(file);
        console.log(`Backed up to ${account.name} (${account.provider})`);
      } catch (error) {
        console.error(`Failed to backup to ${account.provider}:`, error);
      }
    }
  }

  private convertClipboardToFile(item: ClipboardContent): File | null {
    try {
      if (item.type === 'text') {
        const blob = new Blob([item.content], { type: 'text/plain' });
        const filename = `clipboard-${new Date(item.timestamp).toISOString().replace(/[:.]/g, '-')}.txt`;
        return new File([blob], filename, { type: 'text/plain' });
      } else if (item.type === 'image') {
        // Content is base64
        const byteString = atob(item.content);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: item.mimeType || 'image/png' });
        const ext = item.mimeType?.split('/')[1] || 'png';
        const filename = `clipboard-${new Date(item.timestamp).toISOString().replace(/[:.]/g, '-')}.${ext}`;
        return new File([blob], filename, { type: item.mimeType || 'image/png' });
      }
    } catch (e) {
      console.error('Failed to convert clipboard content to file:', e);
    }
    return null;
  }
}

export const cloudClipboardBackupService = new CloudClipboardBackupService();
