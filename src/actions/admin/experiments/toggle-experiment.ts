/**
 * Toggle experiment status (pause/resume)
 *
 * @module ToggleExperiment
 */

'use server'

import { createClient } from '@/src/lib/supabase/server'
import { abTestingAdminService } from '@/src/lib/services/admin/ab-testing-admin.service'
import { successResponse, errorResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import {
  toggleExperimentSchema,
  type ToggleExperimentInput,
} from '@/src/lib/validations/admin/ab-testing.schemas'
import type { ActionResponse } from '@/src/lib/utils/response'
import type { Database } from '@/src/types/database.types'

type ABTestExperiment = Database['public']['Tables']['ab_test_experiments']['Row']

/**
 * Toggle experiment status between running and paused
 *
 * @param input - Experiment ID
 * @returns Updated experiment
 */
export async function toggleExperiment(
  input: ToggleExperimentInput
): Promise<ActionResponse<ABTestExperiment>> {
  return withActionRateLimit('default', async () => {
  try {
    // 1. Validate input
    const validated = toggleExperimentSchema.parse(input)

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

    // 4. Toggle experiment
    const experiment = await abTestingAdminService.toggleExperiment(
      validated.experimentId
    )

    return successResponse(experiment)
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
