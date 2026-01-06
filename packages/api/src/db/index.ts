import type { User, RegisterRequest } from "@syncstuff/shared";

export class Database {
  constructor(private db: D1Database) {}

  async createUser(user: RegisterRequest, passwordHash: string): Promise<User | null> {
    const id = crypto.randomUUID();
    const now = Date.now();
    const defaultPreferences = JSON.stringify({
      isDarkMode: false,
      enablePushNotifications: true,
      enableDebugMode: false,
      requestTimeout: 30000,
      enableBetaFeatures: false,
      notificationTime: "09:00",
    });

    try {
      const result = await this.db.prepare(
        `INSERT INTO users (id, email, password_hash, username, full_name, role, preferences, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'user', ?, 'active', ?, ?)
         RETURNING *`
      )
      .bind(id, user.email, passwordHash, user.username, user.full_name || null, defaultPreferences, now, now)
      .first<User>();

      if (result && result.preferences && typeof result.preferences === 'string') {
          result.preferences = JSON.parse(result.preferences);
      }
      return result;
    } catch (e) {
      console.error("Error creating user:", e);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<{ user: User; password_hash: string } | null> {
    const result = await this.db.prepare("SELECT * FROM users WHERE email = ?").bind(email).first<{
      id: string;
      email: string;
      username: string;
      full_name: string | null;
      role: 'user' | 'admin';
      avatar_url?: string;
      preferences?: string;
      status: 'active' | 'suspended';
      created_at: number;
      updated_at: number;
      password_hash: string;
    }>();
    if (!result) return null;

    const user: User = {
        id: result.id,
        email: result.email,
        username: result.username,
        full_name: result.full_name,
        role: result.role,
        avatar_url: result.avatar_url,
        preferences: result.preferences ? JSON.parse(result.preferences) : undefined,
        status: result.status,
        created_at: result.created_at,
        updated_at: result.updated_at
    };

    return { user, password_hash: result.password_hash };
  }
}
