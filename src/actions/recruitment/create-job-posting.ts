'use server'

import { createClient } from '@/src/lib/supabase/server'
import { recruitmentService } from '@/src/lib/services/recruitment.service'
import { createJobPostingSchema, type CreateJobPostingInput } from '@/src/lib/validations/recruitment.schemas'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'

export async function createJobPosting(
  input: CreateJobPostingInput
): Promise<ActionResponse<{ id: string }>> {
  return withActionRateLimit('create', async () => {
  try {
    const validated = createJobPostingSchema.parse(input)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return errorResponse('Profile not found', 'NOT_FOUND')
    }

    // Only admin and manager can create job postings
    if (!['admin', 'manager'].includes(profile.role)) {
      return errorResponse('Insufficient permissions', 'FORBIDDEN')
    }

    const job = await recruitmentService.createJobPosting({
      ...validated,
      organization_id: profile.organization_id,
      posted_by: user.id,
    })

    return successResponse({ id: job.id })
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
