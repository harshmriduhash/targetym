/**
 * List all experiments
 *
 * @module ListExperiments
 */

'use server'

import { createClient } from '@/src/lib/supabase/server'
import { abTestingAdminService } from '@/src/lib/services/admin/ab-testing-admin.service'
import { successResponse, errorResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import type { ActionResponse } from '@/src/lib/utils/response'
import type { Database } from '@/src/types/database.types'

type ABTestExperiment = Database['public']['Tables']['ab_test_experiments']['Row']

interface ListExperimentsInput {
  status?: 'draft' | 'running' | 'paused' | 'completed'
}

/**
 * List all experiments with optional filtering
 *
 * @param input - Filter options
 * @returns List of experiments
 */
export async function listExperiments(
  input?: ListExperimentsInput
): Promise<ActionResponse<ABTestExperiment[]>> {
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

    // 3. List experiments
    const experiments = await abTestingAdminService.listExperiments(input)

    return successResponse(experiments)
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
