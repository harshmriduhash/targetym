import { z } from 'zod'

// ============================================================================
// KPI Schemas
// ============================================================================

export const createKpiSchema = z.object({
  name: z.string().min(3, 'KPI name must be at least 3 characters').max(200),
  description: z.string().max(2000).optional(),
  category: z.enum([
    'revenue',
    'customer',
    'operational',
    'employee',
    'quality',
    'efficiency',
    'custom',
  ]),
  metric_type: z.enum(['number', 'percentage', 'currency', 'ratio', 'boolean']).default('number'),
  unit: z.string().max(50).optional(),
  target_value: z.number().optional(),
  current_value: z.number().default(0),
  baseline_value: z.number().optional(),
  target_min: z.number().optional(),
  target_max: z.number().optional(),
  measurement_frequency: z
    .enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually'])
    .default('monthly'),
  department: z.string().max(100).optional(),
  aligned_goal_id: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  visibility: z.enum(['private', 'team', 'department', 'organization']).default('team'),
  data_source: z.string().max(100).optional(),
  auto_update_enabled: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
}).refine((data) => {
  // Validate that target_max >= target_min if both are provided
  if (data.target_min !== undefined && data.target_max !== undefined) {
    return data.target_max >= data.target_min
  }
  return true
}, {
  message: 'Maximum target must be greater than or equal to minimum target',
  path: ['target_max'],
})

export const updateKpiSchema = createKpiSchema.partial().extend({
  id: z.string().uuid(),
  status: z.enum(['on_track', 'at_risk', 'below_target', 'above_target', 'needs_attention']).optional(),
  is_active: z.boolean().optional(),
})

// ============================================================================
// KPI Measurement Schemas
// ============================================================================

export const createKpiMeasurementSchema = z.object({
  kpi_id: z.string().uuid(),
  measured_value: z.number(),
  measured_at: z.string().datetime().or(z.date()).optional(),
  measurement_period_start: z.string().datetime().or(z.date()).optional(),
  measurement_period_end: z.string().datetime().or(z.date()).optional(),
  notes: z.string().max(1000).optional(),
  measurement_source: z.enum(['manual', 'automated', 'api', 'integration']).default('manual'),
  metadata: z.record(z.string(), z.any()).optional(),
}).refine((data) => {
  // Validate measurement period
  if (data.measurement_period_start && data.measurement_period_end) {
    const start = new Date(data.measurement_period_start)
    const end = new Date(data.measurement_period_end)
    return end >= start
  }
  return true
}, {
  message: 'End date must be after or equal to start date',
  path: ['measurement_period_end'],
})

export const updateKpiMeasurementSchema = z.object({
  id: z.string().uuid(),
  measured_value: z.number().optional(),
  notes: z.string().max(1000).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

// ============================================================================
// KPI Alert Schemas
// ============================================================================

export const createKpiAlertSchema = z.object({
  kpi_id: z.string().uuid(),
  alert_type: z.enum([
    'threshold_breach',
    'target_achieved',
    'trend_change',
    'missing_data',
    'custom',
  ]),
  condition: z.string().min(1, 'Condition is required'),
  threshold_value: z.number().optional(),
  notify_users: z.array(z.string().uuid()).min(1, 'At least one user must be notified'),
  notification_channels: z.array(z.enum(['in_app', 'email', 'slack', 'teams'])).default(['in_app']),
  is_active: z.boolean().default(true),
})

export const updateKpiAlertSchema = createKpiAlertSchema.partial().extend({
  id: z.string().uuid(),
})

// ============================================================================
// Bulk Operations Schemas
// ============================================================================

export const bulkUpdateKpiMeasurementsSchema = z.object({
  measurements: z.array(
    z.object({
      kpi_id: z.string().uuid(),
      measured_value: z.number(),
      measured_at: z.string().datetime().or(z.date()).optional(),
    })
  ).min(1, 'At least one measurement is required'),
})

// ============================================================================
// Query/Filter Schemas
// ============================================================================

export const kpiFilterSchema = z.object({
  category: z.enum(['revenue', 'customer', 'operational', 'employee', 'quality', 'efficiency', 'custom']).optional(),
  status: z.enum(['on_track', 'at_risk', 'below_target', 'above_target', 'needs_attention']).optional(),
  owner_id: z.string().uuid().optional(),
  department: z.string().optional(),
  is_active: z.boolean().optional(),
  aligned_goal_id: z.string().uuid().optional(),
  visibility: z.enum(['private', 'team', 'department', 'organization']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const kpiMeasurementFilterSchema = z.object({
  kpi_id: z.string().uuid().optional(),
  measured_by: z.string().uuid().optional(),
  measurement_source: z.enum(['manual', 'automated', 'api', 'integration']).optional(),
  start_date: z.string().datetime().or(z.date()).optional(),
  end_date: z.string().datetime().or(z.date()).optional(),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    const start = new Date(data.start_date)
    const end = new Date(data.end_date)
    return end >= start
  }
  return true
}, {
  message: 'End date must be after or equal to start date',
  path: ['end_date'],
})

// ============================================================================
// Type Exports
// ============================================================================

export type CreateKpiInput = z.infer<typeof createKpiSchema>
export type UpdateKpiInput = z.infer<typeof updateKpiSchema>
export type CreateKpiMeasurementInput = z.infer<typeof createKpiMeasurementSchema>
export type UpdateKpiMeasurementInput = z.infer<typeof updateKpiMeasurementSchema>
export type CreateKpiAlertInput = z.infer<typeof createKpiAlertSchema>
export type UpdateKpiAlertInput = z.infer<typeof updateKpiAlertSchema>
export type BulkUpdateKpiMeasurementsInput = z.infer<typeof bulkUpdateKpiMeasurementsSchema>
export type KpiFilterInput = z.infer<typeof kpiFilterSchema>
export type KpiMeasurementFilterInput = z.infer<typeof kpiMeasurementFilterSchema>
