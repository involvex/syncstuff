import { v4 as uuidv4 } from "uuid";
import type {
  CloudAccount,
  CloudFile,
  CloudProvider,
} from "../../../types/cloud.types";

export class MockCloudService implements CloudProvider {
  readonly type = "mock";
  name = "Mock Cloud";
  icon = "cloud-outline";

  private isAuthenticated = false;
  private mockFiles: CloudFile[] = [
    {
      id: "1",
      name: "Document.pdf",
      mimeType: "application/pdf",
      size: 1024 * 1024 * 2.5, // 2.5MB
      modifiedTime: new Date(),
      parents: ["root"],
      provider: "mock",
      accountId: "mock-user-1",
    },
    {
      id: "2",
      name: "Vacation.jpg",
      mimeType: "image/jpeg",
      size: 1024 * 500, // 500KB
      modifiedTime: new Date(Date.now() - 86400000), // Yesterday
      parents: ["root"],
      provider: "mock",
      accountId: "mock-user-1",
    },
  ];

  async initialize(): Promise<void> {
    console.log("Mock Cloud initialized");
  }

  async authenticate(): Promise<CloudAccount> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    this.isAuthenticated = true;
    return {
      id: "mock-user-1",
      provider: "mock",
      name: "Test User",
      email: "user@example.com",
      isAuthenticated: true,
      lastSync: new Date(),
      quotaUsed: 1024 * 1024 * 100, // 100MB
      quotaTotal: 1024 * 1024 * 1024 * 15, // 15GB
    };
  }

  async disconnect(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    this.isAuthenticated = false;
  }

  async listFiles(folderId = "root"): Promise<CloudFile[]> {
    if (!this.isAuthenticated) throw new Error("Not authenticated");
    await new Promise(resolve => setTimeout(resolve, 800));
    return this.mockFiles.filter(f => f.parents.includes(folderId));
  }

  async uploadFile(file: File, parentId = "root"): Promise<CloudFile> {
    if (!this.isAuthenticated) throw new Error("Not authenticated");
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newFile: CloudFile = {
      id: uuidv4(),
      name: file.name,
      mimeType: file.type,
      size: file.size,
      modifiedTime: new Date(),
      parents: [parentId],
      provider: "mock",
      accountId: "mock-user-1",
    };

    this.mockFiles.push(newFile);
    return newFile;
  }

  async downloadFile(_fileId: string): Promise<Blob> {
    if (!this.isAuthenticated) throw new Error("Not authenticated");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return new Blob(["Mock file content"], { type: "text/plain" });
  }

  async getQuota(): Promise<{ used: number; total: number }> {
    return {
      used: 1024 * 1024 * 100,
      total: 1024 * 1024 * 1024 * 15,
    };
  }
}
