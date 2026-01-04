import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.syncstuff.app",
  appName: "Syncstuff",
  webDir: "dist",
  plugins: {
    LiveUpdates: {
      appId: "7524ceb1",
      channel: "Production",
      autoUpdateMethod: "background",
      maxVersions: 2,
    },
  },
};

export default config;
