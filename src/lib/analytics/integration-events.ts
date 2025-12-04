/**
 * Integration Analytics Events
 *
 * Track integration usage, success rates, and user behavior
 * for A/B testing and product analytics
 *
 * @module IntegrationAnalytics
 */


export interface IntegrationEventProperties {
  integrationId?: string
  providerId: string
  providerName: string
  organizationId: string
  userId: string
  status?: 'success' | 'failure' | 'pending'
  errorCode?: string
  errorMessage?: string
  duration?: number
  metadata?: Record<string, unknown>
}

export interface ABTestVariant {
  experimentId: string
  variantId: string
  variantName: string
}

/**
 * Integration event types for analytics
 */
export enum IntegrationEventType {
  // Connection lifecycle
  CONNECTION_INITIATED = 'integration_connection_initiated',
  CONNECTION_AUTHORIZED = 'integration_connection_authorized',
  CONNECTION_COMPLETED = 'integration_connection_completed',
  CONNECTION_FAILED = 'integration_connection_failed',
  DISCONNECTION_INITIATED = 'integration_disconnection_initiated',
  DISCONNECTION_COMPLETED = 'integration_disconnection_completed',

  // OAuth flow
  OAUTH_REDIRECT = 'integration_oauth_redirect',
  OAUTH_CALLBACK_RECEIVED = 'integration_oauth_callback_received',
  OAUTH_TOKEN_EXCHANGE = 'integration_oauth_token_exchange',
  OAUTH_ERROR = 'integration_oauth_error',

  // Token management
  TOKEN_REFRESH_ATTEMPTED = 'integration_token_refresh_attempted',
  TOKEN_REFRESH_SUCCESS = 'integration_token_refresh_success',
  TOKEN_REFRESH_FAILED = 'integration_token_refresh_failed',
  TOKEN_REVOCATION = 'integration_token_revocation',

  // Webhook events
  WEBHOOK_RECEIVED = 'integration_webhook_received',
  WEBHOOK_PROCESSED = 'integration_webhook_processed',
  WEBHOOK_FAILED = 'integration_webhook_failed',

  // Sync operations
  SYNC_STARTED = 'integration_sync_started',
  SYNC_COMPLETED = 'integration_sync_completed',
  SYNC_FAILED = 'integration_sync_failed',

  // Health monitoring
  HEALTH_CHECK_SUCCESS = 'integration_health_check_success',
  HEALTH_CHECK_DEGRADED = 'integration_health_check_degraded',
  HEALTH_CHECK_FAILED = 'integration_health_check_failed',

  // User interactions
  SETTINGS_VIEWED = 'integration_settings_viewed',
  PROVIDER_SELECTED = 'integration_provider_selected',
  DOCUMENTATION_VIEWED = 'integration_documentation_viewed',
}

/**
 * Integration Analytics Service
 *
 * Tracks integration events for product analytics and A/B testing
 */
export class IntegrationAnalytics {
  /**
   * Track integration event
   *
   * @param eventType - Type of event
   * @param properties - Event properties
   * @param abTestVariant - Optional A/B test variant
   *
   * @example
   * ```typescript
   * await IntegrationAnalytics.track(
   *   IntegrationEventType.CONNECTION_COMPLETED,
   *   {
   *     providerId: 'slack',
   *     providerName: 'Slack',
   *     organizationId: 'org123',
   *     userId: 'user123',
   *     status: 'success',
   *     duration: 3500
   *   }
   * )
   * ```
   */
  static async track(
    eventType: IntegrationEventType,
    properties: IntegrationEventProperties,
    abTestVariant?: ABTestVariant
  ): Promise<void> {
    try {
      const event = {
        event: eventType,
        timestamp: new Date().toISOString(),
        properties: {
          ...properties,
          // Add A/B test context
          ...(abTestVariant && {
            experiment_id: abTestVariant.experimentId,
            variant_id: abTestVariant.variantId,
            variant_name: abTestVariant.variantName,
          }),
        },
      }

      // In production, send to analytics platform (Segment, Amplitude, Mixpanel)
      if (process.env.NODE_ENV === 'production') {
        await this.sendToAnalyticsPlatform(event)
      } else {
        // In development, log to console
        console.log('[Integration Analytics]', event)
      }
    } catch (error) {
      // Never throw analytics errors
      console.error('[Integration Analytics] Error tracking event:', error)
    }
  }

  /**
   * Track connection flow
   *
   * @param step - Flow step (initiated, authorized, completed)
   * @param properties - Event properties
   */
  static async trackConnectionFlow(
    step: 'initiated' | 'authorized' | 'completed' | 'failed',
    properties: IntegrationEventProperties
  ): Promise<void> {
    const eventMap = {
      initiated: IntegrationEventType.CONNECTION_INITIATED,
      authorized: IntegrationEventType.CONNECTION_AUTHORIZED,
      completed: IntegrationEventType.CONNECTION_COMPLETED,
      failed: IntegrationEventType.CONNECTION_FAILED,
    }

    await this.track(eventMap[step], properties)
  }

  /**
   * Track OAuth flow
   *
   * @param step - OAuth step
   * @param properties - Event properties
   */
  static async trackOAuthFlow(
    step: 'redirect' | 'callback' | 'token_exchange' | 'error',
    properties: IntegrationEventProperties
  ): Promise<void> {
    const eventMap = {
      redirect: IntegrationEventType.OAUTH_REDIRECT,
      callback: IntegrationEventType.OAUTH_CALLBACK_RECEIVED,
      token_exchange: IntegrationEventType.OAUTH_TOKEN_EXCHANGE,
      error: IntegrationEventType.OAUTH_ERROR,
    }

    await this.track(eventMap[step], properties)
  }

  /**
   * Track token refresh
   *
   * @param success - Whether refresh succeeded
   * @param properties - Event properties
   */
  static async trackTokenRefresh(
    success: boolean,
    properties: IntegrationEventProperties
  ): Promise<void> {
    const eventType = success
      ? IntegrationEventType.TOKEN_REFRESH_SUCCESS
      : IntegrationEventType.TOKEN_REFRESH_FAILED

    await this.track(eventType, properties)
  }

  /**
   * Track webhook event
   *
   * @param status - Webhook processing status
   * @param properties - Event properties
   */
  static async trackWebhook(
    status: 'received' | 'processed' | 'failed',
    properties: IntegrationEventProperties
  ): Promise<void> {
    const eventMap = {
      received: IntegrationEventType.WEBHOOK_RECEIVED,
      processed: IntegrationEventType.WEBHOOK_PROCESSED,
      failed: IntegrationEventType.WEBHOOK_FAILED,
    }

    await this.track(eventMap[status], properties)
  }

  /**
   * Send event to analytics platform (internal)
   *
   * @private
   */
  private static async sendToAnalyticsPlatform(event: {
    event: string
    timestamp: string
    properties: Record<string, unknown>
  }): Promise<void> {
    // Example: Send to Segment
    if (process.env.SEGMENT_WRITE_KEY) {
      // Implement Segment integration
      // await segment.track(event)
    }

    // Example: Send to Amplitude
    if (process.env.AMPLITUDE_API_KEY) {
      // Implement Amplitude integration
      // await amplitude.track(event)
    }

    // Example: Send to Mixpanel
    if (process.env.MIXPANEL_TOKEN) {
      // Implement Mixpanel integration
      // await mixpanel.track(event)
    }

    // For now, just log in production
    console.log('[Analytics]', event)
  }
}
