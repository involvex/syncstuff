import SimplePeer from "simple-peer";
import type { Instance as SimplePeerInstance, SignalData } from "simple-peer";
import type {
  PeerConnection,
  ConnectionState,
  SignalMessage,
} from "../../types/network.types";

type DataReceivedCallback = (deviceId: string, data: unknown) => void;
type ConnectionStateCallback = (
  deviceId: string,
  state: ConnectionState,
) => void;
type SignalCallback = (signal: SignalMessage) => void;

interface PeerConnectionInfo {
  peer: SimplePeerInstance;
  deviceId: string;
  state: ConnectionState;
  initiator: boolean;
  createdAt: Date;
}

class WebRTCService {
  private peers: Map<string, PeerConnectionInfo> = new Map();
  private currentDeviceId: string | null = null;
  private onDataReceivedCallbacks: Set<DataReceivedCallback> = new Set();
  private onConnectionStateCallbacks: Set<ConnectionStateCallback> = new Set();
  private onSignalCallbacks: Set<SignalCallback> = new Set();

  /**
   * Initialize the WebRTC service with the current device ID
   */
  initialize(deviceId: string): void {
    this.currentDeviceId = deviceId;
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
   * Handle an incoming offer/answer signal
   */
  handleSignal(signal: SignalMessage): void {
    const { from, type, data } = signal;

    let peerInfo = this.peers.get(from);

    if (!peerInfo) {
      // Create peer for incoming connection
      if (type === "offer") {
        const peer = this.createPeer(from, false);
        peerInfo = this.setupPeerEventHandlers(peer, from, false);
      } else {
        console.warn(`Received ${type} without existing peer connection`);
        return;
      }
    }

    try {
      // We explicitly cast here because we know our SignalMessage data structure
      // should match what SimplePeer expects (SDP/Candidate objects)
      peerInfo.peer.signal(data as SignalData);
    } catch (error) {
      console.error("Error handling signal:", error);
      this.updateConnectionState(from, "failed");
    }
  }

  /**
   * Send data to a peer
   */
  sendData(deviceId: string, data: unknown): void {
    const peerInfo = this.peers.get(deviceId);

    if (!peerInfo) {
      console.warn(`No connection to ${deviceId}`);
      return;
    }

    if (peerInfo.state !== "connected") {
      console.warn(
        `Connection to ${deviceId} is not established (state: ${peerInfo.state})`,
      );
      return;
    }

    try {
      const message = JSON.stringify(data);
      peerInfo.peer.send(message);
    } catch (error) {
      console.error("Error sending data:", error);
    }
  }

  /**
   * Close connection to a peer
   */
  closeConnection(deviceId: string): void {
    const peerInfo = this.peers.get(deviceId);

    if (peerInfo) {
      try {
        peerInfo.peer.destroy();
      } catch (e) {
        console.error("Error destroying peer:", e);
      }
      this.peers.delete(deviceId);
      this.updateConnectionState(deviceId, "closed");
    }
  }

  /**
   * Close all connections
   */
  closeAllConnections(): void {
    this.peers.forEach((peerInfo, deviceId) => {
      try {
        peerInfo.peer.destroy();
      } catch (e) {
        console.error("Error destroying peer:", e);
      }
      this.updateConnectionState(deviceId, "closed");
    });
    this.peers.clear();
  }

  /**
   * Get connection state for a device
   */
  getConnectionState(deviceId: string): ConnectionState | null {
    return this.peers.get(deviceId)?.state || null;
  }

  /**
   * Get all active connections
   */
  getActiveConnections(): PeerConnection[] {
    return Array.from(this.peers.values()).map(info => ({
      deviceId: info.deviceId,
      state: info.state,
      initiator: info.initiator,
      createdAt: info.createdAt,
    }));
  }

  /**
   * Subscribe to data received events
   */
  onDataReceived(callback: DataReceivedCallback): () => void {
    this.onDataReceivedCallbacks.add(callback);
    return () => {
      this.onDataReceivedCallbacks.delete(callback);
    };
  }

  /**
   * Subscribe to connection state changes
   */
  onConnectionStateChange(callback: ConnectionStateCallback): () => void {
    this.onConnectionStateCallbacks.add(callback);
    return () => {
      this.onConnectionStateCallbacks.delete(callback);
    };
  }

  /**
   * Subscribe to signal events (for signaling server)
   */
  onSignal(callback: SignalCallback): () => void {
    this.onSignalCallbacks.add(callback);
    return () => {
      this.onSignalCallbacks.delete(callback);
    };
  }

  /**
   * Create a SimplePeer instance
   */
  private createPeer(deviceId: string, initiator: boolean): SimplePeerInstance {
    // SimplePeer constructor might vary depending on how it's imported in some environments
    // But with node-polyfills, it should behave as a standard class.
    const peer = new SimplePeer({
      initiator,
      trickle: true,
      config: {
        iceServers: [
          // STUN servers for NAT traversal (public, no TURN for MVP)
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      },
    });

    return peer;
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

    // Signal event (for WebRTC signaling)
    peer.on("signal", (data: SignalData) => {
      if (!this.currentDeviceId) return;

      const signalType = initiator ? "offer" : "answer";
      // We don't check for 'candidate' type specifically in the simple logic
      // because SimplePeer usually bundles everything or we treat them as part of the flow.
      // But typically 'candidate' signals are separate.
      // For MVP, we pass everything along.

      const signal: SignalMessage = {
        from: this.currentDeviceId,
        to: deviceId,
        type: data.type === "candidate" ? "candidate" : signalType,
        data,
        timestamp: new Date(),
      };

      this.onSignalCallbacks.forEach(callback => callback(signal));
    });

    // Connection established
    peer.on("connect", () => {
      console.log(`Connected to ${deviceId}`);
      this.updateConnectionState(deviceId, "connected");
    });

    // Data received
    peer.on("data", (data: Uint8Array) => {
      try {
        const message = JSON.parse(data.toString());
        this.onDataReceivedCallbacks.forEach(callback =>
          callback(deviceId, message),
        );
      } catch (error) {
        console.error("Error parsing received data:", error);
      }
    });

    // Connection closed
    peer.on("close", () => {
      console.log(`Connection to ${deviceId} closed`);
      this.peers.delete(deviceId);
      this.updateConnectionState(deviceId, "closed");
    });

    // Error
    peer.on("error", (error: Error) => {
      console.error(`Peer error with ${deviceId}:`, error);
      this.updateConnectionState(deviceId, "failed");
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
    if (peerInfo) {
      peerInfo.state = state;
    }

    this.onConnectionStateCallbacks.forEach(callback =>
      callback(deviceId, state),
    );
  }
}

// Export singleton instance
export const webrtcService = new WebRTCService();
