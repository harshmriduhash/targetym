'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPerformanceReviews } from '@/src/actions/performance'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Plus, Search, Filter, Star, Calendar, User, FileText } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/src/types/database.types'

type PerformanceReview = Database['public']['Tables']['performance_reviews']['Row']

interface ReviewsListProps {
  initialFilters?: {
    reviewee_id?: string
    reviewer_id?: string
    status?: string
    review_period?: string
  }
}

export function ReviewsList({ initialFilters }: ReviewsListProps) {
  const [filters, setFilters] = useState(initialFilters || {})
  const [searchQuery, setSearchQuery] = useState('')

  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ['performance-reviews', filters],
    queryFn: async () => {
      const result = await getPerformanceReviews({ filters })

      if (!result.success) {
        throw new Error(result.error.message)
      }

      return result.data
    },
    staleTime: 5 * 60 * 1000,
  })

  if (error) {
    toast.error('Failed to load performance reviews', {
      description: error.message,
    })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500',
      in_progress: 'bg-blue-500',
      submitted: 'bg-purple-500',
      completed: 'bg-green-500',
      archived: 'bg-gray-400',
    }
    return colors[status] || 'bg-gray-500'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Draft',
      in_progress: 'In Progress',
      submitted: 'Submitted',
      completed: 'Completed',
      archived: 'Archived',
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
          <h2 className="text-3xl font-bold tracking-tight">Performance Reviews</h2>
          <p className="text-muted-foreground">
            Track and manage employee performance evaluations
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/performance/reviews/new">
            <Plus className="mr-2 h-4 w-4" />
            New Review
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
                placeholder="Search reviews..."
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
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.review_period || 'all'}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  review_period: value === 'all' ? undefined : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                <SelectItem value="Q1 2025">Q1 2025</SelectItem>
                <SelectItem value="Q2 2025">Q2 2025</SelectItem>
                <SelectItem value="Q3 2025">Q3 2025</SelectItem>
                <SelectItem value="Q4 2025">Q4 2025</SelectItem>
                <SelectItem value="2025">Annual 2025</SelectItem>
              </SelectContent>
            </Select>

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

      {/* Reviews List */}
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
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <Link key={review.id} href={`/dashboard/performance/reviews/${review.id}`}>
              <Card className="cursor-pointer transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Reviewee Avatar */}
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-green-400 to-teal-500 text-white">
                        {review.reviewee_name
                          ? getInitials(review.reviewee_name)
                          : 'EM'
                        }
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg">
                            {review.reviewee_name || 'Unknown Employee'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>Reviewer: {review.reviewer_name || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span className="capitalize">{review.review_type}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{review.review_period}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(review.status)}>
                            {getStatusLabel(review.status)}
                          </Badge>
                          {review.overall_rating && (
                            <Badge variant="outline" className="gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {review.overall_rating}/5
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Summary Preview */}
                      {review.summary && (
                        <div className="mt-3 text-sm text-muted-foreground line-clamp-2">
                          {review.summary}
                        </div>
                      )}

                      {/* Dates */}
                      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                        {review.review_period_start && review.review_period_end && (
                          <span>
                            Period: {new Date(review.review_period_start).toLocaleDateString()} -{' '}
                            {new Date(review.review_period_end).toLocaleDateString()}
                          </span>
                        )}
                        {review.submitted_at && (
                          <span>
                            Submitted: {new Date(review.submitted_at).toLocaleDateString()}
                          </span>
                        )}
                        {review.completed_at && (
                          <span>
                            Completed: {new Date(review.completed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-4">
              No performance reviews found
            </p>
            <Button asChild>
              <Link href="/dashboard/performance/reviews/new">
                <Plus className="mr-2 h-4 w-4" />
                Create First Review
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
