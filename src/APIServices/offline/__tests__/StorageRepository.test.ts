import {StorageRepository} from '../StorageRepository';

beforeEach(() => {
  const {MMKV} = require('react-native-mmkv');
  const instance = new MMKV();
  instance.clearAll();
});

describe('StorageRepository', () => {
  describe('set() and get()', () => {
    it('stores and retrieves a string value', () => {
      StorageRepository.set('test_key', 'hello world', 60);
      const result = StorageRepository.get<string>('test_key');
      expect(result).toBe('hello world');
    });

    it('stores and retrieves an object', () => {
      const payload = {id: '1', name: 'Community A'};
      StorageRepository.set('community_1', payload, 300);
      const result = StorageRepository.get<typeof payload>('community_1');
      expect(result).toEqual(payload);
    });

    it('returns null for missing keys', () => {
      const result = StorageRepository.get<string>('nonexistent_key');
      expect(result).toBeNull();
    });

    it('returns null on malformed JSON', () => {
      const {MMKV} = require('react-native-mmkv');
      const store = new MMKV();
      store.set('bad_key', '{invalid-json');
      const result = StorageRepository.get<string>('bad_key');
      expect(result).toBeNull();
    });
  });

  describe('isStale()', () => {
    it('returns false for a freshly cached entry', () => {
      StorageRepository.set('fresh_key', 'data', 300);
      expect(StorageRepository.isStale('fresh_key')).toBe(false);
    });

    it('returns true for a missing key', () => {
      expect(StorageRepository.isStale('missing')).toBe(true);
    });

    it('returns true for a manually expired entry', () => {
      const {MMKV} = require('react-native-mmkv');
      const store = new MMKV();
      const expired = {
        data: 'old',
        timestamp: Date.now() - 10 * 60 * 1000,
        ttl: 5 * 60 * 1000,
      };
      store.set('expired_key', JSON.stringify(expired));
      expect(StorageRepository.isStale('expired_key')).toBe(true);
    });
  });

  describe('delete()', () => {
    it('removes a cached entry', () => {
      StorageRepository.set('to_delete', 'value', 60);
      StorageRepository.delete('to_delete');
      expect(StorageRepository.get('to_delete')).toBeNull();
    });
  });

  describe('clearCachePattern()', () => {
    it('clears all keys matching a prefix pattern', () => {
      StorageRepository.set('posts_cache_1', 'data1', 60);
      StorageRepository.set('posts_cache_2', 'data2', 60);
      StorageRepository.set('communities_cache_1', 'community', 60);
      StorageRepository.clearCachePattern('posts_cache');
      expect(StorageRepository.get('posts_cache_1')).toBeNull();
      expect(StorageRepository.get('posts_cache_2')).toBeNull();
      expect(StorageRepository.get('communities_cache_1')).not.toBeNull();
    });
  });
});
