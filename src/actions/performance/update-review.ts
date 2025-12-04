'use server'

import { createClient } from '@/src/lib/supabase/server'
import { performanceService } from '@/src/lib/services/performance.service'
import { updatePerformanceReviewSchema, type UpdatePerformanceReviewInput } from '@/src/lib/validations/performance.schemas'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'

export async function updatePerformanceReview(
  id: string,
  input: UpdatePerformanceReviewInput
): Promise<ActionResponse<{ id: string }>> {
  return withActionRateLimit('default', async () => {
  try {
    const validated = updatePerformanceReviewSchema.parse(input)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    // Verify user is reviewer or admin/manager
    const review = await performanceService.getPerformanceReviewById(id)

    if (review.reviewer_id !== user.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || !['admin', 'manager'].includes(profile.role)) {
        return errorResponse('Only the reviewer or admin/manager can update reviews', 'FORBIDDEN')
      }
    }

    await performanceService.updatePerformanceReview(id, validated)

    return successResponse({ id })
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
