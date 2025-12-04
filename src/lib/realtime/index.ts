/**
 * Realtime Module
 *
 * Provides hooks and utilities for Supabase Realtime subscriptions
 * integrated with React Query for automatic cache invalidation.
 */

export { useRealtimeSubscription } from './useRealtimeSubscription'
export { useRealtimeQuery } from './useRealtimeQuery'

// Re-export types
export type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js'
