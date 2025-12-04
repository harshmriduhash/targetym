'use server'

import { createClient } from '@/src/lib/supabase/server'
import { updateGoalSchema, type UpdateGoalInput } from '@/src/lib/validations/goals.schemas'
import { goalsService } from '@/src/lib/services/goals.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'

export async function updateGoal(input: UpdateGoalInput): Promise<ActionResponse<{ id: string }>> {
  return withActionRateLimit('default', async () => {
  try {
    // Validate input
    const validated = updateGoalSchema.parse(input)
    const { id, ...updates } = validated

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    // Update goal via service
    await goalsService.updateGoal(id, user.id, updates)

    return successResponse({ id })
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
