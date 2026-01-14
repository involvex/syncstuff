import {
  LocalDevice,
  SYNCSTUFF_PROTOCOL,
  SYNCSTUFF_SERVICE_TYPE,
} from "@syncstuff/network-types";
import { Bonjour, Service, Browser } from "bonjour-service";
import { createSocket } from "dgram";
import { createRequire } from "module";
import { v4 as uuidv4 } from "uuid";
import { readConfig, writeConfig } from "./config.js";
const require = createRequire(import.meta.url);
const packageJson = require("../../../package.json");
/**
 * Network scanner for discovering SyncStuff devices on the local network using mDNS.
 */
class NetworkScanner {
  private bonjour: Bonjour;
  private browser: Browser | null = null;
  private ad: Service | null = null;

  constructor() {
    this.bonjour = new Bonjour();
  }

  /**
   * Scan the local network for SyncStuff devices using mDNS.
   */
  async scan(timeout = 5000): Promise<LocalDevice[]> {
    return new Promise(resolve => {
      if (this.browser) {
        this.browser.stop();
      }
      const devices: LocalDevice[] = [];
      const seenIds = new Set<string>();

      this.browser = this.bonjour.find({
        type: SYNCSTUFF_SERVICE_TYPE,
        protocol: SYNCSTUFF_PROTOCOL,
      });

      this.browser.on("up", (service: Service) => {
        const txt = service.txt || {};
        const deviceId = txt.deviceId;

        if (deviceId && !seenIds.has(deviceId)) {
          const ip = service.addresses.find(addr => addr.includes("."));
          if (ip) {
            seenIds.add(deviceId);
            devices.push({
              id: deviceId,
              name: txt.deviceName || service.name,
              platform: txt.platform || "unknown",
              ip,
              port: service.port,
              version: txt.version || "1.0.0",
            });
          }
        }
      });

      setTimeout(() => {
        if (this.browser) {
          this.browser.stop();
          this.browser = null;
        }
        resolve(devices);
      }, timeout);
    });
  }

  /**
   * Send a message to a specific device.
   * Note: This still uses a direct UDP socket, which is fine for direct communication
   * once a device's IP and port are known.
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
   * Start advertising this device on the local network using mDNS.
   */
  startAdvertising(deviceName: string, port: number, platform = "cli") {
    if (this.ad) {
      this.ad.stop(() => {
        this.ad = null;
        this.publish(deviceName, port, platform);
      });
    } else {
      this.publish(deviceName, port, platform);
    }
  }

  /**
   * Stop advertising this device.
   */
  stopAdvertising() {
    if (this.ad) {
      this.ad.stop(() => {
        this.ad = null;
        console.log("Stopped advertising.");
      });
    }
  }

  /**
   * Unpublish all services and destroy the bonjour instance.
   */
  destroy() {
    this.bonjour.unpublishAll(() => {
      this.bonjour.destroy();
    });
  }

  private publish(deviceName: string, port: number, platform: string) {
    let config = readConfig();
    if (!config.deviceId) {
      config.deviceId = uuidv4();
      writeConfig(config);
    }
    const deviceId = config.deviceId;
    const version = packageJson.version;

    this.ad = this.bonjour.publish({
      name: `${deviceName}-${deviceId.substring(0, 6)}`,
      type: SYNCSTUFF_SERVICE_TYPE,
      port,
      protocol: SYNCSTUFF_PROTOCOL,
      txt: {
        deviceId,
        deviceName,
        platform,
        version,
      },
    });
    console.log(`Advertising '${deviceName}' on the network...`);
  }
}

export const networkScanner = new NetworkScanner();

// Graceful shutdown
process.on("exit", () => networkScanner.destroy());
process.on("SIGINT", () => process.exit());
process.on("SIGTERM", () => process.exit());
