export type CloudProviderType = "google" | "mega" | "mock";

export interface CloudAccount {
  id: string;
  provider: CloudProviderType;
  name: string; // User's display name
  email: string;
  avatarUrl?: string;
  isAuthenticated: boolean;
  lastSync?: Date;
  quotaUsed?: number;
  quotaTotal?: number;
}

export interface CloudFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  thumbnailUrl?: string;
  modifiedTime: Date;
  parents: string[];
  provider: CloudProviderType;
  accountId: string;
}

export interface CloudProvider {
  type: CloudProviderType;
  name: string;
  icon: string;

  initialize(): Promise<void>;
  authenticate(): Promise<CloudAccount>;
  disconnect(): Promise<void>;

  listFiles(folderId?: string): Promise<CloudFile[]>;
  uploadFile(file: File, parentId?: string): Promise<CloudFile>;
  downloadFile(fileId: string): Promise<Blob>;

  getQuota(): Promise<{ used: number; total: number }>;
}
