# Secrets Management Guide

## Overview

This guide explains how to securely manage secrets and sensitive configuration in the Syncstuff monorepo.

## ⚠️ CRITICAL SECURITY RULES

1. **NEVER** commit actual secrets to git (.env, .env.local, wrangler.toml with secrets)
2. **ALWAYS** use .env.example files as templates
3. **ALWAYS** use `wrangler secret put` for production secrets
4. **NEVER** hardcode API keys, passwords, or sensitive data in code

## Local Development Setup

### Step 1: Copy Environment Templates

For each package you're working on, copy the `.env.example` file:

```bash
# API package
cp packages/api/.env.example packages/api/.env.local

# Database package
cp packages/database/.env.example packages/database/.env.local

# Web app
cp apps/web/.env.example apps/web/.env.local
```

### Step 2: Fill in Actual Values

Edit the `.env.local` files with your actual development secrets. Get these from:
- Team password manager (1Password, Bitwarden, etc.)
- Team lead or DevOps engineer
- Cloudflare dashboard for IDs

**Example for `packages/api/.env.local`:**
```env
GITHUB_OAUTH_CLIENT_ID=Ov23li5ZRzCQoPWMN21O
GITHUB_OAUTH_CLIENT_SECRET=actual_secret_here_from_github
JWT_SECRET=your_random_32_character_string_here
SESSION_SECRET=another_random_32_character_string
API_URL=http://localhost:8787
```

### Step 3: Verify .env.local is Ignored

Check that your `.env.local` files are ignored by git:

```bash
git status
# Should NOT show .env.local files
```

## Production Deployment

### Setting Secrets in Cloudflare Workers

**NEVER** put secrets in `wrangler.toml`. Use Wrangler CLI instead:

```bash
# Navigate to the package
cd packages/api

# Set each secret individually
wrangler secret put GITHUB_OAUTH_CLIENT_SECRET
# You'll be prompted to enter the value

wrangler secret put JWT_SECRET
wrangler secret put SESSION_SECRET
```

### Setting D1 Database ID

```bash
# List your D1 databases
wrangler d1 list

# Get database ID
wrangler d1 info syncstuff-db

# Set as secret (if needed)
wrangler secret put DATABASE_ID
```

### Verifying Secrets

```bash
# List all secrets (values are hidden)
wrangler secret list

# Delete a secret if needed
wrangler secret delete SECRET_NAME
```

## Environment File Types

| File | Purpose | Tracked in Git? | Contains Secrets? |
|------|---------|----------------|-------------------|
| `.env.example` | Template with placeholders | ✅ YES | ❌ NO |
| `.env` | Local dev secrets | ❌ NO | ✅ YES |
| `.env.local` | Local dev secrets | ❌ NO | ✅ YES |
| `.dev.vars` | Wrangler local dev | ❌ NO | ✅ YES |
| `wrangler.toml` | Public config only | ✅ YES | ❌ NO |

## Security Best Practices

### DO ✅
- Use `.env.example` templates for documentation
- Use `wrangler secret put` for production
- Rotate secrets immediately if accidentally committed
- Use strong, random secrets (32+ characters)
- Store secrets in team password manager
- Use different secrets for dev/staging/production

### DON'T ❌
- Commit `.env` or `.env.local` files
- Hardcode secrets in code or config files
- Share secrets via Slack, email, or tickets
- Use weak or guessable secrets
- Reuse secrets across environments
- Copy production secrets to development

## Rotating Compromised Secrets

If a secret is accidentally committed:

1. **Immediately rotate the secret:**
   ```bash
   # Generate new secret
   # Update in Cloudflare
   wrangler secret put SECRET_NAME

   # Update in password manager
   # Notify team
   ```

2. **Remove from git history** (if public repo):
   ```bash
   # Use BFG Repo-Cleaner or git-filter-repo
   # See: https://rtyley.github.io/bfg-repo-cleaner/
   ```

3. **Update documentation** noting the secret was rotated

## Generating Secure Secrets

### Random String (Unix/Mac)
```bash
openssl rand -base64 32
```

### Random String (Node.js)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Random String (Online)
Use: https://1password.com/password-generator/ (trusted source)

## Common Secrets by Package

### packages/api
- `GITHUB_OAUTH_CLIENT_SECRET` - OAuth app secret from GitHub
- `JWT_SECRET` - For signing JWT tokens (32+ chars)
- `SESSION_SECRET` - For session encryption (32+ chars)

### packages/database
- `DATABASE_ID` - Cloudflare D1 database ID

### apps/web
- `API_URL` - Backend API endpoint (may be public)

## Troubleshooting

### Secret not working in production
- Verify secret is set: `wrangler secret list`
- Check secret name matches code exactly (case-sensitive)
- Redeploy after setting secret: `wrangler deploy`

### Local development not picking up .env.local
- Ensure file is named `.env.local` exactly
- Check file is in correct package directory
- Restart dev server after changes

### Accidentally committed secrets
- Follow "Rotating Compromised Secrets" section immediately
- Don't delay - assume secret is compromised

## Additional Resources

- [Cloudflare Workers Secrets Documentation](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

## Support

For questions about secrets management:
- Check with team lead or DevOps engineer
- Review this document and linked resources
- Never share actual secrets in support channels
