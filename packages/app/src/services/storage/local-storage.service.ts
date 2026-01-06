import { Storage } from "@ionic/storage";
import type { StorageService } from "../../types/storage.types";

class LocalStorageService implements StorageService {
  private storage: Storage | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the storage
   * Must be called before using any other methods
   */
  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      if (!this.storage) {
        const storage = new Storage();
        this.storage = await storage.create();
      }
    })();

    return this.initPromise;
  }

  /**
   * Ensure storage is initialized before performing operations
   */
  private async ensureInitialized(): Promise<Storage> {
    await this.init();
    if (!this.storage) {
      throw new Error("Storage not initialized");
    }
    return this.storage;
  }

  /**
   * Get a value from storage
   */
  async get<T>(key: string): Promise<T | null> {
    const storage = await this.ensureInitialized();
    return await storage.get(key);
  }

  /**
   * Set a value in storage
   */
  async set<T>(key: string, value: T): Promise<void> {
    const storage = await this.ensureInitialized();
    await storage.set(key, value);
  }

  /**
   * Remove a key from storage
   */
  async remove(key: string): Promise<void> {
    const storage = await this.ensureInitialized();
    await storage.remove(key);
  }

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    const storage = await this.ensureInitialized();
    await storage.clear();
  }

  /**
   * Get all keys in storage
   */
  async keys(): Promise<string[]> {
    const storage = await this.ensureInitialized();
    return await storage.keys();
  }

  /**
   * Get the number of items in storage
   */
  async length(): Promise<number> {
    const storage = await this.ensureInitialized();
    return await storage.length();
  }
}

// Export a singleton instance
export const localStorageService = new LocalStorageService();
