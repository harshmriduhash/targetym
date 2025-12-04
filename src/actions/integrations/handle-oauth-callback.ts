'use server'

import { createClient } from '@/src/lib/supabase/server'
import { integrationsService } from '@/src/lib/services/integrations.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'

export interface OAuthCallbackInput {
  code: string
  state: string
}

/**
 * Handle OAuth callback after user authorizes integration
 *
 * @param input - OAuth code and state from callback URL
 * @returns Created integration details
 */
export async function handleOAuthCallback(
  input: OAuthCallbackInput
): Promise<ActionResponse<{ integrationId: string; providerId: string }>> {
  return withActionRateLimit('default', async () => {
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

    // 3. Handle OAuth callback
    const integration = await integrationsService.handleCallback({
      code: input.code,
      state: input.state,
      organizationId: profile.organization_id,
      userId: user.id,
    })

    return successResponse({
      integrationId: integration.id,
      providerId: integration.provider_id,
    })
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
