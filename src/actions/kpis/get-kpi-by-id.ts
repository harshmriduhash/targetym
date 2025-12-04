'use server'

import { z } from 'zod'
import { kpisService } from '@/src/lib/services/kpis.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError, NotFoundError } from '@/src/lib/utils/errors'
import { getAuthContext } from '@/src/lib/auth/server-auth'

const getKpiByIdSchema = z.object({
  id: z.string().uuid(),
})

export async function getKpiById(input: { id: string }): Promise<ActionResponse<any>> {
  return withActionRateLimit('default', async () => {
  try {
    // Validate input
    const validated = getKpiByIdSchema.parse(input)

    // Get authenticated user context (validates user is authenticated)
    await getAuthContext()

    // Get KPI by ID via service
    const kpi = await kpisService.getKpiById(validated.id)

    if (!kpi) {
      throw new NotFoundError('KPI not found')
    }

    return successResponse(kpi)
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
