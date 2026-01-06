import { redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";

export async function loader({ context, request }: LoaderFunctionArgs) {
  let client_id = context.cloudflare.env.DISCORD_CLIENT_ID;
  let redirect_uri = context.cloudflare.env.DISCORD_OAUTH_CALLBACK;

  // Local development fallback
  if (!client_id) {
    client_id = "1458236674097283236";
  }

  if (!redirect_uri) {
    const url = new URL(request.url);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      redirect_uri = `${url.protocol}//${url.host}/auth/callback?provider=discord`;
    } else {
      redirect_uri =
        "https://syncstuff-web.involvex.workers.dev/auth/callback?provider=discord";
    }
  }

  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id,
    redirect_uri,
    response_type: "code",
    scope: "identify email",
    state,
  });

  return redirect(
    `https://discord.com/api/oauth2/authorize?${params.toString()}`,
  );
}
