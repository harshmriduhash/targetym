'use server'

import { createKpiAlertSchema, type CreateKpiAlertInput } from '@/src/lib/validations/kpis.schemas'
import { kpisService } from '@/src/lib/services/kpis.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import { getAuthContext } from '@/src/lib/auth/server-auth'
import { withActionRateLimit } from '@/src/lib/middleware/action-rate-limit'

export async function createKpiAlert(
  input: CreateKpiAlertInput
): Promise<ActionResponse<{ id: string }>> {
  return withActionRateLimit('create', async () => {
    try {
      // Validate input
      const validated = createKpiAlertSchema.parse(input)

      // Get authenticated user context
      const { userId, organizationId } = await getAuthContext()

      // Create KPI alert via service
      const alert = await kpisService.createKpiAlert({
        ...validated,
        created_by: userId,
        organization_id: organizationId,
      })

      return successResponse({ id: alert.id })
    } catch (error) {
      const appError = handleServiceError(error)
      return errorResponse(appError.message, appError.code)
    }
  })
}
