'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { logger } from '@/src/lib/monitoring/logger'
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js'

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface RealtimeSubscriptionOptions<T> {
  /**
   * Table name to subscribe to
   */
  table: string

  /**
   * Event types to listen for
   * @default '*' (all events)
   */
  event?: RealtimeEvent

  /**
   * Filter for the subscription (e.g., 'organization_id=eq.uuid')
   */
  filter?: string

  /**
   * Callback when INSERT event occurs
   */
  onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void

  /**
   * Callback when UPDATE event occurs
   */
  onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void

  /**
   * Callback when DELETE event occurs
   */
  onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void

  /**
   * Callback for any error
   */
  onError?: (error: Error) => void

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean

  /**
   * Auto-reconnect on disconnect
   * @default true
   */
  autoReconnect?: boolean

  /**
   * Throttle interval in ms (prevents too frequent updates)
   * @default 0 (no throttle)
   */
  throttleMs?: number
}

interface UseRealtimeSubscriptionReturn {
  /**
   * Connection status
   */
  status: 'connecting' | 'connected' | 'disconnected' | 'error'

  /**
   * Last error if any
   */
  error: Error | null

  /**
   * Manual reconnect function
   */
  reconnect: () => void

  /**
   * Unsubscribe function
   */
  unsubscribe: () => void
}

/**
 * Hook for subscribing to Realtime changes on a Supabase table
 *
 * @example
 * ```tsx
 * const { status, error } = useRealtimeSubscription({
 *   table: 'goals',
 *   event: '*',
 *   filter: `organization_id=eq.${organizationId}`,
 *   onInsert: (payload) => {
 *     logger.info('New goal:', payload.new)
 *     // Invalidate React Query cache
 *     queryClient.invalidateQueries(['goals'])
 *   },
 *   onUpdate: (payload) => {
 *     logger.info('Updated goal:', payload.new)
 *   },
 *   onDelete: (payload) => {
 *     logger.info('Deleted goal:', payload.old)
 *   },
 * })
 * ```
 */
export function useRealtimeSubscription<T = any>(
  options: RealtimeSubscriptionOptions<T>
): UseRealtimeSubscriptionReturn {
  const {
    table,
    event = '*',
    filter,
    onInsert,
    onUpdate,
    onDelete,
    onError,
    debug = false,
    autoReconnect = true,
    throttleMs = 0,
  } = options

  const [status, setStatus] = useState<UseRealtimeSubscriptionReturn['status']>('connecting')
  const [error, setError] = useState<Error | null>(null)

  const channelRef = useRef<RealtimeChannel | null>(null)
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastEventTimeRef = useRef<number>(0)

  const log = useCallback((...args: any[]) => {
    if (debug) {
      logger.info(`[Realtime ${table}]`, ...args)
    }
  }, [debug, table])

  const handlePayload = useCallback(
    (payload: RealtimePostgresChangesPayload<T>) => {
      // Throttling logic
      if (throttleMs > 0) {
        const now = Date.now()
        if (now - lastEventTimeRef.current < throttleMs) {
          if (throttleTimeoutRef.current) {
            clearTimeout(throttleTimeoutRef.current)
          }

          throttleTimeoutRef.current = setTimeout(() => {
            processPayload(payload)
            lastEventTimeRef.current = Date.now()
          }, throttleMs)
          return
        }
      }

      processPayload(payload)
      lastEventTimeRef.current = Date.now()
    },
    [throttleMs]
  )

  const processPayload = (payload: RealtimePostgresChangesPayload<T>) => {
    log('Event received:', payload.eventType, payload)

    try {
      switch (payload.eventType) {
        case 'INSERT':
          onInsert?.(payload)
          break
        case 'UPDATE':
          onUpdate?.(payload)
          break
        case 'DELETE':
          onDelete?.(payload)
          break
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      onError?.(error)
      log('Error processing payload:', error)
    }
  }

  const subscribe = useCallback(() => {
    const supabase = createClient()

    log('Subscribing to', { table, event, filter })
    setStatus('connecting')
    setError(null)

    // Create unique channel name
    const channelName = `realtime:${table}:${filter || 'all'}:${Date.now()}`

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          filter,
        } as any,
        handlePayload
      )
      .subscribe((status) => {
        log('Subscription status:', status)

        if (status === 'SUBSCRIBED') {
          setStatus('connected')
          log('✅ Connected')
        } else if (status === 'CHANNEL_ERROR') {
          setStatus('error')
          const err = new Error('Channel subscription error')
          setError(err)
          onError?.(err)
          log('❌ Error')

          // Auto-reconnect
          if (autoReconnect) {
            setTimeout(() => {
              log('Attempting to reconnect...')
              unsubscribe()
              subscribe()
            }, 5000)
          }
        } else if (status === 'TIMED_OUT') {
          setStatus('error')
          const err = new Error('Channel subscription timed out')
          setError(err)
          onError?.(err)
          log('❌ Timeout')
        } else if (status === 'CLOSED') {
          setStatus('disconnected')
          log('🔌 Disconnected')
        }
      })

    channelRef.current = channel
  }, [table, event, filter, handlePayload, autoReconnect, log])

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      log('Unsubscribing...')
      const supabase = createClient()
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
      setStatus('disconnected')
    }

    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current)
    }
  }, [log])

  const reconnect = useCallback(() => {
    log('Manual reconnect triggered')
    unsubscribe()
    subscribe()
  }, [unsubscribe, subscribe, log])

  useEffect(() => {
    subscribe()

    return () => {
      unsubscribe()
    }
  }, [subscribe, unsubscribe])

  return {
    status,
    error,
    reconnect,
    unsubscribe,
  }
}
