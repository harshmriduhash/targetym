/**
 * Integrations Service
 *
 * Core service layer for managing OAuth integrations with external services
 * Handles OAuth flows, token management, and integration lifecycle
 *
 * Supported providers: Slack, Google Workspace, Asana, Notion, etc.
 *
 * @module IntegrationsService
 */

import { createClient } from '@/src/lib/supabase/server'
import type { Database } from '@/src/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { NotFoundError, ForbiddenError, UnauthorizedError, ConflictError } from '@/src/lib/utils/errors'
import { encryptToken, decryptToken } from '@/src/lib/integrations/crypto'
import { createPKCESession, validateOAuthState, isPKCESessionValid } from '@/src/lib/integrations/oauth/pkce'

type Tables = Database['public']['Tables']
type Integration = Tables['integrations']['Row']
type IntegrationInsert = Tables['integrations']['Insert']
type IntegrationUpdate = Tables['integrations']['Update']
type IntegrationProvider = Tables['integration_providers']['Row']
type IntegrationCredentials = Tables['integration_credentials']['Row']
type IntegrationCredentialsInsert = Tables['integration_credentials']['Insert']
type IntegrationOAuthState = Tables['integration_oauth_states']['Row']
type IntegrationOAuthStateInsert = Tables['integration_oauth_states']['Insert']
type TypedSupabaseClient = SupabaseClient<Database>

/**
 * Parameters for initiating OAuth connection
 */
export interface ConnectIntegrationParams {
  providerId: string
  organizationId: string
  userId: string
  redirectUri: string
  scopes?: string[]
  metadata?: Record<string, unknown>
}

/**
 * OAuth authorization URL with state
 */
export interface OAuthAuthorizationUrl {
  url: string
  state: string
  expiresAt: Date
}

/**
 * OAuth callback parameters
 */
export interface OAuthCallbackParams {
  code: string
  state: string
  organizationId: string
  userId: string
}

/**
 * Token exchange response from provider
 */
export interface TokenExchangeResponse {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
  tokenType?: string
  scope?: string
}

/**
 * Integration status with health information
 */
export interface IntegrationStatus {
  id: string
  providerId: string
  providerName: string
  status: string
  healthStatus: string | null
  lastSyncAt: string | null
  lastHealthCheckAt: string | null
  consecutiveFailures: number | null
  errorMessage: string | null
  errorDetails: unknown
  connectedAt: string | null
  connectedBy: string | null
  scopesGranted: string[] | null
}

/**
 * Integration list item
 */
export interface IntegrationListItem {
  id: string
  name: string | null
  providerId: string
  providerName: string
  providerDisplayName: string
  status: string
  healthStatus: string | null
  connectedAt: string | null
  lastSyncAt: string | null
  scopesGranted: string[] | null
}

/**
 * Token refresh result
 */
export interface TokenRefreshResult {
  success: boolean
  expiresAt: string | null
  error?: string
}

/**
 * IntegrationsService
 *
 * Manages OAuth integrations with external services
 */
export class IntegrationsService {
  private async getClient(): Promise<TypedSupabaseClient> {
    return createClient()
  }

