import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  handleServiceError,
} from '@/src/lib/utils/errors'

describe('Error Utilities', () => {
  describe('AppError', () => {
    it('should create an error with code and status', () => {
      const error = new AppError('Test error', 'TEST_CODE', 400)

      expect(error).toBeInstanceOf(Error)
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('TEST_CODE')
      expect(error.statusCode).toBe(400)
      expect(error.name).toBe('AppError')
    })

    it('should default to status 400', () => {
      const error = new AppError('Test error', 'TEST_CODE')

      expect(error.statusCode).toBe(400)
    })
  })

  describe('ValidationError', () => {
    it('should create validation error with 400 status', () => {
      const error = new ValidationError('Invalid input')

      expect(error).toBeInstanceOf(AppError)
      expect(error.message).toBe('Invalid input')
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.statusCode).toBe(400)
      expect(error.name).toBe('ValidationError')
    })

    it('should accept details', () => {
      const details = { field: 'email', reason: 'invalid format' }
      const error = new ValidationError('Invalid input', details)

      expect(error.details).toEqual(details)
    })
  })

  describe('UnauthorizedError', () => {
    it('should create unauthorized error with 401 status', () => {
      const error = new UnauthorizedError()

      expect(error).toBeInstanceOf(AppError)
      expect(error.message).toBe('Unauthorized')
      expect(error.code).toBe('UNAUTHORIZED')
      expect(error.statusCode).toBe(401)
    })

    it('should accept custom message', () => {
      const error = new UnauthorizedError('Custom message')

      expect(error.message).toBe('Custom message')
    })
  })

  describe('ForbiddenError', () => {
    it('should create forbidden error with 403 status', () => {
      const error = new ForbiddenError()

      expect(error).toBeInstanceOf(AppError)
      expect(error.message).toBe('Forbidden')
      expect(error.code).toBe('FORBIDDEN')
      expect(error.statusCode).toBe(403)
    })
  })

  describe('NotFoundError', () => {
    it('should create not found error with 404 status', () => {
      const error = new NotFoundError('User')

      expect(error).toBeInstanceOf(AppError)
      expect(error.message).toBe('User not found')
      expect(error.code).toBe('NOT_FOUND')
      expect(error.statusCode).toBe(404)
    })

    it('should default to "Resource"', () => {
      const error = new NotFoundError()

      expect(error.message).toBe('Resource not found')
    })
  })

  describe('ConflictError', () => {
    it('should create conflict error with 409 status', () => {
      const error = new ConflictError()

      expect(error).toBeInstanceOf(AppError)
      expect(error.message).toBe('Resource already exists')
      expect(error.code).toBe('CONFLICT')
      expect(error.statusCode).toBe(409)
    })
  })

  describe('handleServiceError', () => {
    it('should return AppError as is', () => {
      const originalError = new AppError('Test error', 'TEST_CODE')

      const result = handleServiceError(originalError)

      expect(result).toBe(originalError)
    })

    it('should convert Zod error to ValidationError', () => {
      const zodError = {
        name: 'ZodError',
        errors: [
          { path: ['email'], message: 'Invalid email' },
          { path: ['password'], message: 'Too short' },
        ],
      }

      const result = handleServiceError(zodError)

      expect(result).toBeInstanceOf(ValidationError)
      expect(result.message).toContain('email: Invalid email')
      expect(result.message).toContain('password: Too short')
    })

    it('should convert Error to AppError', () => {
      const error = new Error('Database error')

      const result = handleServiceError(error)

      expect(result).toBeInstanceOf(AppError)
      expect(result.message).toBe('Database error')
      expect(result.code).toBe('INTERNAL_ERROR')
      expect(result.statusCode).toBe(500)
    })

    it('should handle unknown errors', () => {
      const error = 'Unknown error string'

      const result = handleServiceError(error)

      expect(result).toBeInstanceOf(AppError)
      expect(result.message).toBe('An unexpected error occurred')
      expect(result.code).toBe('INTERNAL_ERROR')
    })

    it('should handle null/undefined', () => {
      const result1 = handleServiceError(null)
      const result2 = handleServiceError(undefined)

      expect(result1.message).toBe('An unexpected error occurred')
      expect(result2.message).toBe('An unexpected error occurred')
    })
  })
})
