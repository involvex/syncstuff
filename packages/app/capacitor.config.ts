import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.syncstuff.app",
  appName: "Syncstuff",
  webDir: "dist",
  plugins: {
    Electron: {
      appId: "com.syncstuff.app",
      appName: "Syncstuff",
      webDir: "dist",
      bundledWebRuntime: false,
    },
  },
};

export default config;
