'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { scheduleInterviewSchema, type ScheduleInterviewInput } from '@/src/lib/validations/recruitment.schemas'
import { scheduleInterview } from '@/src/actions/recruitment'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Calendar } from 'lucide-react'

interface InterviewSchedulerProps {
  candidateId: string
  candidateName: string
  onSuccess?: () => void
}

export function InterviewScheduler({ candidateId, candidateName, onSuccess }: InterviewSchedulerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ScheduleInterviewInput>({
    resolver: zodResolver(scheduleInterviewSchema),
    defaultValues: {
      candidate_id: candidateId,
      interviewer_id: '',
      scheduled_date: new Date(),
      type: 'technical',
      location: '',
      status: 'scheduled',
    },
  })

  const onSubmit = async (values: ScheduleInterviewInput) => {
    setIsSubmitting(true)
    try {
      const result = await scheduleInterview(values)

      if (!result.success) {
        toast({
          title: 'Error',
          description: result.error || 'Failed to schedule interview',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success',
        description: 'Interview scheduled successfully',
      })

      form.reset()
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Schedule Interview
        </CardTitle>
        <CardDescription>Schedule an interview with {candidateName}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interview Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="phone">Phone Screen</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="behavioral">Behavioral</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduled_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : field.value}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Video call, Office Room 201" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Scheduling...' : 'Schedule Interview'}
              </Button>
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Reset
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
