# Cache Manager Module

Multi-layer caching system with in-memory, browser storage, and Redis support for optimal performance and data persistence.

## Installation

```bash
pnpm registry:install cache-manager
```

## Dependencies

This module requires:

```json
{
  "dependencies": {
    "ioredis": "^5.3.2"
  },
  "optionalDependencies": {
    "@upstash/redis": "^1.25.0"
  }
}
```

## Architecture

The Cache Manager provides a multi-layer caching strategy:

- **L1 (Memory)**: Ultra-fast in-memory cache for server-side operations
- **L2 (Redis)**: Distributed cache for multi-instance deployments (optional)
- **Browser Storage**: Client-side caching (memory, session, local, IndexedDB)

## Server-Side Caching

### CacheManager

Core server-side cache manager with in-memory storage.

```typescript
import { cache, CacheKeys, CacheTTL } from '@/lib/cache/cache-manager'

// Set value in cache
await cache.set('user:profile:123', userData, {
  ttl: CacheTTL.MEDIUM, // 5 minutes
})

// Get value from cache
const userData = await cache.get<UserProfile>('user:profile:123')

// Get or set pattern (cache-aside)
const goals = await cache.getOrSet(
  CacheKeys.goals(organizationId),
  async () => {
    // This function only runs on cache miss
    return await fetchGoalsFromDatabase(organizationId)
  },
  { ttl: CacheTTL.LONG }
)

// Delete specific key
await cache.delete('user:profile:123')

// Delete by pattern
await cache.deletePattern('user:profile:*')

// Clear all cache
await cache.clear()

// Get cache statistics
const stats = cache.getStats()
console.log(`L1 Size: ${stats.l1Size}`)
```

**Configuration:**

```typescript
// Create custom cache instance
import { CacheManager } from '@/lib/cache/cache-manager'

const myCache = new CacheManager('my-namespace')
```

**Cache Keys Helpers:**

```typescript
import { CacheKeys } from '@/lib/cache/cache-manager'

// Predefined key builders
CacheKeys.goal(id)                           // 'goal:abc-123'
CacheKeys.goals(orgId)                       // 'goals:org:org-456'
CacheKeys.goalsWithProgress(orgId)           // 'goals:progress:org:org-456'
CacheKeys.userProfile(userId)                // 'user:profile:user-789'
CacheKeys.userOrganization(userId)           // 'user:org:user-789'
CacheKeys.organization(orgId)                // 'org:org-456'
```

**TTL Constants:**

```typescript
import { CacheTTL } from '@/lib/cache/cache-manager'

CacheTTL.SHORT      // 60 seconds
CacheTTL.MEDIUM     // 5 minutes
CacheTTL.LONG       // 30 minutes
CacheTTL.VERY_LONG  // 1 hour
CacheTTL.DAY        // 24 hours
```

### Service Cache Wrapper

Automatic caching for service methods with intelligent invalidation.

```typescript
import { withServiceCache, ServiceCacheManager } from '@/lib/cache/service-cache'

// Wrap individual function calls
async function getGoals(organizationId: string) {
  return await withServiceCache(
    {
      key: 'goals:list',
      organizationId,
      ttl: CacheTTL.MEDIUM,
    },
    async () => {
      // Expensive database query
      return await supabase
        .from('goals')
        .select('*')
        .eq('organization_id', organizationId)
    }
  )
}

// Use ServiceCacheManager for CRUD operations
class GoalsService {
  private cacheManager: ServiceCacheManager

  constructor(organizationId: string) {
    this.cacheManager = new ServiceCacheManager(organizationId, CachePrefix.GOALS)
  }

  async getGoal(id: string) {
    return this.cacheManager.get(
      `detail:${id}`,
      async () => {
        return await supabase
          .from('goals')
          .select('*')
          .eq('id', id)
          .single()
      },
      CacheTTL.LONG
    )
  }

  async listGoals() {
    return this.cacheManager.list(
      'list',
      async () => {
        return await supabase.from('goals').select('*')
      }
    )
  }

  async createGoal(data: CreateGoalData) {
    return this.cacheManager.create(async () => {
      const result = await supabase.from('goals').insert(data).select().single()
      return result.data
    })
  }

  async updateGoal(id: string, data: UpdateGoalData) {
    return this.cacheManager.update(id, async () => {
      const result = await supabase.from('goals').update(data).eq('id', id).select().single()
      return result.data
    })
  }

  async deleteGoal(id: string) {
    return this.cacheManager.delete(id, async () => {
      await supabase.from('goals').delete().eq('id', id)
    })
  }
}
```

