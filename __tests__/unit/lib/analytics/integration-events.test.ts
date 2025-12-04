/**
 * Integration Analytics Tests
 *
 * Tests for integration event tracking and analytics
 */

import { IntegrationAnalytics, IntegrationEventType } from '@/src/lib/analytics/integration-events'

describe('IntegrationAnalytics', () => {
  beforeEach(() => {
    // Clear console mocks
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('track', () => {
    it('should track basic integration event', async () => {
      await IntegrationAnalytics.track(
        IntegrationEventType.CONNECTION_INITIATED,
        {
          providerId: 'slack',
          providerName: 'Slack',
          organizationId: 'org123',
          userId: 'user123',
          status: 'success',
        }
      )

      expect(console.log).toHaveBeenCalledWith(
        '[Integration Analytics]',
        expect.objectContaining({
          event: IntegrationEventType.CONNECTION_INITIATED,
          properties: expect.objectContaining({
            providerId: 'slack',
            providerName: 'Slack',
            organizationId: 'org123',
            userId: 'user123',
            status: 'success',
          }),
        })
      )
    })

    it('should include A/B test variant in event', async () => {
      const variant = {
        experimentId: 'oauth_flow_optimization',
        variantId: 'optimized',
        variantName: 'optimized',
      }

      await IntegrationAnalytics.track(
        IntegrationEventType.CONNECTION_COMPLETED,
        {
          providerId: 'slack',
          providerName: 'Slack',
          organizationId: 'org123',
          userId: 'user123',
          status: 'success',
        },
        variant
      )

      expect(console.log).toHaveBeenCalledWith(
        '[Integration Analytics]',
        expect.objectContaining({
          event: IntegrationEventType.CONNECTION_COMPLETED,
          properties: expect.objectContaining({
            experiment_id: 'oauth_flow_optimization',
            variant_id: 'optimized',
            variant_name: 'optimized',
          }),
        })
      )
    })

    it('should include timestamp in event', async () => {
      const before = new Date().toISOString()

      await IntegrationAnalytics.track(
        IntegrationEventType.OAUTH_REDIRECT,
        {
          providerId: 'google',
          providerName: 'Google',
          organizationId: 'org456',
          userId: 'user456',
        }
      )

      const after = new Date().toISOString()

      const call = (console.log as jest.Mock).mock.calls[0][1]
      expect(call.timestamp).toBeDefined()
      expect(call.timestamp >= before).toBe(true)
      expect(call.timestamp <= after).toBe(true)
    })

    it('should not throw on analytics errors', async () => {
      // Mock console.log to throw
      (console.log as jest.Mock).mockImplementation(() => {
        throw new Error('Analytics error')
      })

      // Should not throw
      await expect(
        IntegrationAnalytics.track(
          IntegrationEventType.CONNECTION_FAILED,
          {
            providerId: 'slack',
            providerName: 'Slack',
            organizationId: 'org123',
            userId: 'user123',
            status: 'failure',
          }
        )
      ).resolves.not.toThrow()

      expect(console.error).toHaveBeenCalledWith(
        '[Integration Analytics] Error tracking event:',
        expect.any(Error)
      )
    })
  })

  describe('trackConnectionFlow', () => {
    it('should track connection initiated', async () => {
      await IntegrationAnalytics.trackConnectionFlow('initiated', {
        providerId: 'slack',
        providerName: 'Slack',
        organizationId: 'org123',
        userId: 'user123',
      })

      expect(console.log).toHaveBeenCalledWith(
        '[Integration Analytics]',
        expect.objectContaining({
          event: IntegrationEventType.CONNECTION_INITIATED,
        })
      )
    })

    it('should track connection completed', async () => {
      await IntegrationAnalytics.trackConnectionFlow('completed', {
        providerId: 'google',
        providerName: 'Google',
        organizationId: 'org456',
        userId: 'user456',
        status: 'success',
      })

      expect(console.log).toHaveBeenCalledWith(
        '[Integration Analytics]',
        expect.objectContaining({
          event: IntegrationEventType.CONNECTION_COMPLETED,
        })
      )
    })

    it('should track connection failed', async () => {
      await IntegrationAnalytics.trackConnectionFlow('failed', {
        providerId: 'asana',
        providerName: 'Asana',
        organizationId: 'org789',
        userId: 'user789',
        status: 'failure',
        errorCode: 'OAUTH_ERROR',
        errorMessage: 'Invalid state parameter',
      })

      expect(console.log).toHaveBeenCalledWith(
        '[Integration Analytics]',
        expect.objectContaining({
          event: IntegrationEventType.CONNECTION_FAILED,
          properties: expect.objectContaining({
            errorCode: 'OAUTH_ERROR',
            errorMessage: 'Invalid state parameter',
          }),
        })
      )
    })
  })

  describe('trackOAuthFlow', () => {
    it('should track OAuth redirect', async () => {
      await IntegrationAnalytics.trackOAuthFlow('redirect', {
        providerId: 'slack',
        providerName: 'Slack',
        organizationId: 'org123',
        userId: 'user123',
      })

      expect(console.log).toHaveBeenCalledWith(
        '[Integration Analytics]',
        expect.objectContaining({
          event: IntegrationEventType.OAUTH_REDIRECT,
        })
      )
    })

    it('should track OAuth callback', async () => {
      await IntegrationAnalytics.trackOAuthFlow('callback', {
        providerId: 'google',
        providerName: 'Google',
        organizationId: 'org456',
        userId: 'user456',
      })

      expect(console.log).toHaveBeenCalledWith(
        '[Integration Analytics]',
        expect.objectContaining({
          event: IntegrationEventType.OAUTH_CALLBACK_RECEIVED,
        })
      )
    })

    it('should track token exchange', async () => {
      await IntegrationAnalytics.trackOAuthFlow('token_exchange', {
        providerId: 'notion',
        providerName: 'Notion',
        organizationId: 'org789',
        userId: 'user789',
        duration: 1500,
      })

      expect(console.log).toHaveBeenCalledWith(
        '[Integration Analytics]',
        expect.objectContaining({
          event: IntegrationEventType.OAUTH_TOKEN_EXCHANGE,
          properties: expect.objectContaining({
            duration: 1500,
          }),
        })
      )
    })

    it('should track OAuth error', async () => {
      await IntegrationAnalytics.trackOAuthFlow('error', {
        providerId: 'asana',
        providerName: 'Asana',
        organizationId: 'org101',
        userId: 'user101',
        status: 'failure',
        errorCode: 'INVALID_GRANT',
      })

      expect(console.log).toHaveBeenCalledWith(
        '[Integration Analytics]',
        expect.objectContaining({
          event: IntegrationEventType.OAUTH_ERROR,
          properties: expect.objectContaining({
            errorCode: 'INVALID_GRANT',
          }),
        })
      )
    })
  })

  describe('trackTokenRefresh', () => {
    it('should track successful token refresh', async () => {
      await IntegrationAnalytics.trackTokenRefresh(true, {
        integrationId: 'int123',
        providerId: 'slack',
        providerName: 'Slack',
        organizationId: 'org123',
        userId: 'user123',
        status: 'success',
        duration: 800,
      })

      expect(console.log).toHaveBeenCalledWith(
        '[Integration Analytics]',
        expect.objectContaining({
          event: IntegrationEventType.TOKEN_REFRESH_SUCCESS,
        })
      )
    })

    it('should track failed token refresh', async () => {
      await IntegrationAnalytics.trackTokenRefresh(false, {
        integrationId: 'int456',
        providerId: 'google',
        providerName: 'Google',
        organizationId: 'org456',
        userId: 'user456',
        status: 'failure',
        errorCode: 'INVALID_REFRESH_TOKEN',
      })

      expect(console.log).toHaveBeenCalledWith(
        '[Integration Analytics]',
        expect.objectContaining({
          event: IntegrationEventType.TOKEN_REFRESH_FAILED,
        })
      )
    })
  })

  describe('trackWebhook', () => {
    it('should track webhook received', async () => {
      await IntegrationAnalytics.trackWebhook('received', {
        providerId: 'slack',
        providerName: 'Slack',
        organizationId: 'org123',
        userId: 'system',
        metadata: {
          webhookId: 'wh123',
          eventType: 'message_posted',
        },
      })

      expect(console.log).toHaveBeenCalledWith(
        '[Integration Analytics]',
        expect.objectContaining({
          event: IntegrationEventType.WEBHOOK_RECEIVED,
        })
      )
    })

    it('should track webhook processed', async () => {
      await IntegrationAnalytics.trackWebhook('processed', {
        providerId: 'google',
        providerName: 'Google',
        organizationId: 'org456',
        userId: 'system',
        status: 'success',
        duration: 250,
      })

      expect(console.log).toHaveBeenCalledWith(
        '[Integration Analytics]',
        expect.objectContaining({
          event: IntegrationEventType.WEBHOOK_PROCESSED,
        })
      )
    })

    it('should track webhook failed', async () => {
      await IntegrationAnalytics.trackWebhook('failed', {
        providerId: 'asana',
        providerName: 'Asana',
        organizationId: 'org789',
        userId: 'system',
        status: 'failure',
        errorCode: 'PROCESSING_ERROR',
        errorMessage: 'Failed to sync task',
      })

      expect(console.log).toHaveBeenCalledWith(
        '[Integration Analytics]',
        expect.objectContaining({
          event: IntegrationEventType.WEBHOOK_FAILED,
          properties: expect.objectContaining({
            errorCode: 'PROCESSING_ERROR',
          }),
        })
      )
    })
  })
})
