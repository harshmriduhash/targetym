/**
 * Example: Rate Limiting in API Routes
 *
 * Protect Next.js API routes with rate limiting middleware
 * and custom rate limit strategies.
 *
 * @package rate-limiter
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

/**
 * Example 1: Basic API Route Protection
 */
const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'),
  analytics: true,
  prefix: 'api',
})

export async function GET(request: NextRequest) {
  // Get identifier (IP or API key)
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'anonymous'

  const { success, limit, remaining, reset } = await apiRateLimit.limit(ip)

  // Add rate limit headers
  const headers = {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
  }

  if (!success) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      },
      { status: 429, headers }
    )
  }

  // Process request
  const data = { message: 'Success' }
  return NextResponse.json(data, { headers })
}

/**
 * Example 2: API Key-based Rate Limiting
 */
const apiKeyLimits = {
  free: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 h'),
  }),
  pro: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, '1 h'),
  }),
  enterprise: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10000, '1 h'),
  }),
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key required' },
      { status: 401 }
    )
  }

  // Determine tier from API key (mock implementation)
  const tier = await getApiKeyTier(apiKey)
  const rateLimit = apiKeyLimits[tier as keyof typeof apiKeyLimits]

  if (!rateLimit) {
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401 }
    )
  }

  const { success, remaining } = await rateLimit.limit(apiKey)

  if (!success) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded for your tier',
        tier,
        upgrade: tier === 'free' ? 'Upgrade to Pro for higher limits' : undefined,
      },
      { status: 429 }
    )
  }

  // Process request
  return NextResponse.json({
    data: { processed: true },
    meta: { tier, remaining },
  })
}

/**
 * Example 3: Rate Limiting Middleware
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options?: {
    limit?: number
    window?: string
    keyPrefix?: string
  }
) {
  const rateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      options?.limit || 60,
      options?.window || '1 m'
    ),
    prefix: options?.keyPrefix || 'middleware',
  })

  return async (request: NextRequest) => {
    const ip = request.ip || 'anonymous'
    const { success, limit, remaining, reset } = await rateLimit.limit(ip)

    if (!success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          limit,
          remaining,
          resetAt: new Date(reset).toISOString(),
        },
        { status: 429 }
      )
    }

    // Add rate limit info to response
    const response = await handler(request)
    response.headers.set('X-RateLimit-Limit', limit.toString())
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', reset.toString())

    return response
  }
}

// Usage:
export const GETWithLimit = withRateLimit(
  async (request: NextRequest) => {
    return NextResponse.json({ data: 'Protected endpoint' })
  },
  { limit: 10, window: '1 m' }
)

/**
 * Example 4: Endpoint-specific Rate Limits
 */
export async function rateLimitedEndpoint(
  request: NextRequest,
  endpoint: string
) {
  const limits: Record<string, Ratelimit> = {
    '/api/auth/login': new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '15 m'), // Strict for login
    }),
    '/api/search': new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '1 m'), // Generous for search
    }),
    '/api/upload': new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 h'), // Limited for uploads
    }),
  }

  const rateLimit = limits[endpoint]
  if (!rateLimit) {
    return NextResponse.json({ error: 'Unknown endpoint' }, { status: 404 })
  }

  const ip = request.ip || 'anonymous'
  const { success } = await rateLimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded for this endpoint' },
      { status: 429 }
    )
  }

  return NextResponse.json({ success: true })
}

/**
 * Example 5: Dynamic Rate Limiting based on Request
 */
export async function dynamicRateLimit(request: NextRequest) {
  const ip = request.ip || 'anonymous'
  const body = await request.json()

  // Adjust rate limit based on request size
  const requestSize = JSON.stringify(body).length
  const cost = Math.max(1, Math.floor(requestSize / 1000)) // 1 cost per KB

  const rateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.tokenBucket(100, '1 m', 10),
  })

  const { success, remaining } = await rateLimit.limit(ip, { rate: cost })

  if (!success) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        cost,
        remaining,
        hint: 'Reduce request payload size',
      },
      { status: 429 }
    )
  }

  return NextResponse.json({
    processed: true,
    cost,
    remaining,
  })
}

/**
 * Example 6: Rate Limiting with Analytics
 */
const analyticsRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true, // Enable analytics
  prefix: 'analytics',
})

export async function trackRateLimitMetrics(request: NextRequest) {
  const ip = request.ip || 'anonymous'
  const { success, pending } = await analyticsRateLimit.limit(ip)

  // Wait for analytics to be recorded
  await pending

  // Get analytics data
  const analytics = await redis.get(`analytics:${ip}`)

  return NextResponse.json({
    allowed: success,
    analytics,
  })
}

/**
 * Example 7: Distributed Rate Limiting across Multiple Regions
 */
export async function globalRateLimit(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Global rate limit across all regions
  const globalLimit = new Ratelimit({
    redis, // Uses distributed Redis
    limiter: Ratelimit.slidingWindow(1000, '1 h'),
    prefix: 'global',
  })

  const { success } = await globalLimit.limit(userId)

  if (!success) {
    return NextResponse.json(
      { error: 'Global rate limit exceeded' },
      { status: 429 }
    )
  }

  return NextResponse.json({ success: true })
}

// Helper function (mock)
async function getApiKeyTier(apiKey: string): Promise<string> {
  // In production, fetch from database
  return 'free'
}

/**
 * Best Practices:
 *
 * 1. Always return 429 status code for rate limit errors
 * 2. Include rate limit headers (X-RateLimit-*)
 * 3. Provide clear error messages with retry information
 * 4. Use different limits for different endpoints
 * 5. Consider user tier/plan for limits
 * 6. Log rate limit violations for monitoring
 * 7. Add rate limit bypass for health checks
 *
 * Response Headers:
 * - X-RateLimit-Limit: Maximum requests allowed
 * - X-RateLimit-Remaining: Requests remaining
 * - X-RateLimit-Reset: Timestamp when limit resets
 * - Retry-After: Seconds until retry allowed (for 429)
 *
 * Testing Rate Limits:
 * - Use tools like k6, Apache Bench, or wrk
 * - Test burst scenarios
 * - Verify limit enforcement
 * - Check Redis memory usage
 * - Monitor false positives
 */
