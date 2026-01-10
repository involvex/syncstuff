import { App, type URLOpenListenerEvent } from "@capacitor/app";
import { useDeviceStore } from "../../store/device.store";
import { useSettingsStore } from "../../store/settings.store";
import { isNative } from "../../utils/platform.utils";

// The web app URL for pairing links
const WEB_APP_URL = "https://syncstuff-web.involvex.workers.dev";

class DeepLinkService {
  /**
   * Initialize deep link listener
   */
  async initialize() {
    if (isNative()) {
      App.addListener("appUrlOpen", (event: URLOpenListenerEvent) => {
        this.handleUrl(event.url);
      });

      // Handle URL that launched the app
      const launchUrl = await App.getLaunchUrl();
      if (launchUrl) {
        this.handleUrl(launchUrl.url);
      }
    } else {
      // For Web
      this.handleUrl(window.location.href);
    }
  }

  /**
   * Handle incoming URL
   */
  private handleUrl(urlStr: string) {
    try {
      const url = new URL(urlStr);

      // Check if it's a pairing URL
      // Expected format: syncstuff://pair?id=DEVICE_ID&name=DEVICE_NAME
      // Or: https://syncstuff.example.com/pair?id=DEVICE_ID&name=DEVICE_NAME
      if (url.pathname.includes("/pair") || url.protocol === "syncstuff:") {
        const id = url.searchParams.get("id");
        const name = url.searchParams.get("name");

        if (id && name) {
          this.handlePairingRequest(id, name);
        }
      }
    } catch (e) {
      console.error("Failed to parse URL:", e);
    }
  }

  /**
   * Handle pairing request from URL
   */
  private handlePairingRequest(id: string, name: string) {
    const { deviceId } = useSettingsStore.getState();

    // Don't pair with ourselves
    if (id === deviceId) return;

    console.log(`Pairing request received via URL: ${name} (${id})`);

    // We could automatically pair or show a confirm dialog
    // For now, let's use the existing store method
    useDeviceStore.getState().addPairedDevice({
      id,
      name,
      platform: "web", // Fallback, could be added to URL
      status: "paired",
      lastSeen: new Date(),
    });

    // Ideally we'd navigate to the Devices page or show a toast
  }

  /**
   * Generate a shareable pairing URL
   * Uses the web app URL so the link works across all platforms
   */
  generatePairingUrl(): string {
    const { deviceId, deviceName } = useSettingsStore.getState();
    // Always use web app URL for shareability
    return `${WEB_APP_URL}/pair?id=${deviceId}&name=${encodeURIComponent(deviceName)}`;
  }

  /**
   * Generate a syncstuff:// deep link URL
   * This opens the native app directly if installed
   */
  generateDeepLinkUrl(): string {
    const { deviceId, deviceName } = useSettingsStore.getState();
    return `syncstuff://pair?id=${deviceId}&name=${encodeURIComponent(deviceName)}`;
  }
}

export const deepLinkService = new DeepLinkService();
