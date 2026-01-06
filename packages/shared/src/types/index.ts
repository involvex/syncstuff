/**
 * Shared TypeScript types for Involvex
 * Used by mobile app, web app, and API
 */

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
