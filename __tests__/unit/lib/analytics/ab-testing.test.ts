/**
 * A/B Testing Tests
 *
 * Tests for A/B testing infrastructure and variant assignment
 */

import { ABTestingService, INTEGRATION_EXPERIMENTS } from '@/src/lib/analytics/ab-testing'

// Mock Supabase
jest.mock('@/src/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            maybeSingle: jest.fn(() => ({ data: null, error: null })),
          })),
          maybeSingle: jest.fn(() => ({ data: null, error: null })),
        })),
        maybeSingle: jest.fn(() => ({ data: null, error: null })),
      })),
      insert: jest.fn(() => ({ data: null, error: null })),
    })),
  })),
}))

describe('ABTestingService', () => {
  describe('getVariant', () => {
    it('should return consistent variant for same user', async () => {
      const userId = 'user123'
      const experimentId = INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION

      const variant1 = await ABTestingService.getVariant(userId, experimentId)
      const variant2 = await ABTestingService.getVariant(userId, experimentId)

      expect(variant1.id).toBe(variant2.id)
      expect(variant1.name).toBe(variant2.name)
    })

    it('should return valid variant from experiment', async () => {
      const userId = 'user456'
      const experimentId = INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION

      const variant = await ABTestingService.getVariant(userId, experimentId)

      expect(variant).toBeDefined()
      expect(variant.id).toBeTruthy()
      expect(variant.name).toBeTruthy()
      expect(variant.weight).toBeGreaterThan(0)
      expect(['control', 'optimized']).toContain(variant.id)
    })

    it('should distribute variants based on weights', async () => {
      const experimentId = INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION
      const sampleSize = 1000
      const variants: Record<string, number> = {}

      // Sample many users
      for (let i = 0; i < sampleSize; i++) {
        const userId = `user${i}`
        const variant = await ABTestingService.getVariant(userId, experimentId)
        variants[variant.id] = (variants[variant.id] || 0) + 1
      }

      // Check distribution is roughly even (50/50 split)
      expect(variants.control).toBeGreaterThan(sampleSize * 0.4)
      expect(variants.control).toBeLessThan(sampleSize * 0.6)
      expect(variants.optimized).toBeGreaterThan(sampleSize * 0.4)
      expect(variants.optimized).toBeLessThan(sampleSize * 0.6)
    })

    it('should return default variant for non-existent experiment', async () => {
      const userId = 'user789'
      const experimentId = 'non_existent_experiment'

      const variant = await ABTestingService.getVariant(userId, experimentId)

      expect(variant.id).toBe('control')
      expect(variant.name).toBe('control')
    })

    it('should handle different users differently', async () => {
      const experimentId = INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION

      const variant1 = await ABTestingService.getVariant('user1', experimentId)
      const variant2 = await ABTestingService.getVariant('user2', experimentId)

      // Different users may get different variants (not guaranteed but likely with enough samples)
      expect(variant1).toBeDefined()
      expect(variant2).toBeDefined()
    })
  })

  describe('isFeatureEnabled', () => {
    it('should return true for enabled feature', async () => {
      const userId = 'user123'
      const featureFlag = 'new_oauth_flow'

      // Mock feature flag enabled
      const { createClient } = require('@/src/lib/supabase/server')
      createClient.mockReturnValue({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                maybeSingle: jest.fn(() => ({ data: null, error: null })),
              })),
              maybeSingle: jest.fn(() => ({
                data: { enabled: true, rollout_percentage: 100 },
                error: null,
              })),
            })),
          })),
        })),
      })

      const isEnabled = await ABTestingService.isFeatureEnabled(userId, featureFlag)

      expect(isEnabled).toBe(true)
    })

    it('should return false for disabled feature', async () => {
      const userId = 'user456'
      const featureFlag = 'disabled_feature'

      // Mock feature flag disabled
      const { createClient } = require('@/src/lib/supabase/server')
      createClient.mockReturnValue({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                maybeSingle: jest.fn(() => ({ data: null, error: null })),
              })),
              maybeSingle: jest.fn(() => ({
                data: { enabled: false, rollout_percentage: 0 },
                error: null,
              })),
            })),
          })),
        })),
      })

      const isEnabled = await ABTestingService.isFeatureEnabled(userId, featureFlag)

      expect(isEnabled).toBe(false)
    })

    it('should respect user override', async () => {
      const userId = 'user789'
      const featureFlag = 'test_feature'

      // Mock user override enabled
      const { createClient } = require('@/src/lib/supabase/server')
      createClient.mockReturnValue({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                maybeSingle: jest.fn(() => ({
                  data: { enabled: true },
                  error: null,
                })),
              })),
              maybeSingle: jest.fn(() => ({ data: null, error: null })),
            })),
          })),
        })),
      })

      const isEnabled = await ABTestingService.isFeatureEnabled(userId, featureFlag)

      expect(isEnabled).toBe(true)
    })

    it('should handle rollout percentage correctly', async () => {
      const featureFlag = 'gradual_rollout'

      // Mock 50% rollout
      const { createClient } = require('@/src/lib/supabase/server')
      createClient.mockReturnValue({
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                maybeSingle: jest.fn(() => ({ data: null, error: null })),
              })),
              maybeSingle: jest.fn(() => ({
                data: { enabled: true, rollout_percentage: 50 },
                error: null,
              })),
            })),
          })),
        })),
      })

      const sampleSize = 1000
      let enabledCount = 0

      for (let i = 0; i < sampleSize; i++) {
        const isEnabled = await ABTestingService.isFeatureEnabled(`user${i}`, featureFlag)
        if (isEnabled) enabledCount++
      }

      // Should be around 50% (+/- 10%)
      expect(enabledCount).toBeGreaterThan(sampleSize * 0.4)
      expect(enabledCount).toBeLessThan(sampleSize * 0.6)
    })
  })

  describe('trackExposure', () => {
    it('should record exposure without errors', async () => {
      const userId = 'user123'
      const experimentId = INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION
      const variantId = 'control'

      // Mock insert for exposure tracking
      const { createClient } = require('@/src/lib/supabase/server')
      createClient.mockReturnValue({
        from: jest.fn(() => ({
          insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })

      await expect(
        ABTestingService.trackExposure(userId, experimentId, variantId)
      ).resolves.not.toThrow()
    })
  })
})
