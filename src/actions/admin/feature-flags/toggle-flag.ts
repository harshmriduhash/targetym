/**
 * Toggle feature flag
 *
 * @module ToggleFlag
 */

'use server'

import { createClient } from '@/src/lib/supabase/server'
import { abTestingAdminService } from '@/src/lib/services/admin/ab-testing-admin.service'
import { successResponse, errorResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import {
  toggleFeatureFlagSchema,
  type ToggleFeatureFlagInput,
} from '@/src/lib/validations/admin/ab-testing.schemas'
import type { ActionResponse } from '@/src/lib/utils/response'
import type { Database } from '@/src/types/database.types'

type FeatureFlag = Database['public']['Tables']['feature_flags']['Row']

/**
 * Toggle feature flag enabled/disabled
 *
 * @param input - Flag name
 * @returns Updated feature flag
 */
export async function toggleFeatureFlag(
  input: ToggleFeatureFlagInput
): Promise<ActionResponse<FeatureFlag>> {
  return withActionRateLimit('default', async () => {
  try {
    // 1. Validate input
    const validated = toggleFeatureFlagSchema.parse(input)

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

    // 4. Toggle flag
    const flag = await abTestingAdminService.toggleFeatureFlag(
      validated.flagName
    )

    return successResponse(flag)
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
