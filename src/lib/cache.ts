/**
 * Cache utility with Redis (Upstash)
 * MVP Smart - Phase 1 Optimization
 */

import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

/**
 * Get cached value or execute fetcher and cache result
 *
 * @param key - Cache key
 * @param fetcher - Function to fetch fresh data
 * @param ttl - Time to live in seconds (default: 300s = 5min)
 * @returns Cached or fresh data
 *
 * @example
 * const goals = await getCached(
 *   `goals:${orgId}`,
 *   () => fetchGoalsFromDB(orgId),
 *   300
 * )
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  // If Redis not configured, bypass cache
  if (!redis) {
    console.warn('[Cache] Redis not configured, bypassing cache')
    return fetcher()
  }

  try {
    // Try to get from cache
    const cached = await redis.get<T>(key)

    if (cached !== null) {
      console.log(`[Cache] HIT: ${key}`)
      return cached
    }

    console.log(`[Cache] MISS: ${key}`)

    // Fetch fresh data
    const fresh = await fetcher()

    // Cache the result
    await redis.setex(key, ttl, JSON.stringify(fresh))

    return fresh
  } catch (error) {
    console.error('[Cache] Error:', error)
    // Fallback to fetcher on cache error
    return fetcher()
  }
}

/**
 * Invalidate cache by key pattern
 *
 * @param pattern - Redis key pattern (e.g., "goals:*")
 *
 * @example
 * await invalidateCache("goals:org-123-*")
 */
export async function invalidateCache(pattern: string): Promise<void> {
  if (!redis) return

  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
      console.log(`[Cache] Invalidated ${keys.length} keys matching: ${pattern}`)
    }
  } catch (error) {
    console.error('[Cache] Invalidation error:', error)
  }
}

/**
 * Set cache value manually
 *
 * @param key - Cache key
 * @param value - Value to cache
 * @param ttl - Time to live in seconds
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttl: number = 300
): Promise<void> {
  if (!redis) return

  try {
    await redis.setex(key, ttl, JSON.stringify(value))
    console.log(`[Cache] SET: ${key} (TTL: ${ttl}s)`)
  } catch (error) {
    console.error('[Cache] Set error:', error)
  }
}

/**
 * Cache key builders for consistency
 */
export const CacheKeys = {
  goals: {
    byOrg: (orgId: string) => `goals:org:${orgId}`,
    byId: (id: string) => `goals:id:${id}`,
    all: () => 'goals:*',
  },
  dashboard: {
    summary: (orgId: string) => `dashboard:summary:${orgId}`,
    all: () => 'dashboard:*',
  },
  candidates: {
    byJob: (jobId: string) => `candidates:job:${jobId}`,
    byOrg: (orgId: string) => `candidates:org:${orgId}`,
    all: () => 'candidates:*',
  },
  ai: {
    response: (promptHash: string) => `ai:response:${promptHash}`,
    all: () => 'ai:*',
  },
} as const

/**
 * Cache stats (for monitoring)
 */
export async function getCacheStats() {
  if (!redis) return null

  try {
    const info = await redis.info()
    return {
      connected: true,
      info,
    }
  } catch (error) {
    return {
      connected: false,
      error: String(error),
    }
  }
}
