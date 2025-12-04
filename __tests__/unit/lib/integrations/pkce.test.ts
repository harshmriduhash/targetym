import crypto from 'crypto'
import {
  generatePKCEChallenge,
  verifyPKCE,
  base64URLDecode,
  generateOAuthState,
  validateOAuthState,
  createPKCESession,
  isPKCESessionValid,
} from '@/src/lib/integrations/oauth/pkce'

describe('PKCE Module', () => {
  describe('generatePKCEChallenge', () => {
    it('should generate valid PKCE challenge', () => {
      // Act
      const challenge = generatePKCEChallenge()

      // Assert
      expect(challenge).toHaveProperty('codeVerifier')
      expect(challenge).toHaveProperty('codeChallenge')
      expect(challenge).toHaveProperty('codeChallengeMethod')
      expect(challenge.codeChallengeMethod).toBe('S256')
    })

    it('should generate code verifier of correct length', () => {
      // Act
      const challenge = generatePKCEChallenge()

      // Assert
      // 32 bytes base64url encoded = 43 characters
      expect(challenge.codeVerifier.length).toBe(43)
      expect(challenge.codeVerifier).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    it('should generate code challenge of correct length', () => {
      // Act
      const challenge = generatePKCEChallenge()

      // Assert
      // SHA256 hash base64url encoded = 43 characters
      expect(challenge.codeChallenge.length).toBe(43)
      expect(challenge.codeChallenge).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    it('should generate different challenges each time', () => {
      // Act
      const challenge1 = generatePKCEChallenge()
      const challenge2 = generatePKCEChallenge()

      // Assert
      expect(challenge1.codeVerifier).not.toBe(challenge2.codeVerifier)
      expect(challenge1.codeChallenge).not.toBe(challenge2.codeChallenge)
    })

    it('should generate code challenge from code verifier', () => {
      // Act
      const challenge = generatePKCEChallenge()

      // Manually calculate expected challenge
      const hash = crypto
        .createHash('sha256')
        .update(challenge.codeVerifier)
        .digest()
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')

      // Assert
      expect(challenge.codeChallenge).toBe(hash)
    })

    it('should not contain padding characters in base64url', () => {
      // Act
      const challenge = generatePKCEChallenge()

      // Assert
      expect(challenge.codeVerifier).not.toContain('=')
      expect(challenge.codeChallenge).not.toContain('=')
      expect(challenge.codeVerifier).not.toContain('+')
      expect(challenge.codeChallenge).not.toContain('+')
      expect(challenge.codeVerifier).not.toContain('/')
      expect(challenge.codeChallenge).not.toContain('/')
    })

    it('should use SHA256 method', () => {
      // Act
      const challenge = generatePKCEChallenge()

      // Assert
      expect(challenge.codeChallengeMethod).toBe('S256')
    })

    it('should generate cryptographically secure challenges', () => {
      // Arrange
      const challenges = new Set<string>()

      // Act - Generate 100 challenges
      for (let i = 0; i < 100; i++) {
        const challenge = generatePKCEChallenge()
        challenges.add(challenge.codeVerifier)
      }

      // Assert - All should be unique
      expect(challenges.size).toBe(100)
    })
  })

  describe('verifyPKCE', () => {
    it('should verify valid PKCE challenge', () => {
      // Arrange
      const { codeVerifier, codeChallenge } = generatePKCEChallenge()

      // Act
      const isValid = verifyPKCE(codeVerifier, codeChallenge)

      // Assert
      expect(isValid).toBe(true)
    })

    it('should reject invalid code verifier', () => {
      // Arrange
      const { codeChallenge } = generatePKCEChallenge()
      const wrongVerifier = 'wrong_verifier_value_that_does_not_match'

      // Act
      const isValid = verifyPKCE(wrongVerifier, codeChallenge)

      // Assert
      expect(isValid).toBe(false)
    })

    it('should reject tampered code challenge', () => {
      // Arrange
      const { codeVerifier } = generatePKCEChallenge()
      // Generate a valid-length challenge but with wrong content
      const tamperedChallenge = 'a'.repeat(43) // Same length as real challenge

      // Act
      const isValid = verifyPKCE(codeVerifier, tamperedChallenge)

      // Assert
      expect(isValid).toBe(false)
    })

    it('should use timing-safe comparison', () => {
      // Arrange
      const { codeVerifier, codeChallenge } = generatePKCEChallenge()

      // Spy on crypto.timingSafeEqual
      const timingSafeEqualSpy = jest.spyOn(crypto, 'timingSafeEqual')

      // Act
      verifyPKCE(codeVerifier, codeChallenge)

      // Assert
      expect(timingSafeEqualSpy).toHaveBeenCalled()

      timingSafeEqualSpy.mockRestore()
    })

    it('should handle verification with different case (should fail)', () => {
      // Arrange
      const { codeVerifier, codeChallenge } = generatePKCEChallenge()
      const upperCaseChallenge = codeChallenge.toUpperCase()

      // Act
      const isValid = verifyPKCE(codeVerifier, upperCaseChallenge)

      // Assert
      expect(isValid).toBe(false)
    })
  })

  describe('base64URLDecode', () => {
    it('should decode base64url string', () => {
      // Arrange
      const original = Buffer.from('Hello, World!')
      const base64url = original
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')

      // Act
      const decoded = base64URLDecode(base64url)

      // Assert
      expect(decoded.toString()).toBe('Hello, World!')
    })

    it('should decode string without padding', () => {
      // Arrange
      const base64url = 'SGVsbG8' // "Hello" without padding

      // Act
      const decoded = base64URLDecode(base64url)

      // Assert
      expect(decoded.toString()).toBe('Hello')
    })

    it('should decode string with URL-safe characters', () => {
      // Arrange
      const base64url = 'YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo-_w' // Contains - and _

      // Act
      const decoded = base64URLDecode(base64url)

      // Assert
      expect(decoded).toBeInstanceOf(Buffer)
    })

    it('should handle empty string', () => {
      // Act
      const decoded = base64URLDecode('')

      // Assert
      expect(decoded).toBeInstanceOf(Buffer)
      expect(decoded.length).toBe(0)
    })

    it('should round-trip encode/decode', () => {
      // Arrange
      const original = crypto.randomBytes(32)
      const base64url = original
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')

      // Act
      const decoded = base64URLDecode(base64url)

      // Assert
      expect(decoded).toEqual(original)
    })
  })

  describe('generateOAuthState', () => {
    it('should generate valid OAuth state', () => {
      // Act
      const state = generateOAuthState()

      // Assert
      expect(state).toBeTruthy()
      expect(state.length).toBe(43) // 32 bytes base64url = 43 chars
      expect(state).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    it('should generate different states each time', () => {
      // Act
      const state1 = generateOAuthState()
      const state2 = generateOAuthState()

      // Assert
      expect(state1).not.toBe(state2)
    })

    it('should not contain padding or unsafe characters', () => {
      // Act
      const state = generateOAuthState()

      // Assert
      expect(state).not.toContain('=')
      expect(state).not.toContain('+')
      expect(state).not.toContain('/')
    })

    it('should generate cryptographically secure states', () => {
      // Arrange
      const states = new Set<string>()

      // Act - Generate 100 states
      for (let i = 0; i < 100; i++) {
        states.add(generateOAuthState())
      }

      // Assert - All should be unique
      expect(states.size).toBe(100)
    })

    it('should be URL-safe', () => {
      // Act
      const state = generateOAuthState()
      const urlEncoded = encodeURIComponent(state)

      // Assert - Should not change when URL encoded
      expect(urlEncoded).toBe(state)
    })
  })

  describe('validateOAuthState', () => {
    it('should validate matching states', () => {
      // Arrange
      const state = generateOAuthState()

      // Act
      const isValid = validateOAuthState(state, state)

      // Assert
      expect(isValid).toBe(true)
    })

    it('should reject different states', () => {
      // Arrange
      const state1 = generateOAuthState()
      const state2 = generateOAuthState()

      // Act
      const isValid = validateOAuthState(state1, state2)

      // Assert
      expect(isValid).toBe(false)
    })

    it('should reject empty received state', () => {
      // Arrange
      const storedState = generateOAuthState()

      // Act
      const isValid = validateOAuthState('', storedState)

      // Assert
      expect(isValid).toBe(false)
    })

    it('should reject empty stored state', () => {
      // Arrange
      const receivedState = generateOAuthState()

      // Act
      const isValid = validateOAuthState(receivedState, '')

      // Assert
      expect(isValid).toBe(false)
    })

    it('should reject null states', () => {
      // Act
      const isValid1 = validateOAuthState(null as any, 'state')
      const isValid2 = validateOAuthState('state', null as any)

      // Assert
      expect(isValid1).toBe(false)
      expect(isValid2).toBe(false)
    })

    it('should use timing-safe comparison', () => {
      // Arrange
      const state = generateOAuthState()

      // Spy on crypto.timingSafeEqual
      const timingSafeEqualSpy = jest.spyOn(crypto, 'timingSafeEqual')

      // Act
      validateOAuthState(state, state)

      // Assert
      expect(timingSafeEqualSpy).toHaveBeenCalled()

      timingSafeEqualSpy.mockRestore()
    })

    it('should be case-sensitive', () => {
      // Arrange
      const state = 'AbCdEfGhIjKlMnOpQrStUvWxYz'

      // Act
      const isValid = validateOAuthState(state, state.toLowerCase())

      // Assert
      expect(isValid).toBe(false)
    })
  })

  describe('createPKCESession', () => {
    it('should create valid PKCE session', () => {
      // Arrange
      const provider = 'slack'
      const redirectUri = 'https://app.example.com/callback'

      // Act
      const session = createPKCESession(provider, redirectUri)

      // Assert
      expect(session).toHaveProperty('codeVerifier')
      expect(session).toHaveProperty('codeChallenge')
      expect(session).toHaveProperty('state')
      expect(session).toHaveProperty('provider')
      expect(session).toHaveProperty('redirectUri')
      expect(session).toHaveProperty('createdAt')
      expect(session).toHaveProperty('expiresAt')
      expect(session.provider).toBe(provider)
      expect(session.redirectUri).toBe(redirectUri)
    })

    it('should set default TTL to 10 minutes', () => {
      // Arrange
      const provider = 'slack'
      const redirectUri = 'https://app.example.com/callback'
      const before = new Date()

      // Act
      const session = createPKCESession(provider, redirectUri)
      const after = new Date()

      // Assert
      const expectedExpiry = new Date(before.getTime() + 10 * 60 * 1000)
      const actualExpiry = session.expiresAt

      // Allow 1 second tolerance for test execution time
      expect(actualExpiry.getTime()).toBeGreaterThanOrEqual(expectedExpiry.getTime() - 1000)
      expect(actualExpiry.getTime()).toBeLessThanOrEqual(
        new Date(after.getTime() + 10 * 60 * 1000).getTime() + 1000
      )
    })

    it('should accept custom TTL', () => {
      // Arrange
      const provider = 'slack'
      const redirectUri = 'https://app.example.com/callback'
      const customTTL = 5 // 5 minutes
      const before = new Date()

      // Act
      const session = createPKCESession(provider, redirectUri, customTTL)
      const after = new Date()

      // Assert
      const expectedExpiry = new Date(before.getTime() + customTTL * 60 * 1000)
      const actualExpiry = session.expiresAt

      // Allow 1 second tolerance
      expect(actualExpiry.getTime()).toBeGreaterThanOrEqual(expectedExpiry.getTime() - 1000)
      expect(actualExpiry.getTime()).toBeLessThanOrEqual(
        new Date(after.getTime() + customTTL * 60 * 1000).getTime() + 1000
      )
    })

    it('should set createdAt to current time', () => {
      // Arrange
      const provider = 'slack'
      const redirectUri = 'https://app.example.com/callback'
      const before = new Date()

      // Act
      const session = createPKCESession(provider, redirectUri)
      const after = new Date()

      // Assert
      expect(session.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime() - 100)
      expect(session.createdAt.getTime()).toBeLessThanOrEqual(after.getTime() + 100)
    })

    it('should generate valid PKCE challenge in session', () => {
      // Arrange
      const provider = 'slack'
      const redirectUri = 'https://app.example.com/callback'

      // Act
      const session = createPKCESession(provider, redirectUri)

      // Assert
      expect(verifyPKCE(session.codeVerifier, session.codeChallenge)).toBe(true)
    })

    it('should generate unique sessions', () => {
      // Arrange
      const provider = 'slack'
      const redirectUri = 'https://app.example.com/callback'

      // Act
      const session1 = createPKCESession(provider, redirectUri)
      const session2 = createPKCESession(provider, redirectUri)

      // Assert
      expect(session1.codeVerifier).not.toBe(session2.codeVerifier)
      expect(session1.codeChallenge).not.toBe(session2.codeChallenge)
      expect(session1.state).not.toBe(session2.state)
    })

    it('should handle different providers', () => {
      // Arrange
      const providers = ['slack', 'asana', 'notion', 'google']
      const redirectUri = 'https://app.example.com/callback'

      // Act & Assert
      providers.forEach((provider) => {
        const session = createPKCESession(provider, redirectUri)
        expect(session.provider).toBe(provider)
        expect(session.redirectUri).toBe(redirectUri)
      })
    })

    it('should handle different redirect URIs', () => {
      // Arrange
      const provider = 'slack'
      const redirectUris = [
        'https://app.example.com/callback',
        'https://staging.example.com/oauth/callback',
        'http://localhost:3000/api/integrations/callback',
      ]

      // Act & Assert
      redirectUris.forEach((redirectUri) => {
        const session = createPKCESession(provider, redirectUri)
        expect(session.redirectUri).toBe(redirectUri)
      })
    })
  })

  describe('isPKCESessionValid', () => {
    it('should return true for valid session', () => {
      // Arrange
      const session = createPKCESession('slack', 'https://app.example.com/callback', 10)

      // Act
      const isValid = isPKCESessionValid(session)

      // Assert
      expect(isValid).toBe(true)
    })

    it('should return false for expired session', () => {
      // Arrange
      const session = {
        codeVerifier: 'test-verifier',
        state: 'test-state',
        provider: 'slack',
        redirectUri: 'https://app.example.com/callback',
        createdAt: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
        expiresAt: new Date(Date.now() - 10 * 60 * 1000), // Expired 10 minutes ago
      }

      // Act
      const isValid = isPKCESessionValid(session)

      // Assert
      expect(isValid).toBe(false)
    })

    it('should return false for session expiring exactly now', () => {
      // Arrange
      const now = new Date()
      const session = {
        codeVerifier: 'test-verifier',
        state: 'test-state',
        provider: 'slack',
        redirectUri: 'https://app.example.com/callback',
        createdAt: new Date(now.getTime() - 10 * 60 * 1000),
        expiresAt: now,
      }

      // Act
      const isValid = isPKCESessionValid(session)

      // Assert
      expect(isValid).toBe(false)
    })

    it('should return true for session with future expiry', () => {
      // Arrange
      const session = {
        codeVerifier: 'test-verifier',
        state: 'test-state',
        provider: 'slack',
        redirectUri: 'https://app.example.com/callback',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
      }

      // Act
      const isValid = isPKCESessionValid(session)

      // Assert
      expect(isValid).toBe(true)
    })

    it('should return true for session expiring 1 second from now', () => {
      // Arrange
      const session = {
        codeVerifier: 'test-verifier',
        state: 'test-state',
        provider: 'slack',
        redirectUri: 'https://app.example.com/callback',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 1000), // 1 second from now
      }

      // Act
      const isValid = isPKCESessionValid(session)

      // Assert
      expect(isValid).toBe(true)
    })
  })

  describe('RFC 7636 compliance', () => {
    it('should use S256 challenge method (SHA256)', () => {
      // Act
      const challenge = generatePKCEChallenge()

      // Assert
      expect(challenge.codeChallengeMethod).toBe('S256')
    })

    it('should generate code verifier between 43-128 characters', () => {
      // Act
      const challenge = generatePKCEChallenge()

      // Assert
      expect(challenge.codeVerifier.length).toBeGreaterThanOrEqual(43)
      expect(challenge.codeVerifier.length).toBeLessThanOrEqual(128)
    })

    it('should use unreserved characters for code verifier', () => {
      // Unreserved characters: [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"
      // Note: base64url uses [A-Za-z0-9_-]

      // Act
      const challenge = generatePKCEChallenge()

      // Assert
      expect(challenge.codeVerifier).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    it('should generate base64url-encoded code challenge', () => {
      // Act
      const challenge = generatePKCEChallenge()

      // Assert
      expect(challenge.codeChallenge).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    it('should compute code challenge as BASE64URL(SHA256(ASCII(code_verifier)))', () => {
      // Act
      const challenge = generatePKCEChallenge()

      // Manually compute expected challenge
      const hash = crypto.createHash('sha256').update(challenge.codeVerifier).digest()
      const expectedChallenge = hash
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')

      // Assert
      expect(challenge.codeChallenge).toBe(expectedChallenge)
    })
  })
})
