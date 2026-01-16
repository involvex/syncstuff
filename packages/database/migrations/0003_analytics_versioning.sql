-- Migration number: 0003 	 2026-01-16T00:00:00.000Z

-- Analytics, Presence, and File Versioning Features
-- Adds support for usage analytics, real-time device presence, and file version management

-- ============================================================================
-- ANALYTICS & MONITORING
-- ============================================================================

-- Analytics Events table - Track user actions and app events
CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'transfer_start', 'transfer_complete', 'connection_success', 'connection_failure', etc.
  event_data TEXT, -- JSON string with event-specific data
  device_id TEXT,
  device_name TEXT,
  created_at INTEGER DEFAULT (unixepoch() * 1000),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Performance Metrics table - Track app performance measurements
CREATE TABLE IF NOT EXISTS performance_metrics (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  metric_type TEXT NOT NULL, -- 'transfer_speed', 'connection_latency', 'sync_duration', etc.
  value REAL NOT NULL,
  unit TEXT, -- 'mbps', 'ms', 'seconds', etc.
  device_id TEXT,
  device_name TEXT,
  created_at INTEGER DEFAULT (unixepoch() * 1000),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Error Logs table - Centralized error tracking
CREATE TABLE IF NOT EXISTS error_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT, -- Can be null for unauthenticated errors
  error_type TEXT NOT NULL, -- 'network_error', 'transfer_error', 'auth_error', etc.
  error_message TEXT,
  error_code TEXT,
  stack_trace TEXT,
  device_id TEXT,
  device_name TEXT,
  platform TEXT, -- 'android', 'ios', 'web', 'electron'
  app_version TEXT,
  created_at INTEGER DEFAULT (unixepoch() * 1000)
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_user_created ON analytics_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_type_created ON analytics_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_device ON analytics_events(device_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_user_created ON performance_metrics(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_type ON performance_metrics(metric_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_created ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_user ON error_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_type ON error_logs(error_type);

-- ============================================================================
-- REAL-TIME PRESENCE
-- ============================================================================

-- Device Presence table - Track online/offline status of devices
CREATE TABLE IF NOT EXISTS device_presence (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  device_name TEXT,
  platform TEXT, -- 'android', 'ios', 'web', 'electron', 'cli'
  status TEXT NOT NULL DEFAULT 'online', -- 'online', 'offline', 'away', 'busy'
  last_seen INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  current_action TEXT, -- 'Transferring file...', 'Syncing clipboard...', 'Idle', etc.
  ip_address TEXT, -- Optional for network diagnostics
  created_at INTEGER DEFAULT (unixepoch() * 1000),
  updated_at INTEGER DEFAULT (unixepoch() * 1000),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for presence queries
CREATE INDEX IF NOT EXISTS idx_presence_user_status ON device_presence(user_id, status);
CREATE INDEX IF NOT EXISTS idx_presence_device ON device_presence(device_id);
CREATE INDEX IF NOT EXISTS idx_presence_last_seen ON device_presence(last_seen DESC);

-- ============================================================================
-- FILE VERSIONING
-- ============================================================================

-- File Versions table - Track file history and versions
CREATE TABLE IF NOT EXISTS file_versions (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL, -- Unique identifier for the file across all versions
  user_id TEXT NOT NULL,
  version_number INTEGER NOT NULL, -- Incremental version number (1, 2, 3, ...)
  file_name TEXT NOT NULL,
  file_path TEXT, -- Original file path
  file_hash TEXT NOT NULL, -- SHA-256 hash of file content
  file_size INTEGER NOT NULL, -- Size in bytes
  mime_type TEXT,
  storage_provider TEXT, -- 'r2', 'gdrive', 'mega', 'local'
  storage_path TEXT, -- Path in storage provider (R2 bucket path, etc.)
  device_id TEXT, -- Device that created this version
  device_name TEXT,
  is_current INTEGER DEFAULT 1, -- 1 if this is the latest version, 0 otherwise
  notes TEXT, -- Optional version notes
  created_at INTEGER DEFAULT (unixepoch() * 1000),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- File Conflicts table - Track detected conflicts between file versions
CREATE TABLE IF NOT EXISTS file_conflicts (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  version_a_id TEXT NOT NULL, -- First conflicting version
  version_b_id TEXT NOT NULL, -- Second conflicting version
  conflict_type TEXT NOT NULL, -- 'concurrent_modification', 'hash_mismatch', 'size_mismatch'
  conflict_details TEXT, -- JSON string with detailed conflict information
  resolved INTEGER DEFAULT 0, -- 0 = unresolved, 1 = resolved
  resolution_strategy TEXT, -- 'keep_a', 'keep_b', 'merge', 'manual', 'newest_wins'
  resolved_version_id TEXT, -- ID of the version kept after resolution
  resolved_at INTEGER,
  resolved_by TEXT, -- User ID who resolved the conflict
  created_at INTEGER DEFAULT (unixepoch() * 1000),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (version_a_id) REFERENCES file_versions(id) ON DELETE CASCADE,
  FOREIGN KEY (version_b_id) REFERENCES file_versions(id) ON DELETE CASCADE
);

-- Indexes for version queries
CREATE INDEX IF NOT EXISTS idx_versions_file_created ON file_versions(file_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_versions_user ON file_versions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_versions_hash ON file_versions(file_hash);
CREATE INDEX IF NOT EXISTS idx_versions_current ON file_versions(file_id, is_current);
CREATE INDEX IF NOT EXISTS idx_conflicts_file ON file_conflicts(file_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conflicts_user_resolved ON file_conflicts(user_id, resolved);
CREATE INDEX IF NOT EXISTS idx_conflicts_unresolved ON file_conflicts(resolved, created_at DESC);

-- ============================================================================
-- DEVICES TABLE (Enhancement to existing schema)
-- ============================================================================

-- Add devices table if it doesn't exist (for device management)
CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT, -- 'mobile', 'desktop', 'tablet', 'cli'
  platform TEXT, -- 'android', 'ios', 'windows', 'macos', 'linux', 'web'
  model TEXT,
  os_version TEXT,
  app_version TEXT,
  is_online INTEGER DEFAULT 0,
  last_seen INTEGER DEFAULT (unixepoch() * 1000),
  push_token TEXT, -- For push notifications
  created_at INTEGER DEFAULT (unixepoch() * 1000),
  updated_at INTEGER DEFAULT (unixepoch() * 1000),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for device queries
CREATE INDEX IF NOT EXISTS idx_devices_user ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_online ON devices(is_online);
CREATE INDEX IF NOT EXISTS idx_devices_last_seen ON devices(last_seen DESC);

-- ============================================================================
-- TRANSFER HISTORY (Enhancement for analytics)
-- ============================================================================

-- Transfer History table - Track file transfers between devices
CREATE TABLE IF NOT EXISTS transfer_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_hash TEXT,
  from_device_id TEXT,
  to_device_id TEXT,
  transfer_type TEXT, -- 'p2p', 'cloud', 'local'
  status TEXT NOT NULL, -- 'pending', 'in_progress', 'completed', 'failed', 'cancelled'
  progress INTEGER DEFAULT 0, -- 0-100 percentage
  speed REAL, -- Transfer speed in mbps
  error_message TEXT,
  started_at INTEGER,
  completed_at INTEGER,
  duration INTEGER, -- Duration in milliseconds
  created_at INTEGER DEFAULT (unixepoch() * 1000),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for transfer history
CREATE INDEX IF NOT EXISTS idx_transfer_user ON transfer_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transfer_status ON transfer_history(status);
CREATE INDEX IF NOT EXISTS idx_transfer_devices ON transfer_history(from_device_id, to_device_id);
CREATE INDEX IF NOT EXISTS idx_transfer_completed ON transfer_history(completed_at DESC);
