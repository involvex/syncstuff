import {
  cloudflareDevProxyVitePlugin,
  vitePlugin as remix,
} from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { getLoadContext } from "./load-context";

declare module "@remix-run/cloudflare" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    cloudflareDevProxyVitePlugin({
      getLoadContext,
    }),
    remix({
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
  ssr: {
    resolve: {
      conditions: ["workerd", "worker", "browser"],
    },
  },
  resolve: {
    mainFields: ["browser", "module", "main"],
  },
  server: {
    host: "0.0.0.0",
    port: 3030,
    strictPort: true,
    allowedHosts: ["localhost", "127.0.0.1", "0.0.0.0", "1.1.1.1"],
  },
  build: {
    minify: true,
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
