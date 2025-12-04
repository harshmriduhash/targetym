# Rate Limiter Examples

Production-ready rate limiting with Upstash Redis from the Targetym Component Registry.

## Overview

The `rate-limiter` module provides flexible rate limiting for Server Actions and API routes to prevent abuse and ensure fair usage.

## Examples

### 1. Server Actions (`server-action.ts`)

Rate limiting for Next.js Server Actions.

**Features:**
- Basic rate limiting (requests per time window)
- Tiered limits (free vs premium users)
- Cost-based limiting (token bucket for AI operations)
- Multiple time windows (burst + sustained)
- Custom keys (per resource limits)
- Admin bypass

**Use Case:** Protect Server Actions from abuse while allowing legitimate usage.

### 2. API Routes (`api-route.ts`)

Rate limiting middleware for API endpoints.

**Features:**
- API route protection
- API key-based limits
- Reusable middleware
- Endpoint-specific limits
- Dynamic limits (based on request size)
- Analytics tracking
- Global distributed limits

**Use Case:** Secure REST APIs with flexible rate limiting policies.

## Installation

```bash
npm install @upstash/ratelimit @upstash/redis
npx shadcn@latest add rate-limiter
```

## Environment Setup

```bash
# .env.local
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

Get your credentials from [upstash.com](https://upstash.com)

## Rate Limiting Algorithms

### 1. Fixed Window

```ts
Ratelimit.fixedWindow(10, '1 m')
```

- Simple counter per time window
- Resets at window boundary
- Can allow bursts at boundaries
- Best for: Simple rate limiting

### 2. Sliding Window (Recommended)

```ts
Ratelimit.slidingWindow(10, '1 m')
```

- Smooth distribution over time
- No boundary burst issues
- Moderate memory usage
- Best for: Most use cases

### 3. Token Bucket

```ts
Ratelimit.tokenBucket(100, '1 m', 10)
```

- 100 tokens capacity
- Refill 10 tokens per minute
- Allows controlled bursts
- Best for: Cost-based limiting

### 4. Sliding Logs

```ts
Ratelimit.slidingLogs(10, '1 m')
```

- Most accurate tracking
- Higher memory usage
- Best for: Critical endpoints

## Usage Patterns

### Basic Server Action

```ts
'use server'

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({...})
const rateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function createGoal(data: any) {
  const { success } = await rateLimit.limit(userId)

  if (!success) {
    return { error: 'Rate limit exceeded' }
  }

  // Process request
  return { success: true }
}
```

### API Route with Headers

```ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { success, limit, remaining, reset } =
    await rateLimit.limit(ip)

  const headers = {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
  }

  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers }
    )
  }

  return NextResponse.json(data, { headers })
}
```

### Tiered Limits

```ts
const limits = {
  free: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
  }),
  premium: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 h'),
  }),
}

const limit = limits[userTier]
const { success } = await limit.limit(userId)
```

### Cost-based Limiting

```ts
const costs = {
  small_operation: 1,
  medium_operation: 5,
  large_operation: 10,
}

const { success } = await rateLimit.limit(
  userId,
  { rate: costs[operation] }
)
```

## Recommended Limits

### Public Endpoints

```ts
// Public API
Ratelimit.slidingWindow(100, '1 h')

// Search
Ratelimit.slidingWindow(60, '1 m')

// Health check
// No limit
```

### Authentication

```ts
// Login attempts
Ratelimit.fixedWindow(5, '15 m')

// Password reset
Ratelimit.fixedWindow(3, '1 h')

// Email verification
Ratelimit.fixedWindow(10, '1 h')
```

### Resource Operations

```ts
// Create resources
Ratelimit.slidingWindow(20, '1 m')

// Read operations
Ratelimit.slidingWindow(100, '1 m')

// Bulk operations
Ratelimit.slidingWindow(5, '1 m')
```

### AI/ML Operations

```ts
// CV scoring
Ratelimit.tokenBucket(50, '1 h', 5)

// Chat/completions
Ratelimit.tokenBucket(100, '1 h', 10)

// Image generation
Ratelimit.fixedWindow(10, '1 h')
```

## Error Handling

### Server Actions

```ts
export async function createResource(data: any) {
  const result = await rateLimit.limit(userId)

  if (!result.success) {
    return errorResponse(
      'Rate limit exceeded',
      'RATE_LIMIT_EXCEEDED',
      {
        resetAt: new Date(result.reset).toISOString(),
        remaining: result.remaining,
      }
    )
  }

  // Process
  return successResponse(data)
}
```

### API Routes

```ts
if (!success) {
  return NextResponse.json(
    {
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((reset - Date.now()) / 1000),
    },
    {
      status: 429,
      headers: {
        'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
      },
    }
  )
}
```

## Monitoring

### Enable Analytics

```ts
const rateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true, // Track metrics
})

// Wait for analytics
const { success, pending } = await rateLimit.limit(userId)
await pending // Ensure analytics recorded
```

### Track Violations

```ts
const { success } = await rateLimit.limit(userId)

if (!success) {
  // Log violation
  console.warn(`Rate limit exceeded for user: ${userId}`)

  // Optional: Alert on high violation rate
  await trackRateLimitViolation(userId)
}
```

## Testing

### Load Testing

```bash
# Using k6
k6 run load-test.js

# Using Apache Bench
ab -n 1000 -c 10 http://localhost:3000/api/endpoint
```

### Unit Tests

```ts
describe('Rate Limiting', () => {
  it('should allow requests under limit', async () => {
    for (let i = 0; i < 10; i++) {
      const { success } = await rateLimit.limit('test-user')
      expect(success).toBe(true)
    }
  })

  it('should block requests over limit', async () => {
    // Exhaust limit
    for (let i = 0; i < 10; i++) {
      await rateLimit.limit('test-user')
    }

    // Next should fail
    const { success } = await rateLimit.limit('test-user')
    expect(success).toBe(false)
  })
})
```

## Best Practices

1. **Choose Right Algorithm**: Sliding window for most cases
2. **Set Appropriate Limits**: Balance protection vs usability
3. **Provide Clear Errors**: Include reset time and remaining
4. **Use Standard Headers**: X-RateLimit-* headers
5. **Log Violations**: Monitor abuse patterns
6. **Test Thoroughly**: Verify limits work as expected
7. **Document Limits**: Tell users what to expect
8. **Consider Bypass**: Whitelist health checks, admins

## Troubleshooting

### Limits Too Strict

- Increase limit or window size
- Implement tiered limits
- Review usage patterns

### Redis Connection Issues

- Check credentials
- Verify Redis is accessible
- Implement fallback (allow without limit)

### False Positives

- Use user ID instead of IP when possible
- Adjust algorithm (sliding window vs fixed)
- Increase limits for legitimate high usage

## Related Modules

- **cache-manager**: Uses same Redis instance
- **resilience-patterns**: Circuit breaker for Redis
- **error-handling**: Standardized error responses
