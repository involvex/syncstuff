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
    if (this.storage && this.storage.ready) {
        return this.getAccountInfo();
    }
    // Mega requires credentials (email/pass) which we can't get here without UI interaction
    throw new Error("CREDENTIALS_REQUIRED");
  }

  async login(email: string, pass: string): Promise<CloudAccount> {
      return new Promise((resolve, reject) => {
          try {
              this.storage = new Storage({
                  email,
                  password: pass,
                  keepalive: true
              });

              this.storage.ready.then(async () => {
                  const account = await this.getAccountInfo();
                  resolve(account);
              }).catch((err) => {
                  console.error("Mega login error:", err);
                  reject(new Error("Mega login failed: " + err.message));
              });

          } catch (err: any) {
              reject(err);
          }
      });
  }

  async disconnect(): Promise<void> {
    if (this.storage) {
        // megajs doesn't have a specific logout, just stop using it
        // and if keepalive was used, maybe close connection if exposed
        this.storage = null;
    }
    console.log("Disconnecting from Mega");
  }

  async listFiles(folderId?: string): Promise<CloudFile[]> {
    if (!this.storage || !this.storage.ready) throw new Error("Not authenticated");

    const folder = folderId ? this.storage.files[folderId] : this.storage.root;
    if (!folder || !folder.children) return [];

    return folder.children.map((f: any) => ({
      id: f.nodeId,
      name: f.name,
      mimeType: f.directory ? 'application/vnd.google-apps.folder' : (f.type || 'application/octet-stream'), // approximate mapping
      size: f.size || 0,
      modifiedTime: f.timestamp ? new Date(f.timestamp * 1000) : new Date(),
      parents: [folderId || 'root'],
      provider: 'mega',
      accountId: this.storage!.currentKey || 'mega-user' // megajs doesn't expose ID easily public
    }));
  }

  async uploadFile(file: File, parentId?: string): Promise<CloudFile> {
      if (!this.storage || !this.storage.ready) throw new Error("Not authenticated");
      
      const folder = parentId ? this.storage.files[parentId] : this.storage.root;
      if (!folder) throw new Error("Folder not found");

      // megajs upload expects a buffer or stream in Node, or File/Blob in browser
      // It supports File object directly in browser
      const upload = folder.upload({
          name: file.name,
          data: file
      });

      const uploadedFile: any = await upload.complete;

      return {
          id: uploadedFile.nodeId,
          name: uploadedFile.name,
          mimeType: file.type,
          size: file.size,
          modifiedTime: new Date(),
          parents: [parentId || 'root'],
          provider: 'mega',
          accountId: this.storage!.currentKey || 'mega-user'
      };
  }

  async downloadFile(fileId: string): Promise<Blob> {
      if (!this.storage || !this.storage.ready) throw new Error("Not authenticated");

      const file = this.storage.files[fileId];
      if (!file) throw new Error("File not found");

      const stream = file.download();
      
      // Convert stream/buffer to Blob
      // In browser megajs might return a web stream or we might need to handle chunks
      // Simplest way for small files:
      const chunks: any[] = [];
      for await (const chunk of stream) {
          chunks.push(chunk);
      }
      
      return new Blob(chunks);
  }

  async getQuota(): Promise<{ used: number; total: number }> {
      if (!this.storage || !this.storage.ready) throw new Error("Not authenticated");
      
      const info = await this.storage.getAccountInfo();
      return {
          used: info.spaceUsed,
          total: info.spaceTotal
      };
  }

  private async getAccountInfo(): Promise<CloudAccount> {
      if (!this.storage) throw new Error("No storage");
      const info = await this.storage.getAccountInfo();
      
      // megajs doesn't give display name easily in basic info, use email
      // We can mock ID or use a hash of email if needed
      return {
          id: this.storage.currentKey || 'mega-user', 
          provider: 'mega',
          name: 'Mega User', // Placeholder or fetch if possible
          email: 'user@mega.nz', // megajs 1.x might not expose email directly on storage instance public props easily without getAccountInfo response check
          isAuthenticated: true,
          quotaUsed: info.spaceUsed,
          quotaTotal: info.spaceTotal
      };
  }
}