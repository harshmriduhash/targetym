'use server'

import { createClient } from '@/src/lib/supabase/server'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import { z } from 'zod'

const deleteJobPostingSchema = z.object({
  jobPostingId: z.string().uuid('Invalid job posting ID'),
})

export type DeleteJobPostingInput = z.infer<typeof deleteJobPostingSchema>

/**
 * Delete Job Posting Server Action
 * Soft deletes a job posting (only creator or HR admin can delete)
 */
export async function deleteJobPosting(
  input: DeleteJobPostingInput
): Promise<ActionResponse<{ success: true }>> {
  return withActionRateLimit('default', async () => {
  try {
    // 1. Validate input
    const validated = deleteJobPostingSchema.parse(input)

    // 2. Get authenticated user from Supabase
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    // 3. Get user's organization and role
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return errorResponse('User organization not found', 'NO_ORGANIZATION')
    }

    // 4. Get job posting to check ownership
    const { data: jobPosting, error: fetchError } = await supabase
      .from('job_postings')
      .select('id, created_by, organization_id')
      .eq('id', validated.jobPostingId)
      .eq('organization_id', profile.organization_id)
      .maybeSingle()

    if (fetchError || !jobPosting) {
      return errorResponse('Job posting not found', 'NOT_FOUND')
    }

    // 5. Check authorization (creator or admin/hr role)
    const isCreator = jobPosting.created_by === user.id
    const isAuthorized = isCreator || ['admin', 'hr'].includes(profile.role)

    if (!isAuthorized) {
      return errorResponse('Only the creator or HR admin can delete this job posting', 'FORBIDDEN')
    }

    // 6. Soft delete the job posting
    const { error: deleteError } = await supabase
      .from('job_postings')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', validated.jobPostingId)

    if (deleteError) {
      throw new Error(`Failed to delete job posting: ${deleteError.message}`)
    }

    return successResponse({ success: true })
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
