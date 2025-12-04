/**
 * Circuit Breaker Pattern
 * 
 * Prevents cascading failures by failing fast when a service is down.
 * 
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Too many failures, fail fast without calling service
 * - HALF_OPEN: Testing if service recovered
 */

export interface CircuitBreakerOptions {
  failureThreshold: number     // Failures before opening circuit
  successThreshold: number     // Successes to close from half-open
  timeout: number              // Time before attempting reset (ms)
  name?: string                // Circuit breaker name for logging
  onStateChange?: (state: CircuitState) => void
}

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

export class CircuitBreakerError extends Error {
  constructor(service: string) {
    super(`Circuit breaker is OPEN for ${service}`)
    this.name = 'CircuitBreakerError'
  }
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED'
  private failureCount = 0
  private successCount = 0
  private nextAttempt = 0
  private options: Required<CircuitBreakerOptions>

  constructor(options: CircuitBreakerOptions) {
    this.options = {
      name: 'default',
      onStateChange: () => {},
      ...options,
    }
  }

  /**
   * Execute operation with circuit breaker protection
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    const now = Date.now()

    // If circuit is OPEN, check if we should try again
    if (this.state === 'OPEN') {
      if (now < this.nextAttempt) {
        throw new CircuitBreakerError(this.options.name)
      }
      
      // Time to try again - enter HALF_OPEN state
      this.setState('HALF_OPEN')
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  /**
   * Handle successful operation
   */
  private onSuccess(): void {
    this.failureCount = 0

    if (this.state === 'HALF_OPEN') {
      this.successCount++
      
      if (this.successCount >= this.options.successThreshold) {
        this.setState('CLOSED')
        this.successCount = 0
      }
    }
  }

  /**
   * Handle failed operation
   */
  private onFailure(): void {
    this.failureCount++
    this.successCount = 0

    if (
      this.state === 'HALF_OPEN' ||
      this.failureCount >= this.options.failureThreshold
    ) {
      this.setState('OPEN')
      this.nextAttempt = Date.now() + this.options.timeout
    }
  }

  /**
   * Change circuit state
   */
  private setState(newState: CircuitState): void {
    if (this.state !== newState) {
      this.state = newState
      this.options.onStateChange(newState)
    }
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      nextAttempt: this.nextAttempt,
    }
  }

  /**
   * Manually reset circuit breaker
   */
  reset(): void {
    this.setState('CLOSED')
    this.failureCount = 0
    this.successCount = 0
    this.nextAttempt = 0
  }
}

/**
 * Circuit breaker configuration presets
 */
export const CircuitBreakerPresets = {
  // Quick recovery for non-critical services
  quick: {
    failureThreshold: 3,
    successThreshold: 1,
    timeout: 10000, // 10 seconds
  },
  
  // Standard configuration
  standard: {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 30000, // 30 seconds
  },
  
  // Conservative for critical services
  conservative: {
    failureThreshold: 10,
    successThreshold: 3,
    timeout: 60000, // 1 minute
  },
}

/**
 * Global circuit breaker registry
 */
class CircuitBreakerRegistry {
  private breakers: Map<string, CircuitBreaker> = new Map()

  get(name: string, options?: CircuitBreakerOptions): CircuitBreaker {
    if (!this.breakers.has(name)) {
      const breaker = new CircuitBreaker({
        ...CircuitBreakerPresets.standard,
        ...options,
        name,
      })
      this.breakers.set(name, breaker)
    }
    
    return this.breakers.get(name)!
  }

  getAllStats() {
    const stats: Record<string, ReturnType<CircuitBreaker['getStats']>> = {}
    
    for (const [name, breaker] of this.breakers.entries()) {
      stats[name] = breaker.getStats()
    }
    
    return stats
  }

  reset(name: string): void {
    this.breakers.get(name)?.reset()
  }

  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset()
    }
  }
}

export const circuitBreakers = new CircuitBreakerRegistry()
