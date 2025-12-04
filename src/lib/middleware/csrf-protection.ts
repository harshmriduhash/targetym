/**
 * CSRF Protection for Next.js 15 Server Actions
 *
 * Multi-layer CSRF protection strategy:
 * 1. Origin/Referer header validation
 * 2. Double Submit Cookie pattern with token
 * 3. SameSite cookie enforcement
 *
 * Usage:
 * ```typescript
 * export async function myAction(input: T) {
 *   return withCSRFProtection(async () => {
 *     // Your action logic
 *   })
 * }
 * ```
 */

import { headers, cookies } from 'next/headers'
import { AppError } from '@/src/lib/utils/errors'
import type { ActionResponse } from '@/src/lib/utils/response'
import { errorResponse } from '@/src/lib/utils/response'
import crypto from 'crypto'

const CSRF_TOKEN_NAME = '__Host-csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'

// Production domains (adjust for your deployment)
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
]

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('base64url')
}

/**
 * Validate origin/referer headers to prevent CSRF
 */
async function validateOrigin(): Promise<boolean> {
  const headersList = await headers()
  const origin = headersList.get('origin')
  const referer = headersList.get('referer')

  // In development, be more lenient
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  // Check origin header (preferred)
  if (origin) {
    const isAllowed = ALLOWED_ORIGINS.some(allowed => {
      try {
        const allowedUrl = new URL(allowed)
        const originUrl = new URL(origin)
        return (
          allowedUrl.protocol === originUrl.protocol &&
          allowedUrl.host === originUrl.host
        )
      } catch {
        return false
      }
    })

    if (isAllowed) {
      return true
    }
  }

  // Fallback to referer header
  if (referer) {
    const isAllowed = ALLOWED_ORIGINS.some(allowed => referer.startsWith(allowed))
    if (isAllowed) {
      return true
    }
  }

  return false
}

/**
 * Validate CSRF token using Double Submit Cookie pattern
 */
async function validateCSRFToken(): Promise<boolean> {
  const headersList = await headers()
  const cookieStore = await cookies()

  // Get token from header (sent by client)
  const headerToken = headersList.get(CSRF_HEADER_NAME)

  // Get token from cookie (set by server)
  const cookieToken = cookieStore.get(CSRF_TOKEN_NAME)?.value

  // In development, auto-generate token if missing
  if (process.env.NODE_ENV === 'development') {
    if (!cookieToken) {
      const newToken = generateCSRFToken()
      cookieStore.set(CSRF_TOKEN_NAME, newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
      })
      return true
    }
  }

  // Both tokens must exist
  if (!headerToken || !cookieToken) {
    return false
  }

  // Tokens must match (constant-time comparison)
  return crypto.timingSafeEqual(
    Buffer.from(headerToken),
    Buffer.from(cookieToken)
  )
}

/**
 * Check if request method is safe (no CSRF protection needed)
 */
async function isSafeMethod(): Promise<boolean> {
  const headersList = await headers()
  const method = headersList.get('x-http-method-override') || 'POST'
  return ['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())
}

/**
 * Comprehensive CSRF validation
 */
async function validateCSRF(): Promise<{ valid: boolean; reason?: string }> {
  // Skip CSRF for safe methods
  if (await isSafeMethod()) {
    return { valid: true }
  }

  // Layer 1: Origin/Referer validation
  const originValid = await validateOrigin()
  if (!originValid) {
    return {
      valid: false,
      reason: 'Origin validation failed. Request must originate from an allowed domain.'
    }
  }

  // Layer 2: CSRF token validation
  const tokenValid = await validateCSRFToken()
  if (!tokenValid) {
    return {
      valid: false,
      reason: 'CSRF token validation failed. Token missing or invalid.'
    }
  }

  return { valid: true }
}

/**
 * Wrapper for Server Actions with CSRF protection
 *
 * @example
 * ```typescript
 * export async function updateProfile(input: UpdateProfileInput) {
 *   return withCSRFProtection(async () => {
 *     // Your action logic here
 *     return successResponse({ id: profile.id })
 *   })
 * }
 * ```
 */
export async function withCSRFProtection<T>(
  action: () => Promise<ActionResponse<T>>
): Promise<ActionResponse<T>> {
  try {
    // Validate CSRF
    const validation = await validateCSRF()

    if (!validation.valid) {
      return errorResponse(
        validation.reason || 'CSRF validation failed',
        'CSRF_VALIDATION_FAILED'
      ) as ActionResponse<T>
    }

    // Execute the action
    return await action()
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.code) as ActionResponse<T>
    }
    return errorResponse(
      'An unexpected error occurred during CSRF validation',
      'INTERNAL_ERROR'
    ) as ActionResponse<T>
  }
}

/**
 * Initialize CSRF token for the session (call from layout or middleware)
 */
export async function initializeCSRFToken(): Promise<string> {
  const cookieStore = await cookies()

  // Check if token already exists
  const existingToken = cookieStore.get(CSRF_TOKEN_NAME)?.value

  if (existingToken) {
    return existingToken
  }

  // Generate new token
  const token = generateCSRFToken()

  cookieStore.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })

  return token
}

/**
 * Get current CSRF token (for client-side usage)
 */
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_TOKEN_NAME)?.value || null
}
