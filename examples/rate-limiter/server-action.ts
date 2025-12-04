/**
 * Example: Rate Limiting in Server Actions
 *
 * Demonstrates how to protect Server Actions with rate limiting
 * to prevent abuse and ensure fair usage.
 *
 * @package rate-limiter
 */

'use server'

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { headers } from 'next/headers'
import { successResponse, errorResponse } from '@/src/lib/utils/response'

/**
 * Initialize rate limiter with Upstash Redis
 */
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

/**
 * Example 1: Basic Rate Limiting (10 requests per 10 seconds)
 */
const basicRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
})

export async function createGoalWithRateLimit(data: any) {
  // Get user identifier (IP or user ID)
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') || 'anonymous'

  // Check rate limit
  const { success, limit, remaining, reset } = await basicRateLimit.limit(ip)

  if (!success) {
    return errorResponse(
      'Rate limit exceeded. Please try again later.',
      'RATE_LIMIT_EXCEEDED',
      {
        limit,
        remaining,
        resetAt: new Date(reset).toISOString(),
      }
    )
  }

  // Proceed with goal creation
  // ... actual implementation
  return successResponse({ id: 'goal-123' })
}

/**
 * Example 2: Tiered Rate Limiting (different limits for different users)
 */
const freeUserLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 per hour
})

const premiumUserLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 h'), // 100 per hour
})

export async function createCandidateWithTieredLimit(
  data: any,
  userTier: 'free' | 'premium' = 'free'
) {
  const userId = data.user_id

  // Select rate limiter based on tier
  const rateLimit = userTier === 'premium' ? premiumUserLimit : freeUserLimit

  const { success, remaining } = await rateLimit.limit(userId)

  if (!success) {
    return errorResponse(
      `Rate limit exceeded. ${userTier === 'free' ? 'Upgrade to premium for higher limits.' : ''}`,
      'RATE_LIMIT_EXCEEDED',
      { remaining, tier: userTier }
    )
  }

  // Create candidate
  return successResponse({ id: 'candidate-123', remaining })
}

/**
 * Example 3: Cost-based Rate Limiting (different operations cost different amounts)
 */
const costBasedLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.tokenBucket(100, '1 m', 10), // 100 tokens, refill 10/min
})

export async function aiOperationWithCostLimit(
  operation: 'score_cv' | 'generate_summary' | 'chat',
  data: any
) {
  const userId = data.user_id

  // Different costs for different operations
  const costs = {
    score_cv: 10,
    generate_summary: 5,
    chat: 1,
  }

  const cost = costs[operation]

  const { success, remaining } = await costBasedLimit.limit(userId, { rate: cost })

  if (!success) {
    return errorResponse(
      `Insufficient tokens. ${remaining} tokens remaining.`,
      'RATE_LIMIT_EXCEEDED',
      { cost, remaining }
    )
  }

  // Perform AI operation
  return successResponse({ operation, tokensUsed: cost, remaining })
}

/**
 * Example 4: Multiple Rate Limit Windows
 */
const shortTermLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '10 s'), // Burst protection
})

const longTermLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 h'), // Hourly limit
})

export async function createJobPostingWithMultipleWindows(data: any) {
  const userId = data.user_id

  // Check both limits
  const [shortTerm, longTerm] = await Promise.all([
    shortTermLimit.limit(userId),
    longTermLimit.limit(userId),
  ])

  if (!shortTerm.success) {
    return errorResponse(
      'Too many requests. Please wait a few seconds.',
      'RATE_LIMIT_EXCEEDED',
      { window: 'short', resetAt: new Date(shortTerm.reset).toISOString() }
    )
  }

  if (!longTerm.success) {
    return errorResponse(
      'Hourly limit exceeded. Please try again later.',
      'RATE_LIMIT_EXCEEDED',
      { window: 'long', resetAt: new Date(longTerm.reset).toISOString() }
    )
  }

  // Create job posting
  return successResponse({
    id: 'job-123',
    limits: {
      shortTerm: { remaining: shortTerm.remaining },
      longTerm: { remaining: longTerm.remaining },
    },
  })
}

/**
 * Example 5: Rate Limiting with Custom Keys
 */
export async function scheduleInterviewWithCustomKey(data: any) {
  const { candidate_id, interviewer_id } = data

  // Limit interviews per candidate (max 3 per day)
  const candidateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(3, '1 d'),
  })

  const { success: candidateAllowed } = await candidateLimit.limit(
    `candidate:${candidate_id}`
  )

  if (!candidateAllowed) {
    return errorResponse(
      'This candidate has reached the daily interview limit.',
      'RATE_LIMIT_EXCEEDED'
    )
  }

  // Limit interviews per interviewer (max 10 per day)
  const interviewerLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(10, '1 d'),
  })

  const { success: interviewerAllowed } = await interviewerLimit.limit(
    `interviewer:${interviewer_id}`
  )

  if (!interviewerAllowed) {
    return errorResponse(
      'Interviewer has reached the daily interview limit.',
      'RATE_LIMIT_EXCEEDED'
    )
  }

  // Schedule interview
  return successResponse({ id: 'interview-123' })
}

/**
 * Example 6: Bypass Rate Limiting for Admins
 */
export async function createReviewWithAdminBypass(
  data: any,
  userRole: string
) {
  const userId = data.user_id

  // Skip rate limiting for admins
  if (userRole === 'admin') {
    return successResponse({ id: 'review-123', bypassed: true })
  }

  // Apply rate limit for non-admins
  const rateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 h'),
  })

  const { success } = await rateLimit.limit(userId)

  if (!success) {
    return errorResponse('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED')
  }

  return successResponse({ id: 'review-123' })
}

/**
 * Rate Limiting Algorithms:
 *
 * 1. Fixed Window:
 *    - Ratelimit.fixedWindow(10, '1 m')
 *    - Simple, but can allow bursts at window boundaries
 *
 * 2. Sliding Window:
 *    - Ratelimit.slidingWindow(10, '1 m')
 *    - Smooth distribution, recommended for most cases
 *
 * 3. Token Bucket:
 *    - Ratelimit.tokenBucket(100, '1 m', 10)
 *    - Allows bursts, refills gradually
 *    - Good for cost-based limiting
 *
 * 4. Sliding Logs:
 *    - Ratelimit.slidingLogs(10, '1 m')
 *    - Most accurate, but higher memory usage
 *
 * Usage Guidelines:
 *
 * - Public APIs: 100-1000 req/hour
 * - Authenticated users: 1000-10000 req/hour
 * - Premium users: 10000-100000 req/hour
 * - Internal services: No limit or very high
 *
 * - Login attempts: 5-10 per 15 minutes
 * - Email sending: 10-50 per hour
 * - AI operations: 10-100 per hour (cost-based)
 * - Database writes: 100-1000 per minute
 */
