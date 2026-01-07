-- Cloudflare D1 Database Schema
-- Matches SQLite schema from mobile app (packages/app/src/database/schema.ts)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  username TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user', -- 'user', 'admin', 'moderator'
  avatar_url TEXT,
  preferences TEXT DEFAULT '{}', -- JSON string of user preferences
  status TEXT DEFAULT 'active', -- 'active', 'suspended', 'pending'
  discord_id TEXT UNIQUE,
  github_id TEXT UNIQUE,
  last_login_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch() * 1000),
  updated_at INTEGER DEFAULT (unixepoch() * 1000)
);

-- Subscriptions table
-- CREATE TABLE IF NOT EXISTS subscriptions (
--   id TEXT PRIMARY KEY,
--   user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
--   type TEXT NOT NULL,
--   item_id TEXT NOT NULL UNIQUE,
--   name TEXT NOT NULL,
--   full_name TEXT,
--   data TEXT NOT NULL,
--   subscribed_at INTEGER NOT NULL,
--   is_active INTEGER DEFAULT 1,
--   created_at INTEGER DEFAULT (unixepoch() * 1000),
--   updated_at INTEGER DEFAULT (unixepoch() * 1000)
-- );

-- -- Releases table
-- CREATE TABLE IF NOT EXISTS releases (
--   id TEXT PRIMARY KEY,
--   subscription_id TEXT NOT NULL,
--   tag_name TEXT NOT NULL,
--   name TEXT,
--   body TEXT,
--   published_at INTEGER NOT NULL,
--   is_read INTEGER DEFAULT 0,
--   created_at INTEGER DEFAULT (unixepoch() * 1000),
--   FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
-- );

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data TEXT,
  is_read INTEGER DEFAULT 0,
  scheduled_for INTEGER,
  delivered_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch() * 1000)
);

-- Devices table
CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'mobile', 'desktop', 'web'
  platform TEXT NOT NULL, -- 'android', 'ios', 'windows', 'macos', 'linux', 'web'
  device_id TEXT UNIQUE,
  last_seen INTEGER DEFAULT (unixepoch() * 1000),
  is_online INTEGER DEFAULT 0,
  metadata TEXT, -- JSON string of additional device info
  created_at INTEGER DEFAULT (unixepoch() * 1000),
  updated_at INTEGER DEFAULT (unixepoch() * 1000)
);

-- Transfers table
CREATE TABLE IF NOT EXISTS transfers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  progress INTEGER DEFAULT 0, -- 0-100
  error_message TEXT,
  created_at INTEGER DEFAULT (unixepoch() * 1000),
  updated_at INTEGER DEFAULT (unixepoch() * 1000),
  completed_at INTEGER
);

-- Cache table
CREATE TABLE IF NOT EXISTS cache (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER DEFAULT (unixepoch() * 1000)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_type ON subscriptions(type);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_releases_subscription ON releases(subscription_id);
CREATE INDEX IF NOT EXISTS idx_releases_published ON releases(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_devices_user ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_online ON devices(is_online);
CREATE INDEX IF NOT EXISTS idx_transfers_user ON transfers(user_id);
CREATE INDEX IF NOT EXISTS idx_transfers_device ON transfers(device_id);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfers(status);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache(expires_at);