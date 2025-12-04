
import { BaseIntegrationClient } from './base-client'

export class GoogleWorkspaceClient extends BaseIntegrationClient {
  protected serviceName = 'google'
  protected baseUrl = 'https://www.googleapis.com'

  public getAuthorizationUrl(state: string, redirectUri: string, scopes: string[], codeChallenge: string): string {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      state,
      access_type: 'offline',
      prompt: 'consent',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    })
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  public async exchangeCodeForToken(code: string, redirectUri: string, codeVerifier: string) {
    return this.request({
      url: 'https://oauth2.googleapis.com/token',
      method: 'POST',
      body: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        code_verifier: codeVerifier
      }
    })
  }

  public async listCalendars(accessToken: string) {
    return this.request({
      url: `${this.baseUrl}/calendar/v3/users/me/calendarList`,
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` }
    })
  }

  public async createEvent(accessToken: string, calendarId: string, event: any) {
    return this.request({
      url: `${this.baseUrl}/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: event
    })
  }

  public async createFolder(accessToken: string, folderName: string, parentId?: string) {
    return this.request({
      url: `${this.baseUrl}/drive/v3/files`,
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parentId && { parents: [parentId] })
      }
    })
  }

  public async sendEmail(accessToken: string, to: string, subject: string, body: string) {
    const email = ['Content-Type: text/html; charset=utf-8', 'MIME-Version: 1.0', `To: ${to}`, `Subject: ${subject}`, '', body].join('\n')
    const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    return this.request({
      url: `${this.baseUrl}/gmail/v1/users/me/messages/send`,
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: { raw: encodedEmail }
    })
  }

  public async getUserProfile(accessToken: string) {
    return this.request({
      url: `${this.baseUrl}/oauth2/v2/userinfo`,
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` }
    })
  }

  public async testConnection(accessToken: string): Promise<boolean> {
    try {
      await this.getUserProfile(accessToken)
      return true
    } catch {
      return false
    }
  }
}

export const googleClient = new GoogleWorkspaceClient()
