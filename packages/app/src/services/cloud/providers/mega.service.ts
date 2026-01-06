import type {
  CloudProvider,
  CloudAccount,
  CloudFile,
} from "../../../types/cloud.types";
import { Storage } from "megajs";

export class MegaService implements CloudProvider {
  readonly type = "mega";
  name = "Mega";
  icon = "cloud-outline";

  private storage: Storage | null = null;

  async initialize(): Promise<void> {
    console.log("Mega Service initialized");
  }

  async authenticate(): Promise<CloudAccount> {
    if (this.storage) {
      return this.getAccountInfo();
    }
    // Mega requires credentials (email/pass) which we can't get here without UI interaction
    throw new Error("CREDENTIALS_REQUIRED");
  }

  async login(email: string, pass: string): Promise<CloudAccount> {
    return new Promise((resolve, reject) => {
      try {
        const storage = new Storage({
          email,
          password: pass,
          keepalive: true,
        });

        storage.ready
          .then(async () => {
            this.storage = storage;
            const account = await this.getAccountInfo();
            resolve(account);
          })
          .catch(err => {
            console.error("Mega login error:", err);
            reject(new Error("Mega login failed: " + err.message));
          });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        reject(new Error(errorMsg));
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.storage) {
      this.storage = null;
    }
    console.log("Disconnecting from Mega");
  }

  async listFiles(folderId?: string): Promise<CloudFile[]> {
    if (!this.storage) throw new Error("Not authenticated");

    const folder = folderId ? this.storage.files[folderId] : this.storage.root;
    if (!folder || !folder.children) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return folder.children.map((f: any) => ({
      id: f.nodeId,
      name: f.name,
      mimeType: f.directory
        ? "application/vnd.google-apps.folder"
        : f.type || "application/octet-stream",
      size: f.size || 0,
      modifiedTime: f.timestamp ? new Date(f.timestamp * 1000) : new Date(),
      parents: [folderId || "root"],
      provider: "mega",
      accountId: "mega-user",
    }));
  }

  async uploadFile(file: File, parentId?: string): Promise<CloudFile> {
    if (!this.storage) throw new Error("Not authenticated");

    const folder = parentId ? this.storage.files[parentId] : this.storage.root;
    if (!folder) throw new Error("Folder not found");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const upload = (folder as any).upload(file.name, file);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uploadedFile: any = await upload.complete;

    return {
      id: uploadedFile.nodeId,
      name: uploadedFile.name,
      mimeType: file.type,
      size: file.size,
      modifiedTime: new Date(),
      parents: [parentId || "root"],
      provider: "mega",
      accountId: "mega-user",
    };
  }

  async downloadFile(fileId: string): Promise<Blob> {
    if (!this.storage) throw new Error("Not authenticated");

    const file = this.storage.files[fileId];
    if (!file) throw new Error("File not found");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = (file as any).download();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chunks: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for await (const chunk of stream as any) {
      chunks.push(chunk);
    }

    return new Blob(chunks);
  }

  async getQuota(): Promise<{ used: number; total: number }> {
    if (!this.storage) throw new Error("Not authenticated");

    const info = await this.storage.getAccountInfo();
    return {
      used: info.spaceUsed,
      total: info.spaceTotal,
    };
  }

  private async getAccountInfo(): Promise<CloudAccount> {
    if (!this.storage) throw new Error("No storage");
    const info = await this.storage.getAccountInfo();

    return {
      id: "mega-user",
      provider: "mega",
      name: "Mega User",
      email: "user@mega.nz",
      isAuthenticated: true,
      quotaUsed: info.spaceUsed,
      quotaTotal: info.spaceTotal,
    };
  }
}
