'use server'

import { createClient } from '@/src/lib/supabase/server'
import { performanceService } from '@/src/lib/services/performance.service'
import { createFeedbackSchema, type CreateFeedbackInput } from '@/src/lib/validations/performance.schemas'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import { withActionRateLimit } from '@/src/lib/middleware/action-rate-limit'

export async function createFeedback(
  input: CreateFeedbackInput
): Promise<ActionResponse<{ id: string }>> {
  return withActionRateLimit('create', async () => {
  try {
    const validated = createFeedbackSchema.parse(input)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    const feedback = await performanceService.createFeedback({
      ...validated,
      from_user_id: user.id,
    })

    return successResponse({ id: feedback.id })
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
