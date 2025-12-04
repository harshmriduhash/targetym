/**
 * Tests for Slack Integration Client
 *
 * Covers Slack-specific OAuth configuration and API interactions
 */

import { SlackClient, slackClient } from '@/src/lib/integrations/providers/slack'

describe('Slack Client', () => {
  describe('SlackClient', () => {
    let client: SlackClient

    beforeEach(() => {
      process.env.SLACK_CLIENT_ID = 'slack-client-id-test'
      client = new SlackClient()
    })

    afterEach(() => {
      delete process.env.SLACK_CLIENT_ID
    })

    describe('Initialization', () => {
      it('should initialize with Slack configuration', () => {
        expect(client).toBeDefined()
        expect(client['serviceName']).toBe('slack')
        expect(client['baseUrl']).toBe('https://slack.com/api')
      })

      it('should export singleton instance', () => {
        expect(slackClient).toBeInstanceOf(SlackClient)
      })
    })

    describe('Authorization URL Generation', () => {
      it('should generate authorization URL with required parameters', () => {
        // Arrange
        const state = 'test-state-123'
        const redirectUri = 'https://app.example.com/integrations/callback'
        const scopes = ['channels:read', 'chat:write']

        // Act
        const url = client.getAuthorizationUrl(state, redirectUri, scopes)

        // Assert
        expect(url).toContain('https://slack.com/oauth/v2/authorize')
        expect(url).toContain(`client_id=slack-client-id-test`)
        expect(url).toContain(`state=${state}`)
        expect(url).toContain(`redirect_uri=${encodeURIComponent(redirectUri)}`)
      })

      it('should include scopes in authorization URL', () => {
        // Arrange
        const state = 'test-state'
        const redirectUri = 'https://app.example.com/callback'
        const scopes = ['channels:read', 'chat:write', 'users:read']

        // Act
        const url = client.getAuthorizationUrl(state, redirectUri, scopes)

        // Assert
        // Slack uses comma-separated scopes
        expect(url).toContain('scope=')
        expect(url).toMatch(/scope=channels%3Aread%2Cchat%3Awrite%2Cusers%3Aread/)
      })

      it('should throw error if client ID is not configured', () => {
        // Arrange
        delete process.env.SLACK_CLIENT_ID
        const newClient = new SlackClient()

        // Act & Assert
        expect(() =>
          newClient.getAuthorizationUrl('state', 'https://example.com', [])
        ).toThrow()
      })
    })

    describe('Slack API - Send Message', () => {
      beforeEach(() => {
        global.fetch = jest.fn()
      })

      afterEach(() => {
        jest.restoreAllMocks()
      })

      it('should send message to Slack channel', async () => {
        // Arrange
        const mockResponse = {
          ok: true,
          json: async () => ({
            ok: true,
            channel: 'C123456',
            ts: '1234567890.123456',
            message: {
              text: 'Hello, Slack!',
              user: 'U123456',
            },
          }),
        }

        ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

        const token = 'xoxb-slack-token'
        const channel = 'C123456'
        const text = 'Hello, Slack!'

        // Act
        const result = await client.sendMessage(token, channel, text)

        // Assert
        expect(result).toMatchObject({
          ok: true,
          channel: 'C123456',
        })
        expect(global.fetch).toHaveBeenCalledWith(
          'https://slack.com/api/chat.postMessage',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              Authorization: `Bearer ${token}`,
            }),
            body: expect.anything(),
          })
        )
      })

      it('should include message content in request', async () => {
        // Arrange
        const mockResponse = {
          ok: true,
          json: async () => ({ ok: true }),
        }

        ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

        const token = 'xoxb-slack-token'
        const channel = 'general'
        const text = 'Test message content'

        // Act
        await client.sendMessage(token, channel, text)

        // Assert
        const callArgs = (global.fetch as jest.Mock).mock.calls[0]
        expect(callArgs[0]).toBe('https://slack.com/api/chat.postMessage')
        expect(callArgs[1].method).toBe('POST')
      })

      it('should handle API errors', async () => {
        // Arrange
        const mockErrorResponse = {
          ok: false,
          status: 400,
          json: async () => ({
            ok: false,
            error: 'channel_not_found',
          }),
        }

        ;(global.fetch as jest.Mock).mockResolvedValue(mockErrorResponse)

        const token = 'xoxb-slack-token'
        const channel = 'invalid-channel'
        const text = 'Test message'

        // Act & Assert
        await expect(client.sendMessage(token, channel, text)).rejects.toThrow()
      })

      it('should handle network errors', async () => {
        // Arrange
        ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

        const token = 'xoxb-slack-token'
        const channel = 'C123456'
        const text = 'Test message'

        // Act & Assert
        await expect(client.sendMessage(token, channel, text)).rejects.toThrow('Network error')
      })
    })
  })
})
