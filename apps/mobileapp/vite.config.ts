/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
// import { tamaguiPlugin } from "@tamagui/vite-plugin";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
// Note: Tamagui plugin temporarily disabled for initial setup
// Will be re-enabled after verifying base functionality works
export default defineConfig({
  plugins: [
    react(),
    // tamaguiPlugin({
    //   components: ["tamagui"],
    //   config: "./node_modules/@syncstuff/ui/src/tamagui.config.ts",
    //   outputCSS: "./src/tamagui.css",
    // }),
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
  optimizeDeps: {
    include: ["@syncstuff/ui", "react-native-web", "react-native-svg"],
    exclude: ["react-native"],
    esbuildOptions: {
      resolveExtensions: [".web.js", ".js", ".ts", ".tsx", ".json"],
    },
  },
  resolve: {
    alias: {
      // Alias react-native to react-native-web
      "react-native": "react-native-web",
    },
    extensions: [".web.js", ".js", ".ts", ".tsx", ".json"],
  },
  ssr: {
    noExternal: ["tamagui", "@tamagui/core"],
  },
  server: {
    host: "0.0.0.0",
    port: 8100,
    strictPort: true,
    allowedHosts: ["localhost", "127.0.0.1", "0.0.0.0", "1.1.1.1"],
  },
  build: {
    target: "es2020",
    // Ensure assets use relative paths
    assetsDir: "assets",
    commonjsOptions: {
      transformMixedEsModules: true,
      ignore: ["react-native", "react-native/**"],
    },
    rollupOptions: {
      external: id => {
        // Externalize react-native and all its sub-paths
        if (id.startsWith("react-native")) return true;
        // Externalize the node process shim injected by node polyfills to avoid resolution errors
        if (id === "vite-plugin-node-polyfills/shims/process") return true;
        // Externalize the UI package and its built provider to avoid bundling server-only shims
        if (id.endsWith("/packages/ui/dist/provider.js")) return true;
        return false;
      },
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