**Cache Invalidation:**

```typescript
import { invalidateServiceCache, invalidateCacheKey } from '@/lib/cache/service-cache'

// Invalidate all cache for a module
await invalidateServiceCache(organizationId, CachePrefix.GOALS)

// Invalidate specific key
await invalidateCacheKey(organizationId, CachePrefix.GOALS, 'detail', goalId)
```

**Decorator Pattern (Advanced):**

```typescript
import { cached } from '@/lib/cache/service-cache'

class MyService {
  @cached({
    prefix: 'myservice',
    ttl: CacheTTL.MEDIUM,
    keyGenerator: (arg1, arg2) => `custom:${arg1}:${arg2}`,
    shouldCache: (arg1) => arg1 !== 'skip-cache',
  })
  async expensiveOperation(arg1: string, arg2: number) {
    // This result will be cached
    return await performExpensiveOperation(arg1, arg2)
  }
}
```

## Client-Side Caching

### Memory Cache

Ultra-fast in-memory cache for client components.

```typescript
'use client'

import { memoryCache } from '@/lib/cache/browser-cache'

// Set value (expires in 5 minutes by default)
memoryCache.set('user-settings', settings, 300)

// Get value
const settings = memoryCache.get<UserSettings>('user-settings')

// Delete value
memoryCache.delete('user-settings')

// Clear all
memoryCache.clear()

// Manual cleanup (automatic every 5 minutes)
memoryCache.cleanup()
```

### Local Storage Cache

Persistent browser storage with automatic expiration.

```typescript
'use client'

import { localCache } from '@/lib/cache/browser-cache'

// Set value (expires in 1 hour by default)
localCache.set('theme-preference', 'dark', 3600)

// Get value
const theme = localCache.get<string>('theme-preference')

// Delete value
localCache.delete('theme-preference')

// Clear all
localCache.clear()
```

**Use Cases:**
- User preferences
- Authentication tokens
- Feature flags
- Form drafts

### Session Storage Cache

Session-scoped storage (cleared when tab closes).

```typescript
'use client'

import { sessionCache } from '@/lib/cache/browser-cache'

// Set value (expires in 30 minutes by default)
sessionCache.set('wizard-state', wizardData, 1800)

// Get value
const wizardData = sessionCache.get<WizardState>('wizard-state')

// Delete value
sessionCache.delete('wizard-state')

// Clear all
sessionCache.clear()
```

**Use Cases:**
- Multi-step form state
- Temporary filters
- Session-specific data
- Wizard progress

### IndexedDB Cache

Large data storage in browser (supports >5MB).

```typescript
'use client'

import { indexedDBCache } from '@/lib/cache/browser-cache'

// Initialize (automatic on first use)
await indexedDBCache.init()

// Set value
await indexedDBCache.set('large-dataset', bigData, 3600)

// Get value
const bigData = await indexedDBCache.get<LargeDataset>('large-dataset')

// Delete value
await indexedDBCache.delete('large-dataset')

// Clear all
await indexedDBCache.clear()
```

**Use Cases:**
- Offline data
- Large datasets
- Downloaded files
- Images and media

### Smart Cache

Automatic layer selection based on data size and requirements.

```typescript
'use client'

import { smartCache } from '@/lib/cache/browser-cache'

// Set with automatic layer selection
await smartCache.set('my-data', data, {
  ttl: 300,
  layer: 'memory', // 'memory' | 'session' | 'local' | 'indexeddb'
})

// Get from cache
const data = await smartCache.get<MyData>('my-data', { layer: 'memory' })

// Cache-aside pattern with stale-while-revalidate
const freshData = await smartCache.withCache(
  'api-response',
  async () => {
    return await fetch('/api/data').then((r) => r.json())
  },
  {
    ttl: 300,
    layer: 'local',
    staleWhileRevalidate: true, // Return cached, refresh in background
  }
)

// Delete from specific layer
await smartCache.delete('my-data', 'memory')

// Clear all layers
await smartCache.clear()
```

