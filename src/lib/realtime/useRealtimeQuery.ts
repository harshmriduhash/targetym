'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRealtimeSubscription } from './useRealtimeSubscription'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { logger } from '@/src/lib/monitoring/logger'

interface UseRealtimeQueryOptions<T> {
  /**
   * Table name to subscribe to
   */
  table: string

  /**
   * React Query cache key to invalidate
   */
  queryKey: any[]

  /**
   * Filter for the subscription
   */
  filter?: string

  /**
   * Strategy for handling updates
   * - 'invalidate': Invalidate and refetch (default, safest)
   * - 'optimistic': Update cache directly (faster, requires careful handling)
   * @default 'invalidate'
   */
  strategy?: 'invalidate' | 'optimistic'

  /**
   * Custom handler for INSERT events (when using optimistic strategy)
   */
  onOptimisticInsert?: (newData: T) => void

  /**
   * Custom handler for UPDATE events (when using optimistic strategy)
   */
  onOptimisticUpdate?: (oldData: T, newData: T) => void

  /**
   * Custom handler for DELETE events (when using optimistic strategy)
   */
  onOptimisticDelete?: (oldData: T) => void

  /**
   * Throttle invalidations to prevent too frequent refetches
   * @default 1000ms
   */
  throttleMs?: number

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean

  /**
   * Enable the subscription
   * @default true
   */
  enabled?: boolean
}

/**
 * Hook that combines Realtime subscriptions with React Query cache invalidation
 *
 * This hook automatically invalidates React Query caches when Realtime events occur,
 * ensuring your UI stays in sync with the database.
 *
 * @example
 * ```tsx
 * // In your component
 * const { data: goals } = useQuery({
 *   queryKey: ['goals', organizationId],
 *   queryFn: () => fetchGoals(organizationId)
 * })
 *
 * // Automatically invalidate when goals change
 * const { status } = useRealtimeQuery({
 *   table: 'goals',
 *   queryKey: ['goals', organizationId],
 *   filter: `organization_id=eq.${organizationId}`,
 *   throttleMs: 2000, // Wait 2s before refetching
 * })
 * ```
 *
 * @example Optimistic updates
 * ```tsx
 * const { status } = useRealtimeQuery<Goal>({
 *   table: 'goals',
 *   queryKey: ['goals', organizationId],
 *   filter: `organization_id=eq.${organizationId}`,
 *   strategy: 'optimistic',
 *   onOptimisticInsert: (newGoal) => {
 *     queryClient.setQueryData(['goals', organizationId], (old: Goal[] = []) =>
 *       [...old, newGoal]
 *     )
 *   },
 *   onOptimisticUpdate: (oldGoal, newGoal) => {
 *     queryClient.setQueryData(['goals', organizationId], (old: Goal[] = []) =>
 *       old.map(g => g.id === newGoal.id ? newGoal : g)
 *     )
 *   },
 *   onOptimisticDelete: (oldGoal) => {
 *     queryClient.setQueryData(['goals', organizationId], (old: Goal[] = []) =>
 *       old.filter(g => g.id !== oldGoal.id)
 *     )
 *   },
 * })
 * ```
 */
export function useRealtimeQuery<T = any>(options: UseRealtimeQueryOptions<T>) {
  const {
    table,
    queryKey,
    filter,
    strategy = 'invalidate',
    onOptimisticInsert,
    onOptimisticUpdate,
    onOptimisticDelete,
    throttleMs = 1000,
    debug = false,
    enabled = true,
  } = options

  const queryClient = useQueryClient()

  const subscription = useRealtimeSubscription<T>({
    table,
    filter,
    throttleMs,
    debug,
    onInsert: (payload) => {
      if (!enabled) return

      if (debug) {
        logger.info(`[Realtime Query ${table}] INSERT event`, payload)
      }

      if (strategy === 'optimistic' && onOptimisticInsert) {
        onOptimisticInsert(payload.new as T)
      } else {
        // Invalidate strategy
        queryClient.invalidateQueries({ queryKey })
      }
    },
    onUpdate: (payload) => {
      if (!enabled) return

      if (debug) {
        logger.info(`[Realtime Query ${table}] UPDATE event`, payload)
      }

      if (strategy === 'optimistic' && onOptimisticUpdate) {
        onOptimisticUpdate(payload.old as T, payload.new as T)
      } else {
        // Invalidate strategy
        queryClient.invalidateQueries({ queryKey })
      }
    },
    onDelete: (payload) => {
      if (!enabled) return

      if (debug) {
        logger.info(`[Realtime Query ${table}] DELETE event`, payload)
      }

      if (strategy === 'optimistic' && onOptimisticDelete) {
        onOptimisticDelete(payload.old as T)
      } else {
        // Invalidate strategy
        queryClient.invalidateQueries({ queryKey })
      }
    },
    onError: (error) => {
      logger.error(`[Realtime Query ${table}] Error:`, error)
    },
  })

  useEffect(() => {
    if (debug) {
      logger.info(`[Realtime Query ${table}] Subscription status:`, subscription.status)
    }
  }, [subscription.status, debug, table])

  return subscription
}
