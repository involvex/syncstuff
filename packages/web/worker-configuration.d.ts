interface Env {
  syncstuff_db: D1Database;
  GITHUB_OAUTH_CLIENT_ID: string;
  GITHUB_OAUTH_CLIENT_SECRET: string;
  GITHUB_OAUTH_CALLBACK: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  DISCORD_OAUTH_CALLBACK: string;
  DISCORD_WEBHOOK_URL?: string;
  SESSION_SECRET: string;
  API_URL: string;
  JWT_SECRET: string;
  ASSETS: Fetcher;
}