### Cache Key Helpers

```typescript
import {
  cacheKey,
  organizationCacheKey,
  userCacheKey,
} from '@/lib/cache/browser-cache'

// Build cache key from parts
const key = cacheKey('goals', 'list', 'active')
// Result: 'goals:list:active'

// Organization-scoped key
const orgKey = organizationCacheKey('org-123', 'goals', 'list')
// Result: 'org:org-123:goals:list'

// User-scoped key
const userKey = userCacheKey('user-456', 'settings')
// Result: 'user:user-456:settings'
```

## Redis Integration (Optional)

For distributed caching across multiple server instances.

### Setup

```typescript
// src/lib/cache/redis.ts
import Redis from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
})

export async function cacheGet<T>(key: string): Promise<T | null> {
  const value = await redis.get(key)
  return value ? JSON.parse(value) : null
}

export async function cacheSet<T>(key: string, value: T, ttl: number): Promise<void> {
  await redis.setex(key, ttl, JSON.stringify(value))
}

export async function cacheDel(key: string): Promise<void> {
  await redis.del(key)
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern)
  if (keys.length > 0) {
    await redis.del(...keys)
  }
}

export function cacheKey(prefix: string, orgId: string, ...parts: string[]): string {
  return [prefix, orgId, ...parts].join(':')
}

export const CachePrefix = {
  GOALS: 'goals',
  RECRUITMENT: 'recruitment',
  PERFORMANCE: 'performance',
  USER: 'user',
  ORG: 'org',
}

export const CacheTTL = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 1800,
  VERY_LONG: 3600,
  DAY: 86400,
}
```

### Upstash Redis (Serverless)

For serverless deployments with Vercel/Netlify.

```typescript
// src/lib/cache/redis-cache.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function cacheGet<T>(key: string): Promise<T | null> {
  return await redis.get<T>(key)
}

export async function cacheSet<T>(key: string, value: T, ttl: number): Promise<void> {
  await redis.setex(key, ttl, value)
}

export async function cacheDel(key: string): Promise<void> {
  await redis.del(key)
}
```

## Usage Patterns

### Pattern 1: Cache-Aside (Lazy Loading)

```typescript
async function getGoals(organizationId: string) {
  // Try cache first
  const cached = await cache.get<Goal[]>(CacheKeys.goals(organizationId))
  if (cached) {
    return cached
  }

  // Cache miss - fetch from database
  const goals = await fetchGoalsFromDB(organizationId)

  // Store in cache
  await cache.set(CacheKeys.goals(organizationId), goals, {
    ttl: CacheTTL.MEDIUM,
  })

  return goals
}
```

### Pattern 2: Read-Through Cache

```typescript
async function getGoals(organizationId: string) {
  return await cache.getOrSet(
    CacheKeys.goals(organizationId),
    async () => await fetchGoalsFromDB(organizationId),
    { ttl: CacheTTL.MEDIUM }
  )
}
```

### Pattern 3: Write-Through Cache

```typescript
async function createGoal(data: CreateGoalData) {
  // Write to database
  const goal = await insertGoalToDB(data)

  // Write to cache
  await cache.set(CacheKeys.goal(goal.id), goal, {
    ttl: CacheTTL.LONG,
  })

  // Invalidate list cache
  await cache.deletePattern(CacheKeys.goals(data.organization_id))

  return goal
}
```

### Pattern 4: Stale-While-Revalidate

```typescript
'use client'

async function getGoals() {
  return await smartCache.withCache(
    'goals-list',
    async () => {
      const response = await fetch('/api/goals')
      return response.json()
    },
    {
      ttl: 300,
      layer: 'local',
      staleWhileRevalidate: true, // Return cached, update in background
    }
  )
}
```

## Performance Optimization

### Cache Warming

Pre-populate cache with frequently accessed data.

