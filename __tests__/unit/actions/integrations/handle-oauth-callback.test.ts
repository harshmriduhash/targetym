/**
 * Tests for handleOAuthCallback Server Action
 *
 * Covers OAuth callback handling, token exchange, and integration creation
 */

import { handleOAuthCallback } from '@/src/actions/integrations/handle-oauth-callback'
import { integrationsService } from '@/src/lib/services/integrations.service'
import { createClient } from '@/src/lib/supabase/server'
import { IntegrationAnalytics } from '@/src/lib/analytics/integration-events'

// Mock dependencies
jest.mock('@/src/lib/supabase/server')
jest.mock('@/src/lib/services/integrations.service')
jest.mock('@/src/lib/analytics/integration-events')

describe('handleOAuthCallback Server Action', () => {
  let mockSupabaseClient: any

  beforeEach(() => {
    mockSupabaseClient = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(() => mockSupabaseClient),
      select: jest.fn(() => mockSupabaseClient),
      eq: jest.fn(() => mockSupabaseClient),
      single: jest.fn(),
    }

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabaseClient)
    ;(IntegrationAnalytics.trackConnectionFlow as jest.Mock) = jest.fn().mockResolvedValue(undefined)
    ;(IntegrationAnalytics.trackOAuthFlow as jest.Mock) = jest.fn().mockResolvedValue(undefined)

    jest.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should reject unauthenticated requests', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      // Act
      const result = await handleOAuthCallback({
        code: 'auth-code-123',
        state: 'oauth-state-456',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('UNAUTHORIZED')
      }
    })

    it('should reject users without organization', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: null,
      })

      // Act
      const result = await handleOAuthCallback({
        code: 'auth-code-123',
        state: 'oauth-state-456',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('NO_ORGANIZATION')
      }
    })
  })

  describe('Input Validation', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: { id: 'user-123', organization_id: 'org-123' },
        error: null,
      })
    })

    it('should validate code is required', async () => {
      // Act
      const result = await handleOAuthCallback({
        code: '',
        state: 'oauth-state-456',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
      }
    })

    it('should validate state is required', async () => {
      // Act
      const result = await handleOAuthCallback({
        code: 'auth-code-123',
        state: '',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
      }
    })

    it('should accept valid code and state', async () => {
      // Arrange
      ;(integrationsService.handleCallback as jest.Mock).mockResolvedValue({
        id: 'integration-123',
        organization_id: 'org-123',
        provider_id: 'slack',
        status: 'active',
      })

      // Act
      const result = await handleOAuthCallback({
        code: 'valid-auth-code',
        state: 'valid-oauth-state',
      })

      // Assert
      expect(result.success).toBe(true)
    })
  })

  describe('OAuth Callback Handling', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: { id: 'user-123', organization_id: 'org-123' },
        error: null,
      })
    })

    it('should successfully handle OAuth callback', async () => {
      // Arrange
      const mockIntegration = {
        id: 'integration-123',
        organization_id: 'org-123',
        provider_id: 'slack',
        status: 'active',
        connected_at: new Date().toISOString(),
      }

      ;(integrationsService.handleCallback as jest.Mock).mockResolvedValue(mockIntegration)

      // Act
      const result = await handleOAuthCallback({
        code: 'auth-code-123',
        state: 'oauth-state-456',
      })

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toMatchObject({
          integrationId: 'integration-123',
          providerId: 'slack',
        })
      }
      expect(integrationsService.handleCallback).toHaveBeenCalledWith({
        code: 'auth-code-123',
        state: 'oauth-state-456',
        organizationId: 'org-123',
        userId: 'user-123',
      })
    })

    it('should handle invalid OAuth state', async () => {
      // Arrange
      ;(integrationsService.handleCallback as jest.Mock).mockRejectedValue(
        new Error('Invalid or expired OAuth state')
      )

      // Act
      const result = await handleOAuthCallback({
        code: 'auth-code-123',
        state: 'invalid-state',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Invalid or expired')
      }
    })

    it('should handle expired OAuth state', async () => {
      // Arrange
      ;(integrationsService.handleCallback as jest.Mock).mockRejectedValue(
        new Error('OAuth state expired')
      )

      // Act
      const result = await handleOAuthCallback({
        code: 'auth-code-123',
        state: 'expired-state',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('expired')
      }
    })

    it('should handle token exchange failure', async () => {
      // Arrange
      ;(integrationsService.handleCallback as jest.Mock).mockRejectedValue(
        new Error('Token exchange failed')
      )

      // Act
      const result = await handleOAuthCallback({
        code: 'auth-code-123',
        state: 'oauth-state-456',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Token exchange failed')
      }
    })
  })

  describe('Analytics Tracking', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: { id: 'user-123', organization_id: 'org-123' },
        error: null,
      })
    })

    it('should track OAuth callback received', async () => {
      // Arrange
      ;(integrationsService.handleCallback as jest.Mock).mockResolvedValue({
        id: 'integration-123',
        organization_id: 'org-123',
        provider_id: 'slack',
        status: 'active',
      })

      const trackSpy = jest.spyOn(IntegrationAnalytics, 'trackOAuthFlow')

      // Act
      await handleOAuthCallback({
        code: 'auth-code-123',
        state: 'oauth-state-456',
      })

      // Assert
      expect(trackSpy).toHaveBeenCalledWith('callback', expect.objectContaining({
        organizationId: 'org-123',
        userId: 'user-123',
        status: 'success',
      }))
    })

    it('should track connection completed on success', async () => {
      // Arrange
      ;(integrationsService.handleCallback as jest.Mock).mockResolvedValue({
        id: 'integration-123',
        organization_id: 'org-123',
        provider_id: 'slack',
        status: 'active',
      })

      const trackSpy = jest.spyOn(IntegrationAnalytics, 'trackConnectionFlow')

      // Act
      await handleOAuthCallback({
        code: 'auth-code-123',
        state: 'oauth-state-456',
      })

      // Assert
      expect(trackSpy).toHaveBeenCalledWith('completed', expect.objectContaining({
        integrationId: 'integration-123',
        providerId: 'slack',
        status: 'success',
      }))
    })

    it('should track OAuth error on failure', async () => {
      // Arrange
      ;(integrationsService.handleCallback as jest.Mock).mockRejectedValue(
        new Error('OAuth callback failed')
      )

      const trackSpy = jest.spyOn(IntegrationAnalytics, 'trackOAuthFlow')

      // Act
      await handleOAuthCallback({
        code: 'auth-code-123',
        state: 'invalid-state',
      })

      // Assert
      expect(trackSpy).toHaveBeenCalledWith('error', expect.objectContaining({
        status: 'failure',
      }))
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: { id: 'user-123', organization_id: 'org-123' },
        error: null,
      })
    })

    it('should handle network errors gracefully', async () => {
      // Arrange
      ;(integrationsService.handleCallback as jest.Mock).mockRejectedValue(
        new Error('Network request failed')
      )

      // Act
      const result = await handleOAuthCallback({
        code: 'auth-code-123',
        state: 'oauth-state-456',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      ;(integrationsService.handleCallback as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      )

      // Act
      const result = await handleOAuthCallback({
        code: 'auth-code-123',
        state: 'oauth-state-456',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })

    it('should handle unexpected errors gracefully', async () => {
      // Arrange
      ;(integrationsService.handleCallback as jest.Mock).mockRejectedValue(
        new Error('Unexpected error')
      )

      // Act
      const result = await handleOAuthCallback({
        code: 'auth-code-123',
        state: 'oauth-state-456',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })
  })

  describe('Security', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: { id: 'user-123', organization_id: 'org-123' },
        error: null,
      })
    })

    it('should prevent state reuse attacks', async () => {
      // Arrange
      ;(integrationsService.handleCallback as jest.Mock).mockRejectedValue(
        new Error('Invalid or expired OAuth state')
      )

      // Act
      const result = await handleOAuthCallback({
        code: 'auth-code-123',
        state: 'already-used-state',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Invalid or expired')
      }
    })

    it('should validate organization ownership', async () => {
      // Arrange
      ;(integrationsService.handleCallback as jest.Mock).mockRejectedValue(
        new Error('Invalid or expired OAuth state')
      )

      // Act
      const result = await handleOAuthCallback({
        code: 'auth-code-123',
        state: 'other-org-state',
      })

      // Assert
      expect(result.success).toBe(false)
    })
  })
})
