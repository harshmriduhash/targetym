'use server'

import { createClient } from '@/src/lib/supabase/server'
import { recruitmentService } from '@/src/lib/services/recruitment.service'
import { updateInterviewFeedbackSchema, type UpdateInterviewFeedbackInput } from '@/src/lib/validations/recruitment.schemas'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'

export async function updateInterviewFeedback(
  input: UpdateInterviewFeedbackInput
): Promise<ActionResponse<{ id: string }>> {
  return withActionRateLimit('default', async () => {
  try {
    const validated = updateInterviewFeedbackSchema.parse(input)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    // Verify the interviewer is the one giving feedback
    const interview = await recruitmentService.getInterviewById(validated.interview_id)

    if (interview.interviewer_id !== user.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || !['admin', 'manager'].includes(profile.role)) {
        return errorResponse('Only the interviewer or admin/manager can provide feedback', 'FORBIDDEN')
      }
    }

    const { interview_id, ...feedbackData } = validated

    await recruitmentService.updateInterviewFeedback(interview_id, feedbackData)

    return successResponse({ id: interview_id })
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