```typescript
async function warmCache(organizationId: string) {
  const [goals, users, departments] = await Promise.all([
    fetchGoals(organizationId),
    fetchUsers(organizationId),
    fetchDepartments(organizationId),
  ])

  await Promise.all([
    cache.set(CacheKeys.goals(organizationId), goals, { ttl: CacheTTL.LONG }),
    cache.set(CacheKeys.users(organizationId), users, { ttl: CacheTTL.LONG }),
    cache.set(CacheKeys.departments(organizationId), departments, { ttl: CacheTTL.VERY_LONG }),
  ])
}
```

### Cache Stampede Prevention

Prevent multiple concurrent requests from hitting the database.

```typescript
const pendingRequests = new Map<string, Promise<any>>()

async function getCachedOrFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  // Check cache first
  const cached = await cache.get<T>(key)
  if (cached) return cached

  // Check if request is already pending
  if (pendingRequests.has(key)) {
    return await pendingRequests.get(key)
  }

  // Create new request
  const promise = fetcher().then(async (data) => {
    await cache.set(key, data, { ttl: CacheTTL.MEDIUM })
    pendingRequests.delete(key)
    return data
  })

  pendingRequests.set(key, promise)
  return await promise
}
```

### Batch Operations

Optimize multiple cache operations.

```typescript
async function getMultipleGoals(goalIds: string[]): Promise<Goal[]> {
  // Try to get all from cache first
  const cachePromises = goalIds.map((id) => cache.get<Goal>(CacheKeys.goal(id)))
  const cachedGoals = await Promise.all(cachePromises)

  // Identify cache misses
  const missedIds = goalIds.filter((id, index) => !cachedGoals[index])

  if (missedIds.length === 0) {
    return cachedGoals.filter(Boolean) as Goal[]
  }

  // Fetch missing goals
  const fetchedGoals = await fetchGoalsByIds(missedIds)

  // Store in cache
  await Promise.all(
    fetchedGoals.map((goal) =>
      cache.set(CacheKeys.goal(goal.id), goal, { ttl: CacheTTL.LONG })
    )
  )

  // Combine cached and fetched
  const allGoals = [...cachedGoals.filter(Boolean), ...fetchedGoals] as Goal[]
  return allGoals
}
```

## Best Practices

### 1. Cache Key Naming

Use consistent, hierarchical key naming:

```typescript
// Good
'org:123:goals:list'
'org:123:goal:456'
'user:789:profile'

// Bad
'goals_org_123'
'goal_456'
'user789profile'
```

### 2. TTL Strategy

Choose appropriate TTL based on data volatility:

```typescript
// Frequently changing data
cache.set('active-users-count', count, { ttl: CacheTTL.SHORT }) // 1 min

// Moderately changing data
cache.set('goals-list', goals, { ttl: CacheTTL.MEDIUM }) // 5 min

// Rarely changing data
cache.set('organization-settings', settings, { ttl: CacheTTL.VERY_LONG }) // 1 hour

// Static data
cache.set('feature-flags', flags, { ttl: CacheTTL.DAY }) // 24 hours
```

### 3. Cache Invalidation

Invalidate cache proactively on mutations:

```typescript
async function updateGoal(id: string, data: UpdateGoalData) {
  // Update database
  const updated = await db.update(id, data)

  // Invalidate specific cache
  await cache.delete(CacheKeys.goal(id))

  // Invalidate list cache
  await cache.deletePattern(`org:${data.organization_id}:goals:*`)

  return updated
}
```

### 4. Error Handling

Always handle cache errors gracefully:

```typescript
async function getGoals(organizationId: string) {
  try {
    // Try cache
    const cached = await cache.get<Goal[]>(CacheKeys.goals(organizationId))
    if (cached) return cached
  } catch (error) {
    // Log cache error but don't fail
    console.error('Cache error:', error)
  }

  // Fallback to database
  const goals = await fetchGoalsFromDB(organizationId)

  try {
    // Try to cache result
    await cache.set(CacheKeys.goals(organizationId), goals, { ttl: CacheTTL.MEDIUM })
  } catch (error) {
    // Log but don't fail
    console.error('Cache set error:', error)
  }

  return goals
}
```

