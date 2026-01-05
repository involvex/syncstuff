import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CloudClipboardBackupService } from './clipboard-backup.service';
import { cloudManagerService } from '../cloud-manager.service';
import { useCloudStore } from '../../../store/cloud.store';
import type { CloudAccount, CloudProvider } from '../../../types/cloud.types';
import type { ClipboardContent } from '../../../types/clipboard.types';

// Mock dependencies
vi.mock('../cloud-manager.service', () => ({
  cloudManagerService: {
    getProvider: vi.fn(),
  },
}));

vi.mock('../../../store/cloud.store', () => ({
  useCloudStore: {
    getState: vi.fn(),
  },
}));

describe('CloudClipboardBackupService', () => {
  let service: CloudClipboardBackupService;
  
  beforeEach(() => {
    service = new CloudClipboardBackupService();
    vi.clearAllMocks();
  });

  it('should not backup if no accounts are connected', async () => {
    (useCloudStore.getState as any).mockReturnValue({ accounts: [] });
    
    const content: ClipboardContent = {
      id: '1',
      type: 'text',
      content: 'test content',
      size: 12,
      deviceId: 'device1',
      deviceName: 'Device 1',
      timestamp: new Date(),
      synced: false,
    };

    await service.backupToCloud(content);
    expect(cloudManagerService.getProvider).not.toHaveBeenCalled();
  });

  it('should backup text content to connected accounts', async () => {
    const mockAccount: CloudAccount = {
      id: 'acc1',
      provider: 'mock',
      name: 'Test',
      email: 'test@example.com',
      isAuthenticated: true,
    };

    (useCloudStore.getState as any).mockReturnValue({ accounts: [mockAccount] });
    
    const mockProvider = {
      uploadFile: vi.fn().mockResolvedValue({ id: 'file1' }),
    } as unknown as CloudProvider;

    (cloudManagerService.getProvider as any).mockReturnValue(mockProvider);

    const content: ClipboardContent = {
      id: '1',
      type: 'text',
      content: 'test content',
      size: 12,
      deviceId: 'device1',
      deviceName: 'Device 1',
      timestamp: new Date(),
      synced: false,
    };

    await service.backupToCloud(content);

    expect(cloudManagerService.getProvider).toHaveBeenCalledWith('mock');
    expect(mockProvider.uploadFile).toHaveBeenCalled();
    const uploadedFile = (mockProvider.uploadFile as any).mock.calls[0][0] as File;
    expect(uploadedFile).toBeInstanceOf(File);
    expect(uploadedFile.name).toMatch(/^clipboard-.*\.txt$/);
  });

  it('should backup image content to connected accounts', async () => {
    const mockAccount: CloudAccount = {
      id: 'acc1',
      provider: 'mock',
      name: 'Test',
      email: 'test@example.com',
      isAuthenticated: true,
    };

    (useCloudStore.getState as any).mockReturnValue({ accounts: [mockAccount] });
    
    const mockProvider = {
      uploadFile: vi.fn().mockResolvedValue({ id: 'file1' }),
    } as unknown as CloudProvider;

    (cloudManagerService.getProvider as any).mockReturnValue(mockProvider);

    // Base64 encoded "Hello"
    const content: ClipboardContent = {
      id: '1',
      type: 'image',
      content: 'SGVsbG8=',
      mimeType: 'image/png',
      size: 5,
      deviceId: 'device1',
      deviceName: 'Device 1',
      timestamp: new Date(),
      synced: false,
    };

    await service.backupToCloud(content);

    expect(cloudManagerService.getProvider).toHaveBeenCalledWith('mock');
    expect(mockProvider.uploadFile).toHaveBeenCalled();
    const uploadedFile = (mockProvider.uploadFile as any).mock.calls[0][0] as File;
    expect(uploadedFile).toBeInstanceOf(File);
    expect(uploadedFile.name).toMatch(/^clipboard-.*\.png$/);
    expect(uploadedFile.type).toBe('image/png');
  });
});
