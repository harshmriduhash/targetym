/**
 * A/B Testing Admin Service
 *
 * Administrative operations for managing experiments and feature flags
 *
 * @module ABTestingAdminService
 */

import { createClient } from '@/src/lib/supabase/server'
import type { Database } from '@/src/types/database.types'

type Tables = Database['public']['Tables']
type ABTestExperiment = Tables['ab_test_experiments']['Row']
type ABTestExperimentInsert = Tables['ab_test_experiments']['Insert']
type ABTestExperimentUpdate = Tables['ab_test_experiments']['Update']
type FeatureFlag = Tables['feature_flags']['Row']
type FeatureFlagInsert = Tables['feature_flags']['Insert']
type FeatureFlagUpdate = Tables['feature_flags']['Update']
type FeatureFlagOverride = Tables['feature_flag_overrides']['Row']
type FeatureFlagOverrideInsert = Tables['feature_flag_overrides']['Insert']

export interface ExperimentStats {
  experimentId: string
  totalAssignments: number
  totalExposures: number
  variantDistribution: {
    variantId: string
    variantName: string
    count: number
    percentage: number
  }[]
  assignmentsByDay: {
    date: string
    count: number
  }[]
}

export interface FeatureFlagStats {
  flagName: string
  enabledCount: number
  totalOverrides: number
  rolloutPercentage: number
}

/**
 * A/B Testing Admin Service
 *
 * Provides administrative operations for managing experiments and feature flags
 */
