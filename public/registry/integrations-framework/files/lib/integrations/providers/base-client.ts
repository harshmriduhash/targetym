/**
 * Base Integration Client
 *
 * Provides common functionality for all integration provider clients:
 * - HTTP request handling with retry logic
 * - Circuit breaker pattern for resilience
 * - Rate limiting
 * - Error handling and logging
 * - Token refresh
 */


import { logger } from '@/src/lib/monitoring/logger'

/**
 * HTTP request options
 */
export interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  timeout?: number
  retries?: number
}

/**
 * Circuit breaker states
 */
type CircuitState = 'closed' | 'open' | 'half-open'

/**
 * Circuit breaker configuration
 */
interface CircuitBreakerConfig {
  failureThreshold: number
  successThreshold: number
  timeout: number
}

/**
 * Integration client error
 */
export class IntegrationClientError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public provider?: string,
    public originalError?: any
  ) {
    super(message)
    this.name = 'IntegrationClientError'
  }
}

/**
 * Base integration client class
 * All provider-specific clients should extend this class
 */
export abstract class BaseIntegrationClient {
  protected abstract serviceName: string
  protected abstract baseUrl: string

  // Circuit breaker state
  private circuitState: CircuitState = 'closed'
  private failureCount = 0
  private successCount = 0
  private lastFailureTime = 0

  // Circuit breaker config (can be overridden by subclasses)
  protected circuitBreakerConfig: CircuitBreakerConfig = {
    failureThreshold: 5, // Open circuit after 5 failures
    successThreshold: 2, // Close circuit after 2 successes in half-open state
    timeout: 60000, // Try half-open after 60 seconds
  }

  /**
   * Make an authenticated HTTP request with retry logic and circuit breaker
   */
  protected async request<T>(options: RequestOptions): Promise<T> {
    // Check circuit breaker
    if (this.circuitState === 'open') {
      const now = Date.now()
      if (now - this.lastFailureTime >= this.circuitBreakerConfig.timeout) {
        this.circuitState = 'half-open'
        this.successCount = 0
        logger.info(`[${this.serviceName}] Circuit breaker half-open`)
      } else {
        throw new IntegrationClientError(
          `Circuit breaker is open for ${this.serviceName}`,
          503,
          this.serviceName
        )
      }
    }

    const maxRetries = options.retries ?? 3
    let lastError: Error | undefined

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.executeRequest<T>(options)
        this.onSuccess()
        return response
      } catch (error) {
        lastError = error as Error
        const shouldRetry = this.shouldRetry(error as any, attempt, maxRetries)

        if (!shouldRetry) {
          this.onFailure(error as Error)
          throw error
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
        await this.sleep(delay)

        logger.warn(
          `[${this.serviceName}] Request failed, retrying (${attempt + 1}/${maxRetries})`,
          { error: (error as Error).message }
        )
      }
    }

    this.onFailure(lastError!)
    throw lastError
  }

  /**
   * Execute HTTP request
   */
  private async executeRequest<T>(options: RequestOptions): Promise<T> {
    const {
      url,
      method = 'GET',
      headers = {},
      body,
      timeout = 30000,
    } = options

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorBody = await response.text()
        throw new IntegrationClientError(
          `HTTP ${response.status}: ${errorBody}`,
          response.status,
          this.serviceName,
          errorBody
        )
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T
      }

      return (await response.json()) as T
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof IntegrationClientError) {
        throw error
      }

      if ((error as any).name === 'AbortError') {
        throw new IntegrationClientError(
          `Request timeout after ${timeout}ms`,
          408,
          this.serviceName
        )
      }

      throw new IntegrationClientError(
        `Request failed: ${(error as Error).message}`,
        undefined,
        this.serviceName,
        error
      )
    }
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetry(error: any, attempt: number, maxRetries: number): boolean {
    if (attempt >= maxRetries) {
      return false
    }

    // Retry on network errors
    if (!error.statusCode) {
      return true
    }

    // Retry on specific HTTP status codes
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504]
    return retryableStatusCodes.includes(error.statusCode)
  }

  /**
   * Handle successful request
   */
  private onSuccess(): void {
    if (this.circuitState === 'half-open') {
      this.successCount++
      if (this.successCount >= this.circuitBreakerConfig.successThreshold) {
        this.circuitState = 'closed'
        this.failureCount = 0
        logger.info(`[${this.serviceName}] Circuit breaker closed`)
      }
    } else if (this.circuitState === 'closed') {
      this.failureCount = 0
    }
  }

  /**
   * Handle failed request
   */
  private onFailure(error: Error): void {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.failureCount >= this.circuitBreakerConfig.failureThreshold) {
      this.circuitState = 'open'
      logger.error(`[${this.serviceName}] Circuit breaker opened`, {
        error: error.message,
        failureCount: this.failureCount,
      })
    }

    logger.error(`[${this.serviceName}] Request failed`, {
      error: error.message,
      failureCount: this.failureCount,
      circuitState: this.circuitState,
    })
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Get circuit breaker status
   */
  public getCircuitStatus(): {
    state: CircuitState
    failureCount: number
    successCount: number
  } {
    return {
      state: this.circuitState,
      failureCount: this.failureCount,
      successCount: this.successCount,
    }
  }

  /**
   * Reset circuit breaker (for testing or manual recovery)
   */
  public resetCircuit(): void {
    this.circuitState = 'closed'
    this.failureCount = 0
    this.successCount = 0
    this.lastFailureTime = 0
    logger.info(`[${this.serviceName}] Circuit breaker manually reset`)
  }
}
