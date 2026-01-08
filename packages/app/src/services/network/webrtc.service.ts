import SimplePeer from "simple-peer";
import type { Instance as SimplePeerInstance, SignalData } from "simple-peer";
import { io, Socket } from "socket.io-client";
import type { ConnectionState, SignalMessage } from "../../types/network.types";
import { useSettingsStore } from "../../store/settings.store";
import { getPlatform } from "../../utils/platform.utils";

// For development, assumes signaling server is running on localhost.
// In a real app, this would be a public URL.
// Default signaling server
let SIGNALING_SERVER_URL = "http://localhost:3001";

type DataReceivedCallback = (deviceId: string, data: unknown) => void;
type ConnectionStateCallback = (
  deviceId: string,
  state: ConnectionState,
  metadata?: { name?: string; platform?: string },
) => void;

interface PeerConnectionInfo {
  peer: SimplePeerInstance;
  deviceId: string;
  state: ConnectionState;
  initiator: boolean;
  createdAt: Date;
  pendingData: any[]; // Queue for data sent before connection
  name?: string;
  platform?: string;
}

class WebRTCService {
  private socket: Socket | null = null;
  private peers: Map<string, PeerConnectionInfo> = new Map();
  private currentDeviceId: string | null = null;
  private onDataReceivedCallbacks: Set<DataReceivedCallback> = new Set();
  private onConnectionStateCallbacks: Set<ConnectionStateCallback> = new Set();

