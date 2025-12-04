'use server'

import { createClient } from '@/src/lib/supabase/server'
import { performanceService } from '@/src/lib/services/performance.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import type { Database } from '@/src/types/database.types'

type PerformanceReview = Database['public']['Tables']['performance_reviews']['Row']

export interface GetPerformanceReviewsInput {
  filters?: {
    reviewee_id?: string
    reviewer_id?: string
    status?: string
    review_period?: string
  }
}

/**
 * Get Performance Reviews Server Action
 * Fetches list of performance reviews with filters
 */
export async function getPerformanceReviews(
  input?: GetPerformanceReviewsInput
): Promise<ActionResponse<PerformanceReview[]>> {
  return withActionRateLimit('default', async () => {
  try {
    // 1. Get authenticated user from Supabase
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    // 2. Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return errorResponse('User organization not found', 'NO_ORGANIZATION')
    }

    // 3. Call service with organization_id and filters
    const reviews = await performanceService.getPerformanceReviews(
      profile.organization_id,
      input?.filters
    )

    return successResponse(reviews)
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
