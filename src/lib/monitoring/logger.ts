import pino from 'pino'

/**
 * Structured Logger with Pino
 * 
 * Provides production-ready logging with:
 * - JSON structured logs
 * - Log levels (trace, debug, info, warn, error, fatal)
 * - Automatic context injection
 * - Performance-optimized
 */

const isDevelopment = process.env.NODE_ENV === 'development'
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info')

export const logger = pino({
  level: logLevel,
  
  // Development: pretty print
  // Production: JSON for log aggregation
  ...(isDevelopment
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      }
    : {
        formatters: {
          level: (label) => {
            return { level: label }
          },
        },
      }),

  // Base context for all logs
  base: {
    env: process.env.NODE_ENV,
    version: process.env.npm_package_version || '0.1.0',
  },

  // Redact sensitive fields
  redact: {
    paths: [
      'password',
      'token',
      'apiKey',
      'secret',
      'authorization',
      'cookie',
      '*.password',
      '*.token',
      '*.apiKey',
      '*.secret',
    ],
    censor: '[REDACTED]',
  },

  // Serialize errors properly
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
})

/**
 * Create child logger with context
 * 
 * @example
 * const log = createLogger({ userId: '123', operation: 'create_goal' })
 * log.info('Goal created')
 */
export function createLogger(context: Record<string, unknown>) {
  return logger.child(context)
}

/**
 * Log with performance timing
 * 
 * @example
 * const log = logWithTiming('create_goal')
 * // ... do work
 * log('Goal created', { goalId: '123' })
 */
export function logWithTiming(operation: string) {
  const start = Date.now()
  
  return (message: string, context?: Record<string, unknown>) => {
    const duration = Date.now() - start
    logger.info(
      {
        ...context,
        operation,
        duration,
      },
      message
    )
  }
}

/**
 * Log HTTP request
 */
export function logRequest(req: {
  method: string
  url: string
  headers: Record<string, string | string[] | undefined>
  ip?: string
}) {
  logger.info(
    {
      type: 'request',
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.headers['x-forwarded-for'] || req.headers['x-real-ip'],
    },
    `${req.method} ${req.url}`
  )
}

/**
 * Log HTTP response
 */
export function logResponse(
  req: { method: string; url: string },
  res: { status: number },
  duration: number
) {
  const level = res.status >= 500 ? 'error' : res.status >= 400 ? 'warn' : 'info'
  
  logger[level](
    {
      type: 'response',
      method: req.method,
      url: req.url,
      status: res.status,
      duration,
    },
    `${req.method} ${req.url} ${res.status} ${duration}ms`
  )
}

/**
 * Log database query
 */
export function logQuery(
  query: {
    table: string
    operation: string
    duration: number
  },
  context?: Record<string, unknown>
) {
  logger.debug(
    {
      type: 'query',
      table: query.table,
      operation: query.operation,
      duration: query.duration,
      ...context,
    },
    `DB ${query.operation} ${query.table} (${query.duration}ms)`
  )
}

/**
 * Log cache operation
 */
export function logCache(
  operation: 'hit' | 'miss' | 'set' | 'delete',
  key: string,
  ttl?: number
) {
  logger.debug(
    {
      type: 'cache',
      operation,
      key,
      ttl,
    },
    `Cache ${operation}: ${key}`
  )
}

export default logger