export class ABTestingAdminService {
  /**
   * List all experiments with optional filtering
   */
  async listExperiments(filters?: {
    status?: 'draft' | 'running' | 'paused' | 'completed'
  }): Promise<ABTestExperiment[]> {
    const supabase = await createClient()

    let query = supabase
      .from('ab_test_experiments')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to list experiments: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get experiment by ID
   */
  async getExperiment(experimentId: string): Promise<ABTestExperiment | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('ab_test_experiments')
      .select('*')
      .eq('id', experimentId)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to get experiment: ${error.message}`)
    }

    return data
  }

  /**
   * Get experiment statistics
   */
  async getExperimentStats(experimentId: string): Promise<ExperimentStats> {
    const supabase = await createClient()

    // Get experiment details
    const experiment = await this.getExperiment(experimentId)
    if (!experiment) {
      throw new Error('Experiment not found')
    }

    // Get total assignments
    const { count: totalAssignments } = await supabase
      .from('ab_test_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('experiment_id', experimentId)

    // Get total exposures
    const { count: totalExposures } = await supabase
      .from('ab_test_exposures')
      .select('*', { count: 'exact', head: true })
      .eq('experiment_id', experimentId)

    // Get variant distribution
    const { data: assignments } = await supabase
      .from('ab_test_assignments')
      .select('variant_id')
      .eq('experiment_id', experimentId)

    const variantCounts = new Map<string, number>()
    assignments?.forEach((assignment) => {
      const count = variantCounts.get(assignment.variant_id) || 0
      variantCounts.set(assignment.variant_id, count + 1)
    })

    const variants = (experiment.variants as any[]) || []
    const variantDistribution = variants.map((variant) => {
      const count = variantCounts.get(variant.id) || 0
      const percentage = totalAssignments ? (count / totalAssignments) * 100 : 0
      return {
        variantId: variant.id,
        variantName: variant.name,
        count,
        percentage: Math.round(percentage * 100) / 100,
      }
    })

    // Get assignments by day (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: dailyAssignments } = await supabase
      .from('ab_test_assignments')
      .select('assigned_at')
      .eq('experiment_id', experimentId)
      .gte('assigned_at', thirtyDaysAgo.toISOString())

    const assignmentsByDay = this.aggregateByDay(dailyAssignments || [])

    return {
      experimentId,
      totalAssignments: totalAssignments || 0,
      totalExposures: totalExposures || 0,
      variantDistribution,
      assignmentsByDay,
    }
  }

  /**
   * Create new experiment
   */
  async createExperiment(
    data: Omit<ABTestExperimentInsert, 'id'>
  ): Promise<ABTestExperiment> {
    const supabase = await createClient()

    const { data: insertedData, error } = await supabase
      .from('ab_test_experiments')
      .insert([data])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create experiment: ${error.message}`)
    }

    return insertedData
  }

  /**
   * Update experiment
   */
  async updateExperiment(
    experimentId: string,
    data: ABTestExperimentUpdate
  ): Promise<ABTestExperiment> {
    const supabase = await createClient()

    const { data: updatedData, error } = await supabase
      .from('ab_test_experiments')
      .update(data)
      .eq('id', experimentId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update experiment: ${error.message}`)
    }

    return updatedData
  }

  /**
   * Toggle experiment status (pause/resume)
   */
  async toggleExperiment(experimentId: string): Promise<ABTestExperiment> {
    const experiment = await this.getExperiment(experimentId)
    if (!experiment) {
      throw new Error('Experiment not found')
    }

    const newStatus =
      experiment.status === 'running'
        ? 'paused'
        : experiment.status === 'paused'
        ? 'running'
        : experiment.status

    return this.updateExperiment(experimentId, { status: newStatus })
  }

  /**
   * Get experiment assignments
   */
  async getExperimentAssignments(experimentId: string, limit = 100) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('ab_test_assignments')
      .select(
        `
        *,
        profiles:user_id (
          id,
          email,
          full_name
        )
      `
      )
      .eq('experiment_id', experimentId)
      .order('assigned_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to get assignments: ${error.message}`)
    }

    return data || []
  }

  /**
   * Export experiment results
   */
  async exportExperimentResults(experimentId: string): Promise<{
    experiment: ABTestExperiment
    stats: ExperimentStats
    assignments: any[]
  }> {
    const [experiment, stats, assignments] = await Promise.all([
      this.getExperiment(experimentId),
      this.getExperimentStats(experimentId),
      this.getExperimentAssignments(experimentId, 10000),
    ])

    if (!experiment) {
      throw new Error('Experiment not found')
    }

    return {
      experiment,
      stats,
      assignments,
    }
  }

  /**
   * List all feature flags
   */
  async listFeatureFlags(): Promise<FeatureFlag[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to list feature flags: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get feature flag by name
   */
  async getFeatureFlag(flagName: string): Promise<FeatureFlag | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('name', flagName)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to get feature flag: ${error.message}`)
    }

    return data
  }

  /**
   * Get feature flag statistics
   */
  async getFeatureFlagStats(flagName: string): Promise<FeatureFlagStats> {
    const supabase = await createClient()

    const flag = await this.getFeatureFlag(flagName)
    if (!flag) {
      throw new Error('Feature flag not found')
    }

    // Get total overrides
    const { count: totalOverrides } = await supabase
      .from('feature_flag_overrides')
      .select('*', { count: 'exact', head: true })
      .eq('flag_name', flagName)

    // Get enabled overrides
    const { count: enabledCount } = await supabase
      .from('feature_flag_overrides')
      .select('*', { count: 'exact', head: true })
      .eq('flag_name', flagName)
      .eq('enabled', true)

    return {
      flagName,
      enabledCount: enabledCount || 0,
      totalOverrides: totalOverrides || 0,
      rolloutPercentage: flag.rollout_percentage || 0,
    }
  }

  /**
   * Create feature flag
   */
  async createFeatureFlag(data: FeatureFlagInsert): Promise<FeatureFlag> {
    const supabase = await createClient()

    const { data: insertedData, error } = await supabase
      .from('feature_flags')
      .insert([data])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create feature flag: ${error.message}`)
    }

    return insertedData
  }

  /**
   * Update feature flag
   */
  async updateFeatureFlag(
    flagName: string,
    data: FeatureFlagUpdate
  ): Promise<FeatureFlag> {
    const supabase = await createClient()

    const { data: updatedData, error } = await supabase
      .from('feature_flags')
      .update(data)
      .eq('name', flagName)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update feature flag: ${error.message}`)
    }

    return updatedData
  }

  /**
   * Toggle feature flag
   */
  async toggleFeatureFlag(flagName: string): Promise<FeatureFlag> {
    const flag = await this.getFeatureFlag(flagName)
    if (!flag) {
      throw new Error('Feature flag not found')
    }

    return this.updateFeatureFlag(flagName, { enabled: !flag.enabled })
  }

  /**
   * List feature flag overrides
   */
  async listFeatureFlagOverrides(
    flagName?: string
  ): Promise<FeatureFlagOverride[]> {
    const supabase = await createClient()

    let query = supabase
      .from('feature_flag_overrides')
      .select(
        `
        *,
        profiles:user_id (
          id,
          email,
          full_name
        )
      `
      )
      .order('created_at', { ascending: false })

    if (flagName) {
      query = query.eq('flag_name', flagName)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to list overrides: ${error.message}`)
    }

    return data || []
  }

  /**
   * Create feature flag override
   */
  async createFeatureFlagOverride(
    data: FeatureFlagOverrideInsert
  ): Promise<FeatureFlagOverride> {
    const supabase = await createClient()

    const { data: insertedData, error } = await supabase
      .from('feature_flag_overrides')
      .insert([data])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create override: ${error.message}`)
    }

    return insertedData
  }

  /**
   * Delete feature flag override
   */
  async deleteFeatureFlagOverride(overrideId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('feature_flag_overrides')
      .delete()
      .eq('id', overrideId)

    if (error) {
      throw new Error(`Failed to delete override: ${error.message}`)
    }
  }

  /**
   * Helper: Aggregate assignments by day
   */
  private aggregateByDay(
    assignments: { assigned_at: string | null }[]
  ): { date: string; count: number }[] {
    const counts = new Map<string, number>()

    assignments.forEach((assignment) => {
      if (!assignment.assigned_at) return

      const date = new Date(assignment.assigned_at).toISOString().split('T')[0]
      counts.set(date, (counts.get(date) || 0) + 1)
    })

    return Array.from(counts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }
}

// Singleton export
export const abTestingAdminService = new ABTestingAdminService()
