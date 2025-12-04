/**
 * Retry Logic with Exponential Backoff
 * 
 * Implements automatic retry for failed operations with:
 * - Exponential backoff
 * - Jitter to prevent thundering herd
 * - Configurable retry conditions
 */

export interface RetryOptions {
  maxRetries?: number
  baseDelay?: number    // Initial delay in ms
  maxDelay?: number     // Maximum delay in ms
  factor?: number       // Exponential factor
  jitter?: boolean      // Add randomness to delay
  onRetry?: (attempt: number, error: Error) => void
  shouldRetry?: (error: Error) => boolean
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000,      // 1 second
  maxDelay: 10000,      // 10 seconds
  factor: 2,            // Double each time
  jitter: true,
  onRetry: () => {},
  shouldRetry: () => true,
}

/**
 * Retry an async operation with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  let lastError: Error | undefined
  
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Check if we should retry this error
      if (!opts.shouldRetry(lastError)) {
        throw lastError
      }
      
      // Last attempt - don't retry
      if (attempt === opts.maxRetries) {
        throw lastError
      }
      
      // Calculate delay with exponential backoff
      const exponentialDelay = opts.baseDelay * Math.pow(opts.factor, attempt)
      const cappedDelay = Math.min(exponentialDelay, opts.maxDelay)
      
      // Add jitter if enabled
      let delay = cappedDelay
      if (opts.jitter) {
        const jitterAmount = cappedDelay * 0.2 * (Math.random() - 0.5)
        delay = cappedDelay + jitterAmount
      }
      
      // Call retry callback
      opts.onRetry(attempt + 1, lastError)
      
      // Wait before retrying
      await sleep(delay)
    }
  }
  
  throw lastError
}

/**
 * Helper: Sleep for ms milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Check if error is retryable (network errors, timeouts, 5xx)
 */
export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase()
  
  // Network errors
  if (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('econnrefused') ||
    message.includes('econnreset') ||
    message.includes('etimedout')
  ) {
    return true
  }
  
  // HTTP 5xx errors (server errors)
  if ('status' in error && typeof (error as any).status === 'number') {
    const status = (error as any).status
    return status >= 500 && status < 600
  }
  
  // HTTP 429 (rate limit) - retry after backoff
  if ('status' in error && (error as any).status === 429) {
    return true
  }
  
  return false
}

/**
 * Retry configuration presets
 */
export const RetryPresets = {
  // Quick retry for fast operations
  quick: {
    maxRetries: 2,
    baseDelay: 500,
    maxDelay: 2000,
  },
  
  // Standard retry for most operations
  standard: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
  },
  
  // Aggressive retry for critical operations
  aggressive: {
    maxRetries: 5,
    baseDelay: 2000,
    maxDelay: 30000,
  },
  
  // Network-focused retry
  network: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 8000,
    shouldRetry: isRetryableError,
  },
}
