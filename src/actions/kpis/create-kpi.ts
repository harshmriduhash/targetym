'use server'

import { createKpiSchema, type CreateKpiInput } from '@/src/lib/validations/kpis.schemas'
import { kpisService } from '@/src/lib/services/kpis.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import { getAuthContext } from '@/src/lib/auth/server-auth'
import { withActionRateLimit } from '@/src/lib/middleware/action-rate-limit'

export async function createKpi(input: CreateKpiInput): Promise<ActionResponse<{ id: string }>> {
  return withActionRateLimit('create', async () => {
    try {
      // Validate input
      const validated = createKpiSchema.parse(input)

      // Get authenticated user context
      const { userId, organizationId } = await getAuthContext()

      // Create KPI via service
      const kpi = await kpisService.createKpi({
        ...validated,
        owner_id: userId,
        organization_id: organizationId,
      })

      return successResponse({ id: kpi.id })
    } catch (error) {
      const appError = handleServiceError(error)
      return errorResponse(appError.message, appError.code)
    }
  })
}
