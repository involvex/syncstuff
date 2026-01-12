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

export default defineConfig(async () => {
  // Resolve Tamagui config from the built package file if available. We prefer
  // a path string (CJS file) so the Tamagui static worker can load it without
  // getting a cloned JS object (which causes DataCloneError for functions).
  let tamaguiConfigOrPath: any;
  try {
    // Use createRequire to attempt to resolve the package's built CJS file.
    const { createRequire } = await import("module");
    const req = createRequire(import.meta.url);
    try {
      // This will resolve to something like ".../node_modules/@syncstuff/ui/dist-cjs/tamagui.config.cjs"
      tamaguiConfigOrPath = req.resolve("@syncstuff/ui/dist-cjs/tamagui.config.cjs");
    } catch (resolveErr) {
      // If we can't resolve the built file, fall back to the local generated CJS
      // config path for local package dev.
      tamaguiConfigOrPath = path.resolve(
        process.cwd(),
        "../../packages/ui/.tamagui/tamagui.config.cjs",
      );
    }
  } catch (err) {
    tamaguiConfigOrPath = path.resolve(
      process.cwd(),
      "../../packages/ui/.tamagui/tamagui.config.cjs",
    );
  }

  return {
    mode: process.env.NODE_ENV,
    plugins: [
      // Dev plugin: intercept /@fs/* and /.well-known/* requests early to avoid
      // them being proxied to Remix (which logs noisy 404s for sourcemaps and
      // Chrome DevTools app-specific checks).
      {
        name: "dev-fs-and-well-known",
        async configureServer(server: any) {
          const { promises: fsPromises } = await import("fs");
          const localPath = path;
          const MIME_BY_EXT: Record<string, string> = {
            ".ts": "application/typescript; charset=utf-8",
            ".tsx": "application/typescript; charset=utf-8",
            ".js": "application/javascript; charset=utf-8",
            ".mjs": "application/javascript; charset=utf-8",
            ".cjs": "application/javascript; charset=utf-8",
            ".map": "application/json; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".json": "application/json; charset=utf-8",
            ".svg": "image/svg+xml; charset=utf-8",
          };

          server.middlewares.use(async (req: any, res: any, next: any) => {
            try {
              if (!req.url) return next();
              const rawUrl = decodeURIComponent(req.url.split("?")[0]);

              // Intercept .map requests for Tamagui packages and patch missing sources
              if (rawUrl.endsWith('.map') && rawUrl.includes('@tamagui')) {
                try {
                  let p = rawUrl;
                  if (p.startsWith('/@fs/')) p = p.slice(4);
                  if (p.startsWith('/')) p = p.slice(1);
                  const fullPath = localPath.isAbsolute(p)
                    ? p
                    : localPath.resolve(process.cwd(), p);

                  // Read the sourcemap file
                  const mapRaw = await fsPromises.readFile(fullPath, 'utf8');
                  const mapJson = JSON.parse(mapRaw);
                  mapJson.sourcesContent = mapJson.sourcesContent ?? [];

                  // For each source, ensure content exists; if not, stub it
                  for (let i = 0; i < (mapJson.sources || []).length; i++) {
                    const src = mapJson.sources[i];
                    // Resolve relative to map file directory
                    const candidate = localPath.resolve(localPath.dirname(fullPath), src);
                    try {
                      await fsPromises.access(candidate);
                      // If exists and not already set, read its content
                      if (!mapJson.sourcesContent[i]) {
                        try {
                          mapJson.sourcesContent[i] = await fsPromises.readFile(candidate, 'utf8');
                        } catch (_e) {
                          mapJson.sourcesContent[i] = '/* source not available */';
                        }
                      }
                    } catch (_e) {
                      // Missing source, provide stub
                      mapJson.sourcesContent[i] = mapJson.sourcesContent[i] ?? '/* source not available */';
                    }
                  }

                  const patched = JSON.stringify(mapJson);
                  res.setHeader('Content-Type', 'application/json; charset=utf-8');
                  res.end(patched);
                  return;
                } catch (err) {
                  // If patching fails, continue to next middleware
                }
              }

              // Intercept Chrome DevTools well-known check and return empty JSON
              if (rawUrl.startsWith("/.well-known/")) {
                if (rawUrl.includes("com.chrome.devtools.json")) {
                  res.setHeader("Content-Type", "application/json; charset=utf-8");
                  res.end("{}");
                  return;
                }
              }
            } catch (err) {
              // ignore and continue
            }
            next();
          });
        },
      },

      reactNativeSvgAlias(),
      tailwindcss(),
      tamaguiPlugin({
        config: tamaguiConfigOrPath,
        components: ["tamagui"],
        outputCSS: "./app/tamagui.css",
        disableExtraction: true,
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
        /^@tamagui\/.*/,
      ],
      external: ["react-native-svg", "react-native"],
      resolve: {
        conditions: ["workerd", "worker", "browser"],
      },
    },
    optimizeDeps: {
      include: [],
      exclude: [
        "react-native-svg",
        "react-native",
        "tamagui",
        "@tamagui/core",
        "@tamagui/web",
        "@tamagui/config",
        "@tamagui/lucide-icons",
        "@tamagui/themes",
      ],
    },
    resolve: {
      mainFields: ["browser", "module", "main"],
      dedupe: [
        "react",
        "react-dom",
        // Ensure Tamagui and its packages are deduped so only one runtime instance is used
        "tamagui",
        "@tamagui/config",
        "@tamagui/core",
        "@tamagui/web",
        "@tamagui/themes",
        "@tamagui/lucide-icons",
      ],
      // Force Tamagui packages to resolve to the repo root copies so the same
      // module instances are used in both client and SSR bundles.
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
      sourcemap: true,
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
