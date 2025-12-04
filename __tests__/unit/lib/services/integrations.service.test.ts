import { IntegrationsService } from '@/src/lib/services/integrations.service'
import { createClient } from '@/src/lib/supabase/server'
import { NotFoundError, ForbiddenError, UnauthorizedError, ConflictError } from '@/src/lib/utils/errors'
import { encryptToken, decryptToken } from '@/src/lib/integrations/crypto'
import { createPKCESession, isPKCESessionValid } from '@/src/lib/integrations/oauth/pkce'

// Mock dependencies
jest.mock('@/src/lib/supabase/server')
jest.mock('@/src/lib/integrations/crypto')
jest.mock('@/src/lib/integrations/oauth/pkce')

// Mock fetch globally
global.fetch = jest.fn()

describe('IntegrationsService', () => {
  let service: IntegrationsService
  let mockSupabaseClient: any

  beforeEach(() => {
    service = new IntegrationsService()

    // Create a mock query builder that chains properly
    mockSupabaseClient = {
      from: jest.fn(function(this: any) { return this }),
      select: jest.fn(function(this: any) { return this }),
      insert: jest.fn(function(this: any) { return this }),
      update: jest.fn(function(this: any) { return this }),
      delete: jest.fn(function(this: any) { return this }),
      eq: jest.fn(function(this: any) { return this }),
      in: jest.fn(function(this: any) { return this }),
      is: jest.fn(function(this: any) { return this }),
      order: jest.fn(function(this: any) { return this }),
      maybeSingle: jest.fn(),
      single: jest.fn(),
    }

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabaseClient)

    // Reset mocks
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('connectIntegration', () => {
    const mockProvider = {
      id: 'slack',
      name: 'Slack',
      display_name: 'Slack',
      authorization_endpoint: 'https://slack.com/oauth/v2/authorize',
      token_endpoint: 'https://slack.com/api/oauth.v2.access',
      revocation_endpoint: 'https://slack.com/api/auth.revoke',
      is_active: true,
      default_scopes: ['channels:read', 'chat:write'],
      supports_pkce: true,
    }

    const mockPKCESession = {
      codeVerifier: 'test-verifier-123',
      codeChallenge: 'test-challenge-456',
      state: 'test-state-789',
      provider: 'slack',
      redirectUri: 'https://app.example.com/callback',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    }

    beforeEach(() => {
      // Mock environment variables
      process.env.SLACK_CLIENT_ID = 'slack-client-id'
      process.env.SLACK_CLIENT_SECRET = 'slack-client-secret'

      ;(createPKCESession as jest.Mock).mockReturnValue(mockPKCESession)
    })

    it('should initiate OAuth flow successfully', async () => {
      // Arrange
      const params = {
        providerId: 'slack',
        organizationId: 'org-123',
        userId: 'user-123',
        redirectUri: 'https://app.example.com/callback',
        scopes: ['channels:read', 'chat:write'],
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

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: {
          id: 'oauth-state-123',
          state: mockPKCESession.state,
          code_verifier: mockPKCESession.codeVerifier,
        },
        error: null,
      })

      // Act
      const result = await service.connectIntegration(params)

      // Assert
      expect(result).toMatchObject({
        url: expect.stringContaining('https://slack.com/oauth/v2/authorize'),
        state: mockPKCESession.state,
        expiresAt: mockPKCESession.expiresAt,
      })
      expect(result.url).toContain(`client_id=slack-client-id`)
      expect(result.url).toContain(`state=${mockPKCESession.state}`)
      expect(result.url).toContain(`code_challenge=${mockPKCESession.codeChallenge}`)
      expect(result.url).toContain(`code_challenge_method=S256`)
      expect(mockSupabaseClient.insert).toHaveBeenCalled()
    })

    it('should throw NotFoundError when provider not found', async () => {
      // Arrange
      const params = {
        providerId: 'invalid-provider',
        organizationId: 'org-123',
        userId: 'user-123',
        redirectUri: 'https://app.example.com/callback',
      }

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      // Act & Assert
      await expect(service.connectIntegration(params)).rejects.toThrow(NotFoundError)
    })

    it('should throw ConflictError when integration already exists', async () => {
      // Arrange
      const params = {
        providerId: 'slack',
        organizationId: 'org-123',
        userId: 'user-123',
        redirectUri: 'https://app.example.com/callback',
      }

      mockSupabaseClient.maybeSingle
        .mockResolvedValueOnce({
          data: mockProvider,
          error: null,
        })
        .mockResolvedValueOnce({
          data: { id: 'existing-integration', status: 'active' },
          error: null,
        })

      // Act & Assert
      await expect(service.connectIntegration(params)).rejects.toThrow(ConflictError)
    })

    it('should use default scopes when no scopes provided', async () => {
      // Arrange
      const params = {
        providerId: 'slack',
        organizationId: 'org-123',
        userId: 'user-123',
        redirectUri: 'https://app.example.com/callback',
      }

      mockSupabaseClient.maybeSingle
        .mockResolvedValueOnce({
          data: mockProvider,
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: null,
        })

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: {
          id: 'oauth-state-123',
          state: mockPKCESession.state,
        },
        error: null,
      })

      // Act
      const result = await service.connectIntegration(params)

      // Assert - URL encoding can use + or %20 for spaces
      expect(result.url).toMatch(/scope=channels(%3Aread(\+|%20)chat%3Awrite|%3Aread\+chat%3Awrite)/)
    })

    it('should add Slack-specific parameters for Slack provider', async () => {
      // Arrange
      const params = {
        providerId: 'slack',
        organizationId: 'org-123',
        userId: 'user-123',
        redirectUri: 'https://app.example.com/callback',
      }

      mockSupabaseClient.maybeSingle
        .mockResolvedValueOnce({
          data: mockProvider,
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: null,
        })

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { id: 'oauth-state-123', state: mockPKCESession.state },
        error: null,
      })

      // Act
      const result = await service.connectIntegration(params)

      // Assert
      expect(result.url).toContain('user_scope=')
    })

    it('should throw error when provider does not support OAuth', async () => {
      // Arrange
      const params = {
        providerId: 'slack',
        organizationId: 'org-123',
        userId: 'user-123',
        redirectUri: 'https://app.example.com/callback',
      }

      const providerWithoutOAuth = { ...mockProvider, authorization_endpoint: null }

      mockSupabaseClient.maybeSingle
        .mockResolvedValueOnce({
          data: providerWithoutOAuth,
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: null,
        })

      // Act & Assert
      await expect(service.connectIntegration(params)).rejects.toThrow('does not support OAuth')
    })
  })

  describe('handleCallback', () => {
    const mockProvider = {
      id: 'slack',
      name: 'Slack',
      display_name: 'Slack',
      authorization_endpoint: 'https://slack.com/oauth/v2/authorize',
      token_endpoint: 'https://slack.com/api/oauth.v2.access',
      is_active: true,
    }

    const mockOAuthState = {
      id: 'oauth-state-123',
      state: 'test-state-789',
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

    beforeEach(() => {
      process.env.SLACK_CLIENT_ID = 'slack-client-id'
      process.env.SLACK_CLIENT_SECRET = 'slack-client-secret'

      ;(isPKCESessionValid as jest.Mock).mockReturnValue(true)
      ;(encryptToken as jest.Mock).mockImplementation((token) => `encrypted:${token}`)
    })

    it('should handle OAuth callback successfully', async () => {
      // Arrange
      const params = {
        code: 'auth-code-123',
        state: 'test-state-789',
        organizationId: 'org-123',
        userId: 'user-123',
      }

      const mockTokenResponse = {
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-456',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'channels:read chat:write',
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

      // Mock insert with select chaining
      const mockInsertResult = {
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

      mockSupabaseClient.insert.mockReturnValueOnce(mockInsertResult)

      // Mock credentials insert
      mockSupabaseClient.insert.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      mockSupabaseClient.update.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      })

      // Act
      const result = await service.handleCallback(params)

      // Assert
      expect(result).toMatchObject({
        id: 'integration-123',
        organization_id: 'org-123',
        provider_id: 'slack',
        status: 'active',
      })
      expect(encryptToken).toHaveBeenCalledWith('access-token-123')
      expect(encryptToken).toHaveBeenCalledWith('refresh-token-456')
      expect(mockSupabaseClient.insert).toHaveBeenCalledTimes(2) // Integration + credentials
    })

    it('should throw UnauthorizedError when OAuth state is invalid', async () => {
      // Arrange
      const params = {
        code: 'auth-code-123',
        state: 'invalid-state',
        organizationId: 'org-123',
        userId: 'user-123',
      }

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      // Act & Assert
      await expect(service.handleCallback(params)).rejects.toThrow(UnauthorizedError)
    })

    it('should throw UnauthorizedError when OAuth state is expired', async () => {
      // Arrange
      const params = {
        code: 'auth-code-123',
        state: 'test-state-789',
        organizationId: 'org-123',
        userId: 'user-123',
      }

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: mockOAuthState,
        error: null,
      })

      ;(isPKCESessionValid as jest.Mock).mockReturnValue(false)

      // Act & Assert
      await expect(service.handleCallback(params)).rejects.toThrow('OAuth state expired')
    })

    it('should handle token exchange without refresh token', async () => {
      // Arrange
      const params = {
        code: 'auth-code-123',
        state: 'test-state-789',
        organizationId: 'org-123',
        userId: 'user-123',
      }

      const mockTokenResponse = {
        access_token: 'access-token-123',
        expires_in: 3600,
        token_type: 'Bearer',
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

      // Mock insert with select chaining for token exchange without refresh token
      const mockInsertResult2 = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'integration-123', provider_id: 'slack' },
          error: null,
        }),
      }

      mockSupabaseClient.insert.mockReturnValueOnce(mockInsertResult2)

      mockSupabaseClient.insert.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      mockSupabaseClient.update.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      })

      // Act
      const result = await service.handleCallback(params)

      // Assert
      expect(result).toBeDefined()
      expect(encryptToken).toHaveBeenCalledWith('access-token-123')
      expect(encryptToken).toHaveBeenCalledTimes(1) // Only access token
    })

    it('should rollback integration creation if credentials storage fails', async () => {
      // Arrange
      const params = {
        code: 'auth-code-123',
        state: 'test-state-789',
        organizationId: 'org-123',
        userId: 'user-123',
      }

      const mockTokenResponse = {
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-456',
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

      // Mock integration insert with select chaining
      const mockInsertResult3 = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'integration-123', provider_id: 'slack' },
          error: null,
        }),
      }

      mockSupabaseClient.insert.mockReturnValueOnce(mockInsertResult3)

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
        json: async () => mockTokenResponse,
      })

      // Act & Assert
      await expect(service.handleCallback(params)).rejects.toThrow('Failed to store credentials')
      expect(mockSupabaseClient.delete).toHaveBeenCalled()
    })
  })

  describe('disconnectIntegration', () => {
    const mockIntegration = {
      id: 'integration-123',
      organization_id: 'org-123',
      provider_id: 'slack',
      status: 'active',
      connected_by: 'user-123',
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

    beforeEach(() => {
      ;(decryptToken as jest.Mock).mockImplementation((encrypted) =>
        encrypted.replace('encrypted:', '')
      )
    })

    it('should disconnect integration successfully', async () => {
      // Arrange
      const integrationId = 'integration-123'
      const userId = 'user-123'

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: mockIntegration,
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { id: userId, organization_id: 'org-123', role: 'admin' },
        error: null,
      })

      mockSupabaseClient.eq.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      // Act
      await service.disconnectIntegration(integrationId, userId, false)

      // Assert
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'disconnected',
          health_status: 'disconnected',
          disconnected_at: expect.any(String),
        })
      )
    })

    it('should revoke tokens when revokeTokens is true', async () => {
      // Arrange
      const integrationId = 'integration-123'
      const userId = 'user-123'

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: mockIntegration,
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { id: userId, organization_id: 'org-123', role: 'admin' },
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
      await service.disconnectIntegration(integrationId, userId, true)

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'https://slack.com/api/auth.revoke',
        expect.objectContaining({
          method: 'POST',
        })
      )
    })

    it('should throw NotFoundError when integration not found', async () => {
      // Arrange
      const integrationId = 'nonexistent'
      const userId = 'user-123'

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      // Act & Assert
      await expect(service.disconnectIntegration(integrationId, userId)).rejects.toThrow(
        NotFoundError
      )
    })

    it('should throw ForbiddenError when user not in same organization', async () => {
      // Arrange
      const integrationId = 'integration-123'
      const userId = 'other-user'

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: mockIntegration,
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { id: userId, organization_id: 'other-org', role: 'admin' },
        error: null,
      })

      // Act & Assert
      await expect(service.disconnectIntegration(integrationId, userId)).rejects.toThrow(
        ForbiddenError
      )
    })

    it('should continue disconnection even if token revocation fails', async () => {
      // Arrange
      const integrationId = 'integration-123'
      const userId = 'user-123'

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: mockIntegration,
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { id: userId, organization_id: 'org-123', role: 'admin' },
        error: null,
      })

      mockSupabaseClient.eq.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      // Act
      await service.disconnectIntegration(integrationId, userId, true)

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to revoke tokens:',
        expect.any(Error)
      )
      expect(mockSupabaseClient.update).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('refreshTokens', () => {
    const mockIntegration = {
      id: 'integration-123',
      organization_id: 'org-123',
      provider_id: 'slack',
      consecutive_failures: 0,
      credentials: [
        {
          id: 'cred-123',
          integration_id: 'integration-123',
          access_token_encrypted: 'encrypted:old-access',
          refresh_token_encrypted: 'encrypted:refresh-token',
        },
      ],
      provider: {
        id: 'slack',
        name: 'Slack',
        token_endpoint: 'https://slack.com/api/oauth.v2.access',
      },
    }

    beforeEach(() => {
      process.env.SLACK_CLIENT_ID = 'slack-client-id'
      process.env.SLACK_CLIENT_SECRET = 'slack-client-secret'

      ;(decryptToken as jest.Mock).mockImplementation((encrypted) =>
        encrypted.replace('encrypted:', '')
      )
      ;(encryptToken as jest.Mock).mockImplementation((token) => `encrypted:${token}`)
    })

    it('should refresh tokens successfully', async () => {
      // Arrange
      const integrationId = 'integration-123'

      const mockTokenResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
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
        ok: true,
        json: async () => mockTokenResponse,
      })

      // Act
      const result = await service.refreshTokens(integrationId)

      // Assert
      expect(result.success).toBe(true)
      expect(result.expiresAt).toBeDefined()
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(
        expect.objectContaining({
          access_token_encrypted: 'encrypted:new-access-token',
          refresh_token_encrypted: 'encrypted:new-refresh-token',
        })
      )
    })

    it('should throw NotFoundError when integration not found', async () => {
      // Arrange
      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      // Act & Assert
      await expect(service.refreshTokens('nonexistent')).rejects.toThrow(NotFoundError)
    })

    it('should return error when no refresh token available', async () => {
      // Arrange
      const integrationWithoutRefreshToken = {
        ...mockIntegration,
        credentials: [
          {
            id: 'cred-123',
            integration_id: 'integration-123',
            access_token_encrypted: 'encrypted:access',
            refresh_token_encrypted: null,
          },
        ],
      }

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: integrationWithoutRefreshToken,
        error: null,
      })

      // Act
      const result = await service.refreshTokens('integration-123')

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBe('No refresh token available')
    })

    it('should handle token refresh failure and update integration', async () => {
      // Arrange
      const integrationId = 'integration-123'

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
        text: async () => 'Token refresh failed',
      })

      // Act
      const result = await service.refreshTokens(integrationId)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('Token refresh failed')
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(
        expect.objectContaining({
          consecutive_failures: 1,
          health_status: 'degraded',
        })
      )
    })

    it('should reset consecutive failures on successful refresh', async () => {
      // Arrange
      const integrationId = 'integration-123'
      const integrationWithFailures = {
        ...mockIntegration,
        consecutive_failures: 3,
      }

      const mockTokenResponse = {
        access_token: 'new-access-token',
        expires_in: 3600,
      }

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: integrationWithFailures,
        error: null,
      })

      mockSupabaseClient.eq.mockResolvedValue({
        data: null,
        error: null,
      })

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      })

      // Act
      await service.refreshTokens(integrationId)

      // Assert
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(
        expect.objectContaining({
          consecutive_failures: 0,
          health_status: 'healthy',
          error_message: null,
        })
      )
    })
  })

  describe('getIntegrationStatus', () => {
    it('should get integration status successfully', async () => {
      // Arrange
      const mockIntegration = {
        id: 'integration-123',
        organization_id: 'org-123',
        provider_id: 'slack',
        status: 'active',
        health_status: 'healthy',
        last_sync_at: '2025-01-01T00:00:00Z',
        last_health_check_at: '2025-01-01T00:00:00Z',
        consecutive_failures: 0,
        error_message: null,
        error_details: null,
        connected_at: '2025-01-01T00:00:00Z',
        connected_by: 'user-123',
        scopes_granted: ['channels:read', 'chat:write'],
        provider: {
          id: 'slack',
          name: 'Slack',
        },
      }

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: mockIntegration,
        error: null,
      })

      // Act
      const result = await service.getIntegrationStatus('integration-123')

      // Assert
      expect(result).toMatchObject({
        id: 'integration-123',
        providerId: 'slack',
        providerName: 'Slack',
        status: 'active',
        healthStatus: 'healthy',
      })
    })

    it('should throw NotFoundError when integration not found', async () => {
      // Arrange
      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      // Act & Assert
      await expect(service.getIntegrationStatus('nonexistent')).rejects.toThrow(
        NotFoundError
      )
    })
  })

  describe('listIntegrations', () => {
    it('should list integrations for organization', async () => {
      // Arrange
      const mockIntegrations = [
        {
          id: 'integration-1',
          name: 'Slack Integration',
          provider_id: 'slack',
          status: 'active',
          health_status: 'healthy',
          connected_at: '2025-01-01T00:00:00Z',
          last_sync_at: '2025-01-02T00:00:00Z',
          scopes_granted: ['channels:read'],
          provider: {
            id: 'slack',
            name: 'Slack',
            display_name: 'Slack',
          },
        },
        {
          id: 'integration-2',
          name: 'Asana Integration',
          provider_id: 'asana',
          status: 'active',
          health_status: 'healthy',
          connected_at: '2025-01-01T00:00:00Z',
          last_sync_at: null,
          scopes_granted: ['default'],
          provider: {
            id: 'asana',
            name: 'Asana',
            display_name: 'Asana',
          },
        },
      ]

      mockSupabaseClient.order.mockResolvedValueOnce({
        data: mockIntegrations,
        error: null,
      })

      // Act
      const result = await service.listIntegrations('org-123')

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        id: 'integration-1',
        providerId: 'slack',
        providerName: 'Slack',
        status: 'active',
      })
    })

    it('should filter integrations by status', async () => {
      // Arrange
      mockSupabaseClient.order.mockResolvedValueOnce({
        data: [],
        error: null,
      })

      // Act
      await service.listIntegrations('org-123', { status: 'active' })

      // Assert
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('status', 'active')
    })

    it('should filter integrations by provider', async () => {
      // Arrange
      mockSupabaseClient.order.mockResolvedValueOnce({
        data: [],
        error: null,
      })

      // Act
      await service.listIntegrations('org-123', { providerId: 'slack' })

      // Assert
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('provider_id', 'slack')
    })

    it('should return empty array when no integrations found', async () => {
      // Arrange
      mockSupabaseClient.order.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      // Act
      const result = await service.listIntegrations('org-123')

      // Assert
      expect(result).toEqual([])
    })
  })
})
