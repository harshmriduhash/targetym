/**
 * Export experiment results
 *
 * @module ExportExperimentResults
 */

'use server'

import { createClient } from '@/src/lib/supabase/server'
import { abTestingAdminService } from '@/src/lib/services/admin/ab-testing-admin.service'
import { successResponse, errorResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import {
  exportExperimentSchema,
  type ExportExperimentInput,
} from '@/src/lib/validations/admin/ab-testing.schemas'
import type { ActionResponse } from '@/src/lib/utils/response'

/**
 * Export experiment results in JSON or CSV format
 *
 * @param input - Export configuration
 * @returns Experiment results data
 */
export async function exportExperimentResults(
  input: ExportExperimentInput
): Promise<ActionResponse<any>> {
  return withActionRateLimit('default', async () => {
  try {
    // 1. Validate input
    const validated = exportExperimentSchema.parse(input)

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

    // 4. Export results
    const results = await abTestingAdminService.exportExperimentResults(
      validated.experimentId
    )

    // 5. Format based on requested format
    if (validated.format === 'csv') {
      // Convert to CSV format
      const csvData = convertToCSV(results)
      return successResponse({ format: 'csv', data: csvData })
    }

    return successResponse({ format: 'json', data: results })
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}

/**
 * Convert experiment results to CSV format
 */
function convertToCSV(results: any): string {
  const { experiment, stats, assignments } = results

  const headers = [
    'User ID',
    'User Email',
    'Variant ID',
    'Assigned At',
    'Experiment Name',
  ]

  const rows = assignments.map((assignment: any) => [
    assignment.user_id,
    assignment.profiles?.email || 'N/A',
    assignment.variant_id,
    assignment.assigned_at,
    experiment.name,
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row: any[]) => row.join(',')),
  ].join('\n')

  return csvContent
}
