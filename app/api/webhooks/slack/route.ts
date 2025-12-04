/**
 * Slack Webhook Handler
 * Handles incoming webhook events from Slack with signature verification
 *
 * Security:
 * - HMAC SHA256 signature verification
 * - Timestamp replay attack protection (5-minute window)
 * - Timing-safe comparison
 *
 * Supported Events:
 * - URL verification challenge
 * - message events
 * - channel_created, channel_deleted, channel_renamed
 * - user_change, user_profile_changed
 * - team_join
 * - app_mention
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'
import { log } from '@/src/lib/logger'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Slack event payload types
 */
interface SlackEventBase {
  token: string
  team_id: string
  api_app_id: string
  type: string
}

interface SlackUrlVerification extends SlackEventBase {
  type: 'url_verification'
  challenge: string
}

interface SlackEventCallback extends SlackEventBase {
  type: 'event_callback'
  event_id: string
  event_time: number
  event: {
    type: string
    user?: string
    channel?: string
    text?: string
    ts?: string
    // Additional event-specific fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
}

type SlackWebhookPayload = SlackUrlVerification | SlackEventCallback

/**
 * Verify Slack signature using HMAC SHA256
 *
 * Algorithm:
 * 1. Check timestamp is within 5 minutes (replay attack protection)
 * 2. Construct signature base string: v0:{timestamp}:{body}
 * 3. Compute HMAC SHA256 with signing secret
 * 4. Compare with timing-safe equality
 *
 * @param signingSecret - Slack signing secret from webhook config
 * @param timestamp - X-Slack-Request-Timestamp header
 * @param body - Raw request body string
 * @param signature - X-Slack-Signature header
 * @returns true if signature is valid
 */
function verifySlackSignature(
  signingSecret: string,
  timestamp: string,
  body: string,
  signature: string
): boolean {
  try {
    // Step 1: Verify timestamp is recent (within 5 minutes)
    const currentTime = Math.floor(Date.now() / 1000)
    const requestTime = parseInt(timestamp, 10)

    if (isNaN(requestTime)) {
      log.warn('Invalid timestamp format', { timestamp })
      return false
    }

    if (Math.abs(currentTime - requestTime) > 60 * 5) {
      log.warn('Request timestamp too old', {
        currentTime,
        requestTime,
        difference: currentTime - requestTime
      })
      return false
    }

    // Step 2: Construct signature base string
    const sigBasestring = `v0:${timestamp}:${body}`

    // Step 3: Compute HMAC SHA256
    const mySignature = 'v0=' + crypto
      .createHmac('sha256', signingSecret)
      .update(sigBasestring, 'utf8')
      .digest('hex')

    // Step 4: Timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(mySignature, 'utf8'),
      Buffer.from(signature, 'utf8')
    )
  } catch (error) {
    log.error('Signature verification failed', error)
    return false
  }
}

/**
 * Log webhook event to database
 *
 * @param integrationId - UUID of the integration
 * @param eventType - Type of event received
 * @param payload - Full event payload
 * @param status - Processing status
 * @param errorMessage - Error message if failed
 */
async function logWebhookEvent(
  integrationId: string,
  eventType: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any,
  status: 'completed' | 'failed',
  errorMessage?: string
): Promise<void> {
  try {
    const supabase = await createClient()

    const now = new Date().toISOString()
    const startedAt = now

    await supabase.from('integration_sync_logs').insert({
      integration_id: integrationId,
      sync_type: 'webhook',
      direction: 'pull',
      status,
      resource_type: eventType,
      resource_count: 1,
      started_at: startedAt,
      completed_at: now,
      duration_ms: 0,
      records_processed: 1,
      records_created: status === 'completed' ? 1 : 0,
      records_failed: status === 'failed' ? 1 : 0,
      error_message: errorMessage,
      metadata: {
        event_type: eventType,
        payload_size: JSON.stringify(payload).length,
        timestamp: new Date().toISOString()
      }
    })

    log.info('Webhook event logged', {
      integrationId,
      eventType,
      status
    })
  } catch (error) {
    log.error('Failed to log webhook event', {
      integrationId,
      eventType,
      error
    })
  }
}

/**
 * Update webhook statistics
 *
 * @param webhookId - UUID of the webhook configuration
 * @param success - Whether the webhook processing succeeded
 */
async function updateWebhookStats(
  webhookId: string,
  success: boolean
): Promise<void> {
  try {
    const supabase = await createClient()

    const now = new Date().toISOString()

    // Fetch current stats
    const { data: currentWebhook } = await supabase
      .from('integration_webhooks')
      .select('total_received, total_failed')
      .eq('id', webhookId)
      .single()

    if (!currentWebhook) {
      log.warn('Webhook not found for stats update', { webhookId })
      return
    }

    // Update stats with incremented values
    if (success) {
      await supabase
        .from('integration_webhooks')
        .update({
          total_received: (currentWebhook.total_received || 0) + 1,
          last_received_at: now,
          last_verified_at: now
        })
        .eq('id', webhookId)
    } else {
      await supabase
        .from('integration_webhooks')
        .update({
          total_received: (currentWebhook.total_received || 0) + 1,
          total_failed: (currentWebhook.total_failed || 0) + 1,
          last_received_at: now
        })
        .eq('id', webhookId)
    }
  } catch (error) {
    log.error('Failed to update webhook stats', {
      webhookId,
      error
    })
  }
}