  /**
   * Initiate OAuth flow for connecting an integration
   *
   * Process:
   * 1. Validate provider exists and is active
   * 2. Generate PKCE challenge and state
   * 3. Store OAuth state in database
   * 4. Build authorization URL with parameters
   *
   * @param params - Connection parameters
   * @returns Authorization URL to redirect user to
   * @throws NotFoundError if provider not found
   * @throws ConflictError if integration already exists
   *
   * @example
   * ```typescript
   * const { url, state } = await integrationsService.connectIntegration({
   *   providerId: 'slack',
   *   organizationId: 'org123',
   *   userId: 'user123',
   *   redirectUri: 'https://app.example.com/integrations/callback'
   * })
   * // Redirect user to: url
   * ```
   */
  async connectIntegration(params: ConnectIntegrationParams): Promise<OAuthAuthorizationUrl> {
    const supabase = await this.getClient()

    // 1. Get provider configuration
    const { data: provider, error: providerError } = await supabase
      .from('integration_providers')
      .select('*')
      .eq('id', params.providerId)
      .eq('is_active', true)
      .maybeSingle()

    if (providerError) {
      throw new Error(`Failed to fetch provider: ${providerError.message}`)
    }

    if (!provider) {
      throw new NotFoundError('Integration provider')
    }

    const typedProvider = provider as IntegrationProvider

    if (!typedProvider.authorization_endpoint) {
      throw new Error(`Provider ${params.providerId} does not support OAuth`)
    }

    // 2. Check if integration already exists
    const { data: existingIntegration } = await supabase
      .from('integrations')
      .select('id, status')
      .eq('organization_id', params.organizationId)
      .eq('provider_id', params.providerId)
      .in('status', ['active', 'pending'])
      .maybeSingle()

    if (existingIntegration) {
      throw new ConflictError('Integration already exists for this provider')
    }

    // 3. Generate PKCE session
    const pkceSession = createPKCESession(
      params.providerId,
      params.redirectUri,
      10 // 10 minutes TTL
    )

    // 4. Store OAuth state in database
    const oauthStateData: IntegrationOAuthStateInsert = {
      state: pkceSession.state,
      code_verifier: pkceSession.codeVerifier,
      code_challenge: pkceSession.codeChallenge,
      provider_id: params.providerId,
      organization_id: params.organizationId,
      redirect_uri: params.redirectUri,
      scopes: params.scopes || typedProvider.default_scopes || null,
      initiated_by: params.userId,
      expires_at: pkceSession.expiresAt.toISOString(),
    }

    const { data: oauthState, error: stateError } = await supabase
      .from('integration_oauth_states')
      .insert(oauthStateData)
      .select()
      .single()

    if (stateError) {
      throw new Error(`Failed to create OAuth state: ${stateError.message}`)
    }

    // 5. Build authorization URL
    const scopes = params.scopes || typedProvider.default_scopes || []
    const authUrl = new URL(typedProvider.authorization_endpoint)

    authUrl.searchParams.set('client_id', this.getClientId(params.providerId))
    authUrl.searchParams.set('redirect_uri', params.redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('state', pkceSession.state)
    authUrl.searchParams.set('code_challenge', pkceSession.codeChallenge)
    authUrl.searchParams.set('code_challenge_method', 'S256')

    if (scopes.length > 0) {
      authUrl.searchParams.set('scope', scopes.join(' '))
    }

    // Add provider-specific parameters
    if (params.providerId === 'slack') {
      authUrl.searchParams.set('user_scope', '') // Slack-specific
    }

    return {
      url: authUrl.toString(),
      state: pkceSession.state,
      expiresAt: pkceSession.expiresAt,
    }
  }

  /**
   * Handle OAuth callback after user authorization
   *
   * Process:
   * 1. Verify OAuth state and PKCE challenge
   * 2. Exchange authorization code for tokens
   * 3. Encrypt and store tokens
   * 4. Create integration record
   * 5. Mark OAuth state as used
   *
   * @param params - Callback parameters
   * @returns Created integration
   * @throws UnauthorizedError if state validation fails
   * @throws NotFoundError if OAuth state not found
   *
   * @example
   * ```typescript
   * const integration = await integrationsService.handleCallback({
   *   code: 'auth_code_123',
   *   state: 'state_abc',
   *   organizationId: 'org123',
   *   userId: 'user123'
   * })
   * ```
   */
  async handleCallback(params: OAuthCallbackParams): Promise<Integration> {
    const supabase = await this.getClient()

    // 1. Get and validate OAuth state
    const { data: oauthState, error: stateError } = await supabase
      .from('integration_oauth_states')
      .select('*')
      .eq('state', params.state)
      .eq('organization_id', params.organizationId)
      .is('used_at', null)
      .maybeSingle()

    if (stateError || !oauthState) {
      throw new UnauthorizedError('Invalid or expired OAuth state')
    }

    const typedOAuthState = oauthState as IntegrationOAuthState

    // Validate state hasn't expired
    const session = {
      codeVerifier: typedOAuthState.code_verifier,
      state: typedOAuthState.state,
      provider: typedOAuthState.provider_id,
      redirectUri: typedOAuthState.redirect_uri,
      createdAt: new Date(typedOAuthState.created_at),
      expiresAt: new Date(typedOAuthState.expires_at),
    }

    if (!isPKCESessionValid(session)) {
      throw new UnauthorizedError('OAuth state expired')
    }

    // 2. Get provider configuration
    const { data: provider } = await supabase
      .from('integration_providers')
      .select('*')
      .eq('id', typedOAuthState.provider_id)
      .single()

    if (!provider) {
      throw new NotFoundError('Integration provider')
    }

    const typedProvider = provider as IntegrationProvider

    // 3. Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens({
      code: params.code,
      codeVerifier: typedOAuthState.code_verifier,
      redirectUri: typedOAuthState.redirect_uri,
      provider: typedProvider,
    })

