'use server'

import { createClient } from '@/src/lib/supabase/server'
import { integrationsService } from '@/src/lib/services/integrations.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'

export interface DisconnectIntegrationInput {
  integrationId: string
  revokeTokens?: boolean
}

/**
 * Disconnect an integration
 *
 * @param input - Integration ID and whether to revoke tokens
 * @returns Success confirmation
 */
export async function disconnectIntegration(
  input: DisconnectIntegrationInput
): Promise<ActionResponse<{ success: boolean }>> {
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

    // 2. Disconnect integration
    await integrationsService.disconnectIntegration(
      input.integrationId,
      user.id,
      input.revokeTokens ?? true
    )

    return successResponse({ success: true })
  } catch (error) {
    const appError = handleServiceError(error)
    return errorResponse(appError.message, appError.code)
  }
  })
}
