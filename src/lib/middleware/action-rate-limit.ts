/**
 * Rate limiting middleware for Server Actions
 * Uses in-memory rate limiter for Server Actions
 */

import { checkRateLimit, RateLimitKeys } from './rate-limiter'
import { getAuthContext } from '@/src/lib/auth/server-auth'
import { AppError } from '@/src/lib/utils/errors'
import type { ActionResponse } from '@/src/lib/utils/response'
import { errorResponse } from '@/src/lib/utils/response'

/**
 * Rate limit configurations for different action types
 */
export const actionRateLimits = {
  // Standard CRUD operations
  default: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
  },

  // Creation operations (more restrictive)
  create: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
  },

  // Bulk operations
  bulk: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  },

  // AI-powered operations (most restrictive)
  ai: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
  },
}

/**
 * Wraps a server action with rate limiting
 *
 * @example
 * ```ts
 * export async function createGoal(input: CreateGoalInput) {
 *   return withActionRateLimit('create', async () => {
 *     // Your action logic here
 *     return successResponse({ id: goal.id })
 *   })
 * }
 * ```
 */
export async function withActionRateLimit<T>(
  limitType: keyof typeof actionRateLimits,
  action: () => Promise<ActionResponse<T>>
): Promise<ActionResponse<T>> {
  try {
    // Get authenticated user for rate limit key
    const { userId } = await getAuthContext()

    // Check rate limit using user identifier
    const rateLimitKey = RateLimitKeys.byUser(userId)
    const config = actionRateLimits[limitType]
    const result = checkRateLimit(rateLimitKey, config)

    if (!result.allowed) {
      return errorResponse(
        `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
        'RATE_LIMIT_EXCEEDED'
      ) as ActionResponse<T>
    }

    // Execute the action
    return await action()
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.code) as ActionResponse<T>
    }
    return errorResponse(
      'An unexpected error occurred',
      'INTERNAL_ERROR'
    ) as ActionResponse<T>
  }
}

/**
 * Rate limit decorator for Server Actions (alternative pattern)
 *
 * @example
 * ```ts
 * export const createGoal = withRateLimit('create', async (input: CreateGoalInput) => {
 *   // Your action logic here
 *   return successResponse({ id: goal.id })
 * })
 * ```
 */
export function withRateLimit<TInput, TOutput>(
  limitType: keyof typeof actionRateLimits,
  actionFn: (input: TInput) => Promise<ActionResponse<TOutput>>
) {
  return async (input: TInput): Promise<ActionResponse<TOutput>> => {
    return withActionRateLimit(limitType, () => actionFn(input))
  }
}

/**
 * Rate limit check without executing action (for pre-checks)
 */
export async function checkActionRateLimit(
  limitType: keyof typeof actionRateLimits
): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    const { userId } = await getAuthContext()

    const rateLimitKey = RateLimitKeys.byUser(userId)
    const config = actionRateLimits[limitType]
    const result = checkRateLimit(rateLimitKey, config)

    return {
      allowed: result.allowed,
      retryAfter: result.retryAfter,
    }
  } catch {
    // On error, allow the request (fail open)
    return { allowed: true }
  }
}
