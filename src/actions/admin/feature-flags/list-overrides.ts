/**
 * List feature flag overrides
 *
 * @module ListOverrides
 */

'use server'

import { createClient } from '@/src/lib/supabase/server'
import { abTestingAdminService } from '@/src/lib/services/admin/ab-testing-admin.service'
import { successResponse, errorResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import type { ActionResponse } from '@/src/lib/utils/response'
import type { Database } from '@/src/types/database.types'

type FeatureFlagOverride =
  Database['public']['Tables']['feature_flag_overrides']['Row']

/**
 * List feature flag overrides
 *
 * @param flagName - Optional flag name to filter
 * @returns List of overrides
 */
export async function listFeatureFlagOverrides(
  flagName?: string
): Promise<ActionResponse<FeatureFlagOverride[]>> {
  return withActionRateLimit('default', async () => {
  try {
    // 1. Check authentication and admin role
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    // 2. Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return errorResponse('Forbidden: Admin access required', 'FORBIDDEN')
    }

    // 3. List overrides
    const overrides = await abTestingAdminService.listFeatureFlagOverrides(
      flagName
    )

    return successResponse(overrides)
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
