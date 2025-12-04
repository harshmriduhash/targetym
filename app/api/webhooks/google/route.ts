/**
 * Google Workspace Webhook Handler
 * Handles push notifications from Google Calendar, Drive, and Gmail
 *
 * Google uses a different approach than traditional webhooks:
 * - Watch channels are created for specific resources
 * - Google sends notifications when resources change
 * - Channels have an expiration and must be renewed
 *
 * Security:
 * - Validates X-Goog-Channel-ID matches our webhook configuration
 * - Checks X-Goog-Resource-State for valid states
 * - Optional: Token verification for additional security
 *
 * Supported Services:
 * - Google Calendar: Event changes
 * - Google Drive: File/folder changes
 * - Gmail: Message changes
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'
import { log } from '@/src/lib/logger'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

/**
 * Google push notification headers
 */
interface GoogleNotificationHeaders {
  channelId: string
  channelToken?: string
  resourceId: string
  resourceState: GoogleResourceState
  resourceUri: string
  messageNumber: string
  channelExpiration?: string
}

/**
 * Google resource states
 */
type GoogleResourceState =
  | 'sync' // Initial sync notification
  | 'exists' // Resource exists but changed
  | 'not_exists' // Resource was deleted
  | 'update' // Resource was updated

/**
 * Supported Google service types
 */
type GoogleServiceType = 'calendar' | 'drive' | 'gmail'

/**
 * Extract Google notification headers from request
 *
 * @param request - Next.js request object
 * @returns Parsed headers or null if invalid
 */
function extractGoogleHeaders(
  request: NextRequest
): GoogleNotificationHeaders | null {
  try {
    const channelId = request.headers.get('X-Goog-Channel-ID')
    const channelToken = request.headers.get('X-Goog-Channel-Token') || undefined
    const resourceId = request.headers.get('X-Goog-Resource-ID')
    const resourceState = request.headers.get('X-Goog-Resource-State')
    const resourceUri = request.headers.get('X-Goog-Resource-URI')
    const messageNumber = request.headers.get('X-Goog-Message-Number')
    const channelExpiration = request.headers.get('X-Goog-Channel-Expiration') || undefined

    if (!channelId || !resourceId || !resourceState || !resourceUri || !messageNumber) {
      return null
    }

    // Validate resource state
    const validStates: GoogleResourceState[] = ['sync', 'exists', 'not_exists', 'update']
    if (!validStates.includes(resourceState as GoogleResourceState)) {
      return null
    }

    return {
      channelId,
      channelToken,
      resourceId,
      resourceState: resourceState as GoogleResourceState,
      resourceUri,
      messageNumber,
      channelExpiration
    }
  } catch (error) {
    log.error('Failed to extract Google headers', error)
    return null
  }
}

/**
 * Determine service type from resource URI
 *
 * @param resourceUri - Google resource URI
 * @returns Service type or null if unknown
 */
function determineServiceType(resourceUri: string): GoogleServiceType | null {
  if (resourceUri.includes('calendar')) {
    return 'calendar'
  } else if (resourceUri.includes('drive')) {
    return 'drive'
  } else if (resourceUri.includes('gmail')) {
    return 'gmail'
  }
  return null
}

/**
 * Log webhook event to database
 *
 * @param integrationId - UUID of the integration
 * @param serviceType - Type of Google service
 * @param resourceState - State of the resource
 * @param headers - Full notification headers
 * @param status - Processing status
 * @param errorMessage - Error message if failed
 */
