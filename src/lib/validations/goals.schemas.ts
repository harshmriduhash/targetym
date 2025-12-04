import { z } from 'zod'

export const createGoalSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(['draft', 'active', 'on_hold', 'completed', 'cancelled']).default('draft'),
  period: z.enum(['quarterly', 'semi-annual', 'annual', 'custom']),
  start_date: z.string().datetime().or(z.date()),
  end_date: z.string().datetime().or(z.date()),
  visibility: z.enum(['private', 'team', 'organization', 'public']).default('team'),
  parent_goal_id: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium').optional(),
  alignment_level: z.enum(['individual', 'team', 'department', 'company']).optional(),
  tags: z.array(z.string()).optional(),
}).refine((data) => {
  const start = new Date(data.start_date)
  const end = new Date(data.end_date)
  return end > start
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
})

export const updateGoalSchema = createGoalSchema.partial().extend({
  id: z.string().uuid(),
})

export const createKeyResultSchema = z.object({
  goal_id: z.string().uuid(),
  description: z.string().min(3).max(500),
  target_value: z.number().positive(),
  current_value: z.number().default(0),
  unit: z.string().max(50).optional(),
  weight: z.number().min(0.1).max(1).default(1),
})

export const updateKeyResultProgressSchema = z.object({
  key_result_id: z.string().uuid(),
  new_value: z.number(),
  notes: z.string().max(500).optional(),
})

export type CreateGoalInput = z.infer<typeof createGoalSchema>
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>
export type CreateKeyResultInput = z.infer<typeof createKeyResultSchema>
export type UpdateKeyResultProgressInput = z.infer<typeof updateKeyResultProgressSchema>
