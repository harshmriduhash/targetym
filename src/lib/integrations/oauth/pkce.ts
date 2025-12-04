/**
 * PKCE (Proof Key for Code Exchange) Implementation
 *
 * RFC 7636 compliant implementation for OAuth 2.0 with PKCE
 * Provides enhanced security for OAuth flows, especially for SPAs
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7636
 */

import crypto from 'crypto'

/**
 * PKCE Challenge containing verifier and challenge
 */
export interface PKCEChallenge {
  codeVerifier: string
  codeChallenge: string
  codeChallengeMethod: 'S256' | 'plain'
}

/**
 * Generate a cryptographically secure PKCE challenge
 *
 * Process:
 * 1. Generate code_verifier (43-128 chars, URL-safe base64)
 * 2. Generate code_challenge = BASE64URL(SHA256(code_verifier))
 * 3. Return both for OAuth flow
 *
 * @returns PKCEChallenge object with verifier and challenge
 *
 * @example
 * ```typescript
 * const { codeVerifier, codeChallenge } = generatePKCEChallenge()
 * // Store codeVerifier securely (session/database)
 * // Send codeChallenge in authorization request
 * ```
 */
export function generatePKCEChallenge(): PKCEChallenge {
  // Generate code_verifier: 32 random bytes = 43 base64url chars
  const codeVerifier = base64URLEncode(crypto.randomBytes(32))

  // Generate code_challenge: SHA256(code_verifier) base64url encoded
  const hash = crypto.createHash('sha256').update(codeVerifier).digest()
  const codeChallenge = base64URLEncode(hash)

  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: 'S256', // Always use SHA256
  }
}

/**
 * Verify PKCE code_verifier matches code_challenge
 *
 * Used during token exchange to validate the original challenge
 *
 * @param codeVerifier - The original code verifier
 * @param codeChallenge - The challenge to verify against
 * @returns true if valid, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = verifyPKCE(storedVerifier, receivedChallenge)
 * if (!isValid) {
 *   throw new Error('PKCE verification failed')
 * }
 * ```
 */
export function verifyPKCE(
  codeVerifier: string,
  codeChallenge: string
): boolean {
  const hash = crypto.createHash('sha256').update(codeVerifier).digest()
  const expectedChallenge = base64URLEncode(hash)

  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expectedChallenge),
    Buffer.from(codeChallenge)
  )
}

/**
 * Base64 URL-safe encoding (RFC 4648 Section 5)
 *
 * Converts buffer to base64url format:
 * - Replace + with -
 * - Replace / with _
 * - Remove = padding
 *
 * @param buffer - Buffer to encode
 * @returns URL-safe base64 string
 */
function base64URLEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Base64 URL-safe decoding
 *
 * Converts base64url back to standard base64 and decodes
 *
 * @param str - Base64url string to decode
 * @returns Decoded buffer
 */
export function base64URLDecode(str: string): Buffer {
  // Convert base64url to base64
  let base64 = str
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  // Add padding if needed
  while (base64.length % 4 !== 0) {
    base64 += '='
  }

  return Buffer.from(base64, 'base64')
}

/**
 * Generate OAuth state parameter (CSRF protection)
 *
 * Creates a cryptographically secure random string for state parameter
 *
 * @returns Random state string (32 bytes = 43 chars base64url)
 *
 * @example
 * ```typescript
 * const state = generateOAuthState()
 * // Store in session
 * // Include in authorization URL
 * ```
 */
export function generateOAuthState(): string {
  return base64URLEncode(crypto.randomBytes(32))
}

/**
 * Validate OAuth state parameter
 *
 * @param receivedState - State from OAuth callback
 * @param storedState - State stored in session
 * @returns true if states match
 */
export function validateOAuthState(
  receivedState: string,
  storedState: string
): boolean {
  if (!receivedState || !storedState) {
    return false
  }

  // Timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(receivedState),
    Buffer.from(storedState)
  )
}

/**
 * PKCE Session Data (store securely in database/session)
 */
export interface PKCESession {
  codeVerifier: string
  state: string
  provider: string
  redirectUri: string
  createdAt: Date
  expiresAt: Date
}

/**
 * Create PKCE session for OAuth flow
 *
 * @param provider - Integration provider (slack, asana, etc.)
 * @param redirectUri - OAuth callback URL
 * @param ttlMinutes - Session TTL (default: 10 minutes)
 * @returns PKCESession to store
 */
export function createPKCESession(
  provider: string,
  redirectUri: string,
  ttlMinutes: number = 10
): PKCESession & Pick<PKCEChallenge, 'codeChallenge'> {
  const { codeVerifier, codeChallenge } = generatePKCEChallenge()
  const state = generateOAuthState()
  const createdAt = new Date()
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000)

  return {
    codeVerifier,
    codeChallenge,
    state,
    provider,
    redirectUri,
    createdAt,
    expiresAt,
  }
}

/**
 * Validate PKCE session is not expired
 *
 * @param session - PKCE session to validate
 * @returns true if valid and not expired
 */
export function isPKCESessionValid(session: PKCESession): boolean {
  return new Date() < session.expiresAt
}
