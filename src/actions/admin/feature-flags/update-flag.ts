/**
 * Update feature flag
 *
 * @module UpdateFlag
 */

'use server'

import { createClient } from '@/src/lib/supabase/server'
import { abTestingAdminService } from '@/src/lib/services/admin/ab-testing-admin.service'
import { successResponse, errorResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import {
  updateFeatureFlagSchema,
  type UpdateFeatureFlagInput,
} from '@/src/lib/validations/admin/ab-testing.schemas'
import type { ActionResponse } from '@/src/lib/utils/response'
import type { Database } from '@/src/types/database.types'

type FeatureFlag = Database['public']['Tables']['feature_flags']['Row']

/**
 * Update a feature flag
 *
 * @param input - Update data
 * @returns Updated feature flag
 */
export async function updateFeatureFlag(
  input: UpdateFeatureFlagInput
): Promise<ActionResponse<FeatureFlag>> {
  return withActionRateLimit('default', async () => {
  try {
    // 1. Validate input
    const validated = updateFeatureFlagSchema.parse(input)

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

    // 4. Update flag
    const { flagName, ...updateData } = validated
    const flag = await abTestingAdminService.updateFeatureFlag(
      flagName,
      updateData
    )

    return successResponse(flag)
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
