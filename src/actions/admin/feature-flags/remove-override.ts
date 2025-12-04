/**
 * Remove feature flag override
 *
 * @module RemoveOverride
 */

'use server'

import { createClient } from '@/src/lib/supabase/server'
import { abTestingAdminService } from '@/src/lib/services/admin/ab-testing-admin.service'
import { successResponse, errorResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import {
  deleteFeatureFlagOverrideSchema,
  type DeleteFeatureFlagOverrideInput,
} from '@/src/lib/validations/admin/ab-testing.schemas'
import type { ActionResponse } from '@/src/lib/utils/response'

/**
 * Remove a user-specific feature flag override
 *
 * @param input - Override ID
 * @returns Success status
 */
export async function removeFeatureFlagOverride(
  input: DeleteFeatureFlagOverrideInput
): Promise<ActionResponse<{ success: true }>> {
  return withActionRateLimit('default', async () => {
  try {
    // 1. Validate input
    const validated = deleteFeatureFlagOverrideSchema.parse(input)

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

    // 4. Delete override
    await abTestingAdminService.deleteFeatureFlagOverride(validated.overrideId)

    return successResponse({ success: true })
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
