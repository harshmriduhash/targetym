'use server'

import { createClient } from '@/src/lib/supabase/server'
import { aiService } from '@/src/lib/services/ai.service'
import { performanceService } from '@/src/lib/services/performance.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import type { PerformanceSynthesisResult } from '@/src/lib/services/ai.service'
import { withActionRateLimit } from '@/src/lib/middleware/action-rate-limit'
import { withCSRFProtection } from '@/src/lib/middleware/csrf-protection'

export async function synthesizeEmployeePerformance(
  employeeId: string
): Promise<ActionResponse<PerformanceSynthesisResult>>   {
  return withActionRateLimit('ai', async () =>  {
  return withCSRFProtection(async () => {
        try {
          const supabase = await createClient()
          const { data: { user } } = await supabase.auth.getUser()

          if (!user) {
            return errorResponse('Unauthorized', 'UNAUTHORIZED')
          }

          // Check if user is the employee, their manager, or admin
          if (user.id !== employeeId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .single()

            if (!profile || !['admin', 'manager'].includes(profile.role)) {
              return errorResponse('Insufficient permissions', 'FORBIDDEN')
            }
          }

          // Fetch all performance reviews for employee
          const reviews = await performanceService.getEmployeeReviews(employeeId)

          if (reviews.length === 0) {
            return errorResponse('No performance reviews found', 'NOT_FOUND')
          }

          // Prepare reviews data for AI
          const reviewsData = reviews
            .filter((r) => r.overall_rating && r.strengths && r.areas_for_improvement)
            .map((r) => ({
              rating: r.overall_rating!,
              strengths: r.strengths!,
              improvements: r.areas_for_improvement!,
              date: new Date(r.created_at).toLocaleDateString(),
            }))

          if (reviewsData.length === 0) {
            return errorResponse('No complete reviews found for analysis', 'NOT_FOUND')
          }

          // Generate AI synthesis
          const synthesis = await aiService.synthesizePerformance(reviewsData)

          return successResponse(synthesis)
        } catch (error) {
          const appError = handleServiceError(error)
          return errorResponse(appError.message, appError.code)
        }
    })
  })
}
