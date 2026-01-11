import { personCircleOutline } from "ionicons/icons";
import type {
  CloudAccount,
  CloudFile,
  CloudProvider,
  CloudProviderType,
} from "../../../types/cloud.types";

interface AuthResponse {
  success: boolean;
  error?: string;
  data: {
    token: string;
    user: {
      id: string;
      username: string;
      email: string;
      avatar_url?: string;
    };
  };
}

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
      const account = await this.getAccountInfo();
      if (account) {
        return account;
      }
      // Token exists but account info is null, token might be expired
      this.token = null;
      localStorage.removeItem("syncstuff_token");
    }

    throw new Error("CREDENTIALS_REQUIRED");
  }

  async login(email: string, password: string): Promise<CloudAccount> {
    // Retry logic for network issues (especially on mobile)
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch(`${this.API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Read response text once - we'll parse it as JSON if possible
        const responseText = await response.text();
        const contentType = response.headers.get("content-type");

        // Check if response is ok
        if (!response.ok) {
          let errorMessage = "Login failed";
          // Try to parse as JSON first
          if (contentType?.includes("application/json")) {
            try {
              const errorData = JSON.parse(responseText);
              errorMessage =
                errorData.error || errorData.message || errorMessage;
            } catch {
              // If JSON parse fails, use the text as-is
              errorMessage =
                responseText ||
                `HTTP ${response.status}: ${response.statusText}`;
            }
          } else {
            errorMessage =
              responseText || `HTTP ${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        // Response is ok, try to parse as JSON
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(
            `Invalid response format: ${responseText.substring(0, 100)}`,
          );
        }

        let data: AuthResponse;
        try {
          data = JSON.parse(responseText) as AuthResponse;
        } catch (_parseError) {
          throw new Error(
            `Failed to parse response: ${responseText.substring(0, 100)}`,
          );
        }

        if (!data.success) {
          throw new Error(data.error || "Login failed");
        }

        if (!data.data || !data.data.token || !data.data.user) {
          throw new Error("Invalid response data from server");
        }

        this.token = data.data.token;
        localStorage.setItem("syncstuff_token", this.token);

        return {
          id: data.data.user.id,
          provider: "syncstuff",
          name: data.data.user.username,
          email: data.data.user.email,
          isAuthenticated: true,
          avatarUrl: data.data.user.avatar_url,
        };
      } catch (error) {
        console.error(
          `Syncstuff Login Error (attempt ${attempt}/${maxRetries}):`,
          error,
        );
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on authentication errors (4xx)
        if (error instanceof Error) {
          if (
            error.message.includes("401") ||
            error.message.includes("403") ||
            error.message.includes("Invalid credentials")
          ) {
            throw error;
          }
          // Check if it's a network error that we should retry
          if (
            error.message.includes("Failed to fetch") ||
            error.message.includes("NetworkError") ||
            error.message.includes("aborted") ||
            error.name === "AbortError"
          ) {
            if (attempt < maxRetries) {
              // Wait before retrying (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
              continue;
            }
          }
        }

        // If it's the last attempt or not a retryable error, throw
        if (attempt === maxRetries) {
          throw lastError;
        }
      }
    }

    // Should never reach here, but just in case
    throw lastError || new Error("Login failed after retries");
  }

  async disconnect(): Promise<void> {
    this.token = null;
    localStorage.removeItem("syncstuff_token");
  }

  async listFiles(folderId?: string): Promise<CloudFile[]> {
    if (!this.token) throw new Error("Not authenticated");
    try {
      const url = folderId
        ? `${this.API_URL}/files?folderId=${folderId}`
        : `${this.API_URL}/files`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to list files");
      }

      const data = (await response.json()) as {
        success: boolean;
        data: {
          id: string;
          name: string;
          size: number;
          mime_type: string;
          updated_at: string;
          is_folder?: boolean;
        }[];
      };

      if (!data.success) throw new Error("Failed to list files");

      return data.data.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        mimeType: file.mime_type,
        modifiedTime: new Date(file.updated_at),
        parents: [],
        provider: "syncstuff" as CloudProviderType,
        accountId: this.token || "", // Using token as a placeholder accountId
      }));
    } catch (error) {
      console.error("Syncstuff ListFiles Error:", error);
      return [];
    }
  }

  async uploadFile(file: File, parentId?: string): Promise<CloudFile> {
    if (!this.token) throw new Error("Not authenticated");
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (parentId) {
        formData.append("parentId", parentId);
      }

      const response = await fetch(`${this.API_URL}/files/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = (await response.json()) as {
        success: boolean;
        data: {
          id: string;
          name: string;
          size: number;
          mime_type: string;
          updated_at: string;
          is_folder?: boolean;
        };
      };

      if (!data.success) throw new Error("Failed to upload file");

      return {
        id: data.data.id,
        name: data.data.name,
        size: data.data.size,
        mimeType: data.data.mime_type,
        modifiedTime: new Date(data.data.updated_at),
        parents: [],
        provider: "syncstuff" as CloudProviderType,
        accountId: this.token || "",
      };
    } catch (error) {
      console.error("Syncstuff UploadFile Error:", error);
      throw error;
    }
  }

  async downloadFile(fileId: string): Promise<Blob> {
    if (!this.token) throw new Error("Not authenticated");
    try {
      const response = await fetch(`${this.API_URL}/files/download/${fileId}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      return await response.blob();
    } catch (error) {
      console.error("Syncstuff DownloadFile Error:", error);
      throw error;
    }
  }

  async getQuota(): Promise<{ used: number; total: number }> {
    // Placeholder
    return { used: 0, total: 1024 * 1024 * 1024 * 5 }; // 5GB
  }

  async getAccountInfo(): Promise<CloudAccount | null> {
    if (!this.token) {
      return null;
    }

    try {
      const response = await fetch(`${this.API_URL}/user/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          this.token = null;
          localStorage.removeItem("syncstuff_token");
          return null;
        }
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const data = (await response.json()) as {
        success: boolean;
        data?: {
          id: string;
          username: string;
          email: string;
          avatar_url?: string;
        };
        error?: string;
      };

      if (!data.success || !data.data) {
        throw new Error(data.error || "Failed to fetch profile");
      }

      return {
        id: data.data.id,
        provider: "syncstuff",
        name: data.data.username,
        email: data.data.email,
        isAuthenticated: true,
        avatarUrl: data.data.avatar_url,
      };
    } catch (error) {
      console.error("Syncstuff GetAccountInfo Error:", error);
      // If token is invalid, clear it
      if (error instanceof Error && error.message.includes("401")) {
        this.token = null;
        localStorage.removeItem("syncstuff_token");
      }
      return null;
    }
  }
}
