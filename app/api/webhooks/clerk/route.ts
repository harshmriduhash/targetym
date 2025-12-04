import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@/src/lib/supabase/server'
import { logger } from '@/src/lib/logger'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    logger.warn({ event: 'webhook_error' }, 'Missing Svix headers')
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch (err) {
    logger.error({ error: err, svixId }, 'Webhook signature verification failed')
    return new Response('Error occurred', {
      status: 400,
    })
  }

  // Check idempotency: has this webhook been processed already?
  const supabase = await createClient()
  const { data: existingEvent, error: lookupError } = await supabase
    // @ts-ignore - webhook_events table exists but types not yet regenerated
    .from('webhook_events')
    .select('id, event_type')
    .eq('svix_id', svixId)
    .single()

  if (lookupError && lookupError.code !== 'PGRST116') {
    // PGRST116 = no rows, which is expected for new webhooks
    logger.error({ error: lookupError, svixId }, 'Failed to check webhook idempotency')
    return new Response('Database error', { status: 500 })
  }

  if (existingEvent) {
    logger.info({ svixId, eventType: existingEvent.event_type }, 'Webhook already processed (idempotent response)')
    return new Response(JSON.stringify({ status: 'already_processed', ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data

    const primaryEmail = email_addresses.find((email) => email.id === evt.data.primary_email_address_id)

    if (!primaryEmail) {
      logger.warn({ userId: id }, 'No primary email found for user')
      return new Response('No primary email found', { status: 400 })
    }

    // Create profile in Supabase
    // Note: organization_id is required but Clerk doesn't provide it in webhooks
    // This should be set later when user joins/creates an organization
    const { error } = await supabase.from('profiles').insert({
      id,
      email: primaryEmail.email_address,
      full_name: `${first_name || ''} ${last_name || ''}`.trim() || primaryEmail.email_address.split('@')[0],
      organization_id: '00000000-0000-0000-0000-000000000000', // Placeholder - will be updated when user joins org
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      logger.error({ error: error.message, userId: id }, 'Failed to create profile')
      return new Response('Error creating profile', { status: 500 })
    }

    // Record webhook as processed
    await supabase
      // @ts-ignore - webhook_events table exists but types not yet regenerated
      .from('webhook_events').insert({
      svix_id: svixId,
      event_type: eventType,
      payload: evt.data as any, // Cast Clerk UserJSON to Json type
    })

    logger.info({ userId: id, email: primaryEmail.email_address }, 'User profile created successfully')
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data

    const primaryEmail = email_addresses.find((email) => email.id === evt.data.primary_email_address_id)

    if (!primaryEmail) {
      logger.warn({ userId: id }, 'No primary email found for user update')
      return new Response('No primary email found', { status: 400 })
    }

    // Update profile in Supabase
    const { error } = await supabase
      .from('profiles')
      .update({
        email: primaryEmail.email_address,
        full_name: `${first_name || ''} ${last_name || ''}`.trim() || primaryEmail.email_address.split('@')[0],
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      logger.error({ error: error.message, userId: id }, 'Failed to update profile')
      return new Response('Error updating profile', { status: 500 })
    }

    // Record webhook as processed
    await supabase.from('webhook_events').insert({
      svix_id: svixId,
      event_type: eventType,
      payload: evt.data as any, // Cast Clerk UserJSON to Json type
    })

    logger.info({ userId: id, email: primaryEmail.email_address }, 'User profile updated successfully')
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    if (!id) {
      logger.warn({ event: 'user_deleted' }, 'No user ID found in deletion event')
      return new Response('No user ID found', { status: 400 })
    }

    // Hard-delete profile for now (soft-delete will be re-enabled after type regeneration)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (error) {
      logger.error({ error: error.message, userId: id }, 'Failed to delete profile')
      return new Response('Error deleting profile', { status: 500 })
    }

    // Record webhook as processed
    await supabase
      // @ts-ignore - webhook_events table exists but types not yet regenerated
      .from('webhook_events').insert({
      svix_id: svixId,
      event_type: eventType,
      payload: evt.data as any, // Cast Clerk UserDeletedJSON to Json type
    })

    logger.info({ userId: id }, 'User profile deleted successfully')
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
