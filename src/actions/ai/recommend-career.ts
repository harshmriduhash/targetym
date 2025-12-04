'use server'

import { createClient } from '@/src/lib/supabase/server'
import { aiService } from '@/src/lib/services/ai.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import type { CareerRecommendation } from '@/src/lib/services/ai.service'
import { withActionRateLimit } from '@/src/lib/middleware/action-rate-limit'
import { withCSRFProtection } from '@/src/lib/middleware/csrf-protection'

interface CareerRecommendationInput {
  employeeId: string
  currentRole: string
  skills?: string[]
  interests?: string[]
}

export async function recommendCareerPath(
  input: CareerRecommendationInput
): Promise<ActionResponse<CareerRecommendation>>   {
  return withActionRateLimit('ai', async () =>  {
  return withCSRFProtection(async () => {
        try {
          const supabase = await createClient()
          const { data: { user } } = await supabase.auth.getUser()

          if (!user) {
            return errorResponse('Unauthorized', 'UNAUTHORIZED')
          }

          // Check if user is the employee, their manager, or admin
          if (user.id !== input.employeeId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .single()

            if (!profile || !['admin', 'manager'].includes(profile.role)) {
              return errorResponse('Insufficient permissions', 'FORBIDDEN')
            }
          }

          // Fetch employee profile
          const { data: employeeProfile } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', input.employeeId)
            .single()

          if (!employeeProfile) {
            return errorResponse('Employee not found', 'NOT_FOUND')
          }

          // Fetch recent performance reviews to build summary
          const { data: reviews } = await supabase
            .from('performance_reviews')
            .select('overall_rating, strengths, reviewer_comments')
            .eq('employee_id', input.employeeId)
            .order('created_at', { ascending: false })
            .limit(3)

          const performanceSummary =
            reviews && reviews.length > 0
              ? `Recent performance: Average rating ${(
                  reviews.reduce((acc, r) => acc + (r.overall_rating || 0), 0) / reviews.length
                ).toFixed(1)}/5. ${reviews[0].strengths || ''}`
              : 'No recent performance data available'

          // Generate career recommendations
          const recommendations = await aiService.recommendCareerPath(
            input.currentRole,
            input.skills || [],
            performanceSummary,
            input.interests || []
          )

          return successResponse(recommendations)
        } catch (error) {
          const appError = handleServiceError(error)
          return errorResponse(appError.message, appError.code)
        }
    })
  })
}
