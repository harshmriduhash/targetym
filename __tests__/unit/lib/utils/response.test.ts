/**
 * @jest-environment node
 */

import { successResponse, errorResponse } from '@/src/lib/utils/response'

describe('Response Utilities', () => {
  describe('successResponse', () => {
    it('should create success response with data', () => {
      const data = { id: '123', name: 'Test' }
      const response = successResponse(data)

      expect(response).toEqual({
        success: true,
        data,
      })
    })

    it('should handle null data', () => {
      const response = successResponse(null)

      expect(response).toEqual({
        success: true,
        data: null,
      })
    })

    it('should handle undefined data', () => {
      const response = successResponse(undefined)

      expect(response).toEqual({
        success: true,
        data: undefined,
      })
    })

    it('should preserve data types', () => {
      interface User {
        id: string
        email: string
        age: number
      }

      const user: User = {
        id: '1',
        email: 'test@example.com',
        age: 25,
      }

      const response = successResponse(user)

      expect(response.success).toBe(true)
      if (response.success) {
        expect(response.data.id).toBe('1')
        expect(response.data.email).toBe('test@example.com')
        expect(response.data.age).toBe(25)
      }
    })

    it('should handle arrays', () => {
      const items = [1, 2, 3, 4, 5]
      const response = successResponse(items)

      expect(response.success).toBe(true)
      if (response.success) {
        expect(response.data).toEqual(items)
        expect(Array.isArray(response.data)).toBe(true)
      }
    })

    it('should handle complex nested objects', () => {
      const complexData = {
        user: {
          id: '1',
          profile: {
            name: 'John',
            settings: {
              theme: 'dark',
            },
          },
        },
        metadata: {
          timestamp: new Date(),
        },
      }

      const response = successResponse(complexData)

      expect(response.success).toBe(true)
      if (response.success) {
        expect(response.data.user.profile.settings.theme).toBe('dark')
      }
    })
  })

  describe('errorResponse', () => {
    it('should create error response with message', () => {
      const response = errorResponse('Something went wrong')

      expect(response.success).toBe(false)
      if (!response.success) {
        expect(response.error).toBe('Something went wrong')
      }
    })

    it('should include custom error code', () => {
      const response = errorResponse('Not found', 'NOT_FOUND')

      expect(response).toMatchObject({
        success: false,
        error: 'Not found',
        code: 'NOT_FOUND',
      })
    })

    it('should include error details when provided', () => {
      const details = { field: 'email', value: 'invalid' }
      const response = errorResponse('Validation error', 'VALIDATION_ERROR', details)

      expect(response).toMatchObject({
        success: false,
        error: 'Validation error',
        code: 'VALIDATION_ERROR',
        details,
      })
    })

    it('should handle empty error message', () => {
      const response = errorResponse('')

      expect(response.success).toBe(false)
      if (!response.success) {
        expect(response.error).toBe('')
      }
    })

    it('should handle validation error code', () => {
      const response = errorResponse('Invalid input', 'VALIDATION_ERROR')

      if (!response.success) {
        expect(response.code).toBe('VALIDATION_ERROR')
        expect(response.error).toBe('Invalid input')
      }
    })

    it('should handle unauthorized error code', () => {
      const response = errorResponse('Unauthorized', 'UNAUTHORIZED')

      if (!response.success) {
        expect(response.code).toBe('UNAUTHORIZED')
      }
    })

    it('should handle forbidden error code', () => {
      const response = errorResponse('Forbidden', 'FORBIDDEN')

      if (!response.success) {
        expect(response.code).toBe('FORBIDDEN')
      }
    })

    it('should handle conflict error code', () => {
      const response = errorResponse('Resource already exists', 'CONFLICT')

      if (!response.success) {
        expect(response.code).toBe('CONFLICT')
      }
    })

    it('should handle rate limit error code', () => {
      const response = errorResponse('Too many requests', 'RATE_LIMIT_EXCEEDED')

      if (!response.success) {
        expect(response.code).toBe('RATE_LIMIT_EXCEEDED')
      }
    })
  })

  describe('Type discrimination', () => {
    it('should allow type narrowing based on success field', () => {
      const successResult = successResponse({ id: '1' })
      const errorResult = errorResponse('Error', 'NOT_FOUND')

      if (successResult.success) {
        // TypeScript should know this is SuccessResponse
        expect(successResult.data).toBeDefined()
      }

      if (!errorResult.success) {
        // TypeScript should know this is ErrorResponse
        expect(errorResult.error).toBeDefined()
        expect(errorResult.code).toBeDefined()
      }
    })
  })

  describe('Response patterns', () => {
    it('should match Server Action return type', () => {
      // Simulate Server Action pattern
      async function createResource() {
        try {
          const data = { id: '123' }
          return successResponse(data)
        } catch (error) {
          return errorResponse('Failed to create', 'INTERNAL_ERROR')
        }
      }

      return createResource().then((response) => {
        expect(response.success).toBe(true)
        if (response.success) {
          expect(response.data.id).toBe('123')
        }
      })
    })

    it('should handle async error responses', async () => {
      async function failingAction() {
        return errorResponse('Operation failed', 'VALIDATION_ERROR')
      }

      const response = await failingAction()

      expect(response.success).toBe(false)
      if (!response.success) {
        expect(response.error).toBe('Operation failed')
        expect(response.code).toBe('VALIDATION_ERROR')
      }
    })
  })
})
