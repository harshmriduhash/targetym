/**
 * Encryption Utilities for Integration Credentials
 *
 * Implements AES-256-GCM encryption for secure token storage
 * Follows OWASP cryptographic storage best practices
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html
 */

import crypto from 'crypto'

/**
 * Encryption algorithm (AES-256-GCM)
 * - AES-256: Industry standard, strong encryption
 * - GCM: Galois/Counter Mode provides authenticated encryption
 */
const ALGORITHM = 'aes-256-gcm' as const
const IV_LENGTH = 16 // 128 bits
const AUTH_TAG_LENGTH = 16 // 128 bits
const SALT_LENGTH = 32 // 256 bits

/**
 * Get encryption key from environment
 * Key should be 32 bytes (256 bits) hex-encoded
 *
 * @throws Error if encryption key is not configured
 */
function getEncryptionKey(): Buffer {
  const key = process.env.INTEGRATION_ENCRYPTION_KEY

  if (!key) {
    throw new Error(
      'INTEGRATION_ENCRYPTION_KEY not configured. Generate with: openssl rand -hex 32'
    )
  }

  if (key.length !== 64) {
    throw new Error(
      'INTEGRATION_ENCRYPTION_KEY must be 32 bytes (64 hex chars)'
    )
  }

  return Buffer.from(key, 'hex')
}

/**
 * Encrypted token format
 *
 * Format: version:salt:iv:authTag:encrypted
 * - version: Encryption version (for key rotation)
 * - salt: Random salt for key derivation
 * - iv: Initialization vector
 * - authTag: Authentication tag (GCM)
 * - encrypted: Ciphertext
 */
export interface EncryptedToken {
  version: string
  salt: string
  iv: string
  authTag: string
  encrypted: string
}

/**
 * Encrypt sensitive token/credential
 *
 * Uses AES-256-GCM with random IV and salt for maximum security
 *
 * @param plaintext - Token or credential to encrypt
 * @returns Encrypted string in format: version:salt:iv:authTag:encrypted
 *
 * @example
 * ```typescript
 * const encrypted = encryptToken('sk_live_abc123xyz')
 * // Store in database
 * ```
 */
export function encryptToken(plaintext: string): string {
  if (!plaintext) {
    throw new Error('Cannot encrypt empty value')
  }

  // Generate random IV and salt
  const iv = crypto.randomBytes(IV_LENGTH)
  const salt = crypto.randomBytes(SALT_LENGTH)

  // Derive key from master key + salt (adds extra security)
  const masterKey = getEncryptionKey()
  const derivedKey = crypto.pbkdf2Sync(masterKey, salt, 100000, 32, 'sha256')

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv)

  // Encrypt
  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  // Get authentication tag
  const authTag = cipher.getAuthTag()

  // Format: version:salt:iv:authTag:encrypted
  const result = [
    'v1', // Version for key rotation
    salt.toString('hex'),
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted,
  ].join(':')

  return result
}

/**
 * Decrypt encrypted token/credential
 *
 * @param encryptedToken - Encrypted string from encryptToken()
 * @returns Decrypted plaintext token
 *
 * @throws Error if decryption fails or authentication fails
 *
 * @example
 * ```typescript
 * const decrypted = decryptToken(storedToken)
 * // Use decrypted token for API calls
 * ```
 */
export function decryptToken(encryptedToken: string): string {
  if (!encryptedToken) {
    throw new Error('Cannot decrypt empty value')
  }

  // Parse encrypted format
  const parts = encryptedToken.split(':')
  if (parts.length !== 5) {
    throw new Error('Invalid encrypted token format')
  }

  const [version, saltHex, ivHex, authTagHex, encrypted] = parts

  // Version check (for future key rotation)
  if (version !== 'v1') {
    throw new Error(`Unsupported encryption version: ${version}`)
  }

  // Convert from hex
  const salt = Buffer.from(saltHex, 'hex')
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')

  // Derive same key
  const masterKey = getEncryptionKey()
  const derivedKey = crypto.pbkdf2Sync(masterKey, salt, 100000, 32, 'sha256')

  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv)
  decipher.setAuthTag(authTag)

  try {
    // Decrypt
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (error) {
    // Authentication failed or corrupted data
    throw new Error('Token decryption failed - invalid key or corrupted data')
  }
}

/**
 * Encrypt multiple tokens as a batch
 *
 * @param tokens - Object with token key-value pairs
 * @returns Object with encrypted values
 *
 * @example
 * ```typescript
 * const encrypted = encryptTokenBatch({
 *   accessToken: 'token1',
 *   refreshToken: 'token2'
 * })
 * ```
 */
export function encryptTokenBatch(
  tokens: Record<string, string>
): Record<string, string> {
  const encrypted: Record<string, string> = {}

  for (const [key, value] of Object.entries(tokens)) {
    if (value) {
      encrypted[key] = encryptToken(value)
    }
  }

  return encrypted
}

/**
 * Decrypt multiple tokens as a batch
 *
 * @param encryptedTokens - Object with encrypted token values
 * @returns Object with decrypted values
 */
export function decryptTokenBatch(
  encryptedTokens: Record<string, string>
): Record<string, string> {
  const decrypted: Record<string, string> = {}

  for (const [key, value] of Object.entries(encryptedTokens)) {
    if (value) {
      decrypted[key] = decryptToken(value)
    }
  }

  return decrypted
}

/**
 * Hash token for comparison (non-reversible)
 *
 * Use for webhook secrets or API keys where you only need to verify
 *
 * @param value - Value to hash
 * @returns SHA-256 hash (hex)
 *
 * @example
 * ```typescript
 * const hash = hashToken(webhookSecret)
 * // Store hash in database
 * // Later: verify with crypto.timingSafeEqual()
 * ```
 */
export function hashToken(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}

/**
 * Generate random token/secret
 *
 * @param bytes - Number of random bytes (default: 32)
 * @returns Random hex string
 *
 * @example
 * ```typescript
 * const webhookSecret = generateRandomToken()
 * ```
 */
export function generateRandomToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex')
}

/**
 * Rotate encryption key (for periodic key rotation)
 *
 * Process:
 * 1. Decrypt with old key
 * 2. Encrypt with new key
 * 3. Update database
 *
 * @param encryptedToken - Token encrypted with old key
 * @param newKey - New encryption key
 * @returns Re-encrypted token with new key
 */
export function rotateEncryptionKey(
  encryptedToken: string,
  newKey: string
): string {
  // Decrypt with current key
  const plaintext = decryptToken(encryptedToken)

  // Temporarily set new key
  const originalKey = process.env.INTEGRATION_ENCRYPTION_KEY
  process.env.INTEGRATION_ENCRYPTION_KEY = newKey

  try {
    // Re-encrypt with new key
    const reEncrypted = encryptToken(plaintext)
    return reEncrypted
  } finally {
    // Restore original key
    process.env.INTEGRATION_ENCRYPTION_KEY = originalKey
  }
}

/**
 * Validate encryption key format
 *
 * @param key - Hex-encoded encryption key
 * @returns true if valid format
 */
export function isValidEncryptionKey(key: string): boolean {
  return /^[0-9a-f]{64}$/i.test(key) && key.length === 64
}

/**
 * Generate new encryption key
 *
 * @returns New 32-byte encryption key (hex-encoded)
 *
 * @example
 * ```typescript
 * const newKey = generateEncryptionKey()
 * console.log(`Add to .env: INTEGRATION_ENCRYPTION_KEY=${newKey}`)
 * ```
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}
