'use server'

import { createClient } from '@/src/lib/supabase/server'
import { recruitmentService } from '@/src/lib/services/recruitment.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import type { Database } from '@/src/types/database.types'
import { z } from 'zod'

type Candidate = Database['public']['Tables']['candidates']['Row']

const getCandidateByIdSchema = z.object({
  candidateId: z.string().uuid('Invalid candidate ID'),
})

export type GetCandidateByIdInput = z.infer<typeof getCandidateByIdSchema>

/**
 * Get Candidate By ID Server Action
 * Fetches a single candidate with all relations (job_posting, interviews)
 */
export async function getCandidateById(
  input: GetCandidateByIdInput
): Promise<ActionResponse<Candidate>> {
  return withActionRateLimit('default', async () => {
  try {
    // 1. Validate input
    const validated = getCandidateByIdSchema.parse(input)

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

    // 4. Call service to get candidate
    const candidate = await recruitmentService.getCandidateById(validated.candidateId)

    // 5. Verify candidate belongs to user's organization (security check)
    if (candidate.organization_id !== profile.organization_id) {
      return errorResponse('Candidate not found', 'NOT_FOUND')
    }

    return successResponse(candidate)
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