    // 4. Encrypt tokens
    const encryptedAccessToken = encryptToken(tokens.accessToken)
    const encryptedRefreshToken = tokens.refreshToken
      ? encryptToken(tokens.refreshToken)
      : null

    // 5. Create integration record
    const integrationData: IntegrationInsert = {
      organization_id: params.organizationId,
      provider_id: typedOAuthState.provider_id,
      name: `${typedProvider.display_name} Integration`,
      status: 'active',
      health_status: 'healthy',
      connected_by: params.userId,
      connected_at: new Date().toISOString(),
      scopes_granted: typedOAuthState.scopes,
      metadata: {},
    }

    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .insert(integrationData)
      .select()
      .single()

    if (integrationError) {
      throw new Error(`Failed to create integration: ${integrationError.message}`)
    }

    const typedIntegration = integration as Integration

    // 6. Store encrypted credentials
    const expiresAt = tokens.expiresIn
      ? new Date(Date.now() + tokens.expiresIn * 1000).toISOString()
      : null

    const credentialsData: IntegrationCredentialsInsert = {
      integration_id: typedIntegration.id,
      access_token_encrypted: encryptedAccessToken,
      refresh_token_encrypted: encryptedRefreshToken,
      token_type: tokens.tokenType || 'Bearer',
      scopes: typedOAuthState.scopes,
      expires_at: expiresAt,
      encryption_key_id: 'v1', // Current encryption key version
    }

    const { error: credentialsError } = await supabase
      .from('integration_credentials')
      .insert(credentialsData)

    if (credentialsError) {
      // Rollback integration creation
      await supabase.from('integrations').delete().eq('id', typedIntegration.id)
      throw new Error(`Failed to store credentials: ${credentialsError.message}`)
    }

    // 7. Mark OAuth state as used
    await supabase
      .from('integration_oauth_states')
      .update({ used_at: new Date().toISOString() })
      .eq('id', typedOAuthState.id)

