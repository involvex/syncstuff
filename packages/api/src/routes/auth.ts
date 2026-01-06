/**
 * Auth routes - OAuth handling (Discord, GitHub)
 */

import type { Env } from "../index";

export async function handleAuth(
  request: Request,
  env: Env,
  headers: Record<string, string>,
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // GET /api/auth/callback - OAuth callback
  if (path === "/api/auth/callback") {
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    // TODO: Implement OAuth token exchange
    // For now, return placeholder
    return new Response(
      JSON.stringify({
        success: true,
        message: "OAuth callback received",
        code,
        state,
      }),
      { headers },
    );
  }

  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers,
  });
}
