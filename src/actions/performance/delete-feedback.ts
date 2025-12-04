'use server'

import { createClient } from '@/src/lib/supabase/server'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import { withActionRateLimit } from '@/src/lib/middleware/action-rate-limit'
import { z } from 'zod'

const deleteFeedbackSchema = z.object({
  feedbackId: z.string().uuid('Invalid feedback ID'),
})

export type DeleteFeedbackInput = z.infer<typeof deleteFeedbackSchema>

/**
 * Delete Peer Feedback Server Action
 * Soft deletes peer feedback (only creator or admin/hr can delete)
 */
export async function deleteFeedback(
  input: DeleteFeedbackInput
): Promise<ActionResponse<{ success: true }>> {
  return withActionRateLimit('default', async () => {
    try {
      // 1. Validate input
      const validated = deleteFeedbackSchema.parse(input)

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

      // 4. Get feedback to check authorization
      const { data: feedback, error: fetchError } = await supabase
        .from('peer_feedback')
        .select('id, reviewer_id, organization_id, submitted_at')
        .eq('id', validated.feedbackId)
        .eq('organization_id', profile.organization_id)
        .maybeSingle()

      if (fetchError || !feedback) {
        return errorResponse('Peer feedback not found', 'NOT_FOUND')
      }

      // 5. Check authorization (creator or admin/hr role)
      const isCreator = feedback.reviewer_id === user.id
      const isAuthorized = isCreator || ['admin', 'hr'].includes(profile.role)

      if (!isAuthorized) {
        return errorResponse('Only the feedback creator or admin can delete this feedback', 'FORBIDDEN')
      }

      // 6. Prevent deletion of submitted feedback (if submitted_at is set)
      if (feedback.submitted_at) {
        return errorResponse('Cannot delete submitted feedback', 'FORBIDDEN')
      }

      // 7. Soft delete the feedback
      const { error: deleteError } = await supabase
        .from('peer_feedback')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', validated.feedbackId)

      if (deleteError) {
        throw new Error(`Failed to delete peer feedback: ${deleteError.message}`)
      }

      return successResponse({ success: true })
    } catch (error) {
      const appError = handleServiceError(error)
      return errorResponse(appError.message, appError.code)
    }
  })
}
