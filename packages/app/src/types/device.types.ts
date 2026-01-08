export type Platform = "android" | "ios" | "web" | "desktop";

export type DeviceStatus =
  | "discovered"
  | "paired"
  | "connected"
  | "disconnected"
  | "connecting";

export interface Device {
  id: string;
  name: string;
  platform: Platform;
  status: DeviceStatus;
  lastSeen: Date;
  ipAddress?: string;
  port?: number;
  battery?: {
    level: number;
    charging: boolean;
  };
}

export interface DeviceInfo {
  id: string;
  name: string;
  platform: Platform;
  version: string;
}
