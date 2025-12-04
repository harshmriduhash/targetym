'use server'

import { createClient } from '@/src/lib/supabase/server'
import { recruitmentService } from '@/src/lib/services/recruitment.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import type { PaginationParams } from '@/src/lib/utils/pagination'

interface GetJobPostingsFilters {
  status?: string
  department?: string
  location?: string
  hiring_manager_id?: string
}

export async function getJobPostings(
  filters?: GetJobPostingsFilters,
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

    // Fetch job postings using service
    const result = await recruitmentService.getJobPostings(
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
