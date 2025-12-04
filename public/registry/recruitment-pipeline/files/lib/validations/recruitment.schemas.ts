import { z } from 'zod'

export const createJobPostingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(50),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  department: z.string().max(100).optional(),
  location: z.string().max(200),
  employment_type: z.enum(['full_time', 'part_time', 'contract', 'internship']),
  salary_range_min: z.number().positive().optional(),
  salary_range_max: z.number().positive().optional(),
  currency: z.string().length(3).default('USD'),
  hiring_manager_id: z.string().uuid().optional(),
  recruiter_id: z.string().uuid().optional(),
}).refine((data) => {
  if (data.salary_range_min && data.salary_range_max) {
    return data.salary_range_max >= data.salary_range_min
  }
  return true
}, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['salary_range_max'],
})

export const createCandidateSchema = z.object({
  job_posting_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(50).optional().or(z.literal('')),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  portfolio_url: z.string().url().optional().or(z.literal('')),
  cv_url: z.string().optional(),
  cover_letter: z.string().max(5000).optional().or(z.literal('')),
  source: z.string().max(100).optional().or(z.literal('')),
})

export const scheduleInterviewSchema = z.object({
  candidate_id: z.string().uuid(),
  job_posting_id: z.string().uuid().optional(),
  interview_type: z.enum(['phone', 'video', 'onsite', 'technical', 'behavioral', 'panel']),
  scheduled_at: z.string().datetime().or(z.date()),
  duration_minutes: z.number().int().positive().default(60),
  location: z.string().max(200).optional(),
  meeting_link: z.string().url().optional().or(z.literal('')),
  interviewers: z.string().min(1, 'Au moins un intervieweur est requis'),
  notes: z.string().optional().or(z.literal('')),
  send_calendar_invite: z.boolean().default(true),
  send_preparation_email: z.boolean().default(true),
  reminder_hours: z.number().int().positive().default(24),
})

export const submitInterviewFeedbackSchema = z.object({
  interview_id: z.string().uuid(),
  feedback: z.string().min(10),
  rating: z.number().min(1).max(5),
  recommendation: z.enum(['strong_yes', 'yes', 'neutral', 'no', 'strong_no']),
  feedback_items: z.array(z.object({
    category: z.string(),
    rating: z.number().min(1).max(5),
    notes: z.string().optional(),
  })).optional(),
})

export const updateCandidateStatusSchema = z.object({
  candidate_id: z.string().uuid(),
  status: z.enum(['applied', 'screening', 'interviewing', 'offered', 'hired', 'rejected']),
  notes: z.string().optional(),
})

export type CreateJobPostingInput = z.infer<typeof createJobPostingSchema>
export type CreateCandidateInput = z.infer<typeof createCandidateSchema>
export type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>
export type SubmitInterviewFeedbackInput = z.infer<typeof submitInterviewFeedbackSchema>
export type UpdateCandidateStatusInput = z.infer<typeof updateCandidateStatusSchema>
