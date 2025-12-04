/**
 * Add feature flag override
 *
 * @module AddOverride
 */

'use server'

import { createClient } from '@/src/lib/supabase/server'
import { abTestingAdminService } from '@/src/lib/services/admin/ab-testing-admin.service'
import { successResponse, errorResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import {
  createFeatureFlagOverrideSchema,
  type CreateFeatureFlagOverrideInput,
} from '@/src/lib/validations/admin/ab-testing.schemas'
import type { ActionResponse } from '@/src/lib/utils/response'
import type { Database } from '@/src/types/database.types'

type FeatureFlagOverride =
  Database['public']['Tables']['feature_flag_overrides']['Row']

/**
 * Add a user-specific feature flag override
 *
 * @param input - Override data
 * @returns Created override
 */
export async function addFeatureFlagOverride(
  input: CreateFeatureFlagOverrideInput
): Promise<ActionResponse<FeatureFlagOverride>> {
  return withActionRateLimit('create', async () => {
  try {
    // 1. Validate input
    const validated = createFeatureFlagOverrideSchema.parse(input)

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

    // 4. Create override
    const override = await abTestingAdminService.createFeatureFlagOverride({
      user_id: validated.userId,
      flag_name: validated.flagName,
      enabled: validated.enabled,
      reason: validated.reason,
    })

    return successResponse(override)
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
