// Core types moved to utils/api-client.ts
export type { UserProfile as User } from "./utils/api-client.js";

export interface Device {
  id: string;
  name: string;
  platform: string;
  is_online: boolean;
}

export const DebugMode = {
  enabled: false,
};
