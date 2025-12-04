import { logger } from '@/src/lib/monitoring/logger'
/**
 * Redis-based caching service for Targetym
 * Provides query-level caching with TTL, invalidation, and cache warming
 *
 * Usage:
 * ```typescript
 * const data = await cacheService.getCached(
 *   'key',
 *   async () => { return await fetchData() },
 *   { ttl: 300, tags: ['performance', orgId] }
 * )
 * ```
 */

// Conditional import based on environment
// Use Upstash Redis for production (serverless-friendly)
// Use ioredis for local development
const USE_UPSTASH = process.env.NODE_ENV === 'production'

type RedisClient = any // Dynamic type based on environment

let redis: RedisClient

// Initialize Redis client based on environment
if (USE_UPSTASH && process.env.UPSTASH_REDIS_REST_URL) {
  // Production: Use Upstash Redis (serverless)
  const { Redis } = require('@upstash/redis')
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
} else if (process.env.REDIS_URL) {
  // Development: Use local Redis via ioredis
  const IORedis = require('ioredis')
  redis = new IORedis(process.env.REDIS_URL)
} else {
  // Fallback: In-memory cache (no persistence)
  logger.warn('⚠️  No Redis configured. Using in-memory cache (not recommended for production)')

  class InMemoryCache {
    private cache = new Map<string, { data: string; expires: number }>()

    async get(key: string): Promise<string | null> {
      const item = this.cache.get(key)
      if (!item) return null

      if (Date.now() > item.expires) {
        this.cache.delete(key)
        return null
      }

      return item.data
    }

    async set(key: string, value: string, options?: { ex?: number }): Promise<void> {
      const ttl = options?.ex || 300
      this.cache.set(key, {
        data: value,
        expires: Date.now() + ttl * 1000,
      })
    }

    async del(...keys: string[]): Promise<number> {
      let count = 0
      keys.forEach(key => {
        if (this.cache.delete(key)) count++
      })
      return count
    }

    async keys(pattern: string): Promise<string[]> {
      const regex = new RegExp('^' + pattern.replace('*', '.*') + '$')
      return Array.from(this.cache.keys()).filter(key => regex.test(key))
    }
  }

  redis = new InMemoryCache()
}

export interface CacheOptions {
  /** Time to live in seconds (default: 300 = 5 minutes) */
  ttl?: number

  /** Cache tags for batch invalidation */
  tags?: string[]

  /** Force revalidation (bypass cache) */
  revalidate?: boolean

  /** Cache key prefix */
  prefix?: string
}

export interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  totalKeys: number
}

/**
 * Cache service for query-level caching
 */
export class CacheService {
  private stats = {
    hits: 0,
    misses: 0,
  }

  /**
   * Get cached data or execute callback and cache result
   */
  async getCached<T>(
    key: string,
    callback: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const { ttl = 300, revalidate = false, prefix = 'cache' } = options
    const fullKey = `${prefix}:${key}`

    // Force revalidation if requested
    if (revalidate) {
      const data = await callback()
      await this.set(fullKey, data, ttl)
      this.stats.misses++
      return data
    }

    // Try to get from cache
    try {
      const cached = await redis.get(fullKey)

      if (cached !== null) {
        this.stats.hits++
        return JSON.parse(cached as string) as T
      }
    } catch (error) {
      // Continue to fetch from source
    }

    // OPTIMIZED: Distributed locking to prevent cache stampede
    const lockKey = `lock:${fullKey}`
    const lockTtl = 10 // 10 seconds lock

    try {
      // Try to acquire lock
      const lockAcquired = await redis.set(lockKey, '1', { ex: lockTtl, nx: true })

      if (lockAcquired) {
        // We got the lock - fetch data and update cache
        try {
          this.stats.misses++
          const data = await callback()
          await this.set(fullKey, data, ttl)
          return data
        } finally {
          // Release lock
          await redis.del(lockKey)
        }
      } else {
        // Lock already held by another process - wait and retry
        // Wait up to 5 seconds for the lock holder to populate cache
        const maxWait = 5000
        const checkInterval = 100
        let waited = 0

        while (waited < maxWait) {
          await new Promise(resolve => setTimeout(resolve, checkInterval))
          waited += checkInterval

          // Check if cache was populated
          const cached = await redis.get(fullKey)
          if (cached !== null) {
            this.stats.hits++
            return JSON.parse(cached as string) as T
          }

          // Check if lock was released (other process failed)
          const lockExists = await redis.get(lockKey)
          if (!lockExists) {
            break // Lock released, we can try to acquire it
          }
        }

        // If we reach here, either timeout or lock released
        // Fall back to fetching without lock (better than failing)
        this.stats.misses++
        const data = await callback()
        await this.set(fullKey, data, ttl)
        return data
      }
    } catch (error) {
      // Lock mechanism failed - fall back to simple cache miss
      this.stats.misses++
      const data = await callback()
      await this.set(fullKey, data, ttl)
      return data
    }
  }

