'use server'

import { createClient } from '@/src/lib/supabase/server'
import { recruitmentService } from '@/src/lib/services/recruitment.service'
import { updateJobPostingSchema, type UpdateJobPostingInput } from '@/src/lib/validations/recruitment.schemas'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'

export async function updateJobPosting(
  id: string,
  input: UpdateJobPostingInput
): Promise<ActionResponse<{ id: string }>> {
  return withActionRateLimit('default', async () => {
  try {
    const validated = updateJobPostingSchema.parse(input)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'manager'].includes(profile.role)) {
      return errorResponse('Insufficient permissions', 'FORBIDDEN')
    }

    await recruitmentService.updateJobPosting(id, validated)

    return successResponse({ id })
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
