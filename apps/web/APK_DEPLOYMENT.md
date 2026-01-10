# APK Download Solution

The Android APK file is too large (32MB) for Cloudflare Workers assets (25MB limit).

## Solution: GitHub Releases

Instead of hosting the APK in Workers assets, we'll use GitHub Releases for APK distribution.

### Setup Instructions

1. **Create a GitHub Release**

   ```bash
   # Tag the version
   git tag v0.0.6
   git push origin v0.0.6

   # Upload APK to GitHub Releases
   # Go to: https://github.com/involvex/syncstuff/releases/new
   # - Tag: v0.0.6
   # - Title: SyncStuff v0.0.6
   # - Upload: packages/web/public/downloads/syncstuff-v0.0.6.apk
   ```

2. **Update Web App Download Link**

   Instead of serving from `/downloads/syncstuff-v0.0.6.apk`, use:

   ```
   https://github.com/involvex/syncstuff/releases/download/v0.0.6/syncstuff-v0.0.6.apk
   ```

### Alternative: Cloudflare R2

For automated uploads, you could use Cloudflare R2 (object storage):

```bash
# Install Wrangler
npm install -g wrangler

# Create R2 bucket
wrangler r2 bucket create syncstuff-downloads

# Upload APK
wrangler r2 object put syncstuff-downloads/syncstuff-v0.0.6.apk --file=packages/web/public/downloads/syncstuff-v0.0.6.apk

# Get public URL
# https://syncstuff-downloads.involvex.workers.dev/syncstuff-v0.0.6.apk
```

### Updated Bump Script

The bump-app-version.js script could be enhanced to automatically:

1. Upload APK to GitHub Releases via GitHub API
2. Or upload to Cloudflare R2
3. Update download links in the web app

## Current Status

- ✅ `.assetsignore` updated to exclude downloads/ directory
- ⏳ APK needs to be uploaded to GitHub Releases manually
- ⏳ Web app download link needs updating

## Files Excluded from Workers

The `.assetsignore` file now excludes:

- `*.apk` - All APK files
- `downloads/` - Entire downloads directory

This allows Workers deployment to succeed while APKs are hosted elsewhere.
