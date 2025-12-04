import { integrationsService } from '@/src/lib/services/integrations.service'
import { createClient } from '@/src/lib/supabase/server'
import { encryptToken, decryptToken } from '@/src/lib/integrations/crypto'
import { isPKCESessionValid, createPKCESession } from '@/src/lib/integrations/oauth/pkce'

// Mock dependencies
jest.mock('@/src/lib/supabase/server')
jest.mock('@/src/lib/integrations/crypto')
jest.mock('@/src/lib/integrations/oauth/pkce')

// Mock fetch globally
global.fetch = jest.fn()

/**
 * Integration Tests for OAuth Flow
 *
 * Tests the complete OAuth 2.0 PKCE flow from start to finish:
 * 1. Initiate OAuth flow (connectIntegration)
 * 2. Handle OAuth callback (handleCallback)
 * 3. Token refresh flow (refreshTokens)
 * 4. Disconnection flow (disconnectIntegration)
 */
describe('OAuth Flow Integration Tests', () => {
  let mockSupabaseClient: any

  beforeEach(() => {
    // Setup environment variables
    process.env.SLACK_CLIENT_ID = 'slack-client-id-test'
    process.env.SLACK_CLIENT_SECRET = 'slack-client-secret-test'
    process.env.INTEGRATION_ENCRYPTION_KEY =
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

    // Create mock Supabase client with proper chaining
    const createMockClient = () => {
      const client: any = {
        from: jest.fn(() => client),
        select: jest.fn(() => client),
        insert: jest.fn(() => client),
        update: jest.fn(() => client),
        delete: jest.fn(() => client),
        eq: jest.fn(() => client),
        in: jest.fn(() => client),
        is: jest.fn(() => client),
        order: jest.fn(() => client),
        maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      }
      return client
    }

    mockSupabaseClient = createMockClient()
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabaseClient)

    // Setup crypto mocks
    ;(encryptToken as jest.Mock).mockImplementation((token) => `encrypted:${token}`)
    ;(decryptToken as jest.Mock).mockImplementation((encrypted) =>
      encrypted.replace('encrypted:', '')
    )

    // Setup PKCE mocks
    ;(isPKCESessionValid as jest.Mock).mockReturnValue(true)
    ;(createPKCESession as jest.Mock).mockReturnValue({
      codeVerifier: 'test-verifier-123',
      codeChallenge: 'test-challenge-456',
      state: 'test-state-789',
      provider: 'slack',
      redirectUri: 'https://app.example.com/callback',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    })

    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete OAuth Flow: Connect → Callback → Success', () => {
    it('should complete full OAuth flow successfully', async () => {
      // ===== STEP 1: Initiate OAuth flow =====
      const mockProvider = {
        id: 'slack',
        name: 'Slack',
        display_name: 'Slack',
        authorization_endpoint: 'https://slack.com/oauth/v2/authorize',
        token_endpoint: 'https://slack.com/api/oauth.v2.access',
        is_active: true,
        default_scopes: ['channels:read', 'chat:write'],
      }

      mockSupabaseClient.maybeSingle
        .mockResolvedValueOnce({
          data: mockProvider,
          error: null,
        })
        .mockResolvedValueOnce({
          data: null, // No existing integration
          error: null,
        })

      const mockOAuthState = {
        id: 'oauth-state-123',
        state: 'test-state-789',
        code_verifier: 'test-verifier-123',
      }

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockOAuthState,
        error: null,
      })

      const connectParams = {
        providerId: 'slack',
        organizationId: 'org-123',
        userId: 'user-123',
        redirectUri: 'https://app.example.com/callback',
        scopes: ['channels:read', 'chat:write'],
      }

      const authResult = await integrationsService.connectIntegration(connectParams)

      expect(authResult).toMatchObject({
        url: expect.stringContaining('slack.com/oauth/v2/authorize'),
        state: expect.any(String),
        expiresAt: expect.any(Date),
      })

      const oauthState = authResult.state

      // ===== STEP 2: User authorizes and OAuth callback =====
      const mockStoredOAuthState = {
        id: 'oauth-state-123',
        state: oauthState,
        code_verifier: 'test-verifier-123',
        code_challenge: 'test-challenge-456',
        provider_id: 'slack',
        organization_id: 'org-123',
        redirect_uri: 'https://app.example.com/callback',
        scopes: ['channels:read', 'chat:write'],
        initiated_by: 'user-123',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        used_at: null,
      }

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: mockStoredOAuthState,
        error: null,
      })

      mockSupabaseClient.single
        .mockResolvedValueOnce({
          data: mockProvider,
          error: null,
        })

      // Mock insert with select chaining for integration
      const mockIntegrationInsert = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'integration-123',
            organization_id: 'org-123',
            provider_id: 'slack',
            status: 'active',
          },
          error: null,
        }),
      }

      mockSupabaseClient.insert.mockReturnValueOnce(mockIntegrationInsert)

      // Mock credentials insert
      mockSupabaseClient.insert.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      mockSupabaseClient.update.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      const mockTokenResponse = {
        access_token: 'xoxb-slack-access-token',
        refresh_token: 'xoxb-slack-refresh-token',
        expires_in: 43200,
        token_type: 'Bearer',
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      })

      const callbackParams = {
        code: 'auth-code-from-slack',
        state: oauthState,
        organizationId: 'org-123',
        userId: 'user-123',
      }

      const integration = await integrationsService.handleCallback(callbackParams)

      // ===== STEP 3: Verify integration created =====
      expect(integration).toMatchObject({
        id: 'integration-123',
        organization_id: 'org-123',
        provider_id: 'slack',
        status: 'active',
      })

      expect(encryptToken).toHaveBeenCalledWith('xoxb-slack-access-token')
      expect(encryptToken).toHaveBeenCalledWith('xoxb-slack-refresh-token')
      expect(mockSupabaseClient.insert).toHaveBeenCalledTimes(2) // Integration + credentials
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(
        expect.objectContaining({
          used_at: expect.any(String),
        })
      )
    })
  })

  describe('OAuth Flow with Invalid State', () => {
    it('should reject OAuth callback with invalid state', async () => {
      // Arrange
      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: null, // State not found
        error: null,
      })

      const callbackParams = {
        code: 'auth-code-from-slack',
        state: 'invalid-state-that-does-not-exist',
        organizationId: 'org-123',
        userId: 'user-123',
      }

      // Act & Assert
      await expect(integrationsService.handleCallback(callbackParams)).rejects.toThrow(
        'Invalid or expired OAuth state'
      )
    })

    it('should reject OAuth callback with mismatched organization', async () => {
      // Arrange
      const mockOAuthState = {
        id: 'oauth-state-123',
        state: 'test-state-789',
        code_verifier: 'test-verifier-123',
        organization_id: 'org-456', // Different org
        provider_id: 'slack',
        redirect_uri: 'https://app.example.com/callback',
        scopes: ['channels:read'],
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        used_at: null,
      }

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: null, // Query filters by org, so no data
        error: null,
      })

      const callbackParams = {
        code: 'auth-code-from-slack',
        state: 'test-state-789',
        organizationId: 'org-123', // Different from state
        userId: 'user-123',
      }

      // Act & Assert
      await expect(integrationsService.handleCallback(callbackParams)).rejects.toThrow(
        'Invalid or expired OAuth state'
      )
    })

    it('should reject OAuth callback with already used state', async () => {
      // Arrange
      const mockOAuthState = {
        id: 'oauth-state-123',
        state: 'test-state-789',
        code_verifier: 'test-verifier-123',
        organization_id: 'org-123',
        provider_id: 'slack',
        redirect_uri: 'https://app.example.com/callback',
        scopes: ['channels:read'],
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        used_at: new Date().toISOString(), // Already used
      }

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: null, // Query filters by used_at IS NULL
        error: null,
      })

      const callbackParams = {
        code: 'auth-code-from-slack',
        state: 'test-state-789',
        organizationId: 'org-123',
        userId: 'user-123',
      }

      // Act & Assert
      await expect(integrationsService.handleCallback(callbackParams)).rejects.toThrow(
        'Invalid or expired OAuth state'
      )
    })
  })

  describe('OAuth Flow with Expired State', () => {
    it('should reject OAuth callback with expired state', async () => {
      // Arrange
      const mockOAuthState = {
        id: 'oauth-state-123',
        state: 'test-state-789',
        code_verifier: 'test-verifier-123',
        organization_id: 'org-123',
        provider_id: 'slack',
        redirect_uri: 'https://app.example.com/callback',
        scopes: ['channels:read'],
        created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20 mins ago
        expires_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // Expired 5 mins ago
        used_at: null,
      }

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: mockOAuthState,
        error: null,
      })

      ;(isPKCESessionValid as jest.Mock).mockReturnValue(false)

      const callbackParams = {
        code: 'auth-code-from-slack',
        state: 'test-state-789',
        organizationId: 'org-123',
        userId: 'user-123',
      }

      // Act & Assert
      await expect(integrationsService.handleCallback(callbackParams)).rejects.toThrow(
        'OAuth state expired'
      )
    })
  })

  describe('Token Refresh Flow', () => {
    it('should refresh expired access token successfully', async () => {
      // Arrange
      const mockIntegration = {
        id: 'integration-123',
        organization_id: 'org-123',
        provider_id: 'slack',
        consecutive_failures: 0,
        credentials: [
          {
            id: 'cred-123',
            integration_id: 'integration-123',
            access_token_encrypted: 'encrypted:old-access-token',
            refresh_token_encrypted: 'encrypted:refresh-token-123',
            expires_at: new Date(Date.now() - 1000).toISOString(), // Expired
          },
        ],
        provider: {
          id: 'slack',
          name: 'Slack',
          token_endpoint: 'https://slack.com/api/oauth.v2.access',
        },
      }

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: mockIntegration,
        error: null,
      })

      mockSupabaseClient.eq.mockResolvedValue({
        data: null,
        error: null,
      })

      const mockRefreshResponse = {
        access_token: 'xoxb-new-access-token',
        refresh_token: 'xoxb-new-refresh-token',
        expires_in: 43200,
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRefreshResponse,
      })

      // Act
      const result = await integrationsService.refreshTokens('integration-123')

      // Assert
      expect(result.success).toBe(true)
      expect(result.expiresAt).toBeDefined()
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(
        expect.objectContaining({
          access_token_encrypted: 'encrypted:xoxb-new-access-token',
          refresh_token_encrypted: 'encrypted:xoxb-new-refresh-token',
        })
      )
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(
        expect.objectContaining({
          consecutive_failures: 0,
          health_status: 'healthy',
        })
      )
    })

    it('should handle token refresh failure gracefully', async () => {
      // Arrange
      const mockIntegration = {
        id: 'integration-123',
        organization_id: 'org-123',
        provider_id: 'slack',
        consecutive_failures: 2,
        credentials: [
          {
            id: 'cred-123',
            integration_id: 'integration-123',
            access_token_encrypted: 'encrypted:old-access-token',
            refresh_token_encrypted: 'encrypted:refresh-token-123',
          },
        ],
        provider: {
          id: 'slack',
          name: 'Slack',
          token_endpoint: 'https://slack.com/api/oauth.v2.access',
        },
      }

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: mockIntegration,
        error: null,
      })

      mockSupabaseClient.eq.mockResolvedValue({
        data: null,
        error: null,
      })

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        text: async () => 'invalid_grant: Refresh token has been revoked',
      })

      // Act
      const result = await integrationsService.refreshTokens('integration-123')

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('Token refresh failed')
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(
        expect.objectContaining({
          consecutive_failures: 3,
          health_status: 'degraded',
        })
      )
    })
  })

  describe('Disconnection Flow', () => {
    it('should disconnect integration and optionally revoke tokens', async () => {
      // Arrange
      const mockIntegration = {
        id: 'integration-123',
        organization_id: 'org-123',
        provider_id: 'slack',
        status: 'active',
        credentials: [
          {
            id: 'cred-123',
            integration_id: 'integration-123',
            access_token_encrypted: 'encrypted:access-token',
            refresh_token_encrypted: 'encrypted:refresh-token',
          },
        ],
        provider: {
          id: 'slack',
          name: 'Slack',
          revocation_endpoint: 'https://slack.com/api/auth.revoke',
        },
      }

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: mockIntegration,
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: {
          id: 'user-123',
          organization_id: 'org-123',
          role: 'admin',
        },
        error: null,
      })

      mockSupabaseClient.eq.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      })

      // Act
      await integrationsService.disconnectIntegration('integration-123', 'user-123', true)

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'https://slack.com/api/auth.revoke',
        expect.objectContaining({
          method: 'POST',
        })
      )
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'disconnected',
          health_status: 'disconnected',
          disconnected_at: expect.any(String),
        })
      )
    })

    it('should continue disconnection even if revocation fails', async () => {
      // Arrange
      const mockIntegration = {
        id: 'integration-123',
        organization_id: 'org-123',
        provider_id: 'slack',
        status: 'active',
        credentials: [
          {
            id: 'cred-123',
            integration_id: 'integration-123',
            access_token_encrypted: 'encrypted:access-token',
          },
        ],
        provider: {
          id: 'slack',
          name: 'Slack',
          revocation_endpoint: 'https://slack.com/api/auth.revoke',
        },
      }

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: mockIntegration,
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: {
          id: 'user-123',
          organization_id: 'org-123',
          role: 'admin',
        },
        error: null,
      })

      mockSupabaseClient.eq.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      // Act
      await integrationsService.disconnectIntegration('integration-123', 'user-123', true)

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'disconnected',
        })
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle provider without token endpoint', async () => {
      // Arrange
      const mockProvider = {
        id: 'custom-provider',
        name: 'Custom Provider',
        display_name: 'Custom',
        authorization_endpoint: 'https://custom.com/oauth/authorize',
        token_endpoint: null, // No token endpoint
        is_active: true,
      }

      const mockOAuthState = {
        id: 'oauth-state-123',
        state: 'test-state',
        code_verifier: 'test-verifier',
        organization_id: 'org-123',
        provider_id: 'custom-provider',
        redirect_uri: 'https://app.example.com/callback',
        scopes: [],
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        used_at: null,
      }

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: mockOAuthState,
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockProvider,
        error: null,
      })

      const callbackParams = {
        code: 'auth-code',
        state: 'test-state',
        organizationId: 'org-123',
        userId: 'user-123',
      }

      // Act & Assert
      await expect(integrationsService.handleCallback(callbackParams)).rejects.toThrow(
        'does not have token endpoint configured'
      )
    })

    it('should handle integration without refresh token', async () => {
      // Arrange
      const mockIntegration = {
        id: 'integration-123',
        organization_id: 'org-123',
        provider_id: 'slack',
        credentials: [
          {
            id: 'cred-123',
            integration_id: 'integration-123',
            access_token_encrypted: 'encrypted:access-token',
            refresh_token_encrypted: null, // No refresh token
          },
        ],
        provider: {
          id: 'slack',
          name: 'Slack',
          token_endpoint: 'https://slack.com/api/oauth.v2.access',
        },
      }

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: mockIntegration,
        error: null,
      })

      // Act
      const result = await integrationsService.refreshTokens('integration-123')

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('No refresh token available')
    })

    it('should rollback integration on credentials storage failure', async () => {
      // Arrange
      const mockProvider = {
        id: 'slack',
        name: 'Slack',
        display_name: 'Slack',
        token_endpoint: 'https://slack.com/api/oauth.v2.access',
      }

      const mockOAuthState = {
        id: 'oauth-state-123',
        state: 'test-state',
        code_verifier: 'test-verifier',
        organization_id: 'org-123',
        provider_id: 'slack',
        redirect_uri: 'https://app.example.com/callback',
        scopes: ['channels:read'],
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        used_at: null,
      }

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: mockOAuthState,
        error: null,
      })

      mockSupabaseClient.single
        .mockResolvedValueOnce({
          data: mockProvider,
          error: null,
        })

      // Mock insert with select chaining for rollback test
      const mockRollbackInsert = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'integration-123' },
          error: null,
        }),
      }

      mockSupabaseClient.insert.mockReturnValueOnce(mockRollbackInsert)

      // Mock credentials insert failure
      mockSupabaseClient.insert.mockResolvedValueOnce({
        data: null,
        error: { message: 'Credentials insert failed' },
      })

      mockSupabaseClient.delete.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'token',
          refresh_token: 'refresh',
        }),
      })

      const callbackParams = {
        code: 'auth-code',
        state: 'test-state',
        organizationId: 'org-123',
        userId: 'user-123',
      }

      // Act & Assert
      await expect(integrationsService.handleCallback(callbackParams)).rejects.toThrow(
        'Failed to store credentials'
      )
      expect(mockSupabaseClient.delete).toHaveBeenCalled()
    })
  })
})
