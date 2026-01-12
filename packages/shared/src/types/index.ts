// /* biome-ignore lint: reasonbiome(suppressions/unused) */
/**
 * Shared TypeScript types for Involvex
 * Used by mobile app, web app, and API
 */

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  role: "user" | "admin" | "moderator";
  avatar_url?: string;
  preferences?: UserSettings;
  status: "active" | "suspended" | "pending";
  created_at: number;
  updated_at: number;
}

export interface UserSettings {
  isDarkMode: boolean;
  enablePushNotifications: boolean;
  enableDebugMode: boolean;
  requestTimeout: number;
  enableBetaFeatures: boolean;
  notificationTime: string;
}

export interface Notification {
  id: string;
  type: "release" | "trending" | "milestone";
  title: string;
  body: string;
  data?: string;
  is_read: boolean;
  scheduled_for?: number;
  delivered_at?: number;
  created_at: number;
}

export interface CacheEntry {
  key: string;
  value: string;
  expires_at: number;
  created_at: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  full_name?: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword: string;
}
