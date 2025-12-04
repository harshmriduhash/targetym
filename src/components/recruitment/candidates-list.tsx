'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCandidates } from '@/src/actions/recruitment'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Plus, Search, Filter, Mail, Phone, FileText, Star, Calendar } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/src/types/database.types'

type Candidate = Database['public']['Tables']['candidates']['Row']

interface CandidatesListProps {
  jobPostingId?: string
  initialFilters?: {
    status?: string
    job_posting_id?: string
    current_stage?: string
  }
}

export function CandidatesList({ jobPostingId, initialFilters }: CandidatesListProps) {
  const [filters, setFilters] = useState(initialFilters || (jobPostingId ? { job_posting_id: jobPostingId } : {}))
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data, isLoading, error } = useQuery({
    queryKey: ['candidates', filters, page, pageSize],
    queryFn: async () => {
      const result = await getCandidates({
        filters,
        pagination: { page, pageSize },
      })

      if (!result.success) {
        throw new Error(result.error.message)
      }

      return result.data
    },
    staleTime: 5 * 60 * 1000,
  })

  if (error) {
    toast.error('Failed to load candidates', {
      description: error.message,
    })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      applied: 'bg-blue-500',
      screening: 'bg-yellow-500',
      interviewing: 'bg-purple-500',
      offered: 'bg-green-500',
      hired: 'bg-green-600',
      rejected: 'bg-red-500',
      withdrawn: 'bg-gray-500',
    }
    return colors[status] || 'bg-gray-500'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      applied: 'Applied',
      screening: 'Screening',
      interviewing: 'Interviewing',
      offered: 'Offered',
      hired: 'Hired',
      rejected: 'Rejected',
      withdrawn: 'Withdrawn',
    }
    return labels[status] || status
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Candidates</h2>
          <p className="text-muted-foreground">
            {jobPostingId
              ? 'Candidates for this position'
              : 'All candidates across all job postings'
            }
          </p>
        </div>
        {jobPostingId && (
          <Button asChild>
            <Link href={`/dashboard/recruitment/jobs/${jobPostingId}/candidates/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Candidate
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>

            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  status: value === 'all' ? undefined : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="interviewing">Interviewing</SelectItem>
                <SelectItem value="offered">Offered</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.current_stage || 'all'}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  current_stage: value === 'all' ? undefined : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Current Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="application_review">Application Review</SelectItem>
                <SelectItem value="phone_screen">Phone Screen</SelectItem>
                <SelectItem value="technical_interview">Technical Interview</SelectItem>
                <SelectItem value="final_interview">Final Interview</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setFilters(jobPostingId ? { job_posting_id: jobPostingId } : {})
                setSearchQuery('')
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Candidates List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <div className="space-y-4">
          {data.data.map((candidate: any) => (
            <Link key={candidate.id} href={`/dashboard/recruitment/candidates/${candidate.id}`}>
              <Card className="cursor-pointer transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                        {getInitials(candidate.name || candidate.email)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg">{candidate.name}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{candidate.email}</span>
                            </div>
                            {candidate.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{candidate.phone}</span>
                              </div>
                            )}
                            {candidate.applied_at && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Applied {new Date(candidate.applied_at).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(candidate.status)}>
                            {getStatusLabel(candidate.status)}
                          </Badge>
                          {candidate.rating && (
                            <Badge variant="outline" className="gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {candidate.rating}/5
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Job Posting */}
                      {candidate.job_posting && (
                        <div className="mt-3 p-2 bg-muted/50 rounded-md">
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{candidate.job_posting.title}</span>
                            {candidate.job_posting.department && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-muted-foreground">{candidate.job_posting.department}</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Interviews */}
                      {candidate.interviews && candidate.interviews.length > 0 && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span>{candidate.interviews.length} interview(s) scheduled</span>
                        </div>
                      )}

                      {/* AI Score */}
                      {candidate.ai_cv_score && (
                        <div className="mt-3 flex items-center gap-2">
                          <Badge variant="secondary" className="gap-1">
                            AI Score: {candidate.ai_cv_score}/100
                          </Badge>
                          {candidate.ai_cv_recommendation && (
                            <Badge
                              variant="outline"
                              className={
                                candidate.ai_cv_recommendation === 'strong_yes' || candidate.ai_cv_recommendation === 'yes'
                                  ? 'border-green-500 text-green-600'
                                  : candidate.ai_cv_recommendation === 'maybe'
                                  ? 'border-yellow-500 text-yellow-600'
                                  : 'border-red-500 text-red-600'
                              }
                            >
                              {candidate.ai_cv_recommendation}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-4">
              No candidates found
            </p>
            {jobPostingId && (
              <Button asChild>
                <Link href={`/dashboard/recruitment/jobs/${jobPostingId}/candidates/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Candidate
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
