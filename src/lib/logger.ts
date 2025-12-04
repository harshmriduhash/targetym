/**
 * Centralized Logger with Pino
 * MVP Smart - Phase 2 Optimization
 */

import pino from 'pino'

// Create logger instance
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() }
    },
  },
  base: {
    env: process.env.NODE_ENV,
    revision: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
  },
})

/**
 * Structured logging utilities
 */
export const log = {
  /**
   * Info level logging
   */
  info: (message: string, data?: Record<string, any>) => {
    logger.info(data, message)
  },

  /**
   * Warning level logging
   */
  warn: (message: string, data?: Record<string, any>) => {
    logger.warn(data, message)
  },

  /**
   * Error level logging with automatic error parsing
   */
  error: (message: string, error?: Error | unknown, data?: Record<string, any>) => {
    const errorData = {
      ...data,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : String(error),
    }
    logger.error(errorData, message)
  },

  /**
   * Debug level logging (only in development)
   */
  debug: (message: string, data?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(data, message)
    }
  },

  /**
   * Log API requests
   */
  api: (method: string, path: string, duration: number, status: number) => {
    logger.info({
      type: 'api',
      method,
      path,
      duration,
      status,
    }, `${method} ${path} - ${status} (${duration}ms)`)
  },

  /**
   * Log database queries
   */
  db: (query: string, duration: number, rows?: number) => {
    logger.debug({
      type: 'db',
      query,
      duration,
      rows,
    }, `DB Query - ${duration}ms (${rows} rows)`)
  },

  /**
   * Log cache operations
   */
  cache: (operation: 'hit' | 'miss' | 'set' | 'invalidate', key: string, ttl?: number) => {
    logger.debug({
      type: 'cache',
      operation,
      key,
      ttl,
    }, `Cache ${operation.toUpperCase()}: ${key}`)
  },

  /**
   * Log AI interactions
   */
  ai: (
    provider: 'openai' | 'anthropic',
    model: string,
    tokens: number,
    duration: number,
    cost?: number
  ) => {
    logger.info({
      type: 'ai',
      provider,
      model,
      tokens,
      duration,
      cost,
    }, `AI ${provider}/${model} - ${tokens} tokens (${duration}ms${cost ? `, $${cost.toFixed(4)}` : ''})`)
  },
}

/**
 * Performance monitoring helper
 */
export function createPerformanceLogger(operation: string) {
  const start = Date.now()

  return {
    end: (data?: Record<string, any>) => {
      const duration = Date.now() - start
      logger.info({
        type: 'performance',
        operation,
        duration,
        ...data,
      }, `${operation} completed in ${duration}ms`)
    },
  }
}

/**
 * Request logger middleware (for API routes)
 */
export function logRequest(req: Request): () => void {
  const start = Date.now()
  const { method, url } = req

  return () => {
    const duration = Date.now() - start
    log.api(method, new URL(url).pathname, duration, 200)
  }
}

/**
 * Error logger
 */
export function logError(error: Error, context?: Record<string, any>) {
  // Log to console
  log.error('Application error', error, context)
}
