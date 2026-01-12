import type { LoaderArgs } from "@remix-run/cloudflare";
import { promises as fs } from "fs";
import path from "path";

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
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".wasm": "application/wasm",
  ".html": "text/html; charset=utf-8",
};

export async function loader({ params }: LoaderArgs) {
  // Only serve in development.
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not Found", { status: 404 });
  }

  // params.path should contain the rest of the path after /@fs/
  const raw = params.path ?? "";
  // Reconstruct full path: if client requested absolute path, it will appear as-is.
  let fullPath = raw;
  if (!path.isAbsolute(fullPath)) {
    fullPath = path.resolve(process.cwd(), fullPath);
  }

  const repoRoot = path.resolve(process.cwd());
  const normalized = path.normalize(fullPath);
  if (!normalized.startsWith(repoRoot)) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const data = await fs.readFile(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_BY_EXT[ext] ?? "application/octet-stream";
    return new Response(data, {
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (err) {
    console.error("Error reading file in dev fs loader:", err);
    return new Response("Not Found", { status: 404 });
  }
}
