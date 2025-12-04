'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getJobPostings } from '@/src/actions/recruitment'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Plus, Search, Filter, MapPin, Briefcase, DollarSign, Users } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/src/types/database.types'

type JobPosting = Database['public']['Tables']['job_postings']['Row']

interface JobPostingsListProps {
  initialFilters?: {
    status?: string
    department?: string
    location?: string
  }
}

export function JobPostingsList({ initialFilters }: JobPostingsListProps) {
  const [filters, setFilters] = useState(initialFilters || {})
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data, isLoading, error } = useQuery({
    queryKey: ['job-postings', filters, page, pageSize],
    queryFn: async () => {
      const result = await getJobPostings({
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
    toast.error('Failed to load job postings', {
      description: error.message,
    })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500',
      published: 'bg-green-500',
      closed: 'bg-red-500',
      archived: 'bg-gray-400',
    }
    return colors[status] || 'bg-gray-500'
  }

  const getEmploymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      full_time: 'Full Time',
      part_time: 'Part Time',
      contract: 'Contract',
      internship: 'Internship',
      temporary: 'Temporary',
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Job Postings</h2>
          <p className="text-muted-foreground">
            Manage open positions and track recruitment pipeline
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/recruitment/jobs/new">
            <Plus className="mr-2 h-4 w-4" />
            New Job Posting
          </Link>
        </Button>
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
                placeholder="Search jobs..."
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Department..."
              value={filters.department || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  department: e.target.value || undefined,
                }))
              }
            />

            <Button
              variant="outline"
              onClick={() => {
                setFilters({})
                setSearchQuery('')
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Job Postings List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <div className="space-y-4">
          {data.data.map((job: any) => (
            <Link key={job.id} href={`/dashboard/recruitment/jobs/${job.id}`}>
              <Card className="cursor-pointer transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {job.description?.substring(0, 150) || 'No description'}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{getEmploymentTypeLabel(job.employment_type)}</span>
                    </div>
                    {job.department && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{job.department}</span>
                      </div>
                    )}
                    {(job.salary_range_min || job.salary_range_max) && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>
                          {job.salary_range_min && job.salary_range_max
                            ? `${job.salary_currency || '$'}${job.salary_range_min.toLocaleString()} - ${job.salary_currency || '$'}${job.salary_range_max.toLocaleString()}`
                            : job.salary_range_min
                            ? `From ${job.salary_currency || '$'}${job.salary_range_min.toLocaleString()}`
                            : `Up to ${job.salary_currency || '$'}${job.salary_range_max.toLocaleString()}`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                  {job.candidates && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Candidates</span>
                        <Badge variant="secondary">
                          {job.candidates[0]?.count || 0} applicants
                        </Badge>
                      </div>
                    </div>
                  )}
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
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-4">
              No job postings found
            </p>
            <Button asChild>
              <Link href="/dashboard/recruitment/jobs/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Job Posting
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
