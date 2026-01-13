import { useEffect } from "react";
import { generateUUID } from "../utils/uuid";

export default function DiscordAuthRoute() {
  useEffect(() => {
    const clientId = "1458236674097283236";
    const currentUrl = new URL(window.location.href);
    const redirectUri =
      currentUrl.hostname === "localhost" || currentUrl.hostname === "127.0.0.1"
        ? `${currentUrl.protocol}//${currentUrl.host}/auth/callback?provider=discord`
        : "https://syncstuff-web.involvex.workers.dev/auth/callback?provider=discord";

    const state = generateUUID();

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "identify email",
      state,
    });

    // Redirect to Discord OAuth
    window.location.href = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  }, []);

  return <div>Redirecting to Discord...</div>;
}
