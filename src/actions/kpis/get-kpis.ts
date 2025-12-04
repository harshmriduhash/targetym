'use server'

import { z } from 'zod'
import { kpiFilterSchema } from '@/src/lib/validations/kpis.schemas'
import { kpisService } from '@/src/lib/services/kpis.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import { getAuthContext } from '@/src/lib/auth/server-auth'
import type { PaginationParams, PaginatedResponse } from '@/src/lib/utils/pagination'

const getKpisInputSchema = z.object({
  filters: kpiFilterSchema.optional(),
  pagination: z.object({
    page: z.number().positive().optional(),
    pageSize: z.number().positive().max(100).optional(),
  }).optional(),
})

export async function getKpis(
  input?: z.infer<typeof getKpisInputSchema>
): Promise<ActionResponse<PaginatedResponse<any>>> {
  try {
    // Validate input
    const validated = input ? getKpisInputSchema.parse(input) : {}

    // Get authenticated user context
    const { organizationId } = await getAuthContext()

    // Get KPIs via service
    const kpis = await kpisService.getKpis(
      organizationId,
      validated.filters,
      validated.pagination
    )

    return successResponse(kpis)
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
}
