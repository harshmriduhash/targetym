'use server'

import { createGoalSchema, type CreateGoalInput } from '@/src/lib/validations/goals.schemas'
import { goalsService } from '@/src/lib/services/goals.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import { getAuthContext } from '@/src/lib/auth/server-auth'
import { withActionRateLimit } from '@/src/lib/middleware/action-rate-limit'

export async function createGoal(input: CreateGoalInput): Promise<ActionResponse<{ id: string }>> {
  return withActionRateLimit('create', async () => {
    try {
      // Validate input
      const validated = createGoalSchema.parse(input)

      // Get authenticated user context (replaces duplicated auth code)
      const { userId, organizationId } = await getAuthContext()

      // Create goal via service
      const goal = await goalsService.createGoal({
        ...validated,
        owner_id: userId,
        organization_id: organizationId,
      })

      return successResponse({ id: goal.id })
    } catch (error) {
      const appError = handleServiceError(error)
      return errorResponse(appError.message, appError.code)
    }
  })
}
