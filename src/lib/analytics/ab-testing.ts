/**
 * A/B Testing Infrastructure
 *
 * Feature experimentation and variant assignment for integrations
 *
 * @module ABTesting
 */


import { createClient } from '@/src/lib/supabase/server'

export interface Experiment {
  id: string
  name: string
  description: string
  status: 'draft' | 'running' | 'paused' | 'completed'
  variants: ExperimentVariant[]
  startDate: string | null
  endDate: string | null
  targetPercentage: number
  metadata?: Record<string, unknown>
}

export interface ExperimentVariant {
  id: string
  name: string
  description: string
  weight: number
  config: Record<string, unknown>
}

export interface UserAssignment {
  userId: string
  experimentId: string
  variantId: string
  assignedAt: string
}

/**
 * Integration feature experiments
 */
export const INTEGRATION_EXPERIMENTS = {
  OAUTH_FLOW_OPTIMIZATION: 'oauth_flow_optimization',
  PROVIDER_ONBOARDING_UX: 'provider_onboarding_ux',
  WEBHOOK_RETRY_STRATEGY: 'webhook_retry_strategy',
  TOKEN_REFRESH_TIMING: 'token_refresh_timing',
} as const

/**
 * A/B Testing Service
 *
 * Manages feature experiments and variant assignments
 */
export class ABTestingService {
  /**
   * Get or assign user to experiment variant
   *
   * Uses consistent hashing to assign users to variants
   * Stores assignment in database for consistency
   *
   * @param userId - User ID
   * @param experimentId - Experiment ID
   * @returns Assigned variant
   *
   * @example
   * ```typescript
   * const variant = await ABTestingService.getVariant(
   *   'user123',
   *   INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION
   * )
   *
   * if (variant.name === 'new_flow') {
   *   // Use new OAuth flow
   * } else {
   *   // Use control flow
   * }
   * ```
   */
  static async getVariant(
    userId: string,
    experimentId: string
  ): Promise<ExperimentVariant> {
    const supabase = await createClient()

    // 1. Check if user already assigned
    const { data: existingAssignment } = await supabase
      .from('ab_test_assignments')
      .select('variant_id')
      .eq('user_id', userId)
      .eq('experiment_id', experimentId)
      .maybeSingle()

    if (existingAssignment) {
      return this.getVariantById(experimentId, existingAssignment.variant_id)
    }

    // 2. Get experiment configuration
    const experiment = await this.getExperiment(experimentId)

    if (!experiment || experiment.status !== 'running') {
      // Return control variant if experiment not running
      return experiment?.variants[0] || this.getDefaultVariant()
    }

    // 3. Assign variant using consistent hashing
    const variantId = this.assignVariant(userId, experiment.variants)

    // 4. Store assignment
    await supabase.from('ab_test_assignments').insert({
      user_id: userId,
      experiment_id: experimentId,
      variant_id: variantId,
      assigned_at: new Date().toISOString(),
    })

    return this.getVariantById(experimentId, variantId)
  }

  /**
   * Check if feature is enabled for user
   *
   * @param userId - User ID
   * @param featureFlag - Feature flag name
   * @returns Whether feature is enabled
   *
   * @example
   * ```typescript
   * const isEnabled = await ABTestingService.isFeatureEnabled(
   *   'user123',
   *   'new_oauth_flow'
   * )
   * ```
   */
  static async isFeatureEnabled(
    userId: string,
    featureFlag: string
  ): Promise<boolean> {
    const supabase = await createClient()

    // Check user-specific override
    const { data: override } = await supabase
      .from('feature_flag_overrides')
      .select('enabled')
      .eq('user_id', userId)
      .eq('flag_name', featureFlag)
      .maybeSingle()

    if (override !== null) {
      return override.enabled
    }

    // Check global feature flag
    const { data: flag } = await supabase
      .from('feature_flags')
      .select('enabled, rollout_percentage')
      .eq('name', featureFlag)
      .maybeSingle()

    if (!flag || !flag.enabled) {
      return false
    }

    // Check rollout percentage
    if (flag.rollout_percentage < 100) {
      const hash = this.hashString(userId + featureFlag)
      const bucket = hash % 100
      return bucket < flag.rollout_percentage
    }

    return true
  }

  /**
   * Track experiment exposure
   *
   * Records when a user is exposed to an experiment variant
   *
   * @param userId - User ID
   * @param experimentId - Experiment ID
   * @param variantId - Variant ID
   */
  static async trackExposure(
    userId: string,
    experimentId: string,
    variantId: string
  ): Promise<void> {
    const supabase = await createClient()

    await supabase.from('ab_test_exposures').insert({
      user_id: userId,
      experiment_id: experimentId,
      variant_id: variantId,
      exposed_at: new Date().toISOString(),
    })
  }

  /**
   * Get experiment configuration (internal)
   *
   * @private
   */
  private static async getExperiment(experimentId: string): Promise<Experiment | null> {
    // In production, fetch from database or feature flag service
    // For now, return mock experiment
    const experiments: Record<string, Experiment> = {
      [INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION]: {
        id: INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION,
        name: 'OAuth Flow Optimization',
        description: 'Test optimized OAuth flow with better UX',
        status: 'running',
        variants: [
          {
            id: 'control',
            name: 'control',
            description: 'Current OAuth flow',
            weight: 50,
            config: { useNewFlow: false },
          },
          {
            id: 'optimized',
            name: 'optimized',
            description: 'Optimized OAuth flow',
            weight: 50,
            config: { useNewFlow: true },
          },
        ],
        startDate: '2025-01-01',
        endDate: null,
        targetPercentage: 100,
      },
    }

    return experiments[experimentId] || null
  }

  /**
   * Get variant by ID (internal)
   *
   * @private
   */
  private static async getVariantById(
    experimentId: string,
    variantId: string
  ): Promise<ExperimentVariant> {
    const experiment = await this.getExperiment(experimentId)
    const variant = experiment?.variants.find((v) => v.id === variantId)
    return variant || this.getDefaultVariant()
  }

  /**
   * Assign variant using consistent hashing (internal)
   *
   * @private
   */
  private static assignVariant(
    userId: string,
    variants: ExperimentVariant[]
  ): string {
    const hash = this.hashString(userId)
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0)
    const bucket = hash % totalWeight

    let cumulativeWeight = 0
    for (const variant of variants) {
      cumulativeWeight += variant.weight
      if (bucket < cumulativeWeight) {
        return variant.id
      }
    }

    return variants[0].id
  }

  /**
   * Simple hash function (internal)
   *
   * @private
   */
  private static hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }

  /**
   * Get default control variant (internal)
   *
   * @private
   */
  private static getDefaultVariant(): ExperimentVariant {
    return {
      id: 'control',
      name: 'control',
      description: 'Default control variant',
      weight: 100,
      config: {},
    }
  }
}
