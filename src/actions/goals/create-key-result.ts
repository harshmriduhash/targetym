'use server'

import { createClient } from '@/src/lib/supabase/server'
import { createKeyResultSchema, type CreateKeyResultInput } from '@/src/lib/validations/goals.schemas'
import { goalsService } from '@/src/lib/services/goals.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'

export async function createKeyResult(
  input: CreateKeyResultInput
): Promise<ActionResponse<{ id: string }>> {
  return withActionRateLimit('create', async () => {
  try {
    // Validate input
    const validated = createKeyResultSchema.parse(input)

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return errorResponse('User organization not found', 'NO_ORGANIZATION')
    }

    // Verify user owns the goal
    const goal = await goalsService.getGoalById(validated.goal_id)
    if (goal.owner_id !== user.id) {
      return errorResponse('Forbidden', 'FORBIDDEN')
    }

    // Create key result via service
    const keyResult = await goalsService.createKeyResult({
      ...validated,
      organization_id: profile.organization_id,
    })

    return successResponse({ id: keyResult.id })
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
