/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
// import { tamaguiPlugin } from "@tamagui/vite-plugin";
import path from "path";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
// Note: Tamagui plugin temporarily disabled for initial setup
// Will be re-enabled after verifying base functionality works
export default defineConfig({
  plugins: [
    react({
      fastRefresh: false,
    }),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  // Use relative paths for Electron compatibility
  base: "./",
  define: {
    "process.env.TAMAGUI_TARGET": JSON.stringify("native"),
  },
  // Only optimize main app entry, exclude Android/iOS build artifacts
  optimizeDeps: {
    entries: ["./index.html"],
    include: [
      "react-native-web",
      "react-native-svg",
      "zustand",
      "lucide-react",
    ],
    exclude: ["react-native"],
  },
  resolve: {
    alias: {
      // Alias react-native to react-native-web
      "react-native": "react-native-web",
      // Point to root node_modules for consistent resolution
      "lucide-react": path.resolve(
        __dirname,
        "../../node_modules/lucide-react/dist/esm/lucide-react.js",
      ),
      // Ensure @syncstuff/ui resolves correctly
      "@syncstuff/ui": path.resolve(
        __dirname,
        "../../packages/ui/dist/index.js",
      ),
    },
    extensions: [".web.js", ".js", ".ts", ".tsx", ".json"],
  },
  ssr: {
    noExternal: ["tamagui", "@tamagui/core"],
  },
  server: {
    host: "0.0.0.0",
    port: 8101,
    strictPort: true,
    allowedHosts: ["localhost", "127.0.0.1", "0.0.0.0", "1.1.1.1"],
  },
  build: {
    target: "es2020",
    // Ensure assets use relative paths
    assetsDir: "assets",
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        // Use relative paths for chunks
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
  // test: {
  //   globals: true,
  //   environment: "jsdom",
  //   setupFiles: "./src/setupTests.ts",
  // },
});
