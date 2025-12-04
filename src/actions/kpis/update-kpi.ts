'use server'

import { updateKpiSchema, type UpdateKpiInput } from '@/src/lib/validations/kpis.schemas'
import { kpisService } from '@/src/lib/services/kpis.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import { getAuthContext } from '@/src/lib/auth/server-auth'
import { withActionRateLimit } from '@/src/lib/middleware/action-rate-limit'

export async function updateKpi(input: UpdateKpiInput): Promise<ActionResponse<{ id: string }>> {
  return withActionRateLimit('update', async () => {
    try {
      // Validate input
      const validated = updateKpiSchema.parse(input)
      const { id, ...updateData } = validated

      // Get authenticated user context
      const { userId } = await getAuthContext()

      // Update KPI via service
      const kpi = await kpisService.updateKpi(id, userId, updateData)

      return successResponse({ id: kpi.id })
    } catch (error) {
      const appError = handleServiceError(error)
      return errorResponse(appError.message, appError.code)
    }
  })
}
