-- Migration to reset database
DROP TABLE IF EXISTS cache;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS releases;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS users;

-- Recreate Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  username TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  preferences TEXT DEFAULT '{}',
  status TEXT DEFAULT 'active',
  discord_id TEXT UNIQUE,
  github_id TEXT UNIQUE,
  last_login_at INTEGER,
  created_at INTEGER DEFAULT (unixepoch() * 1000),
  updated_at INTEGER DEFAULT (unixepoch() * 1000)
);

-- Recreate other tables
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  item_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  full_name TEXT,
  data TEXT NOT NULL,
  subscribed_at INTEGER NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch() * 1000),
  updated_at INTEGER DEFAULT (unixepoch() * 1000)
);

CREATE TABLE releases (
  id TEXT PRIMARY KEY,
  subscription_id TEXT NOT NULL,
  tag_name TEXT NOT NULL,
  name TEXT,
  body TEXT,
  published_at INTEGER NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch() * 1000),
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
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

CREATE TABLE cache (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER DEFAULT (unixepoch() * 1000)
);

-- Recreate indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_type ON subscriptions(type);
CREATE INDEX idx_subscriptions_active ON subscriptions(is_active);
CREATE INDEX idx_releases_subscription ON releases(subscription_id);
CREATE INDEX idx_releases_published ON releases(published_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_cache_expires ON cache(expires_at);
