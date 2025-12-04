'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/src/lib/supabase/client'
import { queryKeys } from '../query-client'
import { logger } from '@/src/lib/monitoring/logger'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Database } from '@/src/types/database.types'

type Goal = Database['public']['Tables']['goals']['Row']

/**
 * Hook pour la synchronisation temps réel des goals via Supabase Realtime
 * Met à jour automatiquement React Query cache quand les données changent
 */
export function useRealtimeGoals(organizationId: string, enabled: boolean = true) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled || !organizationId) return

    const supabase = createClient()
    let channel: RealtimeChannel

    const setupRealtime = async () => {
      logger.info({ organizationId }, 'Setting up goals realtime subscription')

      // Créer un channel Supabase Realtime
      channel = supabase
        .channel(`goals:${organizationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'goals',
            filter: `organization_id=eq.${organizationId}`,
          },
          (payload) => {
            logger.debug({ goalId: payload.new.id }, 'Goal created (realtime)')

            // Invalider les listes de goals
            queryClient.invalidateQueries({
              queryKey: queryKeys.goals.lists(),
            })

            // Ajouter optimistiquement au cache
            queryClient.setQueryData<Goal[]>(
              queryKeys.goals.lists(),
              (oldData) => {
                if (!oldData) return [payload.new as Goal]
                return [payload.new as Goal, ...oldData]
              }
            )
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'goals',
            filter: `organization_id=eq.${organizationId}`,
          },
          (payload) => {
            logger.debug({ goalId: payload.new.id }, 'Goal updated (realtime)')

            const goalId = (payload.new as Goal).id

            // Mettre à jour le cache du goal spécifique
            queryClient.setQueryData<Goal>(
              queryKeys.goals.detail(goalId),
              payload.new as Goal
            )

            // Mettre à jour dans les listes
            queryClient.setQueriesData<Goal[]>(
              { queryKey: queryKeys.goals.lists() },
              (oldData) => {
                if (!oldData) return oldData
                return oldData.map((goal) =>
                  goal.id === goalId ? (payload.new as Goal) : goal
                )
              }
            )
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'goals',
            filter: `organization_id=eq.${organizationId}`,
          },
          (payload) => {
            logger.debug({ goalId: payload.old.id }, 'Goal deleted (realtime)')

            const goalId = (payload.old as Goal).id

            // Supprimer du cache
            queryClient.removeQueries({
              queryKey: queryKeys.goals.detail(goalId),
            })

            // Supprimer des listes
            queryClient.setQueriesData<Goal[]>(
              { queryKey: queryKeys.goals.lists() },
              (oldData) => {
                if (!oldData) return oldData
                return oldData.filter((goal) => goal.id !== goalId)
              }
            )
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            logger.info({ organizationId }, 'Goals realtime subscribed')
          } else if (status === 'CHANNEL_ERROR') {
            logger.error({ organizationId }, 'Goals realtime error')
          } else if (status === 'TIMED_OUT') {
            logger.warn({ organizationId }, 'Goals realtime timeout')
          }
        })
    }

    setupRealtime()

    // Cleanup
    return () => {
      if (channel) {
        logger.info({ organizationId }, 'Unsubscribing from goals realtime')
        supabase.removeChannel(channel)
      }
    }
  }, [organizationId, enabled, queryClient])
}

/**
 * Hook pour synchroniser un goal spécifique en temps réel
 */
export function useRealtimeGoal(goalId: string | null, enabled: boolean = true) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled || !goalId) return

    const supabase = createClient()
    let channel: RealtimeChannel

    const setupRealtime = async () => {
      logger.info({ goalId }, 'Setting up goal realtime subscription')

      channel = supabase
        .channel(`goal:${goalId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'goals',
            filter: `id=eq.${goalId}`,
          },
          (payload) => {
            logger.debug({ goalId }, 'Goal updated (realtime)')

            // Mettre à jour le cache
            queryClient.setQueryData<Goal>(
              queryKeys.goals.detail(goalId),
              payload.new as Goal
            )
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            logger.info({ goalId }, 'Goal realtime subscribed')
          }
        })
    }

    setupRealtime()

    return () => {
      if (channel) {
        logger.info({ goalId }, 'Unsubscribing from goal realtime')
        supabase.removeChannel(channel)
      }
    }
  }, [goalId, enabled, queryClient])
}
