/**
 * @jest-environment node
 */

import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  ConflictError,
  handleServiceError,
} from '@/src/lib/utils/errors'

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create base error with message, code and status', () => {
      const error = new AppError('Something went wrong', 'GENERIC_ERROR')

      expect(error.message).toBe('Something went wrong')
      expect(error.code).toBe('GENERIC_ERROR')
      expect(error.name).toBe('AppError')
      expect(error.statusCode).toBe(400)
      expect(error instanceof Error).toBe(true)
    })

    it('should allow custom status code', () => {
      const error = new AppError('Custom error', 'CUSTOM_ERROR', 418)

      expect(error.statusCode).toBe(418)
    })

    it('should support error details', () => {
      const details = { field: 'email', reason: 'invalid' }
      const error = new AppError('Validation failed', 'VALIDATION_ERROR', 400, details)

      expect(error.details).toEqual(details)
    })
  })

  describe('NotFoundError', () => {
    it('should create not found error with resource name', () => {
      const error = new NotFoundError('Goal')

      expect(error.message).toBe('Goal not found')
      expect(error.code).toBe('NOT_FOUND')
      expect(error.statusCode).toBe(404)
      expect(error.name).toBe('NotFoundError')
      expect(error instanceof AppError).toBe(true)
    })

    it('should have default resource name', () => {
      const error = new NotFoundError()

      expect(error.message).toBe('Resource not found')
    })
  })

  describe('UnauthorizedError', () => {
    it('should create unauthorized error', () => {
      const error = new UnauthorizedError('You must be logged in')

      expect(error.message).toBe('You must be logged in')
      expect(error.code).toBe('UNAUTHORIZED')
      expect(error.statusCode).toBe(401)
      expect(error.name).toBe('UnauthorizedError')
    })

    it('should have default message', () => {
      const error = new UnauthorizedError()

      expect(error.message).toBe('Unauthorized')
    })
  })

  describe('ForbiddenError', () => {
    it('should create forbidden error', () => {
      const error = new ForbiddenError('Access denied')

      expect(error.message).toBe('Access denied')
      expect(error.code).toBe('FORBIDDEN')
      expect(error.statusCode).toBe(403)
      expect(error.name).toBe('ForbiddenError')
    })

    it('should have default message', () => {
      const error = new ForbiddenError()

      expect(error.message).toBe('Forbidden')
    })
  })

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid email format')

      expect(error.message).toBe('Invalid email format')
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.statusCode).toBe(400)
      expect(error.name).toBe('ValidationError')
    })

    it('should support error details', () => {
      const details = { fields: ['email', 'password'] }
      const error = new ValidationError('Multiple validation errors', details)

      expect(error.details).toEqual(details)
    })
  })

  describe('ConflictError', () => {
    it('should create conflict error', () => {
      const error = new ConflictError('Email already exists')

      expect(error.message).toBe('Email already exists')
      expect(error.code).toBe('CONFLICT')
      expect(error.statusCode).toBe(409)
      expect(error.name).toBe('ConflictError')
    })

    it('should have default message', () => {
      const error = new ConflictError()

      expect(error.message).toBe('Resource already exists')
    })
  })
})

describe('handleServiceError', () => {
  it('should return AppError as is', () => {
    const originalError = new NotFoundError('Goal')
    const result = handleServiceError(originalError)

    expect(result).toBe(originalError)
    expect(result.code).toBe('NOT_FOUND')
  })

  it('should convert Zod validation errors', () => {
    const zodError = {
      name: 'ZodError',
      errors: [
        { path: ['email'], message: 'Invalid email' },
        { path: ['password'], message: 'Too short' },
      ],
    }

    const result = handleServiceError(zodError)

    expect(result instanceof ValidationError).toBe(true)
    expect(result.message).toContain('email')
    expect(result.message).toContain('Invalid email')
    expect(result.code).toBe('VALIDATION_ERROR')
  })

  it('should convert generic errors to AppError', () => {
    const genericError = new Error('Something went wrong')
    const result = handleServiceError(genericError)

    expect(result instanceof AppError).toBe(true)
    expect(result.message).toBe('Something went wrong')
    expect(result.code).toBe('INTERNAL_ERROR')
    expect(result.statusCode).toBe(500)
  })

  it('should handle unknown error types', () => {
    const unknownError = 'String error'
    const result = handleServiceError(unknownError)

    expect(result instanceof AppError).toBe(true)
    expect(result.message).toBe('An unexpected error occurred')
    expect(result.code).toBe('INTERNAL_ERROR')
  })

  it('should handle null/undefined errors', () => {
    const result = handleServiceError(null)

    expect(result instanceof AppError).toBe(true)
    expect(result.message).toBe('An unexpected error occurred')
  })

  it('should preserve stack trace', () => {
    const error = new Error('Test error')
    const result = handleServiceError(error)

    expect(result.stack).toBeDefined()
  })
})

describe('Error inheritance chain', () => {
  it('should maintain proper inheritance', () => {
    const notFound = new NotFoundError()
    const unauthorized = new UnauthorizedError()
    const forbidden = new ForbiddenError()
    const validation = new ValidationError('test')
    const conflict = new ConflictError()

    expect(notFound instanceof AppError).toBe(true)
    expect(notFound instanceof Error).toBe(true)

    expect(unauthorized instanceof AppError).toBe(true)
    expect(forbidden instanceof AppError).toBe(true)
    expect(validation instanceof AppError).toBe(true)
    expect(conflict instanceof AppError).toBe(true)
  })

  it('should be distinguishable from each other', () => {
    const notFound = new NotFoundError()
    const unauthorized = new UnauthorizedError()

    expect(notFound instanceof UnauthorizedError).toBe(false)
    expect(unauthorized instanceof NotFoundError).toBe(false)
  })

  it('should have correct HTTP status codes', () => {
    expect(new ValidationError('test').statusCode).toBe(400)
    expect(new UnauthorizedError().statusCode).toBe(401)
    expect(new ForbiddenError().statusCode).toBe(403)
    expect(new NotFoundError().statusCode).toBe(404)
    expect(new ConflictError().statusCode).toBe(409)
  })
})