/**
 * Process Slack event
 *
 * @param event - Slack event payload
 * @param integrationId - UUID of the integration
 * @returns Processing result
 */
async function processSlackEvent(
  event: SlackEventCallback['event'],
  integrationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    log.info('Processing Slack event', {
      eventType: event.type,
      integrationId
    })

    // Handle different event types
    switch (event.type) {
      case 'message':
        // Process message event
        // TODO: Implement message processing logic
        log.info('Message event received', {
          channel: event.channel,
          user: event.user,
          text: event.text?.substring(0, 100)
        })
        break

      case 'channel_created':
      case 'channel_deleted':
      case 'channel_renamed':
        // Process channel events
        log.info('Channel event received', {
          eventType: event.type,
          channel: event.channel
        })
        break

      case 'user_change':
      case 'user_profile_changed':
        // Process user events
        log.info('User event received', {
          eventType: event.type,
          user: event.user
        })
        break

      case 'team_join':
        // Process team join event
        log.info('Team join event received', {
          user: event.user
        })
        break

      case 'app_mention':
        // Process app mention
        log.info('App mention received', {
          user: event.user,
          text: event.text?.substring(0, 100)
        })
        break

      default:
        log.warn('Unhandled event type', { eventType: event.type })
    }

    await logWebhookEvent(integrationId, event.type, event, 'completed')

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    await logWebhookEvent(
      integrationId,
      event.type,
      event,
      'failed',
      errorMessage
    )

    return { success: false, error: errorMessage }
  }
}

/**
 * POST /api/webhooks/slack
 *
 * Handles incoming webhook events from Slack
 *
 * Headers:
 * - X-Slack-Request-Timestamp: Unix timestamp
 * - X-Slack-Signature: HMAC signature for verification
 *
 * Query Parameters:
 * - webhook_id: UUID of the webhook configuration (required)
 *
 * Response:
 * - 200: Event processed successfully
 * - 400: Invalid request (missing webhook_id, invalid payload)
 * - 401: Signature verification failed
 * - 500: Internal server error
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Extract webhook_id from query parameters
    const { searchParams } = new URL(request.url)
    const webhookId = searchParams.get('webhook_id')

    if (!webhookId) {
      log.warn('Missing webhook_id in request')
      return NextResponse.json(
        { error: 'Missing webhook_id parameter' },
        { status: 400 }
      )
    }

    // Get request body and headers
    const bodyText = await request.text()
    const slackTimestamp = request.headers.get('X-Slack-Request-Timestamp')
    const slackSignature = request.headers.get('X-Slack-Signature')

    if (!slackTimestamp || !slackSignature) {
      log.warn('Missing Slack signature headers')
      return NextResponse.json(
        { error: 'Missing required Slack headers' },
        { status: 401 }
      )
    }

    // Fetch webhook configuration from database
    const supabase = await createClient()
    const { data: webhook, error: webhookError } = await supabase
      .from('integration_webhooks')
      .select('id, integration_id, secret_encrypted, is_active')
      .eq('id', webhookId)
      .single()

    if (webhookError || !webhook) {
      log.warn('Webhook configuration not found', { webhookId, error: webhookError })
      return NextResponse.json(
        { error: 'Webhook not found' },
        { status: 404 }
      )
    }

    if (!webhook.is_active) {
      log.warn('Webhook is inactive', { webhookId })
      return NextResponse.json(
        { error: 'Webhook is inactive' },
        { status: 403 }
      )
    }

    // Verify Slack signature
    const isValidSignature = verifySlackSignature(
      webhook.secret_encrypted,
      slackTimestamp,
      bodyText,
      slackSignature
    )

    if (!isValidSignature) {
      await updateWebhookStats(webhookId, false)
      log.warn('Invalid Slack signature', { webhookId })
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse payload
    let payload: SlackWebhookPayload
    try {
      payload = JSON.parse(bodyText)
    } catch (parseError) {
      log.error('Failed to parse webhook payload', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    // Handle URL verification challenge
    if (payload.type === 'url_verification') {
      log.info('Slack URL verification challenge received', {
        webhookId,
        challenge: payload.challenge.substring(0, 20)
      })

      await updateWebhookStats(webhookId, true)

      return NextResponse.json(
        { challenge: payload.challenge },
        { status: 200 }
      )
    }

    // Handle event callback
    if (payload.type === 'event_callback') {
      const result = await processSlackEvent(
        payload.event,
        webhook.integration_id
      )

      await updateWebhookStats(webhookId, result.success)

      const duration = Date.now() - startTime

      if (result.success) {
        log.info('Slack event processed successfully', {
          webhookId,
          eventType: payload.event.type,
          duration
        })

        return NextResponse.json(
          { success: true },
          { status: 200 }
        )
      } else {
        log.error('Failed to process Slack event', {
          webhookId,
          eventType: payload.event.type,
          error: result.error,
          duration
        })

        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        )
      }
    }

    // Unknown event type (should never reach here due to type narrowing)
    log.warn('Unknown Slack event type', {
      webhookId,
      eventType: (payload as SlackEventBase).type
    })

    return NextResponse.json(
      { error: 'Unknown event type' },
      { status: 400 }
    )
  } catch (error) {
    const duration = Date.now() - startTime

    log.error('Slack webhook handler error', {
      error,
      duration
    })

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
