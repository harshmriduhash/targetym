/**
 * Get experiment statistics
 *
 * @module GetExperimentStats
 */

'use server'

import { createClient } from '@/src/lib/supabase/server'
import { abTestingAdminService } from '@/src/lib/services/admin/ab-testing-admin.service'
import { successResponse, errorResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import {
  getExperimentStatsSchema,
  type GetExperimentStatsInput,
} from '@/src/lib/validations/admin/ab-testing.schemas'
import type { ActionResponse } from '@/src/lib/utils/response'
import type { ExperimentStats } from '@/src/lib/services/admin/ab-testing-admin.service'

/**
 * Get statistics for an experiment
 *
 * @param input - Experiment ID
 * @returns Experiment statistics
 */
export async function getExperimentStats(
  input: GetExperimentStatsInput
): Promise<ActionResponse<ExperimentStats>> {
  return withActionRateLimit('default', async () => {
  try {
    // 1. Validate input
    const validated = getExperimentStatsSchema.parse(input)

    // 2. Check authentication and admin role
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    // 3. Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return errorResponse('Forbidden: Admin access required', 'FORBIDDEN')
    }

    // 4. Get experiment stats
    const stats = await abTestingAdminService.getExperimentStats(
      validated.experimentId
    )

    return successResponse(stats)
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
