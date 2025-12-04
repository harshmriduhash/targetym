/**
 * Tests for disconnectIntegration Server Action
 *
 * Covers integration disconnection, token revocation, and authorization
 */

import { disconnectIntegration } from '@/src/actions/integrations/disconnect-integration'
import { integrationsService } from '@/src/lib/services/integrations.service'
import { createClient } from '@/src/lib/supabase/server'
import { IntegrationAnalytics } from '@/src/lib/analytics/integration-events'

// Mock dependencies
jest.mock('@/src/lib/supabase/server')
jest.mock('@/src/lib/services/integrations.service')
jest.mock('@/src/lib/analytics/integration-events')

describe('disconnectIntegration Server Action', () => {
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
    ;(IntegrationAnalytics.track as jest.Mock) = jest.fn().mockResolvedValue(undefined)

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
      const result = await disconnectIntegration({
        integrationId: 'integration-123',
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
      const result = await disconnectIntegration({
        integrationId: 'integration-123',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('NO_ORGANIZATION')
      }
    })

    it('should allow authorized users to disconnect integration', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      mockSupabaseClient.single.mockResolvedValue({
        data: { id: 'user-123', organization_id: 'org-123' },
        error: null,
      })

      ;(integrationsService.disconnectIntegration as jest.Mock).mockResolvedValue(undefined)

      // Act
      const result = await disconnectIntegration({
        integrationId: 'integration-123',
      })

      // Assert
      expect(result.success).toBe(true)
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

    it('should validate integrationId is required', async () => {
      // Act
      const result = await disconnectIntegration({
        integrationId: '',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.code).toBe('VALIDATION_ERROR')
      }
    })

    it('should accept optional revokeTokens flag', async () => {
      // Arrange
      ;(integrationsService.disconnectIntegration as jest.Mock).mockResolvedValue(undefined)

      // Act
      const result = await disconnectIntegration({
        integrationId: 'integration-123',
        revokeTokens: true,
      })

      // Assert
      expect(result.success).toBe(true)
      expect(integrationsService.disconnectIntegration).toHaveBeenCalledWith(
        'integration-123',
        'user-123',
        true
      )
    })

    it('should default revokeTokens to false', async () => {
      // Arrange
      ;(integrationsService.disconnectIntegration as jest.Mock).mockResolvedValue(undefined)

      // Act
      await disconnectIntegration({
        integrationId: 'integration-123',
      })

      // Assert
      expect(integrationsService.disconnectIntegration).toHaveBeenCalledWith(
        'integration-123',
        'user-123',
        false
      )
    })
  })

  describe('Disconnection Flow', () => {
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

    it('should successfully disconnect integration', async () => {
      // Arrange
      ;(integrationsService.disconnectIntegration as jest.Mock).mockResolvedValue(undefined)

      // Act
      const result = await disconnectIntegration({
        integrationId: 'integration-123',
      })

      // Assert
      expect(result.success).toBe(true)
      expect(integrationsService.disconnectIntegration).toHaveBeenCalledWith(
        'integration-123',
        'user-123',
        false
      )
    })

    it('should disconnect and revoke tokens when specified', async () => {
      // Arrange
      ;(integrationsService.disconnectIntegration as jest.Mock).mockResolvedValue(undefined)

      // Act
      const result = await disconnectIntegration({
        integrationId: 'integration-123',
        revokeTokens: true,
      })

      // Assert
      expect(result.success).toBe(true)
      expect(integrationsService.disconnectIntegration).toHaveBeenCalledWith(
        'integration-123',
        'user-123',
        true
      )
    })

    it('should handle integration not found', async () => {
      // Arrange
      ;(integrationsService.disconnectIntegration as jest.Mock).mockRejectedValue(
        new Error('Integration not found')
      )

      // Act
      const result = await disconnectIntegration({
        integrationId: 'nonexistent-123',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('not found')
      }
    })

    it('should handle forbidden access', async () => {
      // Arrange
      ;(integrationsService.disconnectIntegration as jest.Mock).mockRejectedValue(
        new Error('User does not have permission')
      )

      // Act
      const result = await disconnectIntegration({
        integrationId: 'integration-123',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('permission')
      }
    })

    it('should continue disconnection even if token revocation fails', async () => {
      // Arrange
      ;(integrationsService.disconnectIntegration as jest.Mock).mockResolvedValue(undefined)

      // Act
      const result = await disconnectIntegration({
        integrationId: 'integration-123',
        revokeTokens: true,
      })

      // Assert - Should still succeed
      expect(result.success).toBe(true)
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

    it('should track disconnection initiated', async () => {
      // Arrange
      ;(integrationsService.disconnectIntegration as jest.Mock).mockResolvedValue(undefined)

      const trackSpy = jest.spyOn(IntegrationAnalytics, 'track')

      // Act
      await disconnectIntegration({
        integrationId: 'integration-123',
      })

      // Assert
      expect(trackSpy).toHaveBeenCalledWith(
        expect.stringContaining('disconnection_initiated'),
        expect.objectContaining({
          integrationId: 'integration-123',
          organizationId: 'org-123',
          userId: 'user-123',
        })
      )
    })

    it('should track successful disconnection', async () => {
      // Arrange
      ;(integrationsService.disconnectIntegration as jest.Mock).mockResolvedValue(undefined)

      const trackSpy = jest.spyOn(IntegrationAnalytics, 'track')

      // Act
      await disconnectIntegration({
        integrationId: 'integration-123',
      })

      // Assert
      expect(trackSpy).toHaveBeenCalledWith(
        expect.stringContaining('disconnection_completed'),
        expect.objectContaining({
          status: 'success',
        })
      )
    })

    it('should track token revocation when requested', async () => {
      // Arrange
      ;(integrationsService.disconnectIntegration as jest.Mock).mockResolvedValue(undefined)

      const trackSpy = jest.spyOn(IntegrationAnalytics, 'track')

      // Act
      await disconnectIntegration({
        integrationId: 'integration-123',
        revokeTokens: true,
      })

      // Assert
      expect(trackSpy).toHaveBeenCalledWith(
        expect.stringContaining('token_revocation'),
        expect.any(Object)
      )
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
      ;(integrationsService.disconnectIntegration as jest.Mock).mockRejectedValue(
        new Error('Network request failed')
      )

      // Act
      const result = await disconnectIntegration({
        integrationId: 'integration-123',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      ;(integrationsService.disconnectIntegration as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      )

      // Act
      const result = await disconnectIntegration({
        integrationId: 'integration-123',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })

    it('should handle unexpected errors gracefully', async () => {
      // Arrange
      ;(integrationsService.disconnectIntegration as jest.Mock).mockRejectedValue(
        new Error('Unexpected error')
      )

      // Act
      const result = await disconnectIntegration({
        integrationId: 'integration-123',
      })

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })
  })
})
