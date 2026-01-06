import { redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";

export async function loader({ context }: LoaderFunctionArgs) {
  const client_id = context.cloudflare.env.GITHUB_OAUTH_CLIENT_ID;
  const redirect_uri = context.cloudflare.env.GITHUB_OAUTH_CALLBACK;
  const state = crypto.randomUUID(); // In a real app, store this in a cookie to verify on callback

  const params = new URLSearchParams({
    client_id,
    redirect_uri,
    scope: "read:user user:email",
    state,
  });

  return redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}
