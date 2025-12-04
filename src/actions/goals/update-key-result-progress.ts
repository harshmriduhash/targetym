'use server'

import { createClient } from '@/src/lib/supabase/server'
import {
  updateKeyResultProgressSchema,
  type UpdateKeyResultProgressInput,
} from '@/src/lib/validations/goals.schemas'
import { goalsService } from '@/src/lib/services/goals.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'

export async function updateKeyResultProgress(
  input: UpdateKeyResultProgressInput
): Promise<ActionResponse<{ id: string; current_value: number }>> {
  return withActionRateLimit('default', async () => {
  try {
    // Validate input
    const validated = updateKeyResultProgressSchema.parse(input)

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    // Update key result progress via service
    const keyResult = await goalsService.updateKeyResultProgress(
      validated.key_result_id,
      validated.new_value
    )

    return successResponse({
      id: keyResult.id,
      current_value: keyResult.current_value,
    })
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
