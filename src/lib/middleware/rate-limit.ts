import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/src/types/database.types'

/**
 * Rate Limiting Middleware
 *
 * Uses Upstash Redis for distributed rate limiting
 * Falls back to in-memory if Redis is not configured
 */

// Rate limit configuration by endpoint type
export const rateLimitConfigs = {
  api: {
    requests: 100,
    window: '1 m', // 100 requests per minute
  },
  auth: {
    requests: 10,
    window: '1 m', // 10 login attempts per minute
  },
  ai: {
    requests: 20,
    window: '1 h', // 20 AI requests per hour
  },
  webhooks: {
    requests: 1000,
    window: '1 m', // 1000 webhooks per minute
  },
} as const

type RateLimitType = keyof typeof rateLimitConfigs

// Create rate limiter with Upstash Redis
let redis: Redis | null = null
let rateLimiters: Record<string, Ratelimit> = {}

function getRateLimiter(type: RateLimitType): Ratelimit {
  if (rateLimiters[type]) {
    return rateLimiters[type]
  }

  // Initialize Redis if configured
  if (!redis && process.env.UPSTASH_REDIS_REST_URL) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }

  const config = rateLimitConfigs[type]

  // Create rate limiter
  const ratelimit = new Ratelimit({
    redis: redis || undefined, // Use in-memory if no Redis
    limiter: Ratelimit.slidingWindow(config.requests, config.window),
    analytics: true,
    prefix: `ratelimit:${type}`,
  })

  rateLimiters[type] = ratelimit
  return ratelimit
}

/**
 * Rate limiting middleware
 */
export async function rateLimit(
  request: NextRequest,
  type: RateLimitType = 'api'
): Promise<NextResponse | null> {
  const ratelimit = getRateLimiter(type)

  // Identify user (IP or userId)
  const identifier = await getIdentifier(request)

  // Check rate limit
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier)

  // Add rate limit headers
  const headers = {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(reset).toISOString(),
  }

  // If rate limit exceeded
  if (!success) {
    return NextResponse.json(
      {
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again after ${new Date(reset).toISOString()}`,
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          ...headers,
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    )
  }

  // Rate limit OK, add headers to response
  return NextResponse.next({
    headers,
  })
}

/**
 * Get unique user identifier
 */
async function getIdentifier(request: NextRequest): Promise<string> {
  // 1. Try to get userId from Supabase Auth
  try {
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // No-op in rate limiting context - we don't need to set cookies
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // 2. Fetch organization_id from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      // Prioritize organization-level rate limiting for better multi-tenant isolation
      if (profile?.organization_id) {
        return `org:${profile.organization_id}`
      }

      // Fallback to user-level if no organization
      return `user:${user.id}`
    }
  } catch (error) {
    // Silently fail and fallback to IP-based rate limiting
    // This ensures the system is resilient to Supabase connection issues
  }

  // 3. Fallback to IP for unauthenticated requests
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'

  return `ip:${ip}`
}

/**
 * Helper to rate limit a function
 */
export async function withRateLimit<T>(
  identifier: string,
  type: RateLimitType,
  fn: () => Promise<T>
): Promise<T> {
  const ratelimit = getRateLimiter(type)
  const { success } = await ratelimit.limit(identifier)

  if (!success) {
    throw new Error('Rate limit exceeded')
  }

  return fn()
}

/**
 * Reset rate limit for a user (admin only)
 */
export async function resetRateLimit(
  identifier: string,
  type: RateLimitType
): Promise<void> {
  if (!redis) return

  const key = `ratelimit:${type}:${identifier}`
  await redis.del(key)
}
