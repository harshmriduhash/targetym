import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { logger } from '@/src/lib/monitoring/logger'

/**
 * Custom Error Classes
 */

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      404,
      id ? `${resource} with id ${id} not found` : `${resource} not found`,
      'NOT_FOUND'
    )
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, 'CONFLICT')
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super(429, 'Too many requests', 'RATE_LIMIT_EXCEEDED', { retryAfter })
    this.name = 'RateLimitError'
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(service: string) {
    super(503, `${service} is currently unavailable`, 'SERVICE_UNAVAILABLE')
    this.name = 'ServiceUnavailableError'
  }
}

/**
 * Error Response Interface
 */
interface ErrorResponse {
  error: {
    message: string
    code?: string
    statusCode: number
    details?: unknown
    timestamp: string
    path?: string
  }
}

/**
 * Format error response
 */
export function formatErrorResponse(
  error: Error | AppError,
  path?: string
): ErrorResponse {
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return {
      error: {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: isDevelopment
          ? error.errors.map((e) => ({
              path: e.path.join('.'),
              message: e.message,
            }))
          : undefined,
        timestamp: new Date().toISOString(),
        path,
      },
    }
  }

  // Handle AppError instances
  if (error instanceof AppError) {
    return {
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        details: isDevelopment ? error.details : undefined,
        timestamp: new Date().toISOString(),
        path,
      },
    }
  }

  // Handle generic errors
  return {
    error: {
      message: isDevelopment ? error.message : 'Internal server error',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
      details: isDevelopment ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      path,
    },
  }
}

/**
 * Global error handler middleware
 */
export function handleError(error: Error | AppError, path?: string): NextResponse {
  // Log the error
  const statusCode = error instanceof AppError ? error.statusCode : 500
  const logLevel = statusCode >= 500 ? 'error' : 'warn'

  logger[logLevel](
    {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error instanceof AppError && {
          code: error.code,
          statusCode: error.statusCode,
          details: error.details,
        }),
      },
      path,
    },
    `Error: ${error.message}`
  )

  // Format and return error response
  const errorResponse = formatErrorResponse(error, path)

  return NextResponse.json(errorResponse, {
    status: errorResponse.error.statusCode,
  })
}

/**
 * Async handler wrapper
 * Catches async errors and passes them to error handler
 */
export function asyncHandler<T>(
  handler: (req: Request, context?: unknown) => Promise<T>
) {
  return async (req: Request, context?: unknown) => {
    try {
      return await handler(req, context)
    } catch (error) {
      return handleError(
        error instanceof Error ? error : new Error('Unknown error'),
        new URL(req.url).pathname
      )
    }
  }
}

/**
 * Try-catch wrapper with error transformation
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    if (error instanceof ZodError) {
      throw new ValidationError('Validation failed', error.errors)
    }

    // Transform generic errors
    throw new AppError(
      500,
      errorMessage || (error instanceof Error ? error.message : 'Unknown error')
    )
  }
}

/**
 * Assert condition or throw error
 */
export function assert(
  condition: boolean,
  error: AppError | string,
  statusCode = 400
): asserts condition {
  if (!condition) {
    throw typeof error === 'string' ? new AppError(statusCode, error) : error
  }
}

/**
 * Assert resource exists or throw NotFoundError
 */
export function assertExists<T>(
  value: T | null | undefined,
  resource: string,
  id?: string
): asserts value is T {
  if (value === null || value === undefined) {
    throw new NotFoundError(resource, id)
  }
}
