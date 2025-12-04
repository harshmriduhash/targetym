'use server'

import { createClient } from '@/src/lib/supabase/server'
import { goalsService } from '@/src/lib/services/goals.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import { z } from 'zod'

const deleteGoalSchema = z.object({
  goalId: z.string().uuid('Invalid goal ID'),
})

export type DeleteGoalInput = z.infer<typeof deleteGoalSchema>

/**
 * Delete Goal Server Action
 * Soft deletes a goal (only owner can delete)
 */
export async function deleteGoal(
  input: DeleteGoalInput
): Promise<ActionResponse<{ success: true }>> {
  try {
    // 1. Validate input
    const validated = deleteGoalSchema.parse(input)

    // 2. Get authenticated user from Supabase
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    // 3. Get user's organization (for audit trail)
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return errorResponse('User organization not found', 'NO_ORGANIZATION')
    }

    // 4. Call service to delete goal (checks ownership internally)
    await goalsService.deleteGoal(validated.goalId, user.id)

    return successResponse({ success: true })
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
}
