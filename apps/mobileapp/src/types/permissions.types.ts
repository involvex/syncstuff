import type { PermissionState } from "@capacitor/core";

export type AppPermission =
  | "camera"
  | "notifications"
  | "bluetooth"
  | "location"
  | "storage";

export interface PermissionStatus {
  permission: AppPermission;
  state: PermissionState;
  canRequest: boolean;
}

export interface PermissionRequestResult {
  granted: boolean;
  state: PermissionState;
  shouldShowRationale?: boolean;
}
