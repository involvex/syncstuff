import { createCookieSessionStorage } from "@remix-run/cloudflare";

type SessionData = {
  token: string;
  userId: string;
  role: string;
};

type SessionFlashData = {
  error: string;
};

const sessionSecret = "dev-session-secret"; // TODO: Use env var

export const sessionStorage = createCookieSessionStorage<
  SessionData,
  SessionFlashData
>({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
    sameSite: "lax",
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
