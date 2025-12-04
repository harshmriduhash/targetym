/**
 * Example: Interview Scheduling Workflow
 *
 * Complete interview scheduling with calendar integration,
 * availability checking, and automated notifications.
 *
 * @package recruitment-pipeline
 */

'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { InterviewScheduler } from '@/public/registry/recruitment-pipeline/files/components/recruitment'
import { getCandidateById, scheduleInterview, getInterviews } from '@/src/actions/recruitment'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import type { Database } from '@/src/types/database.types'

type Interview = Database['public']['Tables']['interviews']['Row']

interface InterviewSchedulingExampleProps {
  candidateId: string
  jobPostingId: string
}

export default function InterviewSchedulingExample({
  candidateId,
  jobPostingId,
}: InterviewSchedulingExampleProps) {
  const [showScheduler, setShowScheduler] = useState(false)
  const queryClient = useQueryClient()

  // Fetch candidate details
  const { data: candidate, isLoading: candidateLoading } = useQuery({
    queryKey: ['candidate', candidateId],
    queryFn: async () => {
      const result = await getCandidateById({ id: candidateId })
      if (!result.success) throw new Error(result.error.message)
      return result.data
    },
  })

  // Fetch scheduled interviews for this candidate
  const { data: interviews, isLoading: interviewsLoading } = useQuery({
    queryKey: ['interviews', candidateId],
    queryFn: async () => {
      const result = await getInterviews({
        filters: { candidate_id: candidateId },
      })
      if (!result.success) throw new Error(result.error.message)
      return result.data
    },
  })

  const getInterviewStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getInterviewStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500',
      no_show: 'bg-orange-500',
    }
    return colors[status] || 'bg-gray-500'
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }
  }

  if (candidateLoading) {
    return <div className="text-center py-8">Loading candidate information...</div>
  }

  if (!candidate) {
    return <div className="text-center py-8 text-red-500">Candidate not found</div>
  }

  return (
    <div className="container mx-auto py-6 max-w-5xl space-y-6">
      {/* Candidate Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xl">
                  {candidate.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{candidate.name}</CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {candidate.email}
                  </span>
                  {candidate.phone && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {candidate.phone}
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
            <Badge className={getInterviewStatusColor(candidate.status)}>
              {candidate.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Interview Scheduler */}
      {showScheduler ? (
        <InterviewScheduler
          candidateId={candidateId}
          jobPostingId={jobPostingId}
          candidateName={candidate.name}
          onSuccess={() => {
            setShowScheduler(false)
            queryClient.invalidateQueries({ queryKey: ['interviews', candidateId] })
            toast.success('Interview scheduled successfully!', {
              description: 'Calendar invite will be sent to all participants.',
            })
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Scheduled Interviews</CardTitle>
              <Button onClick={() => setShowScheduler(true)}>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Interview
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {interviewsLoading ? (
              <div className="text-center py-4">Loading interviews...</div>
            ) : interviews && interviews.data.length > 0 ? (
              <div className="space-y-4">
                {interviews.data.map((interview: Interview) => {
                  const dateTime = formatDateTime(interview.scheduled_at)
                  return (
                    <Card key={interview.id} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-3 flex-1">
                            {/* Interview Type & Status */}
                            <div className="flex items-center gap-2">
                              {getInterviewStatusIcon(interview.status)}
                              <h3 className="font-semibold capitalize">
                                {interview.interview_type.replace('_', ' ')}
                              </h3>
                              <Badge className={getInterviewStatusColor(interview.status)}>
                                {interview.status}
                              </Badge>
                            </div>

                            {/* Date & Time */}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {dateTime.date}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {dateTime.time} ({interview.duration_minutes} min)
                              </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{interview.location}</span>
                            </div>

                            {/* Meeting Link */}
                            {interview.meeting_link && (
                              <div className="flex items-center gap-2">
                                <Video className="h-4 w-4 text-muted-foreground" />
                                <a
                                  href={interview.meeting_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline"
                                >
                                  Join Video Call
                                </a>
                              </div>
                            )}

                            {/* Feedback */}
                            {interview.feedback && (
                              <div className="mt-3 p-3 bg-muted rounded-md">
                                <p className="text-sm font-medium mb-1">Interviewer Feedback:</p>
                                <p className="text-sm text-muted-foreground">
                                  {interview.feedback}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Rating */}
                          {interview.rating && (
                            <div className="text-right">
                              <div className="text-2xl font-bold">{interview.rating}</div>
                              <div className="text-xs text-muted-foreground">/ 5</div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-4">No interviews scheduled yet</p>
                <Button onClick={() => setShowScheduler(true)}>
                  Schedule First Interview
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Interview Timeline (Visual representation) */}
      {interviews && interviews.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Interview Pipeline</CardTitle>
            <CardDescription>
              Track the candidate's progress through the interview stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              {/* Interview Stages */}
              <div className="space-y-6">
                {interviews.data.map((interview: Interview, index: number) => (
                  <div key={interview.id} className="relative pl-10">
                    {/* Timeline Dot */}
                    <div
                      className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-background ${
                        interview.status === 'completed'
                          ? 'bg-green-500'
                          : interview.status === 'scheduled'
                          ? 'bg-blue-500'
                          : 'bg-gray-300'
                      }`}
                    />

                    {/* Interview Info */}
                    <div>
                      <div className="font-medium capitalize">
                        {interview.interview_type.replace('_', ' ')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDateTime(interview.scheduled_at).date}
                      </div>
                      {interview.rating && (
                        <div className="text-sm mt-1">
                          Rating: {interview.rating}/5
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/**
 * Interview Scheduling Features:
 *
 * 1. Candidate Overview:
 *    - Complete candidate profile with contact info
 *    - Current status badge
 *    - Application details
 *
 * 2. Interview Scheduler:
 *    - Multiple interview types (phone, technical, behavioral, etc.)
 *    - Date/time picker with duration selection
 *    - Location (in-person or video call)
 *    - Video meeting link integration
 *    - Interviewer assignment
 *
 * 3. Interview List:
 *    - All scheduled interviews for candidate
 *    - Status indicators (scheduled, completed, cancelled)
 *    - Meeting details (date, time, location, link)
 *    - Interviewer feedback display
 *    - Rating visualization
 *
 * 4. Interview Timeline:
 *    - Visual representation of interview pipeline
 *    - Progress tracking through stages
 *    - Completion status indicators
 *    - Chronological ordering
 *
 * 5. Integrations:
 *    - Calendar invites (requires email service)
 *    - Video call platforms (Google Meet, Zoom, Teams)
 *    - Automated reminders (optional)
 *    - Feedback collection forms
 *
 * 6. Best Practices:
 *    - Always provide meeting link for remote interviews
 *    - Set realistic durations (30-120 min)
 *    - Assign appropriate interviewer for each stage
 *    - Collect feedback immediately after interview
 *    - Update candidate status based on outcomes
 */
