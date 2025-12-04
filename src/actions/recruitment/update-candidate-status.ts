'use server'

import { createClient } from '@/src/lib/supabase/server'
import { recruitmentService } from '@/src/lib/services/recruitment.service'
import { updateCandidateStatusSchema, type UpdateCandidateStatusInput } from '@/src/lib/validations/recruitment.schemas'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'

export async function updateCandidateStatus(
  input: UpdateCandidateStatusInput
): Promise<ActionResponse<{ id: string }>> {
  return withActionRateLimit('default', async () => {
  try {
    const validated = updateCandidateStatusSchema.parse(input)

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

    if (!['admin', 'manager'].includes(profile.role)) {
      return errorResponse('Insufficient permissions', 'FORBIDDEN')
    }

    // SECURITY: Verify candidate belongs to user's organization
    const candidate = await recruitmentService.getCandidateById(validated.candidate_id)

    if (candidate.organization_id !== profile.organization_id) {
      return errorResponse('Candidate not found', 'FORBIDDEN')
    }

    // Update candidate status
    await recruitmentService.updateCandidateStatus(
      validated.candidate_id,
      validated.status
    )

    return successResponse({ id: validated.candidate_id })
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
