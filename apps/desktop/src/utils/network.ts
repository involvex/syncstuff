import { createSocket, type Socket } from "dgram";
import { networkInterfaces } from "os";

export interface LocalDevice {
  id: string;
  name: string;
  platform: string;
  ip: string;
  port: number;
  version: string;
}

const SYNCSTUFF_PORT = 5353; // mDNS port

/**
 * Network scanner for discovering SyncStuff devices on local network
 * Uses UDP multicast to find devices
 */
class NetworkScanner {
  private socket: Socket | null = null;

  /**
   * Get local IP addresses
   */
  getLocalIPs(): string[] {
    const interfaces = networkInterfaces();
    const ips: string[] = [];

    for (const name of Object.keys(interfaces)) {
      const iface = interfaces[name];
      if (!iface) continue;

      for (const addr of iface) {
        if (addr.family === "IPv4" && !addr.internal) {
          ips.push(addr.address);
        }
      }
    }

    return ips;
  }

  /**
   * Scan the local network for SyncStuff devices
   * Uses UDP broadcast to discover devices
   */
  async scan(timeout = 10000): Promise<LocalDevice[]> {
    return new Promise(resolve => {
      const devices: LocalDevice[] = [];
      const seenIds = new Set<string>();

      try {
        this.socket = createSocket({ type: "udp4", reuseAddr: true });

        this.socket.on("error", err => {
          console.error("Scanner error:", err.message);
          this.cleanup();
          resolve(devices);
        });

        this.socket.on("message", (msg, rinfo) => {
          try {
            const data = JSON.parse(msg.toString());

            if (data.service === "syncstuff" && data.deviceId) {
              if (!seenIds.has(data.deviceId)) {
                seenIds.add(data.deviceId);
                devices.push({
                  id: data.deviceId,
                  name: data.deviceName || "Unknown Device",
                  platform: data.platform || "unknown",
                  ip: rinfo.address,
                  port: data.port || 8080,
                  version: data.version || "1.0.0",
                });
              }
            }
          } catch {
            // Ignore non-JSON messages
          }
        });

        this.socket.bind(0, () => {
          this.socket?.setBroadcast(true);

          // Send discovery broadcast
          const discoveryMessage = JSON.stringify({
            service: "syncstuff",
            action: "discover",
            timestamp: Date.now(),
          });

          // Broadcast on local network
          const localIPs = this.getLocalIPs();
          for (const ip of localIPs) {
            const parts = ip.split(".");
            parts[3] = "255";
            const broadcastAddr = parts.join(".");

            this.socket?.send(
              discoveryMessage,
              0,
              discoveryMessage.length,
              SYNCSTUFF_PORT,
              broadcastAddr,
            );
          }

          // Also try mDNS multicast address
          this.socket?.send(
            discoveryMessage,
            0,
            discoveryMessage.length,
            SYNCSTUFF_PORT,
            "224.0.0.251",
          );
        });

        // Cleanup after timeout
        setTimeout(() => {
          this.cleanup();
          resolve(devices);
        }, timeout);
      } catch (error) {
        console.error("Failed to start scanner:", error);
        resolve(devices);
      }
    });
  }

  private cleanup(): void {
    if (this.socket) {
      try {
        this.socket.close();
      } catch {
        // Ignore close errors
      }
      this.socket = null;
    }
  }

  /**
   * Send a message to a specific device
   */
  async sendTo(ip: string, port: number, message: object): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = createSocket("udp4");
      const data = JSON.stringify(message);

      socket.send(data, 0, data.length, port, ip, err => {
        socket.close();
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Start advertising this device on the local network
   */
  startAdvertising(
    deviceName: string,
    port: number,
    platform = "cli",
  ): NodeJS.Timer {
    const socket = createSocket({ type: "udp4", reuseAddr: true });

    socket.bind(() => {
      socket.setBroadcast(true);
    });

    const advertise = () => {
      const message = JSON.stringify({
        service: "syncstuff",
        deviceId: `cli-device-${Math.floor(Math.random() * 10000)}`, // Simple random ID for CLI
        deviceName,
        platform,
        port,
        version: "0.0.6", // Should match package.json
        timestamp: Date.now(),
      });

      const localIPs = this.getLocalIPs();
      for (const ip of localIPs) {
        const parts = ip.split(".");
        parts[3] = "255";
        const broadcastAddr = parts.join(".");

        socket.send(message, 0, message.length, SYNCSTUFF_PORT, broadcastAddr);
      }

      // Also send to multicast group
      socket.send(message, 0, message.length, SYNCSTUFF_PORT, "224.0.0.251");
    };

    // Advertise immediately
    advertise();

    // Then every 3 seconds
    return setInterval(advertise, 3000);
  }
}

export const networkScanner = new NetworkScanner();
