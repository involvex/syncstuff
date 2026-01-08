import type { Device, Platform } from "./device.types";
import type { ZeroConfService } from "capacitor-zeroconf";

export interface DiscoveredDevice extends Device {
  service?: ZeroConfService;
}

// WebRTC Connection Types
export type ConnectionState =
  | "new"
  | "connecting"
  | "connected"
  | "disconnected"
  | "failed"
  | "closed";

export interface PeerConnection {
  deviceId: string;
  state: ConnectionState;
  initiator: boolean;
  createdAt: Date;
}

// Signaling Message Types
export type SignalType = "offer" | "answer" | "candidate" | "pair";

export interface SignalMessage {
  from: string;
  fromName?: string;
  fromPlatform?: string;
  to: string;
  type: SignalType;
  data: unknown;
  timestamp: Date;
}

// Pairing Types
export type PairingRequestStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "timeout";

export interface PairingRequest {
  id: string;
  deviceId: string;
  name: string;
  platform: Platform;
  status: PairingRequestStatus;
  timestamp: Date;
}

// Network Status
export interface NetworkStatus {
  connected: boolean;
  connectionType: "wifi" | "cellular" | "none" | "unknown";
  ssid?: string;
}

// Service Registration
export const SYNCSTUFF_SERVICE_TYPE = "_syncstuff._tcp";
export const SYNCSTUFF_SERVICE_DOMAIN = "local.";
export const SYNCSTUFF_SERVICE_PORT = 8080;

export interface ServiceTxtRecord {
  version: string;
  platform: string;
  deviceId: string;
  deviceName: string;
}
