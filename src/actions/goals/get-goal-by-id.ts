'use server'

import { createClient } from '@/src/lib/supabase/server'
import { goalsService } from '@/src/lib/services/goals.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import type { Database } from '@/src/types/database.types'
import { z } from 'zod'

type Goal = Database['public']['Tables']['goals']['Row']

const getGoalByIdSchema = z.object({
  goalId: z.string().uuid('Invalid goal ID'),
})

export type GetGoalByIdInput = z.infer<typeof getGoalByIdSchema>

/**
 * Get Goal By ID Server Action
 * Fetches a single goal with all relations (owner, key_results, collaborators)
 */
export async function getGoalById(
  input: GetGoalByIdInput
): Promise<ActionResponse<Goal>> {
  return withActionRateLimit('default', async () => {
  try {
    // 1. Validate input
    const validated = getGoalByIdSchema.parse(input)

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

    // 4. Call service to get goal
    const goal = await goalsService.getGoalById(validated.goalId)

    if (!goal) {
      return errorResponse('Goal not found', 'NOT_FOUND')
    }

    // 5. Verify goal belongs to user's organization (security check)
    if (goal.organization_id !== profile.organization_id) {
      return errorResponse('Goal not found', 'NOT_FOUND')
    }

    return successResponse(goal)
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
