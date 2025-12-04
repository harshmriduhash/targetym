'use server'

import { createClient } from '@/src/lib/supabase/server'
import { performanceService } from '@/src/lib/services/performance.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import type { Database } from '@/src/types/database.types'
import { z } from 'zod'

type PerformanceReview = Database['public']['Tables']['performance_reviews']['Row']

const getReviewByIdSchema = z.object({
  reviewId: z.string().uuid('Invalid review ID'),
})

export type GetReviewByIdInput = z.infer<typeof getReviewByIdSchema>

/**
 * Get Performance Review By ID Server Action
 * Fetches a single performance review with all details
 */
export async function getReviewById(
  input: GetReviewByIdInput
): Promise<ActionResponse<PerformanceReview>> {
  return withActionRateLimit('default', async () => {
  try {
    // 1. Validate input
    const validated = getReviewByIdSchema.parse(input)

    // 2. Get authenticated user from Supabase
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    // 3. Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return errorResponse('User organization not found', 'NO_ORGANIZATION')
    }

    // 4. Call service to get review
    const review = await performanceService.getPerformanceReviewById(validated.reviewId)

    // 5. Verify review belongs to user's organization (security check)
    if (review.organization_id !== profile.organization_id) {
      return errorResponse('Performance review not found', 'NOT_FOUND')
    }

    return successResponse(review)
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
