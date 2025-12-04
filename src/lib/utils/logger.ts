/**
 * Logger Utility
 *
 * Simple logger wrapper for consistent logging across the application
 * In production, this could be connected to services like Pino, Winston, etc.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
  [key: string]: any
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  info(message: string, context?: LogContext): void {
    const formatted = this.formatMessage('info', message, context)
    console.log(formatted)
  }

  warn(message: string, context?: LogContext): void {
    const formatted = this.formatMessage('warn', message, context)
    console.warn(formatted)
  }

  error(message: string, context?: LogContext): void {
    const formatted = this.formatMessage('error', message, context)
    console.error(formatted)
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const formatted = this.formatMessage('debug', message, context)
      console.debug(formatted)
    }
  }
}

export const logger = new Logger()
export type { LogLevel, LogContext }
