'use server'

import { createClient } from '@/src/lib/supabase/server'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import { z } from 'zod'

const deleteCandidateSchema = z.object({
  candidateId: z.string().uuid('Invalid candidate ID'),
})

export type DeleteCandidateInput = z.infer<typeof deleteCandidateSchema>

/**
 * Delete Candidate Server Action
 * Soft deletes a candidate (only HR or hiring manager can delete)
 */
export async function deleteCandidate(
  input: DeleteCandidateInput
): Promise<ActionResponse<{ success: true }>> {
  return withActionRateLimit('default', async () => {
  try {
    // 1. Validate input
    const validated = deleteCandidateSchema.parse(input)

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

    // 4. Get candidate to check authorization
    const { data: candidate, error: fetchError } = await supabase
      .from('candidates')
      .select(`
        id,
        organization_id,
        job_posting:job_postings(id, hiring_manager_id)
      `)
      .eq('id', validated.candidateId)
      .eq('organization_id', profile.organization_id)
      .maybeSingle()

    if (fetchError || !candidate) {
      return errorResponse('Candidate not found', 'NOT_FOUND')
    }

    // 5. Check authorization (admin, hr, or hiring manager)
    const isHiringManager = candidate.job_posting?.hiring_manager_id === user.id
    const isAuthorized = ['admin', 'hr'].includes(profile.role) || isHiringManager

    if (!isAuthorized) {
      return errorResponse('Only HR or hiring manager can delete candidates', 'FORBIDDEN')
    }

    // 6. Soft delete the candidate
    const { error: deleteError } = await supabase
      .from('candidates')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', validated.candidateId)

    if (deleteError) {
      throw new Error(`Failed to delete candidate: ${deleteError.message}`)
    }

    return successResponse({ success: true })
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
