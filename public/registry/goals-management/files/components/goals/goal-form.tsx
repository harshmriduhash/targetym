'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { createGoal, updateGoal } from '@/src/actions/goals'
import { createGoalSchema, type CreateGoalInput } from '@/src/lib/validations/goals.schemas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import type { Database } from '@/src/types/database.types'

type Goal = Database['public']['Tables']['goals']['Row']

interface GoalFormProps {
  goal?: Goal
  mode?: 'create' | 'edit'
}

export function GoalForm({ goal, mode = 'create' }: GoalFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateGoalInput>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: goal ? {
      title: goal.title,
      description: goal.description || undefined,
      status: goal.status as any,
      period: goal.period as any,
      start_date: goal.start_date,
      end_date: goal.end_date,
      visibility: goal.visibility as any,
      parent_goal_id: goal.parent_goal_id || undefined,
    } : {
      status: 'draft',
      period: 'quarterly',
      visibility: 'team',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  })

  const onSubmit = async (data: CreateGoalInput) => {
    startTransition(async () => {
      const result = mode === 'create'
        ? await createGoal(data)
        : await updateGoal({ id: goal!.id, ...data })

      if (result.success) {
        toast.success(
          mode === 'create' ? 'Goal created successfully' : 'Goal updated successfully',
          {
            description: `Your goal "${data.title}" has been ${mode === 'create' ? 'created' : 'updated'}.`,
          }
        )
        router.push('/dashboard/goals')
        router.refresh()
      } else {
        toast.error(`Failed to ${mode} goal`, {
          description: result.error.message,
        })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{mode === 'create' ? 'Create New Goal' : 'Edit Goal'}</CardTitle>
          <CardDescription>
            {mode === 'create'
              ? 'Define a new objective with key results to track progress'
              : 'Update your goal details and settings'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Goal Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Increase customer satisfaction by 20%"
              {...register('title')}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide more context about this goal..."
              rows={4}
              {...register('description')}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Two columns layout */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Period */}
            <div className="space-y-2">
              <Label htmlFor="period">
                Period <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch('period')}
                onValueChange={(value) => setValue('period', value as any)}
              >
                <SelectTrigger id="period" className={errors.period ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quarterly">Quarterly (Q1-Q4)</SelectItem>
                  <SelectItem value="semi-annual">Semi-Annual (H1/H2)</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {errors.period && (
                <p className="text-sm text-red-500">{errors.period.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as any)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="start_date">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="start_date"
                type="date"
                {...register('start_date')}
                className={errors.start_date ? 'border-red-500' : ''}
              />
              {errors.start_date && (
                <p className="text-sm text-red-500">{errors.start_date.message}</p>
              )}
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="end_date">
                End Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="end_date"
                type="date"
                {...register('end_date')}
                className={errors.end_date ? 'border-red-500' : ''}
              />
              {errors.end_date && (
                <p className="text-sm text-red-500">{errors.end_date.message}</p>
              )}
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={watch('visibility')}
                onValueChange={(value) => setValue('visibility', value as any)}
              >
                <SelectTrigger id="visibility">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private (Only me)</SelectItem>
                  <SelectItem value="team">Team (My team members)</SelectItem>
                  <SelectItem value="organization">Organization (Everyone)</SelectItem>
                </SelectContent>
              </Select>
              {errors.visibility && (
                <p className="text-sm text-red-500">{errors.visibility.message}</p>
              )}
            </div>

            {/* Parent Goal (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="parent_goal_id">Parent Goal (Optional)</Label>
              <Input
                id="parent_goal_id"
                placeholder="UUID of parent goal"
                {...register('parent_goal_id')}
                className={errors.parent_goal_id ? 'border-red-500' : ''}
              />
              {errors.parent_goal_id && (
                <p className="text-sm text-red-500">{errors.parent_goal_id.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Link this goal to a higher-level objective
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full md:w-auto"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {mode === 'create' ? 'Create Goal' : 'Update Goal'}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
