'use server'

import { createClient } from '@/src/lib/supabase/server'
import { goalsService } from '@/src/lib/services/goals.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import type { Database } from '@/src/types/database.types'
import type { PaginationParams, PaginatedResponse } from '@/src/lib/utils/pagination'

type Goal = Database['public']['Tables']['goals']['Row']

export interface GetGoalsInput {
  filters?: {
    owner_id?: string
    status?: string
    period?: string
  }
  pagination?: PaginationParams
}

/**
 * Get Goals Server Action
 * Fetches paginated list of goals with filters
 */
export async function getGoals(
  input?: GetGoalsInput
): Promise<ActionResponse<PaginatedResponse<Goal>>> {
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
    const result = await goalsService.getGoals(
      profile.organization_id,
      input?.filters,
      input?.pagination
    )

    return successResponse(result)
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
}
