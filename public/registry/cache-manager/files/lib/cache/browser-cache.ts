import { logger } from '@/src/lib/monitoring/logger'
/**
 * Browser-Side Caching Utilities
 *
 * Provides client-side caching with:
 * - IndexedDB for large data storage
 * - LocalStorage for small data
 * - SessionStorage for temporary data
 * - In-memory cache for ultra-fast access
 */

// ============================================
// IN-MEMORY CACHE
// ============================================

class MemoryCache {
  private cache = new Map<string, { value: unknown; expires: number }>();

  set(key: string, value: unknown, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttlSeconds * 1000,
    });
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    if (cached.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return cached.value as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    this.cache.forEach((value, key) => {
      if (value.expires < now) {
        this.cache.delete(key);
      }
    });
  }
}

export const memoryCache = new MemoryCache();

// Cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => memoryCache.cleanup(), 5 * 60 * 1000);
}

// ============================================
// LOCAL STORAGE CACHE
// ============================================

export const localCache = {
  /**
   * Set value in localStorage with expiration
   */
  set(key: string, value: unknown, ttlSeconds: number = 3600): void {
    if (typeof window === 'undefined') return;

    try {
      const item = {
        value,
        expires: Date.now() + ttlSeconds * 1000,
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      logger.error('LocalStorage set error:', error);
    }
  },

  /**
   * Get value from localStorage
   */
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);

      if (parsed.expires < Date.now()) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.value as T;
    } catch (error) {
      logger.error('LocalStorage get error:', error);
      return null;
    }
  },

  /**
   * Delete value from localStorage
   */
  delete(key: string): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      logger.error('LocalStorage delete error:', error);
    }
  },

  /**
   * Clear all values
   */
  clear(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.clear();
    } catch (error) {
      logger.error('LocalStorage clear error:', error);
    }
  },
};

// ============================================
// SESSION STORAGE CACHE
// ============================================

export const sessionCache = {
  /**
   * Set value in sessionStorage with expiration
   */
  set(key: string, value: unknown, ttlSeconds: number = 1800): void {
    if (typeof window === 'undefined') return;

    try {
      const item = {
        value,
        expires: Date.now() + ttlSeconds * 1000,
      };
      sessionStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      logger.error('SessionStorage set error:', error);
    }
  },

  /**
   * Get value from sessionStorage
   */
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = sessionStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);

      if (parsed.expires < Date.now()) {
        sessionStorage.removeItem(key);
        return null;
      }

      return parsed.value as T;
    } catch (error) {
      logger.error('SessionStorage get error:', error);
      return null;
    }
  },

  /**
   * Delete value from sessionStorage
   */
  delete(key: string): void {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      logger.error('SessionStorage delete error:', error);
    }
  },

  /**
   * Clear all values
   */
  clear(): void {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.clear();
    } catch (error) {
      logger.error('SessionStorage clear error:', error);
    }
  },
};

// ============================================
// INDEXEDDB CACHE (for large data)
// ============================================

class IndexedDBCache {
  private dbName = 'targetym-cache';
  private storeName = 'cache-store';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (typeof window === 'undefined') return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async set(key: string, value: unknown, ttlSeconds: number = 3600): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const item = {
        value,
        expires: Date.now() + ttlSeconds * 1000,
      };

      const request = store.put(item, key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.db) await this.init();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const item = request.result;

        if (!item) {
          resolve(null);
          return;
        }

        if (item.expires < Date.now()) {
          this.delete(key);
          resolve(null);
          return;
        }

        resolve(item.value as T);
      };
    });
  }

  async delete(key: string): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const indexedDBCache = new IndexedDBCache();

// ============================================
// MULTI-LAYER CACHE STRATEGY
// ============================================

export interface CacheOptions {
  /**
   * Cache TTL in seconds
   */
  ttl?: number;

  /**
   * Cache layer to use
   * - 'memory': Fastest, cleared on page reload
   * - 'session': Cleared when tab closes
   * - 'local': Persistent across sessions
   * - 'indexeddb': For large data (>5MB)
   */
  layer?: 'memory' | 'session' | 'local' | 'indexeddb';

  /**
   * Whether to update cache in background
   */
  staleWhileRevalidate?: boolean;
}

/**
 * Smart caching that automatically selects the best layer
 */
export const smartCache = {
  async set(key: string, value: unknown, options: CacheOptions = {}): Promise<void> {
    const { ttl = 300, layer = 'memory' } = options;

    switch (layer) {
      case 'memory':
        memoryCache.set(key, value, ttl);
        break;
      case 'session':
        sessionCache.set(key, value, ttl);
        break;
      case 'local':
        localCache.set(key, value, ttl);
        break;
      case 'indexeddb':
        await indexedDBCache.set(key, value, ttl);
        break;
    }
  },

  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const { layer = 'memory' } = options;

    switch (layer) {
      case 'memory':
        return memoryCache.get<T>(key);
      case 'session':
        return sessionCache.get<T>(key);
      case 'local':
        return localCache.get<T>(key);
      case 'indexeddb':
        return await indexedDBCache.get<T>(key);
      default:
        return null;
    }
  },

  async delete(key: string, layer: CacheOptions['layer'] = 'memory'): Promise<void> {
    switch (layer) {
      case 'memory':
        memoryCache.delete(key);
        break;
      case 'session':
        sessionCache.delete(key);
        break;
      case 'local':
        localCache.delete(key);
        break;
      case 'indexeddb':
        await indexedDBCache.delete(key);
        break;
    }
  },

  async clear(layer?: CacheOptions['layer']): Promise<void> {
    if (!layer || layer === 'memory') memoryCache.clear();
    if (!layer || layer === 'session') sessionCache.clear();
    if (!layer || layer === 'local') localCache.clear();
    if (!layer || layer === 'indexeddb') await indexedDBCache.clear();
  },

  /**
   * Wrap a function with caching
   */
  async withCache<T>(
    key: string,
    fn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      // Stale-while-revalidate: return cached and update in background
      if (options.staleWhileRevalidate) {
        fn().then((result) => this.set(key, result, options));
      }
      return cached;
    }

    // Execute function
    const result = await fn();

    // Store in cache
    await this.set(key, result, options);

    return result;
  },
};

// ============================================
// CACHE KEY HELPERS
// ============================================

export function cacheKey(...parts: (string | number)[]): string {
  return parts.join(':');
}

export function organizationCacheKey(
  organizationId: string,
  ...parts: (string | number)[]
): string {
  return cacheKey('org', organizationId, ...parts);
}

export function userCacheKey(
  userId: string,
  ...parts: (string | number)[]
): string {
  return cacheKey('user', userId, ...parts);
}
