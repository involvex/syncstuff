import {
  cloudflareDevProxyVitePlugin,
  vitePlugin as remix,
} from "@remix-run/dev";
import tailwindcss from "@tailwindcss/vite";
import { tamaguiPlugin } from "@tamagui/vite-plugin";
import path from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { getLoadContext } from "./load-context";
import { reactNativeSvgAlias } from "./react-native-svg-alias.mjs";

declare module "@remix-run/cloudflare" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  mode: process.env.NODE_ENV,
  plugins: [
    reactNativeSvgAlias(),
    tailwindcss(),
    tamaguiPlugin({
      config: "./tamagui.config.ts",
      components: ["tamagui"],
    }),
    cloudflareDevProxyVitePlugin({
      getLoadContext,
    }),
    remix({
      ssr: true,
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
  define: {
    "process.env.TAMAGUI_TARGET": JSON.stringify("web"),
  },
  ssr: {
    noExternal: [
      "@syncstuff/ui",
      "tamagui",
      "@tamagui/core",
      "@tamagui/web",
      "@tamagui/lucide-icons",
      "@tamagui/themes",
      "@tamagui/config",
      "@tamagui/font-silkscreen",
    ],
    external: ["react-native-svg", "react-native"],
    resolve: {
      conditions: ["workerd", "worker", "browser"],
    },
  },
  optimizeDeps: {
    exclude: [
      "react-native-svg",
      "react-native",
      "tamagui",
      "@tamagui/core",
      "@tamagui/config",
      "@tamagui/lucide-icons",
      "@tamagui/themes",
    ],
  },
  resolve: {
    mainFields: ["browser", "module", "main"],
    dedupe: ["react", "react-dom"],
    alias: {
      "react-native": "react-native-web",
      "react-native-svg": "./react-native-svg-stub.js",
      "@syncstuff/ui": path.resolve(__dirname, "../../packages/ui/dist"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3030,
    strictPort: true,
    allowedHosts: ["localhost", "127.0.0.1", "0.0.0.0", "1.1.1.1"],
  },
  build: {
    minify: false,
    sourcemap: false,
    copyPublicDir: true,
    outDir: "build",
    assetsDir: "assets",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        chunkFileNames: "app/[name]-[hash].js",
        entryFileNames: "app/[name]-[hash].js",
        assetFileNames: assetInfo => {
          if (assetInfo.name === "style.css") return "app/tailwind.css";
          return assetInfo.name ?? "";
        },
      },
    },
  },
});
