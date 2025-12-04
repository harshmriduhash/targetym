'use client'

import { useState, useTransition } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { getGoalById, deleteGoal } from '@/src/actions/goals'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { ArrowLeft, Edit, Trash2, Plus, TrendingUp, Calendar, User, Eye } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/src/types/database.types'

type Goal = Database['public']['Tables']['goals']['Row']

interface GoalDetailProps {
  goalId: string
}

export function GoalDetail({ goalId }: GoalDetailProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const { data: result, isLoading, error } = useQuery({
    queryKey: ['goal', goalId],
    queryFn: async () => {
      const res = await getGoalById({ goalId })
      if (!res.success) {
        throw new Error(res.error.message)
      }
      return res.data
    },
  })

  const handleDelete = async () => {
    startTransition(async () => {
      const result = await deleteGoal({ goalId })

      if (result.success) {
        toast.success('Goal deleted successfully', {
          description: 'The goal has been permanently deleted.',
        })
        router.push('/dashboard/goals')
        router.refresh()
      } else {
        toast.error('Failed to delete goal', {
          description: result.error.message,
        })
      }
    })
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <p className="text-lg font-medium text-red-500 mb-4">
            Failed to load goal
          </p>
          <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
          <Button asChild variant="outline">
            <Link href="/dashboard/goals">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Goals
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  const goal = result as Goal
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500',
      active: 'bg-blue-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500',
      on_hold: 'bg-yellow-500',
    }
    return colors[status] || 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/goals">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{goal.title}</h1>
          </div>
          {goal.description && (
            <p className="text-muted-foreground ml-12">{goal.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/goals/${goalId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isPending}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the goal
                  and all associated key results.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                  Delete Goal
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-bold text-2xl">{goal.progress_percentage || 0}%</span>
                </div>
                <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{ width: `${goal.progress_percentage || 0}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Results Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Key Results</CardTitle>
                <Button asChild size="sm">
                  <Link href={`/dashboard/goals/${goalId}/key-results/new`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Key Result
                  </Link>
                </Button>
              </div>
              <CardDescription>
                Measurable outcomes that indicate progress toward this goal
              </CardDescription>
            </CardHeader>
            <CardContent>
              {goal.key_results && goal.key_results.length > 0 ? (
                <div className="space-y-4">
                  {goal.key_results.map((kr: any) => (
                    <div key={kr.id} className="space-y-2 p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{kr.title}</h4>
                          {kr.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {kr.description}
                            </p>
                          )}
                        </div>
                        <Badge className={getStatusColor(kr.status)}>
                          {kr.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Current: <span className="font-medium">{kr.current_value} {kr.unit}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Target: <span className="font-medium">{kr.target_value} {kr.unit}</span>
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{
                            width: `${Math.min(100, (kr.current_value / kr.target_value) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No key results yet</p>
                  <Button asChild size="sm" variant="link" className="mt-2">
                    <Link href={`/dashboard/goals/${goalId}/key-results/new`}>
                      Add your first key result
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={getStatusColor(goal.status)}>
                  {goal.status}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Period</span>
                <span className="text-sm font-medium capitalize">{goal.period}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Priority</span>
                <Badge variant="outline">{goal.priority || 'Medium'}</Badge>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Timeline</span>
                </div>
                <div className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Start:</span>
                    <span className="font-medium">
                      {new Date(goal.start_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-muted-foreground">End:</span>
                    <span className="font-medium">
                      {new Date(goal.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Owner</span>
                </div>
                {goal.owner && (
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                      {goal.owner.full_name?.charAt(0) || goal.owner.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{goal.owner.full_name || 'Unknown'}</div>
                      <div className="text-muted-foreground">{goal.owner.email}</div>
                    </div>
                  </div>
                )}
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>Visibility</span>
                </div>
                <span className="text-sm font-medium capitalize">{goal.visibility}</span>
              </div>
            </CardContent>
          </Card>

          {/* Collaborators Card */}
          {goal.collaborators && goal.collaborators.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Collaborators</CardTitle>
                <CardDescription>People working on this goal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {goal.collaborators.map((collab: any) => (
                    <div key={collab.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white text-sm font-medium">
                          {collab.user?.full_name?.charAt(0) || collab.user?.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm">
                          <div className="font-medium">{collab.user?.full_name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{collab.role}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
