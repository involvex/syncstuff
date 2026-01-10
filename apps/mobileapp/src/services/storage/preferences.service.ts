import { Preferences } from "@capacitor/preferences";

/**
 * Preferences Service - Wrapper for Capacitor Preferences plugin
 * Provides key-value storage that persists across app launches
 */
class PreferencesService {
  /**
   * Store a value with the given key
   */
  async set(key: string, value: unknown): Promise<void> {
    await Preferences.set({
      key,
      value: JSON.stringify(value),
    });
  }

  /**
   * Get a value for the given key
   */
  async get<T>(key: string): Promise<T | null> {
    const { value } = await Preferences.get({ key });
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  /**
   * Remove a stored value
   */
  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  }

  /**
   * Clear all stored preferences
   */
  async clear(): Promise<void> {
    await Preferences.clear();
  }

  /**
   * Get all keys stored in preferences
   */
  async keys(): Promise<string[]> {
    const { keys } = await Preferences.keys();
    return keys;
  }

  /**
   * Migrate data from localStorage to Preferences (useful for web to native migration)
   */
  async migrateFromLocalStorage(): Promise<void> {
    const result = await Preferences.migrate();
    console.log(
      `Migrated ${result.migrated.length} keys from localStorage:`,
      result.migrated,
    );
  }
}

export const preferencesService = new PreferencesService();
