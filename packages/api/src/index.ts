/**
 * Involvex API - Cloudflare Workers
 * Provides backend services for the mobile app
 */

import { handleAuth } from "./routes/auth";

export interface Env {
  syncstuff_db: D1Database;
  JWT_SECRET?: string;
  // Add secrets here
}

export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
    };

    // Handle preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    try {
      // Route handling

      if (path.startsWith("/api/auth")) {
        return await handleAuth(request, env, headers);
      }

      // Health check
      if (path === "/health" || path === "/") {
        return new Response(
          JSON.stringify({
            status: "ok",
            version: "0.0.3",
            timestamp: new Date().toISOString(),
          }),
          { headers },
        );
      }

      // 404
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers,
      });
    } catch (error) {
      console.error("API Error:", error);
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error",
        }),
        { status: 500, headers },
      );
    }
  },
};
