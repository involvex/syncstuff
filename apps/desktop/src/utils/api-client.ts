import { readConfig, writeConfig } from "./config.js";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    full_name?: string;
    role: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  role: "user" | "admin" | "moderator";
  status: "active" | "suspended" | "pending";
  preferences?: unknown;
  created_at: number;
  updated_at: number;
}

export interface Device {
  id: string;
  name: string;
  type: string;
  platform: string;
  last_seen: number;
  is_online: boolean;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl =
      process.env.SYNCSTUFF_API_URL ||
      "https://syncstuff-api.involvex.workers.dev";
    this.loadToken();
  }

  private loadToken(): void {
    const config = readConfig();
    this.token = config.token || null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const contentType = response.headers.get("Content-Type");
      let data: ApiResponse<T>;

      if (contentType?.includes("application/json")) {
        data = (await response.json()) as ApiResponse<T>;
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text) as ApiResponse<T>;
        } catch {
          return {
            success: false,
            error: text || `HTTP ${response.status}: ${response.statusText}`,
          };
        }
      }

      if (!response.ok) {
        return {
          success: false,
          error:
            data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Network error occurred",
      };
    }
  }

  async login(
    email: string,
    password: string,
  ): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data?.token) {
      this.token = response.data.token;
      const config = readConfig();
      config.token = this.token;
      config.user = response.data.user;
      writeConfig(config);
    }

    return response;
  }

  async logout(): Promise<void> {
    const config = readConfig();
    config.token = null;
    config.user = null;
    writeConfig(config);
    this.token = null;
  }

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>("/api/user/profile", {
      method: "GET",
    });
  }

  async getDevices(): Promise<ApiResponse<Device[]>> {
    // TODO: Implement when API endpoint is available
    return this.request<Device[]>("/api/devices", {
      method: "GET",
    });
  }

  async transferFile(
    deviceId: string,
    filePath: string,
  ): Promise<ApiResponse<{ transferId: string }>> {
    // TODO: Implement when API endpoint is available
    return this.request<{ transferId: string }>("/api/transfer", {
      method: "POST",
      body: JSON.stringify({ deviceId, filePath }),
    });
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }
}

export const apiClient = new ApiClient();
