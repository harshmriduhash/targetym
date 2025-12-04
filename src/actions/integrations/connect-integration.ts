'use server'

import { createClient } from '@/src/lib/supabase/server'
import { integrationsService } from '@/src/lib/services/integrations.service'
import { successResponse, errorResponse, type ActionResponse } from '@/src/lib/utils/response'
import { handleServiceError } from '@/src/lib/utils/errors'
import { IntegrationAnalytics } from '@/src/lib/analytics/integration-events'
import { ABTestingService, INTEGRATION_EXPERIMENTS } from '@/src/lib/analytics/ab-testing'

export interface ConnectIntegrationInput {
  providerId: string
  scopes?: string[]
}

/**
 * Initiate OAuth flow for integration
 *
 * @param input - Provider ID and optional scopes
 * @returns Authorization URL to redirect user to
 */
export async function connectIntegration(
  input: ConnectIntegrationInput
): Promise<ActionResponse<{ url: string; state: string }>> {
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

    // 3. Build redirect URI
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    const redirectUri = `${appUrl}/integrations/callback`

    // 4. Check A/B test variant (optional - for experimenting with OAuth flows)
    const variant = await ABTestingService.getVariant(
      user.id,
      INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION
    )

    // 5. Connect integration
    const startTime = Date.now()
    const result = await integrationsService.connectIntegration({
      providerId: input.providerId,
      organizationId: profile.organization_id,
      userId: user.id,
      redirectUri,
      scopes: input.scopes,
    })
    const duration = Date.now() - startTime

    // 6. Track analytics event
    await IntegrationAnalytics.trackConnectionFlow('initiated', {
      providerId: input.providerId,
      providerName: input.providerId,
      organizationId: profile.organization_id,
      userId: user.id,
      status: 'success',
      duration,
    })

    // 7. Track A/B test exposure
    await ABTestingService.trackExposure(
      user.id,
      INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION,
      variant.id
    )

    return successResponse(result)
  } catch (error) {
    const appError = handleServiceError(error)

    // Track failed connection attempt
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user?.id || '')
        .single()

      if (user && profile) {
        await IntegrationAnalytics.trackConnectionFlow('failed', {
          providerId: input.providerId,
          providerName: input.providerId,
          organizationId: profile.organization_id,
          userId: user.id,
          status: 'failure',
          errorCode: appError.code,
          errorMessage: appError.message,
        })
      }
    } catch {
      // Ignore analytics errors
    }

    return errorResponse(appError.message, appError.code)
  }
  })
}
