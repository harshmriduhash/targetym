'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../query-client'
import { createGoal, updateGoal, deleteGoal } from '@/src/actions/goals/create-goal'
import type { Goal } from '@/src/types/modules.types'

/**
 * Hook pour récupérer la liste des goals
 */
export function useGoals(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.goals.list(filters),
    queryFn: async () => {
      // Appel à votre server action ou API
      const response = await fetch('/api/goals?' + new URLSearchParams(filters as Record<string, string>))
      if (!response.ok) throw new Error('Failed to fetch goals')
      return response.json() as Promise<Goal[]>
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook pour récupérer un goal spécifique
 */
export function useGoal(goalId: string | null) {
  return useQuery({
    queryKey: queryKeys.goals.detail(goalId || ''),
    queryFn: async () => {
      if (!goalId) throw new Error('Goal ID is required')
      const response = await fetch(`/api/goals/${goalId}`)
      if (!response.ok) throw new Error('Failed to fetch goal')
      return response.json() as Promise<Goal>
    },
    enabled: !!goalId, // Ne fetch que si goalId existe
    staleTime: 3 * 60 * 1000, // 3 minutes
  })
}

/**
 * Hook pour créer un goal avec optimistic update
 */
export function useCreateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Parameters<typeof createGoal>[0]) => {
      return createGoal(data)
    },
    onMutate: async (newGoal) => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.lists() })

      // Snapshot de l'état précédent
      const previousGoals = queryClient.getQueryData(queryKeys.goals.lists())

      // Optimistic update
      queryClient.setQueryData(queryKeys.goals.lists(), (old: Goal[] = []) => [
        ...old,
        { ...newGoal, id: 'temp-id', created_at: new Date().toISOString() },
      ])

      return { previousGoals }
    },
    onError: (err, newGoal, context) => {
      // Rollback en cas d'erreur
      if (context?.previousGoals) {
        queryClient.setQueryData(queryKeys.goals.lists(), context.previousGoals)
      }
    },
    onSettled: () => {
      // Invalidate pour refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.lists() })
    },
  })
}

/**
 * Hook pour mettre à jour un goal
 */
export function useUpdateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Goal> }) => {
      return updateGoal(id, data)
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.detail(id) })

      const previousGoal = queryClient.getQueryData(queryKeys.goals.detail(id))

      queryClient.setQueryData(queryKeys.goals.detail(id), (old: Goal) => ({
        ...old,
        ...data,
      }))

      return { previousGoal }
    },
    onError: (err, { id }, context) => {
      if (context?.previousGoal) {
        queryClient.setQueryData(queryKeys.goals.detail(id), context.previousGoal)
      }
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.lists() })
    },
  })
}

/**
 * Hook pour supprimer un goal
 */
export function useDeleteGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (goalId: string) => {
      return deleteGoal(goalId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.lists() })
    },
  })
}