  /**
   * Initialize the WebRTC service and connect to the signaling server.
   */
  initialize(deviceId: string): void {
    if (this.socket) {
      return;
    }

    this.currentDeviceId = deviceId;
    this.socket = io(SIGNALING_SERVER_URL);

    this.socket.on("connect", () => {
      console.log("Connected to signaling server.");
      this.socket?.emit("join", this.currentDeviceId);
    });

    this.socket.on("signal", (signal: SignalMessage) => {
      // Ensure we don't handle our own sent signals
      if (signal.from !== this.currentDeviceId) {
        console.log(
          `Received signal type ${signal.type} from ${signal.from} (${signal.fromName || "Unknown"})`,
        );
        this.handleSignal(signal);
      }
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from signaling server.");
    });

    // Handle heartbeats to keep socket alive
    setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit("heartbeat", { deviceId: this.currentDeviceId });
      }
    }, 30000);
  }

  /**
   * Update the signaling server URL and reconnect if necessary
   */
  updateSignalingServerUrl(url: string): void {
    if (url === SIGNALING_SERVER_URL) return;

    SIGNALING_SERVER_URL = url;

    if (this.socket) {
      console.log("Updating signaling server URL, reconnecting...");
      const oldDeviceId = this.currentDeviceId;
      this.disconnect();
      if (oldDeviceId) {
        this.initialize(oldDeviceId);
      }
    }
  }

  /**
   * Create a new peer connection (as initiator)
   */
  createOffer(deviceId: string): void {
    if (!this.currentDeviceId) {
      throw new Error("WebRTC service not initialized");
    }

    if (this.peers.has(deviceId)) {
      console.warn(`Connection to ${deviceId} already exists`);
      return;
    }

    const peer = this.createPeer(deviceId, true);
    this.setupPeerEventHandlers(peer, deviceId, true);
  }

  /**
   * Handle an incoming offer/answer signal from the signaling server
   */
  private handleSignal(signal: SignalMessage): void {
    const { from, type, data } = signal;

    let peerInfo = this.peers.get(from);

    if (!peerInfo) {
      if (type === "offer") {
        const peer = this.createPeer(from, false);
        peerInfo = this.setupPeerEventHandlers(peer, from, false);
      } else {
        console.warn(`Received signal for non-existent peer from ${from}`);
        return;
      }
    }

    // Update metadata if available
    if (signal.fromName) peerInfo.name = signal.fromName;
    if (signal.fromPlatform) peerInfo.platform = signal.fromPlatform;

    try {
      peerInfo.peer.signal(data as SignalData);
    } catch (error) {
      console.error(`Error handling signal from ${from}:`, error);
      this.updateConnectionState(from, "failed");
    }
  }

  /**
   * Send data to a peer. If not connected, it will be queued.
   */
  sendData(deviceId: string, data: unknown): void {
    const peerInfo = this.peers.get(deviceId);

    if (peerInfo) {
      if (peerInfo.state === "connected") {
        try {
          peerInfo.peer.send(JSON.stringify(data));
        } catch (error) {
          console.error("Error sending data:", error);
        }
      } else {
        console.log(`Queuing data for ${deviceId} (state: ${peerInfo.state})`);
        peerInfo.pendingData.push(data);
      }
    } else {
      console.warn(`Attempted to send data to unknown peer: ${deviceId}`);
    }
  }

  /**
   * Close connection to a peer
   */
  closeConnection(deviceId: string): void {
    const peerInfo = this.peers.get(deviceId);
    if (peerInfo) {
      peerInfo.peer.destroy();
      this.peers.delete(deviceId);
      this.updateConnectionState(deviceId, "closed");
    }
  }

  /**
   * Disconnect from the signaling server and close all connections
   */
  disconnect(): void {
    this.socket?.disconnect();
    this.peers.forEach((peerInfo, deviceId) => {
      peerInfo.peer.destroy();
      this.updateConnectionState(deviceId, "closed");
    });
    this.peers.clear();
    this.socket = null;
  }

  /**
   * Subscribe to data received events
   */
  onDataReceived(callback: DataReceivedCallback): () => void {
    this.onDataReceivedCallbacks.add(callback);
    return () => this.onDataReceivedCallbacks.delete(callback);
  }

  /**
   * Subscribe to connection state changes
   */
  onConnectionStateChange(callback: ConnectionStateCallback): () => void {
    this.onConnectionStateCallbacks.add(callback);
    return () => this.onConnectionStateCallbacks.delete(callback);
  }

  /**
   * Create a SimplePeer instance
   */
  private createPeer(deviceId: string, initiator: boolean): SimplePeerInstance {
    return new SimplePeer({
      initiator,
      trickle: true,
      config: {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      },
    });
  }

  /**
   * Set up event handlers for a peer connection
   */
  private setupPeerEventHandlers(
    peer: SimplePeerInstance,
    deviceId: string,
    initiator: boolean,
  ): PeerConnectionInfo {
    const peerInfo: PeerConnectionInfo = {
      peer,
      deviceId,
      state: "new",
      initiator,
      createdAt: new Date(),
      pendingData: [],
    };
    this.peers.set(deviceId, peerInfo);

    peer.on("signal", (data: SignalData) => {
      if (!this.currentDeviceId) return;

      const { deviceName } = useSettingsStore.getState();

      const signal: SignalMessage = {
        from: this.currentDeviceId,
        fromName: deviceName,
        fromPlatform: getPlatform(),
        to: deviceId,
        type:
          data.type === "candidate"
            ? "candidate"
            : initiator
              ? "offer"
              : "answer",
        data,
        timestamp: new Date(),
      };

      this.socket?.emit("signal", signal);
    });

    peer.on("connect", () => {
      console.log(`Peer connection established with ${deviceId}`);
      this.updateConnectionState(deviceId, "connected");

      // Send pending data
      const info = this.peers.get(deviceId);
      if (info && info.pendingData.length > 0) {
        console.log(
          `Sending ${info.pendingData.length} queued messages to ${deviceId}`,
        );
        info.pendingData.forEach(data => {
          try {
            info.peer.send(JSON.stringify(data));
          } catch (e) {
            console.error("Failed to send queued data:", e);
          }
        });
        info.pendingData = [];
      }
    });
    peer.on("close", () => this.closeConnection(deviceId));
    peer.on("error", () => this.updateConnectionState(deviceId, "failed"));

    peer.on("data", (data: Uint8Array) => {
      try {
        const message = JSON.parse(data.toString());
        this.onDataReceivedCallbacks.forEach(cb => cb(deviceId, message));
      } catch (error) {
        console.error("Error parsing received data:", error);
      }
    });

    this.updateConnectionState(deviceId, "connecting");
    return peerInfo;
  }

  /**
   * Update and emit connection state change
   */
  private updateConnectionState(
    deviceId: string,
    state: ConnectionState,
  ): void {
    const peerInfo = this.peers.get(deviceId);
    if (peerInfo) peerInfo.state = state;
    this.onConnectionStateCallbacks.forEach(cb =>
      cb(deviceId, state, {
        name: peerInfo?.name,
        platform: peerInfo?.platform,
      }),
    );
  }
}

// Export singleton instance
export const webrtcService = new WebRTCService();
