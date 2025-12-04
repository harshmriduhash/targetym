import crypto from 'crypto'
import {
  encryptToken,
  decryptToken,
  encryptTokenBatch,
  decryptTokenBatch,
  hashToken,
  generateRandomToken,
  rotateEncryptionKey,
  isValidEncryptionKey,
  generateEncryptionKey,
} from '@/src/lib/integrations/crypto'

describe('Crypto Module', () => {
  const TEST_ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

  beforeEach(() => {
    process.env.INTEGRATION_ENCRYPTION_KEY = TEST_ENCRYPTION_KEY
  })

  afterEach(() => {
    delete process.env.INTEGRATION_ENCRYPTION_KEY
  })

  describe('encryptToken', () => {
    it('should encrypt a token successfully', () => {
      // Arrange
      const plaintext = 'sk_live_test_token_123'

      // Act
      const encrypted = encryptToken(plaintext)

      // Assert
      expect(encrypted).toBeTruthy()
      expect(encrypted).toContain(':')
      expect(encrypted.split(':')).toHaveLength(5)
      expect(encrypted.startsWith('v1:')).toBe(true)
    })

    it('should produce different ciphertexts for same plaintext (random IV)', () => {
      // Arrange
      const plaintext = 'sk_live_test_token_123'

      // Act
      const encrypted1 = encryptToken(plaintext)
      const encrypted2 = encryptToken(plaintext)

      // Assert
      expect(encrypted1).not.toEqual(encrypted2)
    })

    it('should throw error for empty plaintext', () => {
      // Act & Assert
      expect(() => encryptToken('')).toThrow('Cannot encrypt empty value')
    })

    it('should encrypt tokens with special characters', () => {
      // Arrange
      const plaintext = 'token!@#$%^&*(){}[]|\\:";\'<>?,./'

      // Act
      const encrypted = encryptToken(plaintext)

      // Assert
      expect(encrypted).toBeTruthy()
      expect(encrypted.startsWith('v1:')).toBe(true)
    })

    it('should throw error when encryption key is not configured', () => {
      // Arrange
      delete process.env.INTEGRATION_ENCRYPTION_KEY

      // Act & Assert
      expect(() => encryptToken('test')).toThrow('INTEGRATION_ENCRYPTION_KEY not configured')
    })

    it('should throw error when encryption key has invalid length', () => {
      // Arrange
      process.env.INTEGRATION_ENCRYPTION_KEY = 'short-key'

      // Act & Assert
      expect(() => encryptToken('test')).toThrow('must be 32 bytes (64 hex chars)')
    })
  })

  describe('decryptToken', () => {
    it('should decrypt an encrypted token successfully', () => {
      // Arrange
      const plaintext = 'sk_live_test_token_123'
      const encrypted = encryptToken(plaintext)

      // Act
      const decrypted = decryptToken(encrypted)

      // Assert
      expect(decrypted).toBe(plaintext)
    })

    it('should throw error for empty encrypted value', () => {
      // Act & Assert
      expect(() => decryptToken('')).toThrow('Cannot decrypt empty value')
    })

    it('should throw error for invalid encrypted token format', () => {
      // Arrange
      const invalidFormats = [
        'invalid',
        'v1:salt:iv',
        'v1:salt:iv:tag',
        'v1:salt:iv:tag:encrypted:extra',
      ]

      // Act & Assert
      invalidFormats.forEach((invalid) => {
        expect(() => decryptToken(invalid)).toThrow('Invalid encrypted token format')
      })
    })

    it('should throw error for unsupported encryption version', () => {
      // Arrange
      const encrypted = encryptToken('test')
      const invalidVersion = encrypted.replace('v1:', 'v2:')

      // Act & Assert
      expect(() => decryptToken(invalidVersion)).toThrow('Unsupported encryption version: v2')
    })

    it('should throw error for corrupted ciphertext', () => {
      // Arrange
      const encrypted = encryptToken('test')
      const parts = encrypted.split(':')
      parts[4] = 'corrupted_data'
      const corrupted = parts.join(':')

      // Act & Assert
      expect(() => decryptToken(corrupted)).toThrow('Token decryption failed')
    })

    it('should throw error for tampered authentication tag', () => {
      // Arrange
      const encrypted = encryptToken('test')
      const parts = encrypted.split(':')
      parts[3] = '0123456789abcdef0123456789abcdef' // Invalid auth tag
      const tampered = parts.join(':')

      // Act & Assert
      expect(() => decryptToken(tampered)).toThrow('Token decryption failed')
    })

    it('should throw error when decrypting with wrong key', () => {
      // Arrange
      const encrypted = encryptToken('test')

      // Change key
      process.env.INTEGRATION_ENCRYPTION_KEY =
        'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210'

      // Act & Assert
      expect(() => decryptToken(encrypted)).toThrow('Token decryption failed')
    })

    it('should handle long tokens', () => {
      // Arrange
      const longToken = 'x'.repeat(10000)
      const encrypted = encryptToken(longToken)

      // Act
      const decrypted = decryptToken(encrypted)

      // Assert
      expect(decrypted).toBe(longToken)
    })

    it('should handle tokens with unicode characters', () => {
      // Arrange
      const unicodeToken = 'token_with_emojis_🔐🔑🛡️_and_한글_العربية'
      const encrypted = encryptToken(unicodeToken)

      // Act
      const decrypted = decryptToken(encrypted)

      // Assert
      expect(decrypted).toBe(unicodeToken)
    })
  })

  describe('encryptTokenBatch', () => {
    it('should encrypt multiple tokens', () => {
      // Arrange
      const tokens = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        apiKey: 'api-key-789',
      }

      // Act
      const encrypted = encryptTokenBatch(tokens)

      // Assert
      expect(encrypted).toHaveProperty('accessToken')
      expect(encrypted).toHaveProperty('refreshToken')
      expect(encrypted).toHaveProperty('apiKey')
      expect(encrypted.accessToken).toContain(':')
      expect(encrypted.refreshToken).toContain(':')
      expect(encrypted.apiKey).toContain(':')
    })

    it('should handle empty object', () => {
      // Arrange
      const tokens = {}

      // Act
      const encrypted = encryptTokenBatch(tokens)

      // Assert
      expect(encrypted).toEqual({})
    })

    it('should skip null/undefined values', () => {
      // Arrange
      const tokens = {
        accessToken: 'access-token-123',
        refreshToken: '',
      }

      // Act
      const encrypted = encryptTokenBatch(tokens)

      // Assert
      expect(encrypted).toHaveProperty('accessToken')
      expect(encrypted).not.toHaveProperty('refreshToken')
    })
  })

  describe('decryptTokenBatch', () => {
    it('should decrypt multiple tokens', () => {
      // Arrange
      const tokens = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      }
      const encrypted = encryptTokenBatch(tokens)

      // Act
      const decrypted = decryptTokenBatch(encrypted)

      // Assert
      expect(decrypted).toEqual(tokens)
    })

    it('should handle empty object', () => {
      // Arrange
      const encrypted = {}

      // Act
      const decrypted = decryptTokenBatch(encrypted)

      // Assert
      expect(decrypted).toEqual({})
    })

    it('should skip null/undefined values', () => {
      // Arrange
      const tokens = {
        accessToken: encryptToken('access-token-123'),
        refreshToken: '',
      }

      // Act
      const decrypted = decryptTokenBatch(tokens)

      // Assert
      expect(decrypted).toHaveProperty('accessToken')
      expect(decrypted.accessToken).toBe('access-token-123')
      expect(decrypted).not.toHaveProperty('refreshToken')
    })
  })

  describe('hashToken', () => {
    it('should hash token with SHA-256', () => {
      // Arrange
      const token = 'webhook-secret-123'

      // Act
      const hash = hashToken(token)

      // Assert
      expect(hash).toBeTruthy()
      expect(hash).toMatch(/^[0-9a-f]{64}$/)
      expect(hash.length).toBe(64)
    })

    it('should produce same hash for same input', () => {
      // Arrange
      const token = 'webhook-secret-123'

      // Act
      const hash1 = hashToken(token)
      const hash2 = hashToken(token)

      // Assert
      expect(hash1).toBe(hash2)
    })

    it('should produce different hashes for different inputs', () => {
      // Arrange
      const token1 = 'webhook-secret-123'
      const token2 = 'webhook-secret-456'

      // Act
      const hash1 = hashToken(token1)
      const hash2 = hashToken(token2)

      // Assert
      expect(hash1).not.toBe(hash2)
    })

    it('should be deterministic', () => {
      // Arrange
      const token = 'test-token'
      const expectedHash = crypto.createHash('sha256').update(token).digest('hex')

      // Act
      const hash = hashToken(token)

      // Assert
      expect(hash).toBe(expectedHash)
    })
  })

  describe('generateRandomToken', () => {
    it('should generate random token with default length', () => {
      // Act
      const token = generateRandomToken()

      // Assert
      expect(token).toBeTruthy()
      expect(token.length).toBe(64) // 32 bytes = 64 hex chars
      expect(token).toMatch(/^[0-9a-f]{64}$/)
    })

    it('should generate random token with custom length', () => {
      // Act
      const token = generateRandomToken(16)

      // Assert
      expect(token).toBeTruthy()
      expect(token.length).toBe(32) // 16 bytes = 32 hex chars
      expect(token).toMatch(/^[0-9a-f]{32}$/)
    })

    it('should generate different tokens each time', () => {
      // Act
      const token1 = generateRandomToken()
      const token2 = generateRandomToken()

      // Assert
      expect(token1).not.toBe(token2)
    })

    it('should generate cryptographically secure tokens', () => {
      // Arrange
      const tokens = new Set<string>()

      // Act - Generate 100 tokens
      for (let i = 0; i < 100; i++) {
        tokens.add(generateRandomToken())
      }

      // Assert - All should be unique
      expect(tokens.size).toBe(100)
    })
  })

  describe('rotateEncryptionKey', () => {
    it('should re-encrypt token with new key', () => {
      // Arrange
      const plaintext = 'test-token-123'
      const oldKey = TEST_ENCRYPTION_KEY
      const newKey = 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789'

      process.env.INTEGRATION_ENCRYPTION_KEY = oldKey
      const encryptedWithOldKey = encryptToken(plaintext)

      // Act
      const reEncrypted = rotateEncryptionKey(encryptedWithOldKey, newKey)

      // Assert - Should be able to decrypt with new key
      process.env.INTEGRATION_ENCRYPTION_KEY = newKey
      const decrypted = decryptToken(reEncrypted)
      expect(decrypted).toBe(plaintext)

      // Cleanup
      process.env.INTEGRATION_ENCRYPTION_KEY = oldKey
    })

    it('should restore original key after rotation', () => {
      // Arrange
      const plaintext = 'test-token-123'
      const oldKey = TEST_ENCRYPTION_KEY
      const newKey = 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789'

      process.env.INTEGRATION_ENCRYPTION_KEY = oldKey
      const encrypted = encryptToken(plaintext)

      // Act
      rotateEncryptionKey(encrypted, newKey)

      // Assert - Original key should still be set
      expect(process.env.INTEGRATION_ENCRYPTION_KEY).toBe(oldKey)
    })

    it('should restore original key even if encryption fails', () => {
      // Arrange
      const plaintext = 'test-token-123'
      const oldKey = TEST_ENCRYPTION_KEY
      const invalidNewKey = 'invalid'

      process.env.INTEGRATION_ENCRYPTION_KEY = oldKey
      const encrypted = encryptToken(plaintext)

      // Act & Assert
      expect(() => rotateEncryptionKey(encrypted, invalidNewKey)).toThrow()
      expect(process.env.INTEGRATION_ENCRYPTION_KEY).toBe(oldKey)
    })
  })

  describe('isValidEncryptionKey', () => {
    it('should validate correct encryption key', () => {
      // Arrange
      const validKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

      // Act
      const isValid = isValidEncryptionKey(validKey)

      // Assert
      expect(isValid).toBe(true)
    })

    it('should reject keys with incorrect length', () => {
      // Arrange
      const invalidKeys = [
        'short',
        '0123456789abcdef',
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef00', // Too long
      ]

      // Act & Assert
      invalidKeys.forEach((key) => {
        expect(isValidEncryptionKey(key)).toBe(false)
      })
    })

    it('should reject keys with non-hex characters', () => {
      // Arrange
      const invalidKeys = [
        '0123456789abcdefg123456789abcdef0123456789abcdef0123456789abcdef', // 'g' is invalid
        '0123456789abcdef 123456789abcdef0123456789abcdef0123456789abcdef', // space
        '0123456789abcdef!123456789abcdef0123456789abcdef0123456789abcdef', // special char
      ]

      // Act & Assert
      invalidKeys.forEach((key) => {
        expect(isValidEncryptionKey(key)).toBe(false)
      })
    })

    it('should accept uppercase hex characters', () => {
      // Arrange
      const validKey = '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF'

      // Act
      const isValid = isValidEncryptionKey(validKey)

      // Assert
      expect(isValid).toBe(true)
    })

    it('should accept mixed case hex characters', () => {
      // Arrange
      const validKey = '0123456789AbCdEf0123456789aBcDeF0123456789abcdef0123456789ABCDEF'

      // Act
      const isValid = isValidEncryptionKey(validKey)

      // Assert
      expect(isValid).toBe(true)
    })
  })

  describe('generateEncryptionKey', () => {
    it('should generate valid encryption key', () => {
      // Act
      const key = generateEncryptionKey()

      // Assert
      expect(key).toBeTruthy()
      expect(isValidEncryptionKey(key)).toBe(true)
      expect(key.length).toBe(64)
    })

    it('should generate different keys each time', () => {
      // Act
      const key1 = generateEncryptionKey()
      const key2 = generateEncryptionKey()

      // Assert
      expect(key1).not.toBe(key2)
    })

    it('should generate cryptographically secure keys', () => {
      // Arrange
      const keys = new Set<string>()

      // Act - Generate 100 keys
      for (let i = 0; i < 100; i++) {
        keys.add(generateEncryptionKey())
      }

      // Assert - All should be unique
      expect(keys.size).toBe(100)
    })

    it('should generate keys that can be used for encryption', () => {
      // Arrange
      const key = generateEncryptionKey()
      process.env.INTEGRATION_ENCRYPTION_KEY = key

      // Act
      const plaintext = 'test-token-123'
      const encrypted = encryptToken(plaintext)
      const decrypted = decryptToken(encrypted)

      // Assert
      expect(decrypted).toBe(plaintext)
    })
  })

  describe('encryption version support', () => {
    it('should include version in encrypted format', () => {
      // Arrange
      const plaintext = 'test-token'

      // Act
      const encrypted = encryptToken(plaintext)
      const [version] = encrypted.split(':')

      // Assert
      expect(version).toBe('v1')
    })

    it('should support decrypting v1 format', () => {
      // Arrange
      const plaintext = 'test-token'
      const encrypted = encryptToken(plaintext)

      // Act
      const decrypted = decryptToken(encrypted)

      // Assert
      expect(decrypted).toBe(plaintext)
    })
  })

  describe('edge cases', () => {
    it('should handle empty string as plaintext (should throw)', () => {
      // Act & Assert
      expect(() => encryptToken('')).toThrow('Cannot encrypt empty value')
    })

    it('should handle very long plaintexts', () => {
      // Arrange
      const longPlaintext = 'x'.repeat(1000000) // 1MB

      // Act
      const encrypted = encryptToken(longPlaintext)
      const decrypted = decryptToken(encrypted)

      // Assert
      expect(decrypted).toBe(longPlaintext)
    })

    it('should handle binary-like strings', () => {
      // Arrange
      const binaryString = String.fromCharCode(...Array.from({ length: 256 }, (_, i) => i))

      // Act
      const encrypted = encryptToken(binaryString)
      const decrypted = decryptToken(encrypted)

      // Assert
      expect(decrypted).toBe(binaryString)
    })
  })
})
