import SimplePeer from "simple-peer";
import type { Instance as SimplePeerInstance, SignalData } from "simple-peer";
import { io, Socket } from "socket.io-client";
import type { ConnectionState, SignalMessage } from "../../types/network.types";

// For development, assumes signaling server is running on localhost.
// In a real app, this would be a public URL.
const SIGNALING_SERVER_URL = "http://localhost:3001";

type DataReceivedCallback = (deviceId: string, data: unknown) => void;
type ConnectionStateCallback = (
  deviceId: string,
  state: ConnectionState,
) => void;

interface PeerConnectionInfo {
  peer: SimplePeerInstance;
  deviceId: string;
  state: ConnectionState;
  initiator: boolean;
  createdAt: Date;
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
        this.handleSignal(signal);
      }
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from signaling server.");
    });
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

    try {
      peerInfo.peer.signal(data as SignalData);
    } catch (error) {
      console.error(`Error handling signal from ${from}:`, error);
      this.updateConnectionState(from, "failed");
    }
  }

  /**
   * Send data to a peer
   */
  sendData(deviceId: string, data: unknown): void {
    const peerInfo = this.peers.get(deviceId);
    if (peerInfo?.state === "connected") {
      try {
        peerInfo.peer.send(JSON.stringify(data));
      } catch (error) {
        console.error("Error sending data:", error);
      }
    } else {
      console.warn(
        `Connection to ${deviceId} not established. State: ${peerInfo?.state}`,
      );
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
    };
    this.peers.set(deviceId, peerInfo);

    peer.on("signal", (data: SignalData) => {
      if (!this.currentDeviceId) return;

      const signal: SignalMessage = {
        from: this.currentDeviceId,
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

    peer.on("connect", () => this.updateConnectionState(deviceId, "connected"));
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
    this.onConnectionStateCallbacks.forEach(cb => cb(deviceId, state));
  }
}

// Export singleton instance
export const webrtcService = new WebRTCService();
