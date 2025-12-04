/**
 * Example: Redis-backed Cache Manager
 *
 * Production-ready caching with Redis (Upstash) for
 * distributed caching across multiple servers.
 *
 * @package cache-manager
 * @requires @upstash/redis
 */

import { Redis } from '@upstash/redis'
import { cacheManager } from '@/public/registry/cache-manager/files/lib/cache/cache-manager'

/**
 * Initialize Redis client
 *
 * Configure Upstash Redis URL and token in environment:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

/**
 * Example 1: Distributed Session Cache
 *
 * Cache user sessions across multiple server instances.
 */
export async function cacheUserSession(sessionId: string, sessionData: any) {
  await redis.setex(
    `session:${sessionId}`,
    3600, // 1 hour TTL
    JSON.stringify(sessionData)
  )
}

export async function getUserSession(sessionId: string) {
  const data = await redis.get(`session:${sessionId}`)
  return data ? JSON.parse(data as string) : null
}

/**
 * Example 2: Cache Leaderboard Data
 *
 * Use Redis sorted sets for leaderboards and rankings.
 */
export async function updatePerformanceLeaderboard(
  userId: string,
  score: number
) {
  await redis.zadd('leaderboard:performance', {
    score,
    member: userId,
  })
}

export async function getTopPerformers(limit: number = 10) {
  return redis.zrange('leaderboard:performance', 0, limit - 1, {
    rev: true, // Highest scores first
    withScores: true,
  })
}

/**
 * Example 3: Rate Limiting with Redis
 *
 * Track API usage per user with sliding window.
 */
export async function checkRateLimit(
  userId: string,
  limit: number = 100,
  windowSeconds: number = 60
): Promise<boolean> {
  const key = `ratelimit:${userId}:${Math.floor(Date.now() / 1000 / windowSeconds)}`

  const count = await redis.incr(key)
  await redis.expire(key, windowSeconds)

  return count <= limit
}

/**
 * Example 4: Cache Invalidation Pattern
 *
 * Use Redis pub/sub to notify all servers of cache invalidation.
 */
export async function invalidateCacheGlobally(pattern: string) {
  // Publish invalidation message
  await redis.publish('cache:invalidate', pattern)

  // Delete matching keys
  const keys = await redis.keys(pattern)
  if (keys.length > 0) {
    await redis.del(...keys)
  }
}

// Subscribe to invalidation messages (in a background worker)
export async function setupCacheInvalidationSubscriber() {
  const subscriber = redis.duplicate()

  await subscriber.subscribe('cache:invalidate', (pattern) => {
    console.log(`Invalidating cache pattern: ${pattern}`)
    // Local cache invalidation here
    cacheManager.clear()
  })
}

/**
 * Example 5: Multi-layer Cache Strategy
 *
 * Combine in-memory cache (fast) with Redis (distributed).
 */
const inMemoryCache = new Map<string, { value: any; expires: number }>()

export async function multiLayerGet(key: string) {
  // Layer 1: In-memory (fastest)
  const memCached = inMemoryCache.get(key)
  if (memCached && memCached.expires > Date.now()) {
    console.log('Memory cache hit:', key)
    return memCached.value
  }

  // Layer 2: Redis (distributed)
  const redisCached = await redis.get(key)
  if (redisCached) {
    console.log('Redis cache hit:', key)
    // Populate in-memory cache
    inMemoryCache.set(key, {
      value: redisCached,
      expires: Date.now() + 60000, // 1 min in-memory TTL
    })
    return redisCached
  }

  console.log('Cache miss:', key)
  return null
}

export async function multiLayerSet(
  key: string,
  value: any,
  ttlSeconds: number = 300
) {
  // Store in both layers
  inMemoryCache.set(key, {
    value,
    expires: Date.now() + Math.min(ttlSeconds, 60) * 1000,
  })

  await redis.setex(key, ttlSeconds, JSON.stringify(value))
}

/**
 * Example 6: Cache Analytics
 *
 * Track cache hit/miss rates for monitoring.
 */
export async function incrementCacheMetric(metric: 'hit' | 'miss') {
  const key = `cache:metrics:${metric}:${new Date().toISOString().split('T')[0]}`
  await redis.incr(key)
  await redis.expire(key, 86400 * 7) // Keep for 7 days
}

export async function getCacheMetrics() {
  const today = new Date().toISOString().split('T')[0]
  const hits = (await redis.get(`cache:metrics:hit:${today}`)) || 0
  const misses = (await redis.get(`cache:metrics:miss:${today}`)) || 0

  const total = Number(hits) + Number(misses)
  const hitRate = total > 0 ? (Number(hits) / total) * 100 : 0

  return {
    hits: Number(hits),
    misses: Number(misses),
    total,
    hitRate: hitRate.toFixed(2) + '%',
  }
}

/**
 * Example 7: Cache Warm-up
 *
 * Pre-populate cache with frequently accessed data.
 */
export async function warmUpCache() {
  console.log('Starting cache warm-up...')

  // Warm up job postings
  const jobs = await fetchActiveJobPostings()
  await Promise.all(
    jobs.map(job =>
      redis.setex(`job:${job.id}`, 600, JSON.stringify(job))
    )
  )

  // Warm up public data
  const stats = await fetchPublicStats()
  await redis.setex('stats:public', 300, JSON.stringify(stats))

  console.log('Cache warm-up complete')
}

// Mock functions
async function fetchActiveJobPostings() {
  return [{ id: '1', title: 'Engineer' }]
}

async function fetchPublicStats() {
  return { totalJobs: 100, totalCandidates: 500 }
}

/**
 * Configuration Tips:
 *
 * 1. Upstash Redis Setup:
 *    - Create account at upstash.com
 *    - Create Redis database
 *    - Copy REST URL and token to .env
 *
 * 2. TTL Strategy:
 *    - User sessions: 1-24 hours
 *    - API responses: 5-60 minutes
 *    - Static data: 1-24 hours
 *    - Analytics: 1-7 days
 *
 * 3. Key Naming Convention:
 *    - Use namespaces: `module:entity:id`
 *    - Examples: `session:abc123`, `user:profile:456`
 *    - Enables pattern-based invalidation
 *
 * 4. Performance Optimization:
 *    - Use pipeline for batch operations
 *    - Implement multi-layer caching
 *    - Monitor hit rates (target >80%)
 *    - Set appropriate TTLs
 *
 * 5. Production Considerations:
 *    - Handle Redis connection failures gracefully
 *    - Implement circuit breaker pattern
 *    - Monitor Redis memory usage
 *    - Set up alerts for low hit rates
 */
