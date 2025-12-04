'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { updateKeyResultProgressSchema, type UpdateKeyResultProgressInput } from '@/src/lib/validations/goals.schemas'
import { updateKeyResultProgress } from '@/src/actions/goals'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { TrendingUp, Target, Check } from 'lucide-react'
import type { KeyResult } from '@/src/types/database.types'

interface ProgressTrackerProps {
  goalId: string
  goalTitle: string
  keyResults: KeyResult[]
  onUpdate?: () => void
}

export function ProgressTracker({ goalId, goalTitle, keyResults, onUpdate }: ProgressTrackerProps) {
  const { toast } = useToast()
  const [selectedKR, setSelectedKR] = useState<KeyResult | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const form = useForm<UpdateKeyResultProgressInput>({
    resolver: zodResolver(updateKeyResultProgressSchema),
    defaultValues: {
      key_result_id: '',
      current_value: 0,
    },
  })

  const calculateProgress = (kr: KeyResult): number => {
    if (!kr.target_value || kr.target_value === 0) return 0
    return Math.min(Math.round((kr.current_value / kr.target_value) * 100), 100)
  }

  const overallProgress = keyResults.length > 0
    ? Math.round(keyResults.reduce((acc, kr) => acc + calculateProgress(kr), 0) / keyResults.length)
    : 0

  const handleSelectKR = (kr: KeyResult) => {
    setSelectedKR(kr)
    form.setValue('key_result_id', kr.id)
    form.setValue('current_value', kr.current_value)
  }

  const onSubmit = async (values: UpdateKeyResultProgressInput) => {
    setIsUpdating(true)
    try {
      const result = await updateKeyResultProgress(values)

      if (!result.success) {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update progress',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success',
        description: 'Progress updated successfully',
      })

      setSelectedKR(null)
      form.reset()
      onUpdate?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{goalTitle}</CardTitle>
              <CardDescription>Overall goal progress based on key results</CardDescription>
            </div>
            <Badge variant={overallProgress === 100 ? 'default' : 'secondary'}>
              {overallProgress}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={overallProgress} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {keyResults.filter((kr) => calculateProgress(kr) === 100).length} of{' '}
                {keyResults.length} key results completed
              </span>
              <span>{overallProgress}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Results List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5" />
          Key Results
        </h3>

        {keyResults.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No key results defined yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {keyResults.map((kr) => {
              const progress = calculateProgress(kr)
              const isCompleted = progress === 100

              return (
                <Card
                  key={kr.id}
                  className={`cursor-pointer transition-all ${
                    selectedKR?.id === kr.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                  }`}
                  onClick={() => handleSelectKR(kr)}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold flex items-center gap-2">
                            {kr.description}
                            {isCompleted && <Check className="h-4 w-4 text-green-600" />}
                          </h4>
                        </div>
                        <Badge variant={isCompleted ? 'default' : 'secondary'}>
                          {progress}%
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Current: {kr.current_value}</span>
                          <span>Target: {kr.target_value}</span>
                        </div>
                      </div>

                      {kr.unit && (
                        <p className="text-sm text-muted-foreground">Unit: {kr.unit}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Update Form */}
      {selectedKR && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Update Progress</CardTitle>
            <CardDescription>Update the current value for: {selectedKR.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="current_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={`Enter current value (Target: ${selectedKR.target_value}${selectedKR.unit ? ' ' + selectedKR.unit : ''})`}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Target: {selectedKR.target_value}
                        {selectedKR.unit ? ` ${selectedKR.unit}` : ''}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={isUpdating}>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    {isUpdating ? 'Updating...' : 'Update Progress'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedKR(null)
                      form.reset()
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
