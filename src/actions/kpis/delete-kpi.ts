'use server'

import { z } from 'zod'
import { kpisService } from '@/src/lib/services/kpis.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import { getAuthContext } from '@/src/lib/auth/server-auth'
import { withActionRateLimit } from '@/src/lib/middleware/action-rate-limit'

const deleteKpiSchema = z.object({
  id: z.string().uuid(),
})

export async function deleteKpi(input: { id: string }): Promise<ActionResponse<void>> {
  return withActionRateLimit('delete', async () => {
    try {
      // Validate input
      const validated = deleteKpiSchema.parse(input)

      // Get authenticated user context
      const { userId } = await getAuthContext()

      // Delete KPI via service
      await kpisService.deleteKpi(validated.id, userId)

      return successResponse(undefined)
    } catch (error) {
      const appError = handleServiceError(error)
      return errorResponse(appError.message, appError.code)
    }
  })
}
