import {storage} from '../../storage/mmkv';
import {Logger} from '../../utils/logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // in milliseconds
}

export class StorageRepository {
  /**
   * Write data to storage with a specific TTL in seconds.
   */
  public static set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttlSeconds * 1000,
      };
      storage.set(key, JSON.stringify(entry));
    } catch (error) {
      Logger.error(`Failed to write to cache for key: ${key}`, 'StorageRepository', error);
    }
  }

  /**
   * Retrieve cached data. Returns null if missing.
   * Note: This returns cached data even if stale (to support Offline reads / SWR).
   */
  public static get<T>(key: string): T | null {
    try {
      const value = storage.getString(key);
      if (!value) return null;

      const entry = JSON.parse(value) as CacheEntry<T>;
      return entry.data;
    } catch (error) {
      Logger.error(`Failed to read cache for key: ${key}`, 'StorageRepository', error);
      return null;
    }
  }

  /**
   * Checks if a cache entry is stale (exceeded TTL).
   */
  public static isStale(key: string): boolean {
    try {
      const value = storage.getString(key);
      if (!value) return true;

      const entry = JSON.parse(value) as CacheEntry<unknown>;
      const age = Date.now() - entry.timestamp;
      return age > entry.ttl;
    } catch {
      return true;
    }
  }

  /**
   * Delete entry from cache.
   */
  public static delete(key: string): void {
    try {
      storage.delete(key);
    } catch (error) {
      Logger.error(`Failed to delete cache for key: ${key}`, 'StorageRepository', error);
    }
  }

  /**
   * Clear all cached keys containing a certain prefix.
   */
  public static clearCachePattern(pattern: string): void {
    try {
      const allKeys = storage.getAllKeys();
      allKeys.forEach((key) => {
        if (key.includes(pattern)) {
          storage.delete(key);
        }
      });
    } catch (error) {
      Logger.error(`Failed to clear cache pattern: ${pattern}`, 'StorageRepository', error);
    }
  }
}
