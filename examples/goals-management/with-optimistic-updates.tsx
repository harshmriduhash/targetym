/**
 * Example: Optimistic UI Updates for Goals
 *
 * Demonstrates optimistic updates pattern for instant UI feedback
 * while Server Actions execute in the background.
 *
 * @package goals-management
 */

'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createGoal, updateGoal, deleteGoal, getGoals } from '@/src/actions/goals'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Trash2, CheckCircle2 } from 'lucide-react'
import type { Database } from '@/src/types/database.types'
import type { CreateGoalInput } from '@/src/lib/validations/goals.schemas'

type Goal = Database['public']['Tables']['goals']['Row']

export default function OptimisticGoalsExample() {
  const [newGoalTitle, setNewGoalTitle] = useState('')
  const queryClient = useQueryClient()

  // Fetch goals with React Query
  const { data, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const result = await getGoals({ pagination: { page: 1, pageSize: 20 } })
      if (!result.success) throw new Error(result.error.message)
      return result.data
    },
  })

  // Create goal with optimistic update
  const createMutation = useMutation({
    mutationFn: async (input: CreateGoalInput) => {
      const result = await createGoal(input)
      if (!result.success) throw new Error(result.error.message)
      return result.data
    },
    onMutate: async (newGoal) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['goals'] })

      // Snapshot previous value
      const previousGoals = queryClient.getQueryData(['goals'])

      // Optimistically update the cache
      queryClient.setQueryData(['goals'], (old: any) => {
        const optimisticGoal: Goal = {
          id: 'temp-' + Date.now(), // Temporary ID
          title: newGoal.title,
          description: newGoal.description || null,
          status: newGoal.status,
          period: newGoal.period,
          start_date: newGoal.start_date,
          end_date: newGoal.end_date,
          visibility: newGoal.visibility || 'team',
          progress_percentage: 0,
          priority: 'medium',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          owner_id: 'current-user', // Will be replaced by server
          organization_id: 'current-org', // Will be replaced by server
          parent_goal_id: newGoal.parent_goal_id || null,
          is_archived: false,
        }

        return {
          ...old,
          data: [optimisticGoal, ...(old?.data || [])],
        }
      })

      return { previousGoals }
    },
    onError: (err, newGoal, context) => {
      // Rollback on error
      queryClient.setQueryData(['goals'], context?.previousGoals)
      toast.error('Failed to create goal', {
        description: err.message,
      })
    },
    onSuccess: () => {
      toast.success('Goal created successfully!')
      setNewGoalTitle('')
    },
    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })

  // Delete goal with optimistic update
  const deleteMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const result = await deleteGoal({ id: goalId })
      if (!result.success) throw new Error(result.error.message)
      return result.data
    },
    onMutate: async (goalId) => {
      await queryClient.cancelQueries({ queryKey: ['goals'] })
      const previousGoals = queryClient.getQueryData(['goals'])

      // Remove goal from cache immediately
      queryClient.setQueryData(['goals'], (old: any) => ({
        ...old,
        data: old?.data.filter((goal: Goal) => goal.id !== goalId) || [],
      }))

      return { previousGoals }
    },
    onError: (err, goalId, context) => {
      queryClient.setQueryData(['goals'], context?.previousGoals)
      toast.error('Failed to delete goal', {
        description: err.message,
      })
    },
    onSuccess: () => {
      toast.success('Goal deleted successfully!')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
    },
  })

  const handleCreateGoal = () => {
    if (!newGoalTitle.trim()) return

    createMutation.mutate({
      title: newGoalTitle,
      status: 'draft',
      period: 'quarterly',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Optimistic Updates Demo</h1>
        <p className="text-muted-foreground mt-2">
          See instant UI updates before server confirmation
        </p>
      </div>

      {/* Quick create form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Add Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter goal title..."
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateGoal()
              }}
            />
            <Button
              onClick={handleCreateGoal}
              disabled={createMutation.isPending || !newGoalTitle.trim()}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Add Goal'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Goals list */}
      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {data?.data.map((goal) => {
            const isOptimistic = goal.id.startsWith('temp-')
            const isDeleting = deleteMutation.isPending && deleteMutation.variables === goal.id

            return (
              <Card
                key={goal.id}
                className={`transition-all ${
                  isOptimistic ? 'opacity-60 border-dashed' : ''
                } ${isDeleting ? 'opacity-40' : ''}`}
              >
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{goal.title}</h3>
                      {isOptimistic && (
                        <Badge variant="outline" className="text-xs">
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          Saving...
                        </Badge>
                      )}
                      {!isOptimistic && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {goal.period} • {goal.status}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(goal.id)}
                    disabled={isOptimistic || isDeleting}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * Optimistic Updates Pattern:
 *
 * 1. onMutate (before server call):
 *    - Cancel in-flight queries to prevent race conditions
 *    - Snapshot current cache for rollback
 *    - Update cache with optimistic data
 *    - Return context for error recovery
 *
 * 2. onError (if server fails):
 *    - Restore previous cache state (rollback)
 *    - Show error notification
 *    - UI returns to pre-mutation state
 *
 * 3. onSuccess (after server confirms):
 *    - Show success notification
 *    - Clear temporary state
 *    - UI already updated, no flash
 *
 * 4. onSettled (always runs):
 *    - Invalidate queries to sync with server
 *    - Replace optimistic data with real server response
 *    - Ensures eventual consistency
 *
 * Benefits:
 * - Instant UI feedback (no loading spinners)
 * - Perceived performance improvement
 * - Graceful error recovery
 * - Works with real-time subscriptions
 *
 * Caveats:
 * - Requires careful state management
 * - Temporary IDs must be handled properly
 * - Complex relationships need special care
 * - Not suitable for critical operations (financial, etc.)
 */
