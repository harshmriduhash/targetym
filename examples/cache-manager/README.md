# Cache Manager Examples

Multi-layer caching system examples with Redis support from the Targetym Component Registry.

## Overview

The `cache-manager` module provides flexible caching utilities for optimizing performance through in-memory and distributed (Redis) caching.

## Examples

### 1. Basic Caching (`basic.ts`)

Simple cache operations for API responses and database queries.

**Features:**
- Get/set operations
- TTL (time-to-live) management
- Batch operations
- Cache invalidation

**Use Case:** Reduce database queries and API calls.

### 2. Redis Integration (`with-redis.ts`)

Production-ready distributed caching with Upstash Redis.

**Features:**
- Distributed caching across servers
- Session management
- Rate limiting
- Leaderboards (sorted sets)
- Multi-layer cache strategy
- Cache analytics

**Use Case:** Multi-server deployments requiring shared cache.

### 3. Invalidation Strategies (`with-invalidation.ts`)

Advanced cache invalidation patterns.

**Strategies:**
- Tag-based invalidation
- Time-based (TTL)
- Event-driven
- Lazy invalidation
- Write-through
- Stale-while-revalidate
- Bulk invalidation

**Use Case:** Maintain cache consistency with database changes.

## Installation

```bash
npm install @upstash/redis
npx shadcn@latest add cache-manager
```

## Environment Setup

For Redis caching:

```bash
# .env.local
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

## API Reference

### Basic Operations

```ts
import { cacheManager } from '@/lib/cache/cache-manager'

// Get
const value = await cacheManager.get('key')

// Set with TTL (seconds)
await cacheManager.set('key', value, 300)

// Delete
await cacheManager.delete('key')

// Clear all
await cacheManager.clear()
```

### Tagged Cache

```ts
// Set with tags
await cacheManager.setWithTags(
  'goal:123',
  goalData,
  ['goals', 'user:456'],
  300
)

// Invalidate by tag
await cacheManager.invalidateByTags(['goals'])
```

### Batch Operations

```ts
// Get multiple
const values = await cacheManager.getBatch([
  'key1',
  'key2',
  'key3'
])

// Set multiple
await cacheManager.setBatch([
  { key: 'key1', value: 'value1', ttl: 300 },
  { key: 'key2', value: 'value2', ttl: 600 },
])
```

### Auto-fetch Pattern

```ts
const data = await cacheManager.getOrSet(
  'expensive:data',
  async () => {
    // Only called on cache miss
    return await fetchExpensiveData()
  },
  600 // TTL
)
```

## TTL Guidelines

```ts
// Frequently changing (1-5 minutes)
await cacheManager.set('live:data', value, 60)

// Semi-static (5-30 minutes)
await cacheManager.set('user:profile', value, 900)

// Rarely changing (1+ hours)
await cacheManager.set('settings', value, 3600)

// Static reference (24+ hours)
await cacheManager.set('countries', value, 86400)
```

## Invalidation Patterns

### On Data Change

```ts
async function updateGoal(id: string, data: any) {
  const goal = await db.update(id, data)

  // Invalidate caches
  await cacheManager.delete(`goal:${id}`)
  await cacheManager.invalidateByTags(['goals'])

  return goal
}
```

### Scheduled Refresh

```ts
// Refresh cache every 10 minutes
setInterval(async () => {
  const data = await fetchFreshData()
  await cacheManager.set('cached:data', data, 600)
}, 600000)
```

## Redis-specific Features

### Rate Limiting

```ts
const allowed = await checkRateLimit(userId, 100, 60)
if (!allowed) {
  throw new Error('Rate limit exceeded')
}
```

### Leaderboards

```ts
// Update score
await redis.zadd('leaderboard', { score: 100, member: userId })

// Get top 10
const top = await redis.zrange('leaderboard', 0, 9, { rev: true })
```

### Distributed Locks

```ts
const lock = await redis.set('lock:resource', 'locked', {
  nx: true, // Only set if not exists
  ex: 10,   // Expire in 10 seconds
})

if (lock) {
  // Perform operation
  await doWork()
  await redis.del('lock:resource')
}
```

## Best Practices

1. **Key Naming**: Use namespaces (`module:entity:id`)
2. **TTL Strategy**: Match TTL to data change frequency
3. **Invalidation**: Invalidate on writes, not reads
4. **Monitoring**: Track hit/miss rates (target >80%)
5. **Fallback**: Always handle cache failures gracefully
6. **Size Limits**: Cache only necessary data
7. **Compression**: Consider compressing large values

## Performance Tips

- Use batch operations for multiple keys
- Implement multi-layer caching (memory + Redis)
- Set appropriate TTLs to reduce stale data
- Monitor cache memory usage
- Use stale-while-revalidate for better UX

## Troubleshooting

### Low Hit Rate

- Check if TTL is too short
- Verify invalidation isn't too aggressive
- Ensure keys are consistent

### High Memory Usage

- Reduce TTLs
- Implement size limits
- Clear unused caches
- Use Redis eviction policies

### Redis Connection Issues

- Implement circuit breaker
- Add retry logic
- Fall back to database on failure

## Related Modules

- **rate-limiter**: Uses cache for rate limiting
- **resilience-patterns**: Circuit breaker for cache failures
