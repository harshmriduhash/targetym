import { z } from 'zod'

export const createReviewCycleSchema = z.object({
  name: z.string().min(3).max(200),
  cycle_type: z.enum(['annual', 'semi_annual', 'quarterly', 'probation']),
  start_date: z.string().datetime().or(z.date()),
  end_date: z.string().datetime().or(z.date()),
  self_review_deadline: z.string().datetime().or(z.date()).optional(),
  manager_review_deadline: z.string().datetime().or(z.date()).optional(),
}).refine((data) => {
  const start = new Date(data.start_date)
  const end = new Date(data.end_date)
  return end > start
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
})

export const createPerformanceReviewSchema = z.object({
  review_cycle_id: z.string().uuid(),
  employee_id: z.string().uuid(),
  review_type: z.enum(['self', 'manager', 'peer', '360']),
  overall_rating: z.number().min(1).max(5).optional(),
  competencies: z.array(z.object({
    name: z.string(),
    rating: z.number().min(1).max(5),
    notes: z.string().optional(),
  })).optional(),
  strengths: z.string().max(2000).optional(),
  areas_for_improvement: z.string().max(2000).optional(),
  achievements: z.string().max(2000).optional(),
  goals_assessment: z.string().max(2000).optional(),
})

export const submitFeedbackSchema = z.object({
  recipient_id: z.string().uuid(),
  feedback_type: z.enum(['praise', 'constructive', 'general']),
  content: z.string().min(10).max(2000),
  is_anonymous: z.boolean().default(false),
  is_private: z.boolean().default(true),
  related_goal_id: z.string().uuid().optional(),
  related_project: z.string().max(200).optional(),
})

export const createDevelopmentPlanSchema = z.object({
  employee_id: z.string().uuid(),
  performance_review_id: z.string().uuid().optional(),
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  target_skills: z.array(z.string()).optional(),
  timeline: z.string().max(500).optional(),
})

export const updatePerformanceReviewSchema = z.object({
  review_type: z.enum(['self', 'manager', 'peer', '360']).optional(),
  overall_rating: z.number().min(1).max(5).optional(),
  competencies: z.array(z.object({
    name: z.string(),
    rating: z.number().min(1).max(5),
    notes: z.string().optional(),
  })).optional(),
  strengths: z.string().max(2000).optional(),
  areas_for_improvement: z.string().max(2000).optional(),
  achievements: z.string().max(2000).optional(),
  goals_assessment: z.string().max(2000).optional(),
  status: z.enum(['draft', 'submitted', 'approved']).optional(),
})

export type CreateReviewCycleInput = z.infer<typeof createReviewCycleSchema>
export type CreatePerformanceReviewInput = z.infer<typeof createPerformanceReviewSchema>
export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>
export type CreateDevelopmentPlanInput = z.infer<typeof createDevelopmentPlanSchema>
export type UpdatePerformanceReviewInput = z.infer<typeof updatePerformanceReviewSchema>
