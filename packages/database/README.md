# @involvex/database

Cloudflare D1 database schema and migrations for Involvex.

## Setup

1. Create the database:

```bash
bun run create
```

2. Copy the database ID from the output and update `wrangler.toml`

3. Run migrations:

```bash
bun run migrate
```

## Local Development

```bash
# Apply migrations locally
bun run migrate:local

# Check tables
bun run studio
```

## Deployment

```bash
bun run deploy
```

## Schema

The schema matches the SQLite database used in the mobile app:

- `subscriptions` - User subscriptions to GitHub repos and npm packages
- `releases` - Release notifications
- `notifications` - Push notifications
- `cache` - API response cache
