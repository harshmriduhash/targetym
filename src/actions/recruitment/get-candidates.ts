'use server'

import { createClient } from '@/src/lib/supabase/server'
import { recruitmentService } from '@/src/lib/services/recruitment.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import type { PaginationParams } from '@/src/lib/utils/pagination'

interface GetCandidatesFilters {
  job_posting_id?: string
  status?: string
  current_stage?: string
}

export async function getCandidates(
  filters?: GetCandidatesFilters,
  pagination?: PaginationParams
): Promise<ActionResponse<any>> {
  return withActionRateLimit('default', async () => {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    // Get user's organization_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return errorResponse('User organization not found', 'NO_ORGANIZATION')
    }

    // Fetch candidates using service
    const result = await recruitmentService.getCandidates(
      profile.organization_id,
      filters,
      pagination
    )

    return successResponse(result)
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