async function logWebhookEvent(
  integrationId: string,
  serviceType: GoogleServiceType,
  resourceState: GoogleResourceState,
  headers: GoogleNotificationHeaders,
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
      resource_type: `${serviceType}:${resourceState}`,
      resource_count: 1,
      started_at: startedAt,
      completed_at: now,
      duration_ms: 0,
      records_processed: 1,
      records_created: status === 'completed' ? 1 : 0,
      records_failed: status === 'failed' ? 1 : 0,
      error_message: errorMessage,
      metadata: {
        service_type: serviceType,
        resource_state: resourceState,
        resource_id: headers.resourceId,
        message_number: headers.messageNumber,
        channel_expiration: headers.channelExpiration,
        timestamp: new Date().toISOString()
      }
    })

    log.info('Google webhook event logged', {
      integrationId,
      serviceType,
      resourceState,
      status
    })
  } catch (error) {
    log.error('Failed to log Google webhook event', {
      integrationId,
      serviceType,
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
    log.error('Failed to update Google webhook stats', {
      webhookId,
      error
    })
  }
}

/**
 * Process Google notification
 *
 * @param headers - Google notification headers
 * @param integrationId - UUID of the integration
 * @param serviceType - Type of Google service
 * @returns Processing result
 */
async function processGoogleNotification(
  headers: GoogleNotificationHeaders,
  integrationId: string,
  serviceType: GoogleServiceType
): Promise<{ success: boolean; error?: string }> {
  try {
    log.info('Processing Google notification', {
      serviceType,
      resourceState: headers.resourceState,
      integrationId
    })

    // Handle sync notification (initial setup)
    if (headers.resourceState === 'sync') {
      log.info('Google sync notification received', {
        serviceType,
        channelId: headers.channelId
      })

      await logWebhookEvent(
        integrationId,
        serviceType,
        headers.resourceState,
        headers,
        'completed'
      )

      return { success: true }
    }

    // Handle different service types and states
    switch (serviceType) {
      case 'calendar':
        await processCalendarNotification(headers, integrationId)
        break

      case 'drive':
        await processDriveNotification(headers, integrationId)
        break

      case 'gmail':
        await processGmailNotification(headers, integrationId)
        break

      default:
        log.warn('Unknown Google service type', { serviceType })
    }

    await logWebhookEvent(
      integrationId,
      serviceType,
      headers.resourceState,
      headers,
      'completed'
    )

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    await logWebhookEvent(
      integrationId,
      serviceType,
      headers.resourceState,
      headers,
      'failed',
      errorMessage
    )

    return { success: false, error: errorMessage }
  }
}

/**
 * Process Google Calendar notification
 *
 * @param headers - Google notification headers
 * @param _integrationId - UUID of the integration (reserved for future use)
 */
async function processCalendarNotification(
  headers: GoogleNotificationHeaders,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _integrationId: string
): Promise<void> {
  log.info('Processing Calendar notification', {
    resourceState: headers.resourceState,
    resourceId: headers.resourceId
  })

  // TODO: Implement calendar event processing
  // - Fetch changed events using Google Calendar API
  // - Sync to local database
  // - Handle event deletions

  switch (headers.resourceState) {
    case 'exists':
    case 'update':
      log.info('Calendar resource changed', {
        resourceId: headers.resourceId,
        resourceUri: headers.resourceUri
      })
      break

    case 'not_exists':
      log.info('Calendar resource deleted', {
        resourceId: headers.resourceId
      })
      break
  }
}

/**
 * Process Google Drive notification
 *
 * @param headers - Google notification headers
 * @param _integrationId - UUID of the integration (reserved for future use)
 */
async function processDriveNotification(
  headers: GoogleNotificationHeaders,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _integrationId: string
): Promise<void> {
  log.info('Processing Drive notification', {
    resourceState: headers.resourceState,
    resourceId: headers.resourceId
  })

  // TODO: Implement drive file processing
  // - Fetch changed files using Google Drive API
  // - Sync file metadata to local database
  // - Handle file deletions

  switch (headers.resourceState) {
    case 'exists':
    case 'update':
      log.info('Drive resource changed', {
        resourceId: headers.resourceId,
        resourceUri: headers.resourceUri
      })
      break

    case 'not_exists':
      log.info('Drive resource deleted', {
        resourceId: headers.resourceId
      })
      break
  }
}

/**
 * Process Gmail notification
 *
 * @param headers - Google notification headers
 * @param _integrationId - UUID of the integration (reserved for future use)
 */
async function processGmailNotification(
  headers: GoogleNotificationHeaders,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _integrationId: string
): Promise<void> {
  log.info('Processing Gmail notification', {
    resourceState: headers.resourceState,
    resourceId: headers.resourceId
  })

  // TODO: Implement gmail message processing
  // - Fetch new/changed messages using Gmail API
  // - Process labels, threads, attachments
  // - Sync to local database

  switch (headers.resourceState) {
    case 'exists':
    case 'update':
      log.info('Gmail resource changed', {
        resourceId: headers.resourceId,
        resourceUri: headers.resourceUri
      })
      break

    case 'not_exists':
      log.info('Gmail resource deleted', {
        resourceId: headers.resourceId
      })
      break
  }
}

/**
 * POST /api/webhooks/google
 *
 * Handles incoming push notifications from Google Workspace services
 *
 * Headers:
 * - X-Goog-Channel-ID: Unique channel identifier
 * - X-Goog-Channel-Token: Optional verification token
 * - X-Goog-Resource-ID: Resource identifier
 * - X-Goog-Resource-State: State of the resource (sync, exists, not_exists, update)
 * - X-Goog-Resource-URI: URI of the changed resource
 * - X-Goog-Message-Number: Message sequence number
 * - X-Goog-Channel-Expiration: Optional channel expiration timestamp
 *
 * Query Parameters:
 * - webhook_id: UUID of the webhook configuration (optional for backward compatibility)
 *
 * Response:
 * - 200: Notification processed successfully
 * - 400: Invalid request (missing headers, invalid state)
 * - 401: Verification failed (invalid channel ID or token)
 * - 404: Webhook configuration not found
 * - 500: Internal server error
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Extract Google notification headers
    const headers = extractGoogleHeaders(request)

    if (!headers) {
      log.warn('Missing or invalid Google notification headers')
      return NextResponse.json(
        { error: 'Missing required Google notification headers' },
        { status: 400 }
      )
    }

    log.info('Google notification received', {
      channelId: headers.channelId,
      resourceState: headers.resourceState,
      messageNumber: headers.messageNumber
    })

    // Fetch webhook configuration from database using channel ID
    const supabase = await createClient()
    const { data: webhook, error: webhookError } = await supabase
      .from('integration_webhooks')
      .select('id, integration_id, secret_encrypted, is_active, external_webhook_id')
      .eq('external_webhook_id', headers.channelId)
      .single()

    if (webhookError || !webhook) {
      log.warn('Webhook configuration not found', {
        channelId: headers.channelId,
        error: webhookError
      })

      return NextResponse.json(
        { error: 'Webhook configuration not found' },
        { status: 404 }
      )
    }

    if (!webhook.is_active) {
      log.warn('Webhook is inactive', {
        webhookId: webhook.id,
        channelId: headers.channelId
      })

      return NextResponse.json(
        { error: 'Webhook is inactive' },
        { status: 403 }
      )
    }

    // Verify channel token if configured
    if (headers.channelToken && webhook.secret_encrypted) {
      if (headers.channelToken !== webhook.secret_encrypted) {
        await updateWebhookStats(webhook.id, false)

        log.warn('Invalid channel token', {
          webhookId: webhook.id,
          channelId: headers.channelId
        })

        return NextResponse.json(
          { error: 'Invalid channel token' },
          { status: 401 }
        )
      }
    }

    // Determine service type from resource URI
    const serviceType = determineServiceType(headers.resourceUri)

    if (!serviceType) {
      log.warn('Unknown Google service type', {
        resourceUri: headers.resourceUri
      })

      return NextResponse.json(
        { error: 'Unknown service type' },
        { status: 400 }
      )
    }

    // Process notification
    const result = await processGoogleNotification(
      headers,
      webhook.integration_id,
      serviceType
    )

    await updateWebhookStats(webhook.id, result.success)

    const duration = Date.now() - startTime

    if (result.success) {
      log.info('Google notification processed successfully', {
        webhookId: webhook.id,
        serviceType,
        resourceState: headers.resourceState,
        duration
      })

      return NextResponse.json(
        { success: true },
        { status: 200 }
      )
    } else {
      log.error('Failed to process Google notification', {
        webhookId: webhook.id,
        serviceType,
        resourceState: headers.resourceState,
        error: result.error,
        duration
      })

      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    const duration = Date.now() - startTime

    log.error('Google webhook handler error', {
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

/**
 * GET /api/webhooks/google
 *
 * Optional: Health check endpoint for Google webhook
 * Can be used to verify webhook is accessible
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'google-webhook',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  )
}