    return typedIntegration
  }

  /**
   * Disconnect an integration
   *
   * Updates integration status to 'disconnected' and records disconnection time
   * Optionally revokes tokens at the provider
   *
   * @param integrationId - Integration ID
   * @param userId - User performing disconnection
   * @param revokeTokens - Whether to revoke tokens at provider (default: false)
   * @throws NotFoundError if integration not found
   * @throws ForbiddenError if user doesn't have permission
   *
   * @example
   * ```typescript
   * await integrationsService.disconnectIntegration('int123', 'user123', true)
   * ```
   */
  async disconnectIntegration(
    integrationId: string,
    userId: string,
    revokeTokens: boolean = false
  ): Promise<void> {
    const supabase = await this.getClient()

    // 1. Get integration with credentials
    const { data: integration, error: fetchError } = await supabase
      .from('integrations')
      .select(`
        *,
        credentials:integration_credentials(*),
        provider:integration_providers(*)
      `)
      .eq('id', integrationId)
      .maybeSingle()

    if (fetchError || !integration) {
      throw new NotFoundError('Integration')
    }

    const typedIntegration = integration as unknown as Integration & {
      credentials: IntegrationCredentials[]
      provider: IntegrationProvider
    }

    // 2. Verify user has permission (org admin or connector)
    // This would be enforced by RLS, but we check explicitly
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', userId)
      .single()

    if (
      !userProfile ||
      userProfile.organization_id !== typedIntegration.organization_id
    ) {
      throw new ForbiddenError('Not authorized to disconnect this integration')
    }

    // 3. Optionally revoke tokens at provider
    if (revokeTokens && typedIntegration.credentials?.[0]) {
      try {
        await this.revokeTokensAtProvider(
          typedIntegration.provider,
          typedIntegration.credentials[0]
        )
      } catch (error) {
        // Log error but continue with disconnection
        console.error('Failed to revoke tokens:', error)
      }
    }

    // 4. Update integration status
    const updateData: IntegrationUpdate = {
      status: 'disconnected',
      disconnected_at: new Date().toISOString(),
      health_status: 'disconnected',
    }

    const { error: updateError } = await supabase
      .from('integrations')
      .update(updateData)
      .eq('id', integrationId)

    if (updateError) {
      throw new Error(`Failed to disconnect integration: ${updateError.message}`)
    }
  }

  /**
   * Refresh expired access tokens
   *
   * Uses refresh token to get new access token from provider
   *
   * @param integrationId - Integration ID
   * @returns Refresh result with new expiry
   * @throws NotFoundError if integration or credentials not found
   *
   * @example
   * ```typescript
   * const result = await integrationsService.refreshTokens('int123')
   * if (!result.success) {
   *   console.error('Token refresh failed:', result.error)
   * }
   * ```
   */
  async refreshTokens(integrationId: string): Promise<TokenRefreshResult> {
    const supabase = await this.getClient()

    // 1. Get integration with credentials and provider
    const { data: integration, error: fetchError } = await supabase
      .from('integrations')
      .select(`
        *,
        credentials:integration_credentials(*),
        provider:integration_providers(*)
      `)
      .eq('id', integrationId)
      .maybeSingle()

    if (fetchError || !integration) {
      throw new NotFoundError('Integration')
    }

    const typedIntegration = integration as unknown as Integration & {
      credentials: IntegrationCredentials[]
      provider: IntegrationProvider
    }

    const credentials = typedIntegration.credentials?.[0]
    if (!credentials) {
      throw new NotFoundError('Integration credentials')
    }

    if (!credentials.refresh_token_encrypted) {
      return {
        success: false,
        expiresAt: null,
        error: 'No refresh token available',
      }
    }

    try {
      // 2. Decrypt refresh token
      const refreshToken = decryptToken(credentials.refresh_token_encrypted)

      // 3. Exchange refresh token for new access token
      const tokens = await this.refreshAccessToken({
        refreshToken,
        provider: typedIntegration.provider,
      })

      // 4. Encrypt and update tokens
      const encryptedAccessToken = encryptToken(tokens.accessToken)
      const encryptedRefreshToken = tokens.refreshToken
        ? encryptToken(tokens.refreshToken)
        : credentials.refresh_token_encrypted // Keep old if not returned

      const expiresAt = tokens.expiresIn
        ? new Date(Date.now() + tokens.expiresIn * 1000).toISOString()
        : null

      const { error: updateError } = await supabase
        .from('integration_credentials')
        .update({
          access_token_encrypted: encryptedAccessToken,
          refresh_token_encrypted: encryptedRefreshToken,
          expires_at: expiresAt,
          last_rotated_at: new Date().toISOString(),
        })
        .eq('integration_id', integrationId)

      if (updateError) {
        throw new Error(`Failed to update credentials: ${updateError.message}`)
      }

      // 5. Reset consecutive failures on successful refresh
      await supabase
        .from('integrations')
        .update({
          consecutive_failures: 0,
          health_status: 'healthy',
          error_message: null,
          error_details: null,
        })
        .eq('id', integrationId)

      return {
        success: true,
        expiresAt,
      }
    } catch (error) {
      // Update integration with error
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed'

      await supabase
        .from('integrations')
        .update({
          consecutive_failures: (typedIntegration.consecutive_failures || 0) + 1,
          health_status: 'degraded',
          error_message: errorMessage,
        })
        .eq('id', integrationId)

      return {
        success: false,
        expiresAt: null,
        error: errorMessage,
      }
    }
  }

  /**
   * Get integration status and health
   *
   * @param integrationId - Integration ID
   * @returns Integration status with health information
   * @throws NotFoundError if integration not found
   *
   * @example
   * ```typescript
   * const status = await integrationsService.getIntegrationStatus('int123')
   * console.log(`Status: ${status.status}, Health: ${status.healthStatus}`)
   * ```
   */
  async getIntegrationStatus(integrationId: string): Promise<IntegrationStatus> {
    const supabase = await this.getClient()

    const { data: integration, error } = await supabase
      .from('integrations')
      .select(`
        *,
        provider:integration_providers(id, name)
      `)
      .eq('id', integrationId)
      .maybeSingle()

    if (error || !integration) {
      throw new NotFoundError('Integration')
    }

    const typedIntegration = integration as Integration & {
      provider: { id: string; name: string }
    }

    return {
      id: typedIntegration.id,
      providerId: typedIntegration.provider_id,
      providerName: typedIntegration.provider.name,
      status: typedIntegration.status || 'unknown',
      healthStatus: typedIntegration.health_status,
      lastSyncAt: typedIntegration.last_sync_at,
      lastHealthCheckAt: typedIntegration.last_health_check_at,
      consecutiveFailures: typedIntegration.consecutive_failures,
      errorMessage: typedIntegration.error_message,
      errorDetails: typedIntegration.error_details,
      connectedAt: typedIntegration.connected_at,
      connectedBy: typedIntegration.connected_by,
      scopesGranted: typedIntegration.scopes_granted,
    }
  }

  /**
   * List all integrations for an organization
   *
   * @param organizationId - Organization ID
   * @param filters - Optional filters (status, providerId)
   * @returns List of integrations
   *
   * @example
   * ```typescript
   * const integrations = await integrationsService.listIntegrations('org123', {
   *   status: 'active'
   * })
   * ```
   */
  async listIntegrations(
    organizationId: string,
    filters?: {
      status?: string
      providerId?: string
    }
  ): Promise<IntegrationListItem[]> {
    const supabase = await this.getClient()

    let query = supabase
      .from('integrations')
      .select(`
        id,
        name,
        provider_id,
        status,
        health_status,
        connected_at,
        last_sync_at,
        scopes_granted,
        provider:integration_providers(id, name, display_name)
      `)
      .eq('organization_id', organizationId)
      .order('connected_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.providerId) {
      query = query.eq('provider_id', filters.providerId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to list integrations: ${error.message}`)
    }

    return (data || []).map((integration) => ({
      id: integration.id,
      name: integration.name,
      providerId: integration.provider_id,
      providerName: (integration.provider as { name: string }).name,
      providerDisplayName: (integration.provider as { display_name: string }).display_name,
      status: integration.status || 'unknown',
      healthStatus: integration.health_status,
      connectedAt: integration.connected_at,
      lastSyncAt: integration.last_sync_at,
      scopesGranted: integration.scopes_granted,
    }))
  }

  /**
   * Exchange authorization code for tokens (internal)
   *
   * @private
   */
  private async exchangeCodeForTokens(params: {
    code: string
    codeVerifier: string
    redirectUri: string
    provider: IntegrationProvider
  }): Promise<TokenExchangeResponse> {
    const { code, codeVerifier, redirectUri, provider } = params

    if (!provider.token_endpoint) {
      throw new Error('Provider does not have token endpoint configured')
    }

    const clientId = this.getClientId(provider.id)
    const clientSecret = this.getClientSecret(provider.id)

    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
      code_verifier: codeVerifier,
    })

    const response = await fetch(provider.token_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: tokenParams.toString(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Token exchange failed: ${errorText}`)
    }

    const data = await response.json()

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    }
  }

  /**
   * Refresh access token using refresh token (internal)
   *
   * @private
   */
  private async refreshAccessToken(params: {
    refreshToken: string
    provider: IntegrationProvider
  }): Promise<TokenExchangeResponse> {
    const { refreshToken, provider } = params

    if (!provider.token_endpoint) {
      throw new Error('Provider does not have token endpoint configured')
    }

    const clientId = this.getClientId(provider.id)
    const clientSecret = this.getClientSecret(provider.id)

    const tokenParams = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    })

    const response = await fetch(provider.token_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: tokenParams.toString(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Token refresh failed: ${errorText}`)
    }

    const data = await response.json()

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token, // May not be returned
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    }
  }

  /**
   * Revoke tokens at provider (internal)
   *
   * @private
   */
  private async revokeTokensAtProvider(
    provider: IntegrationProvider,
    credentials: IntegrationCredentials
  ): Promise<void> {
    if (!provider.revocation_endpoint) {
      // Provider doesn't support token revocation
      return
    }

    const accessToken = decryptToken(credentials.access_token_encrypted)

    const revokeParams = new URLSearchParams({
      token: accessToken,
      token_type_hint: 'access_token',
    })

    await fetch(provider.revocation_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: revokeParams.toString(),
    })

    // Note: We don't throw on failure as revocation is best-effort
  }

  /**
   * Get OAuth client ID for provider (internal)
   *
   * @private
   */
  private getClientId(providerId: string): string {
    const envKey = `${providerId.toUpperCase()}_CLIENT_ID`
    const clientId = process.env[envKey]

    if (!clientId) {
      throw new Error(`${envKey} not configured in environment`)
    }

    return clientId
  }

  /**
   * Get OAuth client secret for provider (internal)
   *
   * @private
   */
  private getClientSecret(providerId: string): string {
    const envKey = `${providerId.toUpperCase()}_CLIENT_SECRET`
    const clientSecret = process.env[envKey]

    if (!clientSecret) {
      throw new Error(`${envKey} not configured in environment`)
    }

    return clientSecret
  }
}

/**
 * Singleton instance of IntegrationsService
 */
export const integrationsService = new IntegrationsService()
