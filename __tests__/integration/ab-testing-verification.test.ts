/**
 * A/B Testing Verification Tests
 *
 * Integration tests to verify the A/B testing system works end-to-end:
 * - Variant assignment consistency
 * - Distribution across users
 * - Feature flag rollout
 * - Experiment tracking
 */

import { ABTestingService, INTEGRATION_EXPERIMENTS } from '@/src/lib/analytics/ab-testing'
import { createClient } from '@/src/lib/supabase/server'

// Mock Supabase
jest.mock('@/src/lib/supabase/server')

describe('A/B Testing System Verification', () => {
  let mockSupabaseClient: any

  beforeEach(() => {
    // Create mock Supabase client
    mockSupabaseClient = {
      from: jest.fn(() => mockSupabaseClient),
      select: jest.fn(() => mockSupabaseClient),
      insert: jest.fn(() => mockSupabaseClient),
      update: jest.fn(() => mockSupabaseClient),
      eq: jest.fn(() => mockSupabaseClient),
      maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabaseClient)

    jest.clearAllMocks()
  })

  describe('Variant Assignment Consistency', () => {
    it('should assign same variant to same user across multiple calls', async () => {
      // Arrange
      const userId = 'consistent-user-123'
      const experimentId = INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION

      // First call creates assignment
      mockSupabaseClient.maybeSingle
        .mockResolvedValueOnce({ data: null, error: null }) // No existing assignment
        .mockResolvedValueOnce({
          data: { variant_id: 'control' },
          error: null,
        }) // Subsequent calls

      mockSupabaseClient.insert.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      // Act
      const variant1 = await ABTestingService.getVariant(userId, experimentId)
      const variant2 = await ABTestingService.getVariant(userId, experimentId)
      const variant3 = await ABTestingService.getVariant(userId, experimentId)

      // Assert
      expect(variant1.id).toBe(variant2.id)
      expect(variant2.id).toBe(variant3.id)
      expect(variant1.name).toBe(variant2.name)
      expect(variant1.config).toEqual(variant2.config)
    })

    it('should persist variant assignment in database', async () => {
      // Arrange
      const userId = 'user-persist-test'
      const experimentId = INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      mockSupabaseClient.insert.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      // Act
      await ABTestingService.getVariant(userId, experimentId)

      // Assert
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          experiment_id: experimentId,
          variant_id: expect.any(String),
          assigned_at: expect.any(String),
        })
      )
    })

    it('should use existing assignment from database', async () => {
      // Arrange
      const userId = 'user-existing-assignment'
      const experimentId = INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION
      const existingVariant = 'optimized'

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: { variant_id: existingVariant },
        error: null,
      })

      // Act
      const variant = await ABTestingService.getVariant(userId, experimentId)

      // Assert
      expect(variant.id).toBe(existingVariant)
      expect(mockSupabaseClient.insert).not.toHaveBeenCalled()
    })
  })

  describe('Variant Distribution', () => {
    it('should distribute users roughly evenly for 50/50 split', async () => {
      // Arrange
      const experimentId = INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION
      const sampleSize = 1000
      const variants: Record<string, number> = {}

      // Mock no existing assignments
      mockSupabaseClient.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      })

      mockSupabaseClient.insert.mockResolvedValue({
        data: null,
        error: null,
      })

      // Act - Sample 1000 users
      for (let i = 0; i < sampleSize; i++) {
        const userId = `test-user-${i}`
        const variant = await ABTestingService.getVariant(userId, experimentId)
        variants[variant.id] = (variants[variant.id] || 0) + 1
      }

      // Assert - Check distribution is approximately 50/50 (within 10% margin)
      const controlPercentage = (variants.control / sampleSize) * 100
      const optimizedPercentage = (variants.optimized / sampleSize) * 100

      expect(controlPercentage).toBeGreaterThan(40)
      expect(controlPercentage).toBeLessThan(60)
      expect(optimizedPercentage).toBeGreaterThan(40)
      expect(optimizedPercentage).toBeLessThan(60)

      // Total should be 100%
      expect(variants.control + variants.optimized).toBe(sampleSize)
    })

    it('should produce deterministic assignments based on user ID', async () => {
      // Arrange
      const experimentId = INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION

      mockSupabaseClient.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      })

      mockSupabaseClient.insert.mockResolvedValue({
        data: null,
        error: null,
      })

      // Act - Same user should always get same variant
      const assignments: Record<string, string> = {}
      const testUsers = ['user-a', 'user-b', 'user-c', 'user-d']

      for (const userId of testUsers) {
        const variant = await ABTestingService.getVariant(userId, experimentId)
        assignments[userId] = variant.id

        // Check consistency - call again
        const variant2 = await ABTestingService.getVariant(userId, experimentId)
        expect(variant2.id).toBe(variant.id)
      }

      // Assert - Distribution exists but is consistent per user
      expect(Object.keys(assignments).length).toBe(testUsers.length)
    })
  })

  describe('Feature Flags', () => {
    it('should enable feature at 100% rollout', async () => {
      // Arrange
      const userId = 'user-100-percent'
      const featureFlag = 'integration_slack_enabled'

      mockSupabaseClient.maybeSingle
        .mockResolvedValueOnce({ data: null, error: null }) // No override
        .mockResolvedValueOnce({
          data: { enabled: true, rollout_percentage: 100 },
          error: null,
        })

      // Act
      const isEnabled = await ABTestingService.isFeatureEnabled(userId, featureFlag)

      // Assert
      expect(isEnabled).toBe(true)
    })

    it('should distribute features at 50% rollout', async () => {
      // Arrange
      const featureFlag = 'integration_auto_sync'
      const sampleSize = 1000
      let enabledCount = 0

      // Mock setup: Each call needs two maybeSingle calls (override + flag)
      mockSupabaseClient.maybeSingle.mockImplementation(() => {
        // First call checks override (return null)
        return Promise.resolve({ data: null, error: null })
      })

      // Create a new mock for the from chain
      const mockFrom = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              maybeSingle: jest.fn(() =>
                Promise.resolve({ data: null, error: null })
              ),
            })),
            maybeSingle: jest.fn(() =>
              Promise.resolve({
                data: { enabled: true, rollout_percentage: 50 },
                error: null,
              })
            ),
          })),
          maybeSingle: jest.fn(() =>
            Promise.resolve({
              data: { enabled: true, rollout_percentage: 50 },
              error: null,
            })
          ),
        })),
      }))

      mockSupabaseClient.from = mockFrom

      // Act
      for (let i = 0; i < sampleSize; i++) {
        const isEnabled = await ABTestingService.isFeatureEnabled(`user-${i}`, featureFlag)
        if (isEnabled) enabledCount++
      }

      // Assert - Should be approximately 50% (within 10% margin)
      const percentage = (enabledCount / sampleSize) * 100
      expect(percentage).toBeGreaterThan(40)
      expect(percentage).toBeLessThan(60)
    })

    it('should disable feature at 0% rollout', async () => {
      // Arrange
      const userId = 'user-0-percent'
      const featureFlag = 'disabled_feature'

      mockSupabaseClient.maybeSingle
        .mockResolvedValueOnce({ data: null, error: null }) // No override
        .mockResolvedValueOnce({
          data: { enabled: true, rollout_percentage: 0 },
          error: null,
        })

      // Act
      const isEnabled = await ABTestingService.isFeatureEnabled(userId, featureFlag)

      // Assert
      expect(isEnabled).toBe(false)
    })

    it('should respect user-specific override', async () => {
      // Arrange
      const userId = 'vip-user'
      const featureFlag = 'beta_feature'

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: { enabled: true }, // Override enabled
        error: null,
      })

      // Act
      const isEnabled = await ABTestingService.isFeatureEnabled(userId, featureFlag)

      // Assert
      expect(isEnabled).toBe(true)
      // Should not check global flag if override exists
    })

    it('should return false for disabled feature flag', async () => {
      // Arrange
      const userId = 'user-disabled'
      const featureFlag = 'completely_disabled'

      mockSupabaseClient.maybeSingle
        .mockResolvedValueOnce({ data: null, error: null }) // No override
        .mockResolvedValueOnce({
          data: { enabled: false, rollout_percentage: 100 },
          error: null,
        })

      // Act
      const isEnabled = await ABTestingService.isFeatureEnabled(userId, featureFlag)

      // Assert
      expect(isEnabled).toBe(false)
    })

    it('should return false for non-existent feature flag', async () => {
      // Arrange
      const userId = 'user-non-existent'
      const featureFlag = 'non_existent_flag'

      mockSupabaseClient.maybeSingle
        .mockResolvedValueOnce({ data: null, error: null }) // No override
        .mockResolvedValueOnce({ data: null, error: null }) // No flag

      // Act
      const isEnabled = await ABTestingService.isFeatureEnabled(userId, featureFlag)

      // Assert
      expect(isEnabled).toBe(false)
    })
  })

  describe('Experiment Exposure Tracking', () => {
    it('should track experiment exposure without errors', async () => {
      // Arrange
      const userId = 'user-exposure-test'
      const experimentId = INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION
      const variantId = 'control'

      mockSupabaseClient.insert.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      // Act & Assert
      await expect(
        ABTestingService.trackExposure(userId, experimentId, variantId)
      ).resolves.not.toThrow()

      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          experiment_id: experimentId,
          variant_id: variantId,
          exposed_at: expect.any(String),
        })
      )
    })

    it('should handle multiple exposures for same user', async () => {
      // Arrange
      const userId = 'user-multiple-exposures'
      const experimentId = INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION
      const variantId = 'optimized'

      mockSupabaseClient.insert.mockResolvedValue({
        data: null,
        error: null,
      })

      // Act
      await ABTestingService.trackExposure(userId, experimentId, variantId)
      await ABTestingService.trackExposure(userId, experimentId, variantId)
      await ABTestingService.trackExposure(userId, experimentId, variantId)

      // Assert
      expect(mockSupabaseClient.insert).toHaveBeenCalledTimes(3)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle database errors gracefully in variant assignment', async () => {
      // Arrange
      const userId = 'user-db-error'
      const experimentId = INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection error' },
      })

      // Act & Assert - Should still return a variant (default)
      const variant = await ABTestingService.getVariant(userId, experimentId)
      expect(variant).toBeDefined()
      expect(variant.id).toBeTruthy()
    })

    it('should handle insert errors in assignment storage', async () => {
      // Arrange
      const userId = 'user-insert-error'
      const experimentId = INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      mockSupabaseClient.insert.mockResolvedValueOnce({
        data: null,
        error: { message: 'Insert failed' },
      })

      // Act - Should still assign variant even if storage fails
      const variant = await ABTestingService.getVariant(userId, experimentId)

      // Assert
      expect(variant).toBeDefined()
      expect(['control', 'optimized']).toContain(variant.id)
    })

    it('should return default variant for non-running experiment', async () => {
      // Arrange
      const userId = 'user-paused-experiment'
      const experimentId = 'paused_experiment'

      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      // Act
      const variant = await ABTestingService.getVariant(userId, experimentId)

      // Assert - Should return default control variant
      expect(variant.id).toBe('control')
      expect(variant.name).toBe('control')
    })

    it('should handle concurrent variant requests for same user', async () => {
      // Arrange
      const userId = 'user-concurrent'
      const experimentId = INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION

      mockSupabaseClient.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      })

      mockSupabaseClient.insert.mockResolvedValue({
        data: null,
        error: null,
      })

      // Act - Simulate concurrent requests
      const [variant1, variant2, variant3] = await Promise.all([
        ABTestingService.getVariant(userId, experimentId),
        ABTestingService.getVariant(userId, experimentId),
        ABTestingService.getVariant(userId, experimentId),
      ])

      // Assert - All should return same variant (deterministic hashing)
      expect(variant1.id).toBe(variant2.id)
      expect(variant2.id).toBe(variant3.id)
    })
  })

  describe('Real-World Scenarios', () => {
    it('should simulate complete user journey with A/B test', async () => {
      // Arrange
      const userId = 'user-journey-test'
      const experimentId = INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION

      // Step 1: User visits page, gets assigned variant
      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      mockSupabaseClient.insert.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      const variant = await ABTestingService.getVariant(userId, experimentId)

      // Step 2: Track exposure when user sees the variant
      mockSupabaseClient.insert.mockResolvedValueOnce({
        data: null,
        error: null,
      })

      await ABTestingService.trackExposure(userId, experimentId, variant.id)

      // Step 3: User returns later, should get same variant
      mockSupabaseClient.maybeSingle.mockResolvedValueOnce({
        data: { variant_id: variant.id },
        error: null,
      })

      const sameVariant = await ABTestingService.getVariant(userId, experimentId)

      // Assert
      expect(variant.id).toBe(sameVariant.id)
      expect(mockSupabaseClient.insert).toHaveBeenCalledTimes(2) // Assignment + exposure
    })

    it('should simulate gradual feature rollout', async () => {
      // Arrange
      const featureFlag = 'gradual_rollout_test'
      const cohortSize = 100

      // Initial rollout: 10%
      const mockFrom10 = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              maybeSingle: jest.fn(() =>
                Promise.resolve({ data: null, error: null })
              ),
            })),
            maybeSingle: jest.fn(() =>
              Promise.resolve({
                data: { enabled: true, rollout_percentage: 10 },
                error: null,
              })
            ),
          })),
          maybeSingle: jest.fn(() =>
            Promise.resolve({
              data: { enabled: true, rollout_percentage: 10 },
              error: null,
            })
          ),
        })),
      }))

      mockSupabaseClient.from = mockFrom10

      let enabledCount = 0
      for (let i = 0; i < cohortSize; i++) {
        const isEnabled = await ABTestingService.isFeatureEnabled(`user-${i}`, featureFlag)
        if (isEnabled) enabledCount++
      }

      const initialPercentage = (enabledCount / cohortSize) * 100

      // Assert - Should be around 10% (within margin)
      expect(initialPercentage).toBeGreaterThan(5)
      expect(initialPercentage).toBeLessThan(15)

      // Increased rollout: 50%
      const mockFrom50 = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              maybeSingle: jest.fn(() =>
                Promise.resolve({ data: null, error: null })
              ),
            })),
            maybeSingle: jest.fn(() =>
              Promise.resolve({
                data: { enabled: true, rollout_percentage: 50 },
                error: null,
              })
            ),
          })),
          maybeSingle: jest.fn(() =>
            Promise.resolve({
              data: { enabled: true, rollout_percentage: 50 },
              error: null,
            })
          ),
        })),
      }))

      mockSupabaseClient.from = mockFrom50

      enabledCount = 0
      for (let i = 0; i < cohortSize; i++) {
        const isEnabled = await ABTestingService.isFeatureEnabled(`user-${i}`, featureFlag)
        if (isEnabled) enabledCount++
      }

      const increasedPercentage = (enabledCount / cohortSize) * 100

      // Assert - Should be around 50%
      expect(increasedPercentage).toBeGreaterThan(40)
      expect(increasedPercentage).toBeLessThan(60)
    })
  })
})
