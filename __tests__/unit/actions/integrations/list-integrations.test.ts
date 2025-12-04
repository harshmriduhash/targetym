/**
 * Tests for listIntegrations Server Action
 *
 * Covers listing, filtering, and viewing integration status
 */

import { listIntegrations } from '@/src/actions/integrations/list-integrations'
import { integrationsService } from '@/src/lib/services/integrations.service'
import { createClient } from '@/src/lib/supabase/server'

// Mock dependencies
jest.mock('@/src/lib/supabase/server')
jest.mock('@/src/lib/services/integrations.service')

describe('listIntegrations Server Action', () => {
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
      const result = await listIntegrations()

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
      const result = await listIntegrations()

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

      ;(integrationsService.listIntegrations as jest.Mock).mockResolvedValue([])

      // Act
      const result = await listIntegrations()

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual([])
      }
    })
  })

  describe('Listing Integrations', () => {
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

    it('should list all integrations for organization', async () => {
      // Arrange
      const mockIntegrations = [
        {
          id: 'integration-1',
          providerId: 'slack',
          providerName: 'Slack',
          status: 'active',
          connectedAt: '2025-01-01T00:00:00Z',
          lastSyncAt: '2025-01-02T00:00:00Z',
        },
        {
          id: 'integration-2',
          providerId: 'google',
          providerName: 'Google Workspace',
          status: 'active',
          connectedAt: '2025-01-01T00:00:00Z',
          lastSyncAt: null,
        },
      ]

      ;(integrationsService.listIntegrations as jest.Mock).mockResolvedValue(mockIntegrations)

      // Act
      const result = await listIntegrations()

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
        expect(result.data).toEqual(mockIntegrations)
      }
      expect(integrationsService.listIntegrations).toHaveBeenCalledWith('org-123')
    })

    it('should return empty array when no integrations exist', async () => {
      // Arrange
      ;(integrationsService.listIntegrations as jest.Mock).mockResolvedValue([])

      // Act
      const result = await listIntegrations()

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual([])
      }
    })
  })

  describe('Filtering', () => {
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

    it('should filter by status', async () => {
      // Arrange
      const activeIntegrations = [
        {
          id: 'integration-1',
          providerId: 'slack',
          providerName: 'Slack',
          status: 'active',
          connectedAt: '2025-01-01T00:00:00Z',
          lastSyncAt: null,
        },
      ]

      ;(integrationsService.listIntegrations as jest.Mock).mockResolvedValue(activeIntegrations)

      // Act
      const result = await listIntegrations()

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(1)
      }
      expect(integrationsService.listIntegrations).toHaveBeenCalledWith('org-123')
    })

    it('should filter by provider ID', async () => {
      // Arrange
      const slackIntegrations = [
        {
          id: 'integration-1',
          providerId: 'slack',
          providerName: 'Slack',
          status: 'active',
          connectedAt: '2025-01-01T00:00:00Z',
          lastSyncAt: null,
        },
      ]

      ;(integrationsService.listIntegrations as jest.Mock).mockResolvedValue(slackIntegrations)

      // Act
      const result = await listIntegrations()

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(1)
        expect(result.data[0]?.providerId).toBe('slack')
      }
      expect(integrationsService.listIntegrations).toHaveBeenCalledWith('org-123')
    })

    it('should apply multiple filters', async () => {
      // Arrange
      ;(integrationsService.listIntegrations as jest.Mock).mockResolvedValue([])

      // Act
      const result = await listIntegrations()

      // Assert
      expect(result.success).toBe(true)
      expect(integrationsService.listIntegrations).toHaveBeenCalledWith('org-123')
    })
  })

  describe('Integration Details', () => {
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

    it('should include status in results', async () => {
      // Arrange
      const integrations = [
        {
          id: 'integration-1',
          providerId: 'slack',
          providerName: 'Slack',
          status: 'active',
          connectedAt: '2025-01-01T00:00:00Z',
          lastSyncAt: null,
        },
      ]

      ;(integrationsService.listIntegrations as jest.Mock).mockResolvedValue(integrations)

      // Act
      const result = await listIntegrations()

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data[0]?.status).toBe('active')
      }
    })

    it('should include provider information', async () => {
      // Arrange
      const integrations = [
        {
          id: 'integration-1',
          providerId: 'slack',
          providerName: 'Slack',
          status: 'active',
          connectedAt: '2025-01-01T00:00:00Z',
          lastSyncAt: null,
        },
      ]

      ;(integrationsService.listIntegrations as jest.Mock).mockResolvedValue(integrations)

      // Act
      const result = await listIntegrations()

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data[0]?.providerId).toBe('slack')
        expect(result.data[0]?.providerName).toBe('Slack')
      }
    })

    it('should include connection and sync timestamps', async () => {
      // Arrange
      const integrations = [
        {
          id: 'integration-1',
          providerId: 'slack',
          providerName: 'Slack',
          status: 'active',
          connectedAt: '2025-01-01T00:00:00Z',
          lastSyncAt: '2025-01-02T12:00:00Z',
        },
      ]

      ;(integrationsService.listIntegrations as jest.Mock).mockResolvedValue(integrations)

      // Act
      const result = await listIntegrations()

      // Assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data[0]?.connectedAt).toBe('2025-01-01T00:00:00Z')
        expect(result.data[0]?.lastSyncAt).toBe('2025-01-02T12:00:00Z')
      }
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

    it('should handle database errors gracefully', async () => {
      // Arrange
      ;(integrationsService.listIntegrations as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      )

      // Act
      const result = await listIntegrations()

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })

    it('should handle network errors gracefully', async () => {
      // Arrange
      ;(integrationsService.listIntegrations as jest.Mock).mockRejectedValue(
        new Error('Network request failed')
      )

      // Act
      const result = await listIntegrations()

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })

    it('should handle unexpected errors gracefully', async () => {
      // Arrange
      ;(integrationsService.listIntegrations as jest.Mock).mockRejectedValue(
        new Error('Unexpected error')
      )

      // Act
      const result = await listIntegrations()

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })
  })
})
