
import { BaseIntegrationClient } from './base-client'

export class SlackClient extends BaseIntegrationClient {
  protected serviceName = 'slack'
  protected baseUrl = 'https://slack.com/api'

  public getAuthorizationUrl(state: string, redirectUri: string, scopes: string[]): string {
    const params = new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID!,
      scope: scopes.join(','),
      state,
      redirect_uri: redirectUri
    })
    return `https://slack.com/oauth/v2/authorize?${params}`
  }

  public async sendMessage(token: string, channel: string, text: string) {
    return this.request({
      url: `${this.baseUrl}/chat.postMessage`,
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { channel, text }
    })
  }
}

export const slackClient = new SlackClient()
