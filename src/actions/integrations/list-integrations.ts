'use server'

import { createClient } from '@/src/lib/supabase/server'
import { integrationsService } from '@/src/lib/services/integrations.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'

export interface IntegrationListItem {
  id: string
  providerId: string
  providerName: string
  status: string
  connectedAt: string | null
  lastSyncAt: string | null
}

/**
 * List all integrations for user's organization
 *
 * @returns Array of integrations
 */
export async function listIntegrations(): Promise<
  ActionResponse<IntegrationListItem[]>
> {
  try {
    // 1. Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED')
    }

    // 2. Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return errorResponse('User organization not found', 'NO_ORGANIZATION')
    }

    // 3. List integrations
    const integrations = await integrationsService.listIntegrations(
      profile.organization_id
    )

    return successResponse(integrations)
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
}
