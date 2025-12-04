'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { updatePerformanceReviewSchema, type UpdatePerformanceReviewInput } from '@/src/lib/validations/performance.schemas'
import { updatePerformanceReview } from '@/src/actions/performance'
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
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Star } from 'lucide-react'

interface ReviewFormProps {
  reviewId: string
  employeeName: string
  initialData?: Partial<UpdatePerformanceReviewInput>
  onSuccess?: () => void
}

export function ReviewForm({ reviewId, employeeName, initialData, onSuccess }: ReviewFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<UpdatePerformanceReviewInput>({
    resolver: zodResolver(updatePerformanceReviewSchema),
    defaultValues: {
      overall_rating: initialData?.overall_rating || undefined,
      strengths: initialData?.strengths || '',
      areas_for_improvement: initialData?.areas_for_improvement || '',
      goals_next_period: initialData?.goals_next_period || '',
      reviewer_comments: initialData?.reviewer_comments || '',
      status: initialData?.status || 'draft',
    },
  })

  const onSubmit = async (values: UpdatePerformanceReviewInput) => {
    setIsSubmitting(true)
    try {
      const result = await updatePerformanceReview(reviewId, values)

      if (!result.success) {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update review',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success',
        description: 'Performance review updated successfully',
      })

      onSuccess?.()
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Performance Review</CardTitle>
        <CardDescription>Review for {employeeName}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="overall_rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overall Rating</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          <div className="flex items-center gap-2">
                            {rating}
                            <div className="flex">
                              {Array.from({ length: rating }).map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Rate overall performance (1-5)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="strengths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strengths</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Key strengths and accomplishments..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Highlight what this employee does well</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="areas_for_improvement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Areas for Improvement</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Areas where growth is needed..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Constructive feedback for development</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goals_next_period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goals for Next Period</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Suggested goals and objectives..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Future goals and development plan</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reviewer_comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Comments</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional feedback..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submit</SelectItem>
                      <SelectItem value="completed">Complete</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Change status to submit or complete the review</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Review'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/performance')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
