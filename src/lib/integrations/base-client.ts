import { withRetry, RetryPresets, isRetryableError } from '@/src/lib/resilience/retry'
import { CircuitBreaker, CircuitBreakerPresets } from '@/src/lib/resilience/circuit-breaker'
import { logger } from '@/src/lib/monitoring/logger'

/**
 * Base Integration Client
 * 
 * Provides common functionality for all external integrations:
 * - Retry logic with exponential backoff
 * - Circuit breaker for resilience
 * - Request/response logging
 * - Error handling
 */

export interface RequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  timeout?: number
}

export class IntegrationError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message)
    this.name = 'IntegrationError'
  }
}

export abstract class BaseIntegrationClient {
  protected readonly serviceName: string
  protected circuitBreaker: CircuitBreaker

  constructor(serviceName: string) {
    this.serviceName = serviceName
    this.circuitBreaker = new CircuitBreaker({
      ...CircuitBreakerPresets.standard,
      name: this.serviceName,
      onStateChange: (state) => {
        logger.warn(
          { service: this.serviceName, state },
          'Circuit breaker state changed'
        )
      },
    })
  }

  /**
   * Make HTTP request with retry and circuit breaker
   */
  protected async request<T>(config: RequestConfig): Promise<T> {
    const startTime = Date.now()

    try {
      return await this.circuitBreaker.execute(async () => {
        return await withRetry(
          () => this.executeRequest<T>(config),
          {
            ...RetryPresets.network,
            onRetry: (attempt, error) => {
              logger.warn(
                {
                  service: this.serviceName,
                  url: config.url,
                  attempt,
                  error: error.message,
                },
                'Retrying request'
              )
            },
          }
        )
      })
    } catch (error) {
      const duration = Date.now() - startTime

      logger.error(
        {
          service: this.serviceName,
          url: config.url,
          method: config.method || 'GET',
          duration,
          err: error,
        },
        'Integration request failed'
      )

      throw error
    }
  }

  /**
   * Execute actual HTTP request
   */
  private async executeRequest<T>(config: RequestConfig): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), config.timeout || 30000)

    try {
      const response = await fetch(config.url, {
        method: config.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Targetym/1.0',
          ...config.headers,
        },
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok) {
        const errorBody = await response.text()
        throw new IntegrationError(
          `Request failed: ${response.statusText}`,
          response.status,
          errorBody
        )
      }

      return (await response.json()) as T
    } catch (error) {
      clearTimeout(timeout)

      if (error instanceof Error && error.name === 'AbortError') {
        throw new IntegrationError('Request timeout')
      }

      throw error
    }
  }

  /**
   * Check if service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const state = this.circuitBreaker.getState()
      return state === 'CLOSED'
    } catch {
      return false
    }
  }
}