### 5. Cache Size Management

Monitor and limit cache size:

```typescript
const MAX_CACHE_SIZE = 1000

class ManagedCache extends CacheManager {
  async set<T>(key: string, value: T, options?: CacheOptions) {
    const stats = this.getStats()

    if (stats.l1Size >= MAX_CACHE_SIZE) {
      // Evict oldest entries or clear cache
      await this.clear()
    }

    await super.set(key, value, options)
  }
}
```

## Testing

### Unit Tests

```typescript
import { CacheManager, CacheTTL } from '@/lib/cache/cache-manager'

describe('CacheManager', () => {
  let cache: CacheManager

  beforeEach(() => {
    cache = new CacheManager('test')
  })

  afterEach(async () => {
    await cache.clear()
  })

  it('should set and get values', async () => {
    await cache.set('key1', { data: 'value' }, { ttl: CacheTTL.SHORT })
    const result = await cache.get('key1')

    expect(result).toEqual({ data: 'value' })
  })

  it('should expire values after TTL', async () => {
    await cache.set('key2', 'value', { ttl: 1 }) // 1 second

    await new Promise((resolve) => setTimeout(resolve, 1100)) // Wait 1.1s

    const result = await cache.get('key2')
    expect(result).toBeNull()
  })

  it('should delete values by pattern', async () => {
    await cache.set('org:123:goal:1', 'value1')
    await cache.set('org:123:goal:2', 'value2')
    await cache.set('org:456:goal:3', 'value3')

    await cache.deletePattern('org:123:*')

    expect(await cache.get('org:123:goal:1')).toBeNull()
    expect(await cache.get('org:123:goal:2')).toBeNull()
    expect(await cache.get('org:456:goal:3')).toBe('value3')
  })

  it('should handle getOrSet pattern', async () => {
    const fetcher = jest.fn().mockResolvedValue('fetched-value')

    const result1 = await cache.getOrSet('key3', fetcher, { ttl: CacheTTL.MEDIUM })
    const result2 = await cache.getOrSet('key3', fetcher, { ttl: CacheTTL.MEDIUM })

    expect(result1).toBe('fetched-value')
    expect(result2).toBe('fetched-value')
    expect(fetcher).toHaveBeenCalledTimes(1) // Only called once
  })
})
```

### Integration Tests

```typescript
import { withServiceCache } from '@/lib/cache/service-cache'
import { createClient } from '@/lib/supabase/server'

describe('Service Cache Integration', () => {
  it('should cache database queries', async () => {
    const supabase = await createClient()
    const dbQuery = jest.fn().mockResolvedValue([{ id: '1', name: 'Goal 1' }])

    const result1 = await withServiceCache(
      { key: 'goals:list', organizationId: 'org-123' },
      dbQuery
    )

    const result2 = await withServiceCache(
      { key: 'goals:list', organizationId: 'org-123' },
      dbQuery
    )

    expect(result1).toEqual(result2)
    expect(dbQuery).toHaveBeenCalledTimes(1) // Cached on second call
  })
})
```

## Troubleshooting

### Cache not working

1. Check cache initialization
2. Verify TTL is not set too low
3. Ensure cache key is consistent
4. Check for cache clearing between requests
5. Verify namespace matches

### Memory leaks

1. Implement cache size limits
2. Use cleanup() method regularly
3. Set appropriate TTLs
4. Monitor cache.getStats()
5. Clear cache on unmount (client-side)

### Stale data

1. Reduce TTL for frequently changing data
2. Implement cache invalidation on mutations
3. Use stale-while-revalidate pattern
4. Add version number to cache keys
5. Implement cache warming strategy

### Redis connection issues

1. Verify Redis server is running
2. Check connection credentials
3. Ensure network access (firewall, security groups)
4. Monitor Redis memory usage
5. Check Redis logs for errors

## Related Documentation

- [Performance Optimization](../performance/optimization.md)
- [Service Layer](../architecture/service-layer.md)
- [React Query](./react-query.md)
- [Monitoring](./monitoring.md)
