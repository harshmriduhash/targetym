export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 'FORBIDDEN', 403)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 'CONFLICT', 409)
    this.name = 'ConflictError'
  }
}

export function handleServiceError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
    const zodError = error as { errors: Array<{ path: (string | number)[]; message: string }> }
    const messages = zodError.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ')
    return new ValidationError(messages)
  }

  if (error instanceof Error) {
    return new AppError(error.message, 'INTERNAL_ERROR', 500)
  }

  return new AppError('An unexpected error occurred', 'INTERNAL_ERROR', 500)
}
