import { logger } from '@/src/lib/monitoring/logger'

/**
 * Microsoft 365 Integration Layer
 *
 * Provides OAuth 2.0 authentication and API access for:
 * - Calendar (interviews, meetings)
 * - Teams (notifications, chats)
 * - OneDrive (document storage)
 * - Outlook (email notifications)
 */

export interface MicrosoftConfig {
  clientId: string
  clientSecret: string
  tenantId: string
  redirectUri: string
}

export interface MicrosoftTokens {
  accessToken: string
  refreshToken?: string
  expiresAt: number
}

export interface CalendarEvent {
  id?: string
  subject: string
  start: string
  end: string
  attendees: string[]
  location?: string
  body?: string
}

/**
 * Microsoft 365 Client
 */
export class MicrosoftClient {
  private config: MicrosoftConfig
  private baseUrl = 'https://graph.microsoft.com/v1.0'

  constructor(config: MicrosoftConfig) {
    this.config = config
  }

  /**
   * Get OAuth 2.0 authorization URL
   */
  getAuthorizationUrl(state: string, scopes: string[] = []): string {
    const defaultScopes = [
      'User.Read',
      'Calendars.ReadWrite',
      'Mail.Send',
      'Files.ReadWrite',
    ]

    const allScopes = [...defaultScopes, ...scopes]

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      scope: allScopes.join(' '),
      state,
      response_mode: 'query',
    })

    return `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/authorize?${params}`
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code: string): Promise<MicrosoftTokens> {
    const response = await fetch(
      `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code,
          redirect_uri: this.config.redirectUri,
          grant_type: 'authorization_code',
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      logger.error({ error }, 'Microsoft token exchange failed')
      throw new Error('Failed to exchange code for tokens')
    }

    const data = await response.json()

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<MicrosoftTokens> {
    const response = await fetch(
      `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      }
    )

    if (!response.ok) {
      logger.error('Microsoft token refresh failed')
      throw new Error('Failed to refresh token')
    }

    const data = await response.json()

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresAt: Date.now() + data.expires_in * 1000,
    }
  }

  /**
   * Create calendar event
   */
  async createCalendarEvent(
    accessToken: string,
    event: CalendarEvent
  ): Promise<CalendarEvent> {
    const response = await fetch(`${this.baseUrl}/me/events`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: event.subject,
        start: {
          dateTime: event.start,
          timeZone: 'UTC',
        },
        end: {
          dateTime: event.end,
          timeZone: 'UTC',
        },
        attendees: event.attendees.map((email) => ({
          emailAddress: { address: email },
          type: 'required',
        })),
        location: event.location ? { displayName: event.location } : undefined,
        body: event.body
          ? {
              contentType: 'HTML',
              content: event.body,
            }
          : undefined,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      logger.error({ error }, 'Failed to create calendar event')
      throw new Error('Failed to create calendar event')
    }

    const data = await response.json()
    logger.info({ eventId: data.id }, 'Calendar event created')

    return {
      id: data.id,
      subject: data.subject,
      start: data.start.dateTime,
      end: data.end.dateTime,
      attendees: data.attendees.map((a: { emailAddress: { address: string } }) => a.emailAddress.address),
      location: data.location?.displayName,
    }
  }

  /**
   * Send email via Outlook
   */
  async sendEmail(
    accessToken: string,
    params: {
      to: string[]
      subject: string
      body: string
      cc?: string[]
      attachments?: Array<{ name: string; content: string }>
    }
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/me/sendMail`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          subject: params.subject,
          body: {
            contentType: 'HTML',
            content: params.body,
          },
          toRecipients: params.to.map((email) => ({
            emailAddress: { address: email },
          })),
          ccRecipients: params.cc?.map((email) => ({
            emailAddress: { address: email },
          })),
          attachments: params.attachments?.map((att) => ({
            '@odata.type': '#microsoft.graph.fileAttachment',
            name: att.name,
            contentBytes: att.content,
          })),
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      logger.error({ error }, 'Failed to send email')
      throw new Error('Failed to send email')
    }

    logger.info({ to: params.to }, 'Email sent')
  }

  /**
   * Get user profile
   */
  async getUserProfile(accessToken: string): Promise<{
    id: string
    displayName: string
    email: string
  }> {
    const response = await fetch(`${this.baseUrl}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!response.ok) {
      throw new Error('Failed to get user profile')
    }

    const data = await response.json()

    return {
      id: data.id,
      displayName: data.displayName,
      email: data.mail || data.userPrincipalName,
    }
  }
}

/**
 * Factory function to create Microsoft client
 */
export function createMicrosoftClient(): MicrosoftClient | null {
  const config = {
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    tenantId: process.env.MICROSOFT_TENANT_ID || 'common',
    redirectUri: process.env.MICROSOFT_REDIRECT_URI,
  }

  if (!config.clientId || !config.clientSecret || !config.redirectUri) {
    logger.warn('Microsoft integration not configured')
    return null
  }

  return new MicrosoftClient(config as MicrosoftConfig)
}
