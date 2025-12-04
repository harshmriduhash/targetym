// Simple rate limiter middleware for API routes
// Expands on existing Upstash setup to ensure 100% coverage

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Create rate limiters for different use cases
export const rateLimiters = {
  // 100 requests per 10 minutes
  standard: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '10 m'),
    analytics: true,
  }),
  // 1000 requests per hour for authenticated users
  authenticated: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, '1 h'),
    analytics: true,
  }),
  // Strict: 10 requests per minute for auth endpoints
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
  }),
};

export async function checkRateLimit(key: string, limiter = rateLimiters.standard) {
  try {
    const result = await limiter.limit(key);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (err) {
    console.error('Rate limit check error', err);
    // Fail open: allow request if rate limiter is down
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
}

export function getRateLimitHeaders(result: Awaited<ReturnType<typeof checkRateLimit>>) {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
  };
}
