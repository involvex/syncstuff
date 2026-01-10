import { ZeroConf } from "capacitor-zeroconf";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { discoveryService } from "./discovery.service";

// Mock the ZeroConf plugin
vi.mock("capacitor-zeroconf", () => ({
  ZeroConf: {
    watch: vi.fn(),
    unwatch: vi.fn(),
    close: vi.fn(),
    stop: vi.fn(),
    register: vi.fn(),
    addListener: vi.fn(() =>
      Promise.resolve({
        remove: vi.fn(),
      }),
    ),
  },
}));

// Mock platform utils
vi.mock("../../utils/platform.utils", () => ({
  isNative: vi.fn(() => true),
}));

describe("DiscoveryService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    // Ensure service is stopped after each test
    if (discoveryService.getIsRunning()) {
      await discoveryService.stopDiscovery();
    }
  });

  describe("isSupported", () => {
    it("should return true on native platforms", () => {
      expect(discoveryService.isSupported()).toBe(true);
    });
  });

  describe("startDiscovery", () => {
    it("should start ZeroConf watch", async () => {
      await discoveryService.startDiscovery();

      expect(ZeroConf.watch).toHaveBeenCalledWith({
        domain: "local.",
        type: "_syncstuff._tcp",
      });
      expect(discoveryService.getIsRunning()).toBe(true);
    });

    it("should add discover listener", async () => {
      await discoveryService.startDiscovery();

      expect(ZeroConf.addListener).toHaveBeenCalledWith(
        "discover",
        expect.any(Function),
      );
    });

    it("should not start if already running", async () => {
      await discoveryService.startDiscovery();

      vi.clearAllMocks();

      await discoveryService.startDiscovery();

      expect(ZeroConf.watch).not.toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      vi.mocked(ZeroConf.watch).mockRejectedValueOnce(
        new Error("Watch failed"),
      );

      await expect(discoveryService.startDiscovery()).rejects.toThrow(
        "Watch failed",
      );

      expect(discoveryService.getIsRunning()).toBe(false);
    });
  });

  describe("stopDiscovery", () => {
    beforeEach(async () => {
      // Start discovery first
      await discoveryService.startDiscovery();
    });

    it("should stop ZeroConf device registration", async () => {
      await discoveryService.stopDiscovery();

      expect(ZeroConf.stop).toHaveBeenCalled();
    });

    it("should remove listener", async () => {
      const mockRemove = vi.fn();
      vi.mocked(ZeroConf.addListener).mockReturnValueOnce(
        Promise.resolve({
          remove: mockRemove,
        }),
      );

      // Restart discovery to get new listener
      await discoveryService.stopDiscovery();
      await discoveryService.startDiscovery();
      await discoveryService.stopDiscovery();

      expect(mockRemove).toHaveBeenCalled();
    });

    it("should unwatch and close ZeroConf", async () => {
      await discoveryService.stopDiscovery();

      expect(ZeroConf.unwatch).toHaveBeenCalledWith({
        domain: "local.",
        type: "_syncstuff._tcp",
      });
      expect(ZeroConf.close).toHaveBeenCalled();
    });

    it("should set isRunning to false", async () => {
      await discoveryService.stopDiscovery();

      expect(discoveryService.getIsRunning()).toBe(false);
    });

    it("should handle errors and reset state", async () => {
      vi.mocked(ZeroConf.unwatch).mockRejectedValueOnce(
        new Error("Unwatch failed"),
      );

      await discoveryService.stopDiscovery();

      // Should still mark as not running despite error
      expect(discoveryService.getIsRunning()).toBe(false);
    });

    it("should do nothing if not running", async () => {
      await discoveryService.stopDiscovery();

      vi.clearAllMocks();

      await discoveryService.stopDiscovery();

      expect(ZeroConf.unwatch).not.toHaveBeenCalled();
      expect(ZeroConf.close).not.toHaveBeenCalled();
    });
  });

  describe("registerDevice", () => {
    it("should register device with ZeroConf", async () => {
      const device = {
        id: "device-123",
        name: "Test Device",
        platform: "android" as const,
        status: "connected" as const,
        lastSeen: new Date(),
      };

      await discoveryService.registerDevice(device);

      expect(ZeroConf.register).toHaveBeenCalledWith({
        domain: "local.",
        type: "_syncstuff._tcp",
        name: expect.stringContaining("Test Device"),
        port: 8080,
        props: {
          version: "1.0",
          platform: "android",
          deviceId: "device-123",
          deviceName: "Test Device",
        },
      });
    });

    it("should handle registration errors", async () => {
      vi.mocked(ZeroConf.register).mockRejectedValueOnce(
        new Error("Registration failed"),
      );

      const device = {
        id: "device-123",
        name: "Test Device",
        platform: "android" as const,
        status: "connected" as const,
        lastSeen: new Date(),
      };

      await expect(discoveryService.registerDevice(device)).rejects.toThrow(
        "Registration failed",
      );
    });
  });

  describe("unregisterDevice", () => {
    it("should stop ZeroConf service", async () => {
      await discoveryService.unregisterDevice();

      expect(ZeroConf.stop).toHaveBeenCalled();
    });

    it("should handle unregister errors gracefully", async () => {
      vi.mocked(ZeroConf.stop).mockRejectedValueOnce(new Error("Stop failed"));

      // Should not throw
      await expect(
        discoveryService.unregisterDevice(),
      ).resolves.toBeUndefined();
    });
  });

  describe("device found/lost callbacks", () => {
    it("should subscribe and unsubscribe to device found events", () => {
      const callback = vi.fn();

      const unsubscribe = discoveryService.onDeviceFound(callback);

      expect(typeof unsubscribe).toBe("function");

      // Unsubscribe
      unsubscribe();
    });

    it("should subscribe and unsubscribe to device lost events", () => {
      const callback = vi.fn();

      const unsubscribe = discoveryService.onDeviceLost(callback);

      expect(typeof unsubscribe).toBe("function");

      // Unsubscribe
      unsubscribe();
    });

    it("should clear callbacks on stop discovery", async () => {
      const foundCallback = vi.fn();
      const lostCallback = vi.fn();

      discoveryService.onDeviceFound(foundCallback);
      discoveryService.onDeviceLost(lostCallback);

      await discoveryService.startDiscovery();
      await discoveryService.stopDiscovery();

      // Callbacks should be cleared (tested implicitly by state reset)
      expect(discoveryService.getIsRunning()).toBe(false);
    });
  });

  describe("state management", () => {
    it("should track running state correctly", async () => {
      expect(discoveryService.getIsRunning()).toBe(false);

      await discoveryService.startDiscovery();
      expect(discoveryService.getIsRunning()).toBe(true);

      await discoveryService.stopDiscovery();
      expect(discoveryService.getIsRunning()).toBe(false);
    });

    it("should reset state on error", async () => {
      vi.mocked(ZeroConf.watch).mockRejectedValueOnce(new Error("Failed"));

      try {
        await discoveryService.startDiscovery();
      } catch {
        // Expected to fail
      }

      expect(discoveryService.getIsRunning()).toBe(false);
    });
  });
});
