import { redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import * as jose from "jose";
import { commitSession, getSession } from "~/services/session.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const jwtSecret = new TextEncoder().encode(
    context.cloudflare.env.JWT_SECRET || "dev-secret-key-change-me",
  );

  if (!code) {
    return redirect("/auth/login?error=No code provided");
  }

  try {
    const db = context.cloudflare.env.syncstuff_db;
    const session = await getSession(request.headers.get("Cookie"));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let userData: any = null;

    const providerParam = url.searchParams.get("provider");

    if (providerParam === "discord") {
      let { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_OAUTH_CALLBACK } =
        context.cloudflare.env;

      // Fallbacks
      if (!DISCORD_CLIENT_ID) DISCORD_CLIENT_ID = "1458236674097283236";
      // Hardcoded secret for now if not in env
      if (!DISCORD_CLIENT_SECRET)
        DISCORD_CLIENT_SECRET = "WwHX9w5L9avio4J7e-WoZl_tH7kbbR2e";

      if (!DISCORD_OAUTH_CALLBACK) {
        if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
          DISCORD_OAUTH_CALLBACK = `${url.protocol}//${url.host}/auth/callback?provider=discord`;
        } else {
          DISCORD_OAUTH_CALLBACK =
            "https://syncstuff-web.involvex.workers.dev/auth/callback?provider=discord";
        }
      }

      console.log("Discord Auth Debug:", {
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: DISCORD_OAUTH_CALLBACK,
        secret_length: DISCORD_CLIENT_SECRET?.length,
      });

      const tokenResponse = await fetch(
        "https://discord.com/api/oauth2/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            client_secret: DISCORD_CLIENT_SECRET,
            grant_type: "authorization_code",
            code,
            redirect_uri: DISCORD_OAUTH_CALLBACK,
          }),
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tokenData: any = await tokenResponse.json();

      if (tokenData.error) {
        console.error("Discord Token Error Body:", tokenData);
        throw new Error(
          tokenData.error_description || `Discord error: ${tokenData.error}`,
        );
      }

      const userResponse = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      userData = await userResponse.json();

      // Map Discord user to our DB
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let user: any = await db
        .prepare("SELECT id, role FROM users WHERE discord_id = ?")
        .bind(userData.id)
        .first();
      if (!user) {
        user = await db
          .prepare("SELECT id, role FROM users WHERE email = ?")
          .bind(userData.email)
          .first();
        if (user) {
          await db
            .prepare("UPDATE users SET discord_id = ? WHERE id = ?")
            .bind(userData.id, user.id)
            .run();
        } else {
          const userId = crypto.randomUUID();
          const now = Date.now();
          await db
            .prepare(
              `INSERT INTO users (id, email, username, full_name, role, status, discord_id, created_at, updated_at) 
                     VALUES (?, ?, ?, ?, 'user', 'active', ?, ?, ?)`,
            )
            .bind(
              userId,
              userData.email,
              userData.username,
              userData.global_name || userData.username,
              userData.id,
              now,
              now,
            )
            .run();
          user = { id: userId, role: "user" };
        }
      }

      session.set("userId", user.id);
      session.set("role", user.role || "user");

      // Generate Token
      const token = await new jose.SignJWT({ sub: user.id, role: user.role })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(jwtSecret);

      session.set("token", token);
    } else {
      // GitHub flow (default or if provider=github)
      let {
        GITHUB_OAUTH_CLIENT_ID,
        GITHUB_OAUTH_CLIENT_SECRET,
        GITHUB_OAUTH_CALLBACK,
      } = context.cloudflare.env;
      if (!GITHUB_OAUTH_CLIENT_ID)
        GITHUB_OAUTH_CLIENT_ID = "Ov23li5ZRzCQoPWMN21O";
      if (!GITHUB_OAUTH_CLIENT_SECRET)
        GITHUB_OAUTH_CLIENT_SECRET = "07631a180f65b26a290791b111dd1ba01dae370b";

      if (!GITHUB_OAUTH_CALLBACK) {
        if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
          GITHUB_OAUTH_CALLBACK = `${url.protocol}//${url.host}/auth/callback?provider=github`;
        } else {
          GITHUB_OAUTH_CALLBACK =
            "https://syncstuff-web.involvex.workers.dev/auth/callback?provider=github";
        }
      }

      const tokenResponse = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            client_id: GITHUB_OAUTH_CLIENT_ID,
            client_secret: GITHUB_OAUTH_CLIENT_SECRET,
            code,
            redirect_uri: GITHUB_OAUTH_CALLBACK,
          }),
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tokenData: any = await tokenResponse.json();
      if (tokenData.error)
        throw new Error(
          tokenData.error_description || "GitHub token exchange failed",
        );

      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "User-Agent": "Syncstuff-Web",
        },
      });
      userData = await userResponse.json();

      const emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "User-Agent": "Syncstuff-Web",
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const emails: any[] = await emailResponse.json();
      const primaryEmail =
        emails.find(e => e.primary && e.verified)?.email || userData.email;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let user: any = await db
        .prepare("SELECT id, role FROM users WHERE github_id = ?")
        .bind(userData.id.toString())
        .first();
      if (!user) {
        user = await db
          .prepare("SELECT id, role FROM users WHERE email = ?")
          .bind(primaryEmail)
          .first();
        if (user) {
          await db
            .prepare("UPDATE users SET github_id = ? WHERE id = ?")
            .bind(userData.id.toString(), user.id)
            .run();
        } else {
          const userId = crypto.randomUUID();
          const now = Date.now();
          await db
            .prepare(
              `INSERT INTO users (id, email, username, full_name, role, status, github_id, created_at, updated_at) 
                     VALUES (?, ?, ?, ?, 'user', 'active', ?, ?, ?)`,
            )
            .bind(
              userId,
              primaryEmail,
              userData.login,
              userData.name || userData.login,
              userData.id.toString(),
              now,
              now,
            )
            .run();
          user = { id: userId, role: "user" };
        }
      }

      session.set("userId", user.id);
      session.set("role", user.role || "user");

      // Generate Token
      const token = await new jose.SignJWT({ sub: user.id, role: user.role })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(jwtSecret);

      session.set("token", token);
    }

    return redirect("/dashboard", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  } catch (error: unknown) {
    console.error("Auth Callback Error:", error);
    const errorMsg =
      error instanceof Error ? error.message : "Authentication failed";
    return redirect(`/auth/login?error=${encodeURIComponent(errorMsg)}`);
  }
}
