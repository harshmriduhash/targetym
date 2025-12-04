/**
 * Rate Limiter Middleware
 * 
 * Implements token bucket algorithm for rate limiting.
 * Supports multiple rate limit tiers (public, authenticated, organization).
 */

export interface RateLimitConfig {
  windowMs: number      // Time window in milliseconds
  maxRequests: number   // Maximum requests in window
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfter?: number
}

// Rate limit configurations
export const RATE_LIMITS = {
  // Public endpoints (unauthenticated)
  public: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 100,           // 100 requests
  },
  
  // Authenticated users
  authenticated: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 1000,          // 1000 requests
  },
  
  // Per organization (shared quota)
  organization: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    maxRequests: 10000,         // 10k requests
  },
  
  // AI endpoints (expensive operations)
  ai: {
    windowMs: 60 * 60 * 1000,  // 1 hour
    maxRequests: 100,           // 100 requests
  },
  
  // Write operations
  write: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 200,           // 200 requests
  },
} as const

/**
 * In-memory rate limit store
 * For production, use Redis for distributed rate limiting
 */
class RateLimitStore {
  private store: Map<string, { count: number; resetAt: number }> = new Map()

  get(key: string): { count: number; resetAt: number } | undefined {
    const entry = this.store.get(key)
    
    // Clean up expired entries
    if (entry && Date.now() > entry.resetAt) {
      this.store.delete(key)
      return undefined
    }
    
    return entry
  }

  set(key: string, count: number, resetAt: number): void {
    this.store.set(key, { count, resetAt })
  }

  increment(key: string, resetAt: number): number {
    const entry = this.get(key)
    
    if (!entry) {
      this.set(key, 1, resetAt)
      return 1
    }
    
    entry.count++
    this.store.set(key, entry)
    return entry.count
  }

  // Cleanup expired entries periodically
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetAt) {
        this.store.delete(key)
      }
    }
  }
}

// Singleton store instance
const store = new RateLimitStore()

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => store.cleanup(), 5 * 60 * 1000)
}

/**
 * Check rate limit for a key
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const resetAt = now + config.windowMs
  
  const entry = store.get(key)
  
  if (!entry) {
    // First request in window
    store.set(key, 1, resetAt)
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
    }
  }
  
  const count = entry.count + 1
  
  if (count > config.maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000), // seconds
    }
  }
  
  // Increment counter
  store.set(key, count, entry.resetAt)
  
  return {
    allowed: true,
    remaining: config.maxRequests - count,
    resetAt: entry.resetAt,
  }
}

/**
 * Rate limit key generators
 */
export const RateLimitKeys = {
  // By IP address (for public endpoints)
  byIp: (ip: string) => `ratelimit:ip:${ip}`,
  
  // By user ID (for authenticated endpoints)
  byUser: (userId: string) => `ratelimit:user:${userId}`,
  
  // By organization (shared quota)
  byOrganization: (orgId: string) => `ratelimit:org:${orgId}`,
  
  // By user and operation (specific limits for expensive operations)
  byUserOperation: (userId: string, operation: string) => 
    `ratelimit:user:${userId}:${operation}`,
  
  // By organization and operation
  byOrgOperation: (orgId: string, operation: string) =>
    `ratelimit:org:${orgId}:${operation}`,
}

/**
 * Get rate limit config for endpoint
 */
export function getRateLimitConfig(
  endpoint: string,
  method: string
): RateLimitConfig {
  // AI endpoints
  if (endpoint.includes('/ai/')) {
    return RATE_LIMITS.ai
  }
  
  // Write operations
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return RATE_LIMITS.write
  }
  
  // Default to authenticated limits
  return RATE_LIMITS.authenticated
}

/**
 * Rate limit response headers
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.remaining + (result.allowed ? 1 : 0)),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.resetAt),
  }
  
  if (result.retryAfter !== undefined) {
    headers['Retry-After'] = String(result.retryAfter)
  }
  
  return headers
}
