import { redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { commitSession, getSession } from "~/services/session.server";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return redirect("/auth/login?error=No code provided");
  }

  try {
    let {
      GITHUB_OAUTH_CLIENT_ID,
      GITHUB_OAUTH_CLIENT_SECRET,
      GITHUB_OAUTH_CALLBACK,
    } = context.cloudflare.env;

    // Fallbacks for local development
    if (!GITHUB_OAUTH_CLIENT_ID)
      GITHUB_OAUTH_CLIENT_ID = "Ov23li5ZRzCQoPWMN21O";
    if (!GITHUB_OAUTH_CLIENT_SECRET)
      GITHUB_OAUTH_CLIENT_SECRET = "07631a180f65b26a290791b111dd1ba01dae370b";

    if (!GITHUB_OAUTH_CALLBACK) {
      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
        GITHUB_OAUTH_CALLBACK = `${url.protocol}//${url.host}/auth/callback`;
      } else {
        GITHUB_OAUTH_CALLBACK =
          "https://syncstuff-web.involvex.workers.dev/auth/callback";
      }
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "Syncstuff-Web",
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

    if (tokenData.error) {
      throw new Error(tokenData.error_description || "Failed to get token");
    }

    const accessToken = tokenData.access_token;

    // Fetch user profile
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "Syncstuff-Web",
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userData: any = await userResponse.json();

    // Fetch user email (if private)
    const emailResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "Syncstuff-Web",
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const emails: any[] = await emailResponse.json();
    const primaryEmail =
      emails.find(e => e.primary && e.verified)?.email || userData.email;

    if (!primaryEmail) {
      throw new Error("No verified email found from GitHub");
    }

    // Direct DB access
    const db = context.cloudflare.env.syncstuff_db;

    interface DbUser {
      id: string;
      role: string;
      email?: string;
      username?: string;
      github_id?: string;
    }

    // Check if user exists by github_id
    let user = (await db
      .prepare("SELECT id, role FROM users WHERE github_id = ?")
      .bind(userData.id.toString())
      .first()) as DbUser | null;

    if (!user) {
      // Check if email exists
      user = (await db
        .prepare("SELECT id, role FROM users WHERE email = ?")
        .bind(primaryEmail)
        .first()) as DbUser | null;

      if (user) {
        // Link GitHub ID
        await db
          .prepare("UPDATE users SET github_id = ? WHERE id = ?")
          .bind(userData.id.toString(), user.id)
          .run();
      } else {
        // Create new user
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

    const session = await getSession(request.headers.get("Cookie"));
    session.set("userId", user.id as string);
    session.set("role", (user.role as string) || "user");

    return redirect("/dashboard", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error: unknown) {
    console.error("GitHub Auth Error:", error);
    const errorMsg =
      error instanceof Error ? error.message : "Authentication failed";
    return redirect(`/auth/login?error=${encodeURIComponent(errorMsg)}`);
  }
}
