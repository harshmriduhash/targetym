/**
 * @jest-environment node
 */

import {
  withActionRateLimit,
  withRateLimit,
  checkActionRateLimit,
  actionRateLimits,
} from '@/src/lib/middleware/action-rate-limit'
import { checkRateLimit } from '@/src/lib/middleware/rate-limiter'
import { getAuthContext } from '@/src/lib/auth/server-auth'
import { successResponse, errorResponse } from '@/src/lib/utils/response'
import { AppError } from '@/src/lib/utils/errors'

// Mock dependencies
jest.mock('@/src/lib/middleware/rate-limiter')
jest.mock('@/src/lib/auth/server-auth')

describe('Action Rate Limit Middleware', () => {
  const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<typeof checkRateLimit>
  const mockGetAuthContext = getAuthContext as jest.MockedFunction<typeof getAuthContext>

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Default auth context
    mockGetAuthContext.mockResolvedValue({
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'employee' as const,
    })

    // Default rate limit success
    mockCheckRateLimit.mockReturnValue({
      allowed: true,
      remaining: 59,
      resetAt: Date.now() + 60000,
    })
  })

  describe('withActionRateLimit', () => {
    it('should execute action when rate limit allows', async () => {
      const mockAction = jest.fn().mockResolvedValue(
        successResponse({ data: 'success' })
      )

      const result = await withActionRateLimit('default', mockAction)

      expect(result).toEqual(successResponse({ data: 'success' }))
      expect(mockAction).toHaveBeenCalledTimes(1)
      expect(mockCheckRateLimit).toHaveBeenCalledWith(
        'ratelimit:user:user-1',
        actionRateLimits.default
      )
    })

    it('should use different rate limit configs for different types', async () => {
      const mockAction = jest.fn().mockResolvedValue(successResponse({ data: 'created' }))

      await withActionRateLimit('create', mockAction)

      expect(mockCheckRateLimit).toHaveBeenCalledWith(
        'ratelimit:user:user-1',
        actionRateLimits.create
      )
    })

    it('should return error response when rate limit exceeded', async () => {
      mockCheckRateLimit.mockReturnValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 30000,
        retryAfter: 30,
      })

      const mockAction = jest.fn()

      const result = await withActionRateLimit('create', mockAction)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Rate limit exceeded')
        expect(result.code).toBe('RATE_LIMIT_EXCEEDED')
      }
      expect(mockAction).not.toHaveBeenCalled()
    })

    it('should handle action errors gracefully', async () => {
      const mockAction = jest.fn().mockRejectedValue(
        new AppError('Validation failed', 'VALIDATION_ERROR')
      )

      const result = await withActionRateLimit('default', mockAction)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Validation failed')
        expect(result.code).toBe('VALIDATION_ERROR')
      }
    })

    it('should handle unexpected errors', async () => {
      const mockAction = jest.fn().mockRejectedValue(new Error('Unexpected'))

      const result = await withActionRateLimit('default', mockAction)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('An unexpected error occurred')
        expect(result.code).toBe('INTERNAL_ERROR')
      }
    })

    it('should apply correct limits for AI operations', async () => {
      const mockAction = jest.fn().mockResolvedValue(successResponse({ score: 85 }))

      await withActionRateLimit('ai', mockAction)

      expect(mockCheckRateLimit).toHaveBeenCalledWith(
        'ratelimit:user:user-1',
        actionRateLimits.ai
      )
    })

    it('should apply correct limits for bulk operations', async () => {
      const mockAction = jest.fn().mockResolvedValue(
        successResponse({ processed: 100 })
      )

      await withActionRateLimit('bulk', mockAction)

      expect(mockCheckRateLimit).toHaveBeenCalledWith(
        'ratelimit:user:user-1',
        actionRateLimits.bulk
      )
    })
  })

  describe('withRateLimit', () => {
    it('should wrap function with rate limiting', async () => {
      const mockFn = jest.fn().mockResolvedValue(successResponse({ id: 'new-1' }))
      const wrapped = withRateLimit('create', mockFn)

      const result = await wrapped({ title: 'Test' })

      expect(result).toEqual(successResponse({ id: 'new-1' }))
      expect(mockFn).toHaveBeenCalledWith({ title: 'Test' })
      expect(mockCheckRateLimit).toHaveBeenCalled()
    })

    it('should preserve input types', async () => {
      interface CreateInput {
        name: string
        value: number
      }

      const mockFn = jest.fn().mockResolvedValue(successResponse({ id: '1' }))
      const wrapped = withRateLimit<CreateInput, { id: string }>('create', mockFn)

      await wrapped({ name: 'test', value: 42 })

      expect(mockFn).toHaveBeenCalledWith({ name: 'test', value: 42 })
    })

    it('should block when rate limited', async () => {
      mockCheckRateLimit.mockReturnValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 45000,
        retryAfter: 45,
      })

      const mockFn = jest.fn()
      const wrapped = withRateLimit('create', mockFn)

      const result = await wrapped({ data: 'test' })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('RATE_LIMIT_EXCEEDED')
      }
      expect(mockFn).not.toHaveBeenCalled()
    })
  })

  describe('checkActionRateLimit', () => {
    it('should return allowed when rate limit permits', async () => {
      const result = await checkActionRateLimit('default')

      expect(result).toEqual({
        allowed: true,
        retryAfter: undefined,
      })
    })

    it('should return not allowed with retryAfter when rate limited', async () => {
      const resetTime = Date.now() + 30000
      mockCheckRateLimit.mockReturnValue({
        allowed: false,
        remaining: 0,
        resetAt: resetTime,
        retryAfter: 30,
      })

      const result = await checkActionRateLimit('default')

      expect(result.allowed).toBe(false)
      expect(result.retryAfter).toBe(30)
    })

    it('should fail open on errors', async () => {
      mockGetAuthContext.mockRejectedValue(new Error('Auth failed'))

      const result = await checkActionRateLimit('default')

      expect(result).toEqual({
        allowed: true,
      })
    })

    it('should check specific rate limit types', async () => {
      await checkActionRateLimit('ai')

      expect(mockCheckRateLimit).toHaveBeenCalledWith(
        'ratelimit:user:user-1',
        actionRateLimits.ai
      )
    })
  })

  describe('Rate limit configurations', () => {
    it('should have correct default limits', () => {
      expect(actionRateLimits.default).toEqual({
        windowMs: 60 * 1000,
        maxRequests: 60,
      })
    })

    it('should have stricter create limits', () => {
      expect(actionRateLimits.create).toEqual({
        windowMs: 60 * 1000,
        maxRequests: 20,
      })
    })

    it('should have strict bulk limits', () => {
      expect(actionRateLimits.bulk).toEqual({
        windowMs: 60 * 1000,
        maxRequests: 10,
      })
    })

    it('should have strictest AI limits', () => {
      expect(actionRateLimits.ai).toEqual({
        windowMs: 60 * 1000,
        maxRequests: 5,
      })
    })
  })

  describe('Integration scenarios', () => {
    it('should handle sequential requests correctly', async () => {
      const mockAction = jest.fn()
        .mockResolvedValueOnce(successResponse({ id: '1' }))
        .mockResolvedValueOnce(successResponse({ id: '2' }))

      mockCheckRateLimit
        .mockReturnValueOnce({
          allowed: true,
          remaining: 19,
          resetAt: Date.now() + 60000,
        })
        .mockReturnValueOnce({
          allowed: true,
          remaining: 18,
          resetAt: Date.now() + 60000,
        })

      const result1 = await withActionRateLimit('create', mockAction)
      const result2 = await withActionRateLimit('create', mockAction)

      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      expect(mockAction).toHaveBeenCalledTimes(2)
    })

    it('should block after limit is reached', async () => {
      const mockAction = jest.fn().mockResolvedValue(successResponse({ id: '1' }))

      mockCheckRateLimit
        .mockReturnValueOnce({
          allowed: true,
          remaining: 0,
          resetAt: Date.now() + 60000,
        })
        .mockReturnValueOnce({
          allowed: false,
          remaining: 0,
          resetAt: Date.now() + 60000,
          retryAfter: 60,
        })

      const result1 = await withActionRateLimit('ai', mockAction)
      const result2 = await withActionRateLimit('ai', mockAction)

      expect(result1.success).toBe(true)
      expect(result2.success).toBe(false)
      if (!result2.success) {
        expect(result2.code).toBe('RATE_LIMIT_EXCEEDED')
      }
      expect(mockAction).toHaveBeenCalledTimes(1)
    })
  })
})
