/**
 * Validation schemas for A/B Testing Admin operations
 *
 * @module ABTestingSchemas
 */

import { z } from 'zod'

/**
 * Experiment variant schema
 */
export const experimentVariantSchema = z.object({
  id: z.string().min(1, 'Variant ID is required'),
  name: z.string().min(1, 'Variant name is required'),
  description: z.string().optional(),
  weight: z.number().int().min(0).max(100),
  config: z.record(z.unknown()).default({}),
})

/**
 * Create experiment schema
 */
export const createExperimentSchema = z.object({
  id: z
    .string()
    .min(1, 'Experiment ID is required')
    .regex(/^[a-z0-9_]+$/, 'ID must contain only lowercase letters, numbers, and underscores'),
  name: z.string().min(1, 'Experiment name is required').max(200),
  description: z.string().optional(),
  status: z.enum(['draft', 'running', 'paused', 'completed']).default('draft'),
  variants: z
    .array(experimentVariantSchema)
    .min(2, 'At least 2 variants required')
    .refine(
      (variants) => {
        const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0)
        return totalWeight === 100
      },
      { message: 'Variant weights must sum to 100' }
    ),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  targetPercentage: z.number().int().min(0).max(100).default(100),
  metadata: z.record(z.unknown()).optional(),
})

export type CreateExperimentInput = z.infer<typeof createExperimentSchema>

/**
 * Update experiment schema
 */
export const updateExperimentSchema = z.object({
  experimentId: z.string().min(1, 'Experiment ID is required'),
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'running', 'paused', 'completed']).optional(),
  variants: z
    .array(experimentVariantSchema)
    .min(2)
    .optional()
    .refine(
      (variants) => {
        if (!variants) return true
        const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0)
        return totalWeight === 100
      },
      { message: 'Variant weights must sum to 100' }
    ),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  targetPercentage: z.number().int().min(0).max(100).optional(),
  metadata: z.record(z.unknown()).optional(),
})

export type UpdateExperimentInput = z.infer<typeof updateExperimentSchema>

/**
 * Toggle experiment schema
 */
export const toggleExperimentSchema = z.object({
  experimentId: z.string().min(1, 'Experiment ID is required'),
})

export type ToggleExperimentInput = z.infer<typeof toggleExperimentSchema>

/**
 * Export experiment results schema
 */
export const exportExperimentSchema = z.object({
  experimentId: z.string().min(1, 'Experiment ID is required'),
  format: z.enum(['json', 'csv']).default('json'),
})

export type ExportExperimentInput = z.infer<typeof exportExperimentSchema>

/**
 * Create feature flag schema
 */
export const createFeatureFlagSchema = z.object({
  name: z
    .string()
    .min(1, 'Flag name is required')
    .max(100)
    .regex(/^[a-z0-9_]+$/, 'Name must contain only lowercase letters, numbers, and underscores'),
  description: z.string().optional(),
  enabled: z.boolean().default(false),
  rolloutPercentage: z.number().int().min(0).max(100).default(0),
  config: z.record(z.unknown()).default({}),
})

export type CreateFeatureFlagInput = z.infer<typeof createFeatureFlagSchema>

/**
 * Update feature flag schema
 */
export const updateFeatureFlagSchema = z.object({
  flagName: z.string().min(1, 'Flag name is required'),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
  rolloutPercentage: z.number().int().min(0).max(100).optional(),
  config: z.record(z.unknown()).optional(),
})

export type UpdateFeatureFlagInput = z.infer<typeof updateFeatureFlagSchema>

/**
 * Toggle feature flag schema
 */
export const toggleFeatureFlagSchema = z.object({
  flagName: z.string().min(1, 'Flag name is required'),
})

export type ToggleFeatureFlagInput = z.infer<typeof toggleFeatureFlagSchema>

/**
 * Create feature flag override schema
 */
export const createFeatureFlagOverrideSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  flagName: z.string().min(1, 'Flag name is required'),
  enabled: z.boolean(),
  reason: z.string().optional(),
})

export type CreateFeatureFlagOverrideInput = z.infer<
  typeof createFeatureFlagOverrideSchema
>

/**
 * Delete feature flag override schema
 */
export const deleteFeatureFlagOverrideSchema = z.object({
  overrideId: z.string().uuid('Invalid override ID'),
})

export type DeleteFeatureFlagOverrideInput = z.infer<
  typeof deleteFeatureFlagOverrideSchema
>

/**
 * Get experiment stats schema
 */
export const getExperimentStatsSchema = z.object({
  experimentId: z.string().min(1, 'Experiment ID is required'),
})

export type GetExperimentStatsInput = z.infer<typeof getExperimentStatsSchema>

/**
 * Get feature flag stats schema
 */
export const getFeatureFlagStatsSchema = z.object({
  flagName: z.string().min(1, 'Flag name is required'),
})

export type GetFeatureFlagStatsInput = z.infer<typeof getFeatureFlagStatsSchema>
