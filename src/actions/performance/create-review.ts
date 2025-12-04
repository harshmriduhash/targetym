'use server'

import { createClient } from '@/src/lib/supabase/server'
import { performanceService } from '@/src/lib/services/performance.service'
import { createPerformanceReviewSchema, type CreatePerformanceReviewInput } from '@/src/lib/validations/performance.schemas'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'

export async function createPerformanceReview(
  input: CreatePerformanceReviewInput
): Promise<ActionResponse<{ id: string }>> {
  return withActionRateLimit('create', async () => {
  try {
    const validated = createPerformanceReviewSchema.parse(input)

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

    const review = await performanceService.createPerformanceReview(validated)

    return successResponse({ id: review.id })
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
