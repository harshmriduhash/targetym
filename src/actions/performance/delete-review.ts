'use server'

import { createClient } from '@/src/lib/supabase/server'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import { withActionRateLimit } from '@/src/lib/middleware/action-rate-limit'
import { z } from 'zod'

const deleteReviewSchema = z.object({
  reviewId: z.string().uuid('Invalid review ID'),
})

export type DeleteReviewInput = z.infer<typeof deleteReviewSchema>

/**
 * Delete Performance Review Server Action
 * Soft deletes a performance review (only reviewer or admin can delete)
 */
export async function deleteReview(
  input: DeleteReviewInput
): Promise<ActionResponse<{ success: true }>> {
  return withActionRateLimit('default', async () => {
  try {
    // 1. Validate input
    const validated = deleteReviewSchema.parse(input)

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

    // 4. Get review to check authorization
    const { data: review, error: fetchError } = await supabase
      .from('performance_reviews')
      .select('id, reviewer_id, organization_id, status')
      .eq('id', validated.reviewId)
      .eq('organization_id', profile.organization_id)
      .maybeSingle()

    if (fetchError || !review) {
      return errorResponse('Performance review not found', 'NOT_FOUND')
    }

    // 5. Check authorization (reviewer or admin/hr role)
    const isReviewer = review.reviewer_id === user.id
    const isAuthorized = isReviewer || ['admin', 'hr'].includes(profile.role)

    if (!isAuthorized) {
      return errorResponse('Only the reviewer or admin can delete this review', 'FORBIDDEN')
    }

    // 6. Prevent deletion of submitted/approved reviews
    if (review.status === 'submitted' || review.status === 'approved') {
      return errorResponse('Cannot delete a submitted or approved review', 'FORBIDDEN')
    }

    // 7. Soft delete the review
    const { error: deleteError } = await supabase
      .from('performance_reviews')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', validated.reviewId)

    if (deleteError) {
      throw new Error(`Failed to delete performance review: ${deleteError.message}`)
    }

    return successResponse({ success: true })
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
