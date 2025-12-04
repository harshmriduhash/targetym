/**
 * Cache Manager
 * 
 * Provides abstraction for caching with support for multiple backends.
 * Currently implements in-memory cache (L1).
 * Ready for Redis/Upstash integration (L2).
 */

export interface CacheOptions {
  ttl?: number // Time to live in seconds
  namespace?: string // Cache namespace for key prefixing
}

export interface CacheEntry<T> {
  value: T
  expiresAt: number
}

/**
 * In-memory cache implementation (L1)
 */
class MemoryCache {
  private store: Map<string, CacheEntry<any>> = new Map()

  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    
    if (!entry) {
      return null
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    
    return entry.value as T
  }

  set<T>(key: string, value: T, ttl: number): void {
    const expiresAt = Date.now() + ttl * 1000
    this.store.set(key, { value, expiresAt })
  }

  delete(key: string): void {
    this.store.delete(key)
  }

  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace('*', '.*'))
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key)
      }
    }
  }

  clear(): void {
    this.store.clear()
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key)
      }
    }
  }

  size(): number {
    return this.store.size
  }
}

/**
 * Cache Manager with multi-level caching support
 */
export class CacheManager {
  private l1Cache: MemoryCache
  private namespace: string

  constructor(namespace: string = 'app') {
    this.namespace = namespace
    this.l1Cache = new MemoryCache()
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.buildKey(key)
    
    // Try L1 (memory) cache first
    const l1Value = this.l1Cache.get<T>(fullKey)
    if (l1Value !== null) {
      return l1Value
    }
    
    return null
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const fullKey = this.buildKey(key)
    const ttl = options.ttl || 300 // Default 5 minutes
    
    // Set in L1 cache
    this.l1Cache.set(fullKey, value, Math.min(ttl, 60)) // Max 1 minute in L1
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    const fullKey = this.buildKey(key)
    this.l1Cache.delete(fullKey)
  }

  /**
   * Delete all keys matching pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    const fullPattern = this.buildKey(pattern)
    this.l1Cache.deletePattern(fullPattern)
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.l1Cache.clear()
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }
    
    // Cache miss - call factory
    const value = await factory()
    
    // Store in cache
    await this.set(key, value, options)
    
    return value
  }

  /**
   * Build full cache key with namespace
   */
  private buildKey(key: string): string {
    return `${this.namespace}:${key}`
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      l1Size: this.l1Cache.size(),
      namespace: this.namespace,
    }
  }
}

/**
 * Cache key builders for common patterns
 */
export const CacheKeys = {
  goal: (id: string) => `goal:${id}`,
  goals: (orgId: string) => `goals:org:${orgId}`,
  goalsWithProgress: (orgId: string) => `goals:progress:org:${orgId}`,
  userProfile: (userId: string) => `user:profile:${userId}`,
  userOrganization: (userId: string) => `user:org:${userId}`,
  organization: (orgId: string) => `org:${orgId}`,
}

/**
 * Default TTL values (in seconds)
 */
export const CacheTTL = {
  SHORT: 60,          // 1 minute
  MEDIUM: 300,        // 5 minutes
  LONG: 1800,         // 30 minutes
  VERY_LONG: 3600,    // 1 hour
  DAY: 86400,         // 24 hours
}

// Singleton instance
export const cache = new CacheManager('targetym')
