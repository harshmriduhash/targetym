'use server'

import { createClient } from '@/src/lib/supabase/server'
import { recruitmentService } from '@/src/lib/services/recruitment.service'
import { createCandidateSchema, type CreateCandidateInput } from '@/src/lib/validations/recruitment.schemas'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'

export async function createCandidate(
  input: CreateCandidateInput
): Promise<ActionResponse<{ id: string }>> {
  return withActionRateLimit('create', async () => {
  try {
    const validated = createCandidateSchema.parse(input)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    // Get user's organization_id and role
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return errorResponse('User organization not found', 'NO_ORGANIZATION')
    }

    if (!['admin', 'manager', 'employee'].includes(profile.role)) {
      return errorResponse('Insufficient permissions', 'FORBIDDEN')
    }

    // SECURITY: Verify job posting belongs to user's organization
    const jobPosting = await recruitmentService.getJobPostingById(validated.job_posting_id)

    if (jobPosting.organization_id !== profile.organization_id) {
      return errorResponse('Job posting not found', 'FORBIDDEN')
    }

    // Create candidate with organization_id
    const candidate = await recruitmentService.createCandidate({
      ...validated,
      organization_id: profile.organization_id,
    })

    return successResponse({ id: candidate.id })
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
