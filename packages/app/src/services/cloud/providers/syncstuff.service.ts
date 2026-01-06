import type {
  CloudAccount,
  CloudFile,
  CloudProvider,
  CloudProviderType,
} from "../../../types/cloud.types";
import { personCircleOutline } from "ionicons/icons";

export class SyncstuffService implements CloudProvider {
  type: CloudProviderType = "syncstuff";
  name = "Syncstuff";
  icon = personCircleOutline;
  private token: string | null = null;
  private API_URL = "https://syncstuff-api.involvex.workers.dev/api"; // Updated to deployed API

  async initialize(): Promise<void> {
    const storedToken = localStorage.getItem("syncstuff_token");
    if (storedToken) {
      this.token = storedToken;
    }
  }

  async authenticate(): Promise<CloudAccount> {
    // This method is called by the UI.
    // Since we need credentials, we expect the UI to handle the collection
    // or we can't fully authenticate here without args.
    // We will throw an error to signal the UI to ask for credentials
    // OR we return a placeholder if we want to simulate the flow.

    if (this.token) {
      return this.getAccountInfo();
    }

    throw new Error("CREDENTIALS_REQUIRED");
  }

  async login(email: string, password: string): Promise<CloudAccount> {
    try {
      const response = await fetch(`${this.API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new Error((data as any).error || "Login failed");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.token = (data as any).data.token;
      localStorage.setItem("syncstuff_token", this.token!);

      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (data as any).data.user.id,
        provider: "syncstuff",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name: (data as any).data.user.username,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        email: (data as any).data.user.email,
        isAuthenticated: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        avatarUrl: (data as any).data.user.avatar_url,
      };
    } catch (error) {
      console.error("Syncstuff Login Error:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.token = null;
    localStorage.removeItem("syncstuff_token");
  }

  async listFiles(_folderId?: string): Promise<CloudFile[]> {
    if (!this.token) throw new Error("Not authenticated");
    // TODO: Implement file listing API
    return [];
  }

  async uploadFile(_file: File, _parentId?: string): Promise<CloudFile> {
    if (!this.token) throw new Error("Not authenticated");
    // TODO: Implement upload API
    throw new Error("Not implemented");
  }

  async downloadFile(_fileId: string): Promise<Blob> {
    if (!this.token) throw new Error("Not authenticated");
    // TODO: Implement download API
    throw new Error("Not implemented");
  }

  async getQuota(): Promise<{ used: number; total: number }> {
    // Placeholder
    return { used: 0, total: 1024 * 1024 * 1024 * 5 }; // 5GB
  }

  private async getAccountInfo(): Promise<CloudAccount> {
    // TODO: Fetch user info using token
    return {
      id: "current-user",
      provider: "syncstuff",
      name: "Syncstuff User",
      email: "user@syncstuff.app",
      isAuthenticated: true,
    };
  }
}
