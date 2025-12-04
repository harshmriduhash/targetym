'use server'

import { createKpiMeasurementSchema, type CreateKpiMeasurementInput } from '@/src/lib/validations/kpis.schemas'
import { kpisService } from '@/src/lib/services/kpis.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import { getAuthContext } from '@/src/lib/auth/server-auth'
import { withActionRateLimit } from '@/src/lib/middleware/action-rate-limit'

export async function addKpiMeasurement(
  input: CreateKpiMeasurementInput
): Promise<ActionResponse<{ id: string }>> {
  return withActionRateLimit('create', async () => {
    try {
      // Validate input
      const validated = createKpiMeasurementSchema.parse(input)

      // Get authenticated user context
      const { userId, organizationId } = await getAuthContext()

      // Add KPI measurement via service
      const measurement = await kpisService.addKpiMeasurement({
        ...validated,
        measured_by: userId,
        organization_id: organizationId,
      })

      return successResponse({ id: measurement.id })
    } catch (error) {
      const appError = handleServiceError(error)
      return errorResponse(appError.message, appError.code)
    }
  })
}
