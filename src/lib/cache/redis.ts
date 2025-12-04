import { Redis } from '@upstash/redis'
import { logger, logCache } from '@/src/lib/monitoring/logger'

/**
 * Redis Cache Layer
 *
 * Provides server-side caching with Upstash Redis
 * Falls back to in-memory cache if Redis is not configured
 */

// Initialize Redis client
let redis: Redis | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
  logger.info('Redis cache initialized')
} else {
  logger.warn('Redis not configured, using in-memory cache')
}

// In-memory fallback cache
const memoryCache = new Map<string, { value: unknown; expires: number }>()

// Cache key prefixes
export const CachePrefix = {
  GOALS: 'goals',
  RECRUITMENT: 'recruitment',
  PERFORMANCE: 'performance',
  ANALYTICS: 'analytics',
  USER: 'user',
} as const

/**
 * Generate cache key with prefix and organization isolation
 */
export function cacheKey(
  prefix: string,
  organizationId: string,
  ...parts: string[]
): string {
  return `${prefix}:${organizationId}:${parts.join(':')}`
}

/**
 * Get value from cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    if (redis) {
      const value = await redis.get<T>(key)
      if (value) {
        logCache('hit', key)
        return value
      }
      logCache('miss', key)
      return null
    }

    // Fallback to memory cache
    const cached = memoryCache.get(key)
    if (cached && cached.expires > Date.now()) {
      logCache('hit', key)
      return cached.value as T
    }

    logCache('miss', key)
    return null
  } catch (error) {
    logger.error({ error, key }, 'Cache get error')
    return null
  }
}

/**
 * Set value in cache
 */
export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number = 300 // 5 minutes default
): Promise<void> {
  try {
    if (redis) {
      await redis.setex(key, ttlSeconds, value)
      logCache('set', key, ttlSeconds)
      return
    }

    // Fallback to memory cache
    memoryCache.set(key, {
      value,
      expires: Date.now() + ttlSeconds * 1000,
    })
    logCache('set', key, ttlSeconds)
  } catch (error) {
    logger.error({ error, key }, 'Cache set error')
  }
}

/**
 * Delete value from cache
 */
export async function cacheDel(key: string): Promise<void> {
  try {
    if (redis) {
      await redis.del(key)
      logCache('delete', key)
      return
    }

    memoryCache.delete(key)
    logCache('delete', key)
  } catch (error) {
    logger.error({ error, key }, 'Cache delete error')
  }
}

/**
 * Delete multiple keys matching a pattern
 */
export async function cacheDelPattern(pattern: string): Promise<void> {
  try {
    if (redis) {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
        logger.info({ pattern, count: keys.length }, 'Cache pattern deleted')
      }
      return
    }

    // Fallback to memory cache
    const keysToDelete: string[] = []
    memoryCache.forEach((_, key) => {
      if (key.includes(pattern.replace('*', ''))) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach((key) => memoryCache.delete(key))
    logger.info({ pattern, count: keysToDelete.length }, 'Cache pattern deleted')
  } catch (error) {
    logger.error({ error, pattern }, 'Cache delete pattern error')
  }
}

/**
 * Wrap a function with caching
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // Try to get from cache
  const cached = await cacheGet<T>(key)
  if (cached !== null) {
    return cached
  }

  // Execute function
  const result = await fn()

  // Store in cache
  await cacheSet(key, result, ttlSeconds)

  return result
}

/**
 * Invalidate cache for a specific organization
 */
export async function invalidateOrganizationCache(
  organizationId: string,
  prefix?: string
): Promise<void> {
  const pattern = prefix
    ? `${prefix}:${organizationId}:*`
    : `*:${organizationId}:*`

  await cacheDelPattern(pattern)
  logger.info({ organizationId, prefix }, 'Organization cache invalidated')
}

/**
 * Clean up expired entries in memory cache
 */
function cleanupMemoryCache() {
  const now = Date.now()
  let cleaned = 0

  memoryCache.forEach((value, key) => {
    if (value.expires < now) {
      memoryCache.delete(key)
      cleaned++
    }
  })

  if (cleaned > 0) {
    logger.debug({ cleaned }, 'Memory cache cleanup completed')
  }
}

// Run cleanup every 5 minutes
if (!redis) {
  setInterval(cleanupMemoryCache, 5 * 60 * 1000)
}

/**
 * Cache TTL presets (in seconds)
 */
export const CacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 900, // 15 minutes
  HOUR: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const
