'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { scheduleInterview } from '@/src/actions/recruitment'
import { scheduleInterviewSchema, type ScheduleInterviewInput } from '@/src/lib/validations/recruitment.schemas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Calendar, Clock, Video, MapPin } from 'lucide-react'

interface InterviewSchedulerProps {
  candidateId: string
  jobPostingId: string
  candidateName?: string
  onSuccess?: () => void
}

export function InterviewScheduler({
  candidateId,
  jobPostingId,
  candidateName,
  onSuccess,
}: InterviewSchedulerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ScheduleInterviewInput>({
    resolver: zodResolver(scheduleInterviewSchema),
    defaultValues: {
      candidate_id: candidateId,
      job_posting_id: jobPostingId,
      interview_type: 'phone_screen',
      duration_minutes: 60,
      location: 'Video Call',
    },
  })

  const onSubmit = async (data: ScheduleInterviewInput) => {
    startTransition(async () => {
      const result = await scheduleInterview(data)

      if (result.success) {
        toast.success('Interview scheduled successfully', {
          description: `Interview scheduled for ${candidateName || 'candidate'}.`,
        })
        onSuccess?.()
        router.refresh()
      } else {
        toast.error('Failed to schedule interview', {
          description: result.error.message,
        })
      }
    })
  }

  const getInterviewTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      phone_screen: 'Phone Screening',
      technical: 'Technical Interview',
      behavioral: 'Behavioral Interview',
      cultural_fit: 'Cultural Fit',
      final: 'Final Interview',
    }
    return labels[type] || type
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Schedule Interview</CardTitle>
          <CardDescription>
            {candidateName
              ? `Schedule an interview for ${candidateName}`
              : 'Schedule a new interview session'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Interview Type */}
          <div className="space-y-2">
            <Label htmlFor="interview_type">
              Interview Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch('interview_type')}
              onValueChange={(value) => setValue('interview_type', value as any)}
            >
              <SelectTrigger id="interview_type" className={errors.interview_type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select interview type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone_screen">📞 Phone Screening</SelectItem>
                <SelectItem value="technical">💻 Technical Interview</SelectItem>
                <SelectItem value="behavioral">🗣️ Behavioral Interview</SelectItem>
                <SelectItem value="cultural_fit">🤝 Cultural Fit</SelectItem>
                <SelectItem value="final">🎯 Final Interview</SelectItem>
              </SelectContent>
            </Select>
            {errors.interview_type && (
              <p className="text-sm text-red-500">{errors.interview_type.message}</p>
            )}
          </div>

          {/* Interviewer ID */}
          <div className="space-y-2">
            <Label htmlFor="interviewer_id">
              Interviewer ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="interviewer_id"
              placeholder="UUID of interviewer"
              {...register('interviewer_id')}
              className={errors.interviewer_id ? 'border-red-500' : ''}
            />
            {errors.interviewer_id && (
              <p className="text-sm text-red-500">{errors.interviewer_id.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter the user ID of the person conducting the interview
            </p>
          </div>

          {/* Date and Time */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="scheduled_at" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date & Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                {...register('scheduled_at')}
                className={errors.scheduled_at ? 'border-red-500' : ''}
              />
              {errors.scheduled_at && (
                <p className="text-sm text-red-500">{errors.scheduled_at.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duration (minutes)
              </Label>
              <Select
                value={watch('duration_minutes')?.toString()}
                onValueChange={(value) => setValue('duration_minutes', parseInt(value))}
              >
                <SelectTrigger id="duration_minutes">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
              {errors.duration_minutes && (
                <p className="text-sm text-red-500">{errors.duration_minutes.message}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location"
              placeholder="e.g., Video Call, Office Room 301, or Address"
              {...register('location')}
              className={errors.location ? 'border-red-500' : ''}
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location.message}</p>
            )}
          </div>

          {/* Meeting Link (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="meeting_link" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Meeting Link (Optional)
            </Label>
            <Input
              id="meeting_link"
              type="url"
              placeholder="https://meet.google.com/..."
              {...register('meeting_link')}
              className={errors.meeting_link ? 'border-red-500' : ''}
            />
            {errors.meeting_link && (
              <p className="text-sm text-red-500">{errors.meeting_link.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Add a video call link (Google Meet, Zoom, Teams, etc.)
            </p>
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
              Scheduling...
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Interview
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
