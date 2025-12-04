/**
 * Tests for connectIntegration Server Action
 *
 * Covers authentication, authorization, validation, and integration flow initiation
 */

import { connectIntegration } from '@/src/actions/integrations/connect-integration'
import { integrationsService } from '@/src/lib/services/integrations.service'
import { createClient } from '@/src/lib/supabase/server'
import { IntegrationAnalytics, IntegrationEventType } from '@/src/lib/analytics/integration-events'

// Mock dependencies
jest.mock('@/src/lib/supabase/server')
jest.mock('@/src/lib/services/integrations.service')
jest.mock('@/src/lib/analytics/integration-events')

describe('connectIntegration Server Action', () => {
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

    jest.clearAllMocks()
  })

  describe('Authentication and Authorization', () => {
    it('should reject unauthenticated requests', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })

      // Act
      const result = await connectIntegration({
        providerId: 'slack',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('UNAUTHORIZED')
        expect(result.error).toContain('Unauthorized')
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
      const result = await connectIntegration({
        providerId: 'slack',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('NO_ORGANIZATION')
      }
    })

    it('should allow authenticated users with organization', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: { id: 'user-123', organization_id: 'org-123' },
        error: null,
      })

      ;(integrationsService.connectIntegration as jest.Mock).mockResolvedValue({
        url: 'https://slack.com/oauth/authorize?...',
        state: 'state-123',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      })

      // Act
      const result = await connectIntegration({
        providerId: 'slack',
      })

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toMatchObject({
          url: expect.stringContaining('slack.com'),
          state: 'state-123',
        })
      }
    })
  })

  describe('Input Validation', () => {
    beforeEach(() => {
      // Setup authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: { id: 'user-123', organization_id: 'org-123' },
        error: null,
      })
    })

    it('should validate providerId is required', async () => {
      // Act
      const result = await connectIntegration({
        providerId: '',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
      }
    })

    it('should accept valid scopes array', async () => {
      // Arrange
      ;(integrationsService.connectIntegration as jest.Mock).mockResolvedValue({
        url: 'https://slack.com/oauth/authorize',
        state: 'state-123',
        expiresAt: new Date(),
      })

      // Act
      const result = await connectIntegration({
        providerId: 'slack',
        scopes: ['channels:read', 'chat:write'],
      })

      // Assert
      expect(result.success).toBe(true)
      expect(integrationsService.connectIntegration).toHaveBeenCalledWith(
        expect.objectContaining({
          scopes: ['channels:read', 'chat:write'],
        })
      )
    })
  })

  describe('Integration Flow Initiation', () => {
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

    it('should initiate OAuth flow successfully', async () => {
      // Arrange
      const mockOAuthUrl = {
        url: 'https://slack.com/oauth/v2/authorize?client_id=123&state=abc',
        state: 'oauth-state-abc',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      }

      ;(integrationsService.connectIntegration as jest.Mock).mockResolvedValue(mockOAuthUrl)

      // Act
      const result = await connectIntegration({
        providerId: 'slack',
      })

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toMatchObject({
          url: mockOAuthUrl.url,
          state: mockOAuthUrl.state,
        })
      }
      expect(integrationsService.connectIntegration).toHaveBeenCalledWith(
        expect.objectContaining({
          providerId: 'slack',
          organizationId: 'org-123',
          userId: 'user-123',
          scopes: undefined,
        })
      )
    })

    it('should pass custom scopes to service', async () => {
      // Arrange
      ;(integrationsService.connectIntegration as jest.Mock).mockResolvedValue({
        url: 'https://slack.com/oauth/authorize',
        state: 'state-123',
        expiresAt: new Date(),
      })

      // Act
      await connectIntegration({
        providerId: 'slack',
        scopes: ['channels:read', 'users:read'],
      })

      // Assert
      expect(integrationsService.connectIntegration).toHaveBeenCalledWith(
        expect.objectContaining({
          scopes: ['channels:read', 'users:read'],
        })
      )
    })

    it('should handle provider not found error', async () => {
      // Arrange
      ;(integrationsService.connectIntegration as jest.Mock).mockRejectedValue(
        new Error('Integration provider not found')
      )

      // Act
      const result = await connectIntegration({
        providerId: 'invalid-provider',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('provider not found')
      }
    })

    it('should handle conflict when integration exists', async () => {
      // Arrange
      ;(integrationsService.connectIntegration as jest.Mock).mockRejectedValue(
        new Error('Integration already exists for this provider')
      )

      // Act
      const result = await connectIntegration({
        providerId: 'slack',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('already exists')
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

    it('should track connection initiated event on success', async () => {
      // Arrange
      ;(integrationsService.connectIntegration as jest.Mock).mockResolvedValue({
        url: 'https://slack.com/oauth/authorize',
        state: 'state-123',
        expiresAt: new Date(),
      })

      const trackSpy = jest.spyOn(IntegrationAnalytics, 'trackConnectionFlow')

      // Act
      await connectIntegration({
        providerId: 'slack',
      })

      // Assert
      expect(trackSpy).toHaveBeenCalledWith('initiated', expect.objectContaining({
        providerId: 'slack',
        organizationId: 'org-123',
        userId: 'user-123',
        status: 'success',
      }))
    })

    it('should track connection failed event on error', async () => {
      // Arrange
      ;(integrationsService.connectIntegration as jest.Mock).mockRejectedValue(
        new Error('Connection failed')
      )

      const trackSpy = jest.spyOn(IntegrationAnalytics, 'trackConnectionFlow')

      // Act
      await connectIntegration({
        providerId: 'slack',
      })

      // Assert
      expect(trackSpy).toHaveBeenCalledWith('failed', expect.objectContaining({
        providerId: 'slack',
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
      ;(integrationsService.connectIntegration as jest.Mock).mockRejectedValue(
        new Error('Network request failed')
      )

      // Act
      const result = await connectIntegration({
        providerId: 'slack',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      mockSupabaseClient.single.mockRejectedValue(new Error('Database error'))

      // Act
      const result = await connectIntegration({
        providerId: 'slack',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })

    it('should handle unexpected errors gracefully', async () => {
      // Arrange
      ;(integrationsService.connectIntegration as jest.Mock).mockRejectedValue(
        new Error('Unexpected error occurred')
      )

      // Act
      const result = await connectIntegration({
        providerId: 'slack',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })
  })
})
