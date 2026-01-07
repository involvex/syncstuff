import type {
  CloudProvider,
  CloudAccount,
  CloudFile,
} from "../../../types/cloud.types";

const CLIENT_ID =
  "699308700646-6a9no4bf3osp21v6rljeq7p4cqsriims.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/drive.file";

// Declare global types for Google Identity Services and GAPI if not already present
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gapi: any;
  }
}

export class GoogleDriveService implements CloudProvider {
  readonly type = "google";
  name = "Google Drive";
  icon = "logo-google";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private tokenClient: any;
  private accessToken: string | null = null;
  private gapiInited = false;
  private gisInited = false;
  private accountId: string | null = null;

  async initialize(): Promise<void> {
    console.log("Initializing Google Drive Service...");
    await Promise.all([this.loadGapiClient(), this.loadGisClient()]);
    console.log("Google Drive Service initialized");
  }

  private loadGapiClient(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        this.gapiInited = true;
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.onload = () => {
        window.gapi.load("client", async () => {
          await window.gapi.client.init({
            // apiKey: API_KEY, // Optional for some APIs, but often needed for discovery
            discoveryDocs: [
              "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
            ],
          });
          this.gapiInited = true;
          resolve();
        });
      };
      script.onerror = err => reject(err);
      document.body.appendChild(script);
    });
  }

  private loadGisClient(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google) {
        this.gisInited = true;
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.onload = () => {
        this.gisInited = true;
        resolve();
      };
      script.onerror = err => reject(err);
      document.body.appendChild(script);
    });
  }

  async authenticate(): Promise<CloudAccount> {
    if (!this.gapiInited || !this.gisInited) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      try {
        this.tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback: async (resp: any) => {
            if (resp.error !== undefined) {
              // Handle specific error for Android/Web client mismatch
              if (
                resp.error === "invalid_client" ||
                resp.error.includes("Storage relay URI is not allowed")
              ) {
                console.error(
                  "Google Drive Auth Error: Client ID configuration mismatch. Ensure you are using a 'Web application' Client ID for web/hybrid apps, not an Android Client ID.",
                );
                reject(
                  new Error(
                    "Google Client ID configuration error. See console for details.",
                  ),
                );
                return;
              }
              reject(resp);
              return;
            }
            this.accessToken = resp.access_token;

            // Get user info
            const about = await window.gapi.client.drive.about.get({
              fields: "user",
            });

            const user = about.result.user;
            this.accountId = user.permissionId || "unknown";

            resolve({
              id: this.accountId!,
              name: user.displayName || "Google User",
              email: user.emailAddress || "",
              provider: "google",
              avatarUrl: user.photoLink,
              isAuthenticated: true,
            });
          },
        });

        // Request token
        if (window.gapi.client.getToken() === null) {
          this.tokenClient.requestAccessToken({ prompt: "consent" });
        } else {
          this.tokenClient.requestAccessToken({ prompt: "" });
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.accessToken) {
      window.google.accounts.oauth2.revoke(this.accessToken, () => {
        console.log("Token revoked");
      });
      this.accessToken = null;
      this.accountId = null;
    }
  }

  async listFiles(folderId: string = "root"): Promise<CloudFile[]> {
    if (!this.accessToken) {
      throw new Error("Not authenticated");
    }

    const response = await window.gapi.client.drive.files.list({
      pageSize: 100,
      fields:
        "nextPageToken, files(id, name, mimeType, size, modifiedTime, thumbnailLink, parents)",
      q: `'${folderId}' in parents and trashed = false`,
    });

    const files = response.result.files;
    if (!files) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return files.map((f: any) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      size: f.size ? parseInt(f.size) : 0,
      modifiedTime: new Date(f.modifiedTime),
      thumbnailUrl: f.thumbnailLink,
      parents: f.parents || [],
      provider: "google",
      accountId: this.accountId || "unknown",
    }));
  }

  async uploadFile(file: File, parentId: string = "root"): Promise<CloudFile> {
    if (!this.accessToken) {
      throw new Error("Not authenticated");
    }

    const metadata = {
      name: file.name,
      mimeType: file.type,
      parents: [parentId],
    };

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" }),
    );
    form.append("file", file);

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: new Headers({ Authorization: "Bearer " + this.accessToken }),
        body: form,
      },
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await response.json();

    return {
      id: result.id,
      name: result.name,
      mimeType: result.mimeType,
      size: file.size,
      modifiedTime: new Date(),
      parents: [parentId],
      provider: "google",
      accountId: this.accountId || "unknown",
    };
  }

  async downloadFile(fileId: string): Promise<Blob> {
    if (!this.accessToken) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        method: "GET",
        headers: new Headers({ Authorization: "Bearer " + this.accessToken }),
      },
    );

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    return await response.blob();
  }

  async getQuota(): Promise<{ used: number; total: number }> {
    if (!this.accessToken) throw new Error("Not authenticated");

    const response = await window.gapi.client.drive.about.get({
      fields: "storageQuota",
    });

    const quota = response.result.storageQuota;
    return {
      used: parseInt(quota.usage),
      total: parseInt(quota.limit),
    };
  }
}
