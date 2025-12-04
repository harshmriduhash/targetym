'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../query-client'
import { logger } from '@/src/lib/monitoring/logger'
import type { Database } from '@/src/types/database.types'

type Goal = Database['public']['Tables']['goals']['Row']

interface CreateGoalInput {
  title: string
  description?: string
  period: string
  start_date: string
  end_date: string
  status?: string
}

interface UpdateGoalInput {
  id: string
  title?: string
  description?: string
  status?: string
  start_date?: string
  end_date?: string
}

/**
 * Hook avec optimistic updates pour créer un goal
 * L'UI se met à jour instantanément avant la réponse du serveur
 */
export function useOptimisticCreateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateGoalInput) => {
      const response = await fetch('/api/v1/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create goal')
      }

      return response.json() as Promise<Goal>
    },

    // Optimistic update AVANT la requête
    onMutate: async (newGoal) => {
      logger.debug({ goal: newGoal }, 'Optimistic create: START')

      // 1. Annuler les requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({
        queryKey: queryKeys.goals.lists(),
      })

      // 2. Snapshot de l'état précédent (pour rollback)
      const previousGoals = queryClient.getQueryData(queryKeys.goals.lists())

      // 3. Optimistic update: ajouter immédiatement au cache
      const optimisticGoal: Goal = {
        id: `temp-${Date.now()}`, // ID temporaire
        title: newGoal.title,
        description: newGoal.description || null,
        period: newGoal.period,
        status: newGoal.status || 'draft',
        start_date: newGoal.start_date,
        end_date: newGoal.end_date,
        owner_id: '', // Sera rempli par le serveur
        organization_id: '', // Sera rempli par le serveur
        parent_goal_id: null,
        visibility: 'team',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      }

      queryClient.setQueryData<Goal[]>(
        queryKeys.goals.lists(),
        (oldData) => {
          if (!oldData) return [optimisticGoal]
          return [optimisticGoal, ...oldData]
        }
      )

      logger.debug({ goal: optimisticGoal }, 'Optimistic create: APPLIED')

      return { previousGoals, optimisticGoal }
    },

    // Rollback en cas d'erreur
    onError: (error, newGoal, context) => {
      logger.error({ error, goal: newGoal }, 'Optimistic create: ERROR')

      if (context?.previousGoals) {
        queryClient.setQueryData(
          queryKeys.goals.lists(),
          context.previousGoals
        )
        logger.debug('Optimistic create: ROLLED BACK')
      }
    },

    // Synchroniser avec la réponse réelle du serveur
    onSuccess: (serverGoal, variables, context) => {
      logger.info({ goalId: serverGoal.id }, 'Goal created successfully')

      // Remplacer l'optimistic goal par le vrai
      queryClient.setQueryData<Goal[]>(
        queryKeys.goals.lists(),
        (oldData) => {
          if (!oldData) return [serverGoal]

          return oldData.map((goal) =>
            goal.id === context?.optimisticGoal.id ? serverGoal : goal
          )
        }
      )

      // Ajouter au cache du goal spécifique
      queryClient.setQueryData(
        queryKeys.goals.detail(serverGoal.id),
        serverGoal
      )
    },

    // Toujours revalider après
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.goals.lists(),
      })
    },
  })
}

/**
 * Hook avec optimistic updates pour mettre à jour un goal
 */
export function useOptimisticUpdateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateGoalInput) => {
      const response = await fetch(`/api/v1/goals/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update goal')
      }

      return response.json() as Promise<Goal>
    },

    onMutate: async (updatedGoal) => {
      logger.debug({ goalId: updatedGoal.id }, 'Optimistic update: START')

      const { id, ...updates } = updatedGoal

      // Annuler les requêtes en cours
      await queryClient.cancelQueries({
        queryKey: queryKeys.goals.detail(id),
      })

      // Snapshot
      const previousGoal = queryClient.getQueryData(
        queryKeys.goals.detail(id)
      )

      // Optimistic update du goal spécifique
      queryClient.setQueryData<Goal>(
        queryKeys.goals.detail(id),
        (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            ...updates,
            updated_at: new Date().toISOString(),
          }
        }
      )

      // Optimistic update dans les listes
      queryClient.setQueriesData<Goal[]>(
        { queryKey: queryKeys.goals.lists() },
        (oldData) => {
          if (!oldData) return oldData
          return oldData.map((goal) =>
            goal.id === id
              ? { ...goal, ...updates, updated_at: new Date().toISOString() }
              : goal
          )
        }
      )

      logger.debug({ goalId: id }, 'Optimistic update: APPLIED')

      return { previousGoal, goalId: id }
    },

    onError: (error, variables, context) => {
      logger.error({ error, goalId: variables.id }, 'Optimistic update: ERROR')

      if (context?.previousGoal) {
        queryClient.setQueryData(
          queryKeys.goals.detail(context.goalId),
          context.previousGoal
        )
        logger.debug({ goalId: context.goalId }, 'Optimistic update: ROLLED BACK')
      }
    },

    onSuccess: (serverGoal) => {
      logger.info({ goalId: serverGoal.id }, 'Goal updated successfully')

      // Synchroniser avec la réponse du serveur
      queryClient.setQueryData(
        queryKeys.goals.detail(serverGoal.id),
        serverGoal
      )
    },

    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.goals.detail(variables.id),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.goals.lists(),
      })
    },
  })
}

/**
 * Hook avec optimistic updates pour supprimer un goal
 */
export function useOptimisticDeleteGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (goalId: string) => {
      const response = await fetch(`/api/v1/goals/${goalId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete goal')
      }

      return { id: goalId }
    },

    onMutate: async (goalId) => {
      logger.debug({ goalId }, 'Optimistic delete: START')

      // Annuler les requêtes
      await queryClient.cancelQueries({
        queryKey: queryKeys.goals.lists(),
      })

      // Snapshot
      const previousGoals = queryClient.getQueryData(
        queryKeys.goals.lists()
      )

      // Optimistic delete: retirer immédiatement
      queryClient.setQueryData<Goal[]>(
        queryKeys.goals.lists(),
        (oldData) => {
          if (!oldData) return oldData
          return oldData.filter((goal) => goal.id !== goalId)
        }
      )

      // Retirer du cache spécifique
      queryClient.removeQueries({
        queryKey: queryKeys.goals.detail(goalId),
      })

      logger.debug({ goalId }, 'Optimistic delete: APPLIED')

      return { previousGoals, goalId }
    },

    onError: (error, goalId, context) => {
      logger.error({ error, goalId }, 'Optimistic delete: ERROR')

      if (context?.previousGoals) {
        queryClient.setQueryData(
          queryKeys.goals.lists(),
          context.previousGoals
        )
        logger.debug({ goalId }, 'Optimistic delete: ROLLED BACK')
      }
    },

    onSuccess: (data) => {
      logger.info({ goalId: data.id }, 'Goal deleted successfully')
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.goals.lists(),
      })
    },
  })
}
