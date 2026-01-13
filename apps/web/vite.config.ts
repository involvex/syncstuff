import {
  cloudflareDevProxyVitePlugin,
  vitePlugin as remix,
} from "@remix-run/dev";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { getLoadContext } from "./load-context";
import { reactNativeSvgAlias } from "./react-native-svg-alias.mjs";

declare module "@remix-run/cloudflare" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig(async () => {
  return {
    mode: process.env.NODE_ENV,
    plugins: [
      reactNativeSvgAlias(),
      tailwindcss(),
      cloudflareDevProxyVitePlugin({
        getLoadContext,
      }),
      remix({
        ssr: true,
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_singleFetch: false,
          v3_lazyRouteDiscovery: true,
        },
      }),
      tsconfigPaths(),
    ],
    define: {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    },
    ssr: {
      noExternal: ["@syncstuff/ui"],
      external: ["react-native-svg", "react-native"],
      resolve: {
        conditions: ["workerd", "worker", "browser"],
      },
    },
    resolve: {
      mainFields: ["browser", "module", "main"],
      alias: {
        "react-native": "react-native-web",
        "react-native-svg": "./react-native-svg-stub.js",
      },
    },
    server: {
      host: "0.0.0.0",
      port: 3030,
      strictPort: true,
      allowedHosts: ["localhost", "127.0.0.1", "0.0.0.0", "1.1.1.1"],
      fs: {
        allow: ["../.."],
      },
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
          assetFileNames: (assetInfo: any) => {
            if (assetInfo.name === "style.css") return "app/tailwind.css";
            return assetInfo.name ?? "";
          },
        },
      },
    },
  };
});