  /**
   * Set cache value directly
   */
  async set<T>(key: string, value: T, ttl: number = 300): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(value), { ex: ttl })
    } catch (error) {
      logger.error('Cache set error:', error)
    }
  }

  /**
   * Get cache value directly
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redis.get(key)
      return cached ? JSON.parse(cached as string) as T : null
    } catch (error) {
      logger.error('Cache get error:', error)
      return null
    }
  }

  /**
   * Delete cache key(s)
   */
  async delete(...keys: string[]): Promise<void> {
    if (keys.length === 0) return

    try {
      await redis.del(...keys)
    } catch (error) {
      logger.error('Cache delete error:', error)
    }
  }

  /**
   * Invalidate cache by key pattern
   * Pattern examples: 'goals:*', '*:org-123:*'
   */
  async invalidate(pattern: string): Promise<number> {
    try {
      // OPTIMIZED: Use SCAN instead of KEYS to avoid blocking Redis
      const keysToDelete: string[] = []
      let cursor = '0'

      do {
        // SCAN returns [newCursor, keys]
        const result = await redis.scan(cursor, {
          match: pattern,
          count: 100, // Scan 100 keys per iteration
        })

        // Handle different Redis client response formats
        const newCursor = Array.isArray(result) ? result[0] : result.cursor
        const keys = Array.isArray(result) ? result[1] : result.keys

        cursor = String(newCursor)
        if (keys && keys.length > 0) {
          keysToDelete.push(...keys)
        }
      } while (cursor !== '0')

      if (keysToDelete.length === 0) {
        return 0
      }

      // Delete in batches of 100 to avoid overloading Redis
      const batchSize = 100
      for (let i = 0; i < keysToDelete.length; i += batchSize) {
        const batch = keysToDelete.slice(i, i + batchSize)
        await redis.del(...batch)
      }

      return keysToDelete.length
    } catch (error) {
      return 0
    }
  }

  /**
   * Invalidate cache by tags
   * Invalidates all keys containing any of the tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    let totalInvalidated = 0

    for (const tag of tags) {
      const count = await this.invalidate(`*:${tag}:*`)
      totalInvalidated += count
    }

    return totalInvalidated
  }

  /**
   * Warm up cache with data
   */
  async warmup<T>(key: string, data: T, ttl: number = 300): Promise<void> {
    await this.set(key, data, ttl)
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      totalKeys: 0, // Would need async call to get this
    }
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = { hits: 0, misses: 0 }
  }

  /**
   * Clear all cache (use with caution!)
   */
  async clearAll(): Promise<void> {
    try {
      await this.invalidate('*')
      this.resetStats()
    } catch (error) {
      logger.error('Cache clear error:', error)
    }
  }
}

// Singleton export
export const cacheService = new CacheService()

/**
 * Cache key builders for common patterns
 */
export const CacheKeys = {
  // Goals
  goal: (goalId: string) => `goal:${goalId}`,
  goals: (orgId: string, filters?: string) => `goals:${orgId}${filters ? `:${filters}` : ''}`,
  goalsWithProgress: (orgId: string) => `goals-progress:${orgId}`,

  // KPIs
  kpi: (kpiId: string) => `kpi:${kpiId}`,
  kpis: (orgId: string, filters?: string) => `kpis:${orgId}${filters ? `:${filters}` : ''}`,
  kpiMeasurements: (kpiId: string) => `kpi-measurements:${kpiId}`,

  // Performance
  performanceReview: (reviewId: string) => `perf-review:${reviewId}`,
  performanceReviews: (orgId: string) => `perf-reviews:${orgId}`,
  performanceSummary: (orgId: string) => `perf-summary:${orgId}`,

  // Recruitment
  jobPosting: (postingId: string) => `job-posting:${postingId}`,
  jobPostings: (orgId: string) => `job-postings:${orgId}`,
  candidate: (candidateId: string) => `candidate:${candidateId}`,
  candidates: (jobPostingId: string) => `candidates:${jobPostingId}`,

  // Notifications
  notifications: (userId: string) => `notifications:${userId}`,
  notificationStats: (userId: string) => `notification-stats:${userId}`,
  unreadCount: (userId: string) => `unread-count:${userId}`,

  // Organization
  organization: (orgId: string) => `org:${orgId}`,
  organizationStats: (orgId: string) => `org-stats:${orgId}`,
} as const

/**
 * Cache tags for invalidation
 */
export const CacheTags = {
  goals: (orgId: string) => ['goals', orgId],
  kpis: (orgId: string) => ['kpis', orgId],
  performance: (orgId: string) => ['performance', orgId],
  recruitment: (orgId: string) => ['recruitment', orgId],
  notifications: (userId: string) => ['notifications', userId],
} as const
