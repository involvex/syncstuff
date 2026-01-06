import { redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";

export async function loader({ context, request }: LoaderFunctionArgs) {
  // Try to get from cloudflare context, fallback to hardcoded for local dev if context is failing
  let client_id = context.cloudflare.env.GITHUB_OAUTH_CLIENT_ID;
  let redirect_uri = context.cloudflare.env.GITHUB_OAUTH_CALLBACK;

  // Local development fallback if proxy is not working
  if (!client_id) {
    console.log(
      "Warning: GITHUB_OAUTH_CLIENT_ID missing from context, using fallback",
    );
    client_id = "Ov23li5ZRzCQoPWMN21O";
  }

  if (!redirect_uri) {
    // Check if running locally based on request URL
    const url = new URL(request.url);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      redirect_uri = `${url.protocol}//${url.host}/auth/callback`;
      console.log("Using local callback URL:", redirect_uri);
    } else {
      console.log(
        "Warning: GITHUB_OAUTH_CALLBACK missing from context, using fallback",
      );
      redirect_uri = "https://syncstuff-web.involvex.workers.dev/auth/callback";
    }
  }

  console.log("GitHub Auth Redirect:", { client_id, redirect_uri });

  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id,
    redirect_uri,
    scope: "read:user user:email",
    state,
  });

  return redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`,
  );
}
