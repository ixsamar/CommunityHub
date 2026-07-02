import {storage} from '../../Utils/mmkv';
import {Logger} from '../../Utils/logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class StorageRepository {
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

  public static delete(key: string): void {
    try {
      storage.delete(key);
    } catch (error) {
      Logger.error(`Failed to delete cache for key: ${key}`, 'StorageRepository', error);
    }
  }

  public static clearCachePattern(pattern: string): void {
    try {
      const allKeys = storage.getAllKeys();
      allKeys.forEach(key => {
        if (key.includes(pattern)) {
          storage.delete(key);
        }
      });
    } catch (error) {
      Logger.error(`Failed to clear cache pattern: ${pattern}`, 'StorageRepository', error);
    }
  }
}
