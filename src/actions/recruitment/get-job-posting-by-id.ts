'use server'

import { createClient } from '@/src/lib/supabase/server'
import { recruitmentService } from '@/src/lib/services/recruitment.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import type { Database } from '@/src/types/database.types'
import { z } from 'zod'

type JobPosting = Database['public']['Tables']['job_postings']['Row']

const getJobPostingByIdSchema = z.object({
  jobPostingId: z.string().uuid('Invalid job posting ID'),
})

export type GetJobPostingByIdInput = z.infer<typeof getJobPostingByIdSchema>

/**
 * Get Job Posting By ID Server Action
 * Fetches a single job posting with all relations (hiring_manager, candidates)
 */
export async function getJobPostingById(
  input: GetJobPostingByIdInput
): Promise<ActionResponse<JobPosting>> {
  return withActionRateLimit('default', async () => {
  try {
    // 1. Validate input
    const validated = getJobPostingByIdSchema.parse(input)

    // 2. Get authenticated user from Supabase
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    // 3. Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return errorResponse('User organization not found', 'NO_ORGANIZATION')
    }

    // 4. Call service to get job posting
    const jobPosting = await recruitmentService.getJobPostingById(validated.jobPostingId)

    // 5. Verify job posting belongs to user's organization (security check)
    if (jobPosting.organization_id !== profile.organization_id) {
      return errorResponse('Job posting not found', 'NOT_FOUND')
    }

    return successResponse(jobPosting)
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
