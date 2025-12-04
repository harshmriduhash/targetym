'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getGoals } from '@/src/actions/goals'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Plus, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/src/types/database.types'

type Goal = Database['public']['Tables']['goals']['Row']

interface GoalsListProps {
  initialFilters?: {
    owner_id?: string
    status?: string
    period?: string
  }
}

export function GoalsList({ initialFilters }: GoalsListProps) {
  const [filters, setFilters] = useState(initialFilters || {})
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['goals', filters, page, pageSize],
    queryFn: async () => {
      const result = await getGoals({
        filters,
        pagination: { page, pageSize },
      })

      if (!result.success) {
        throw new Error(result.error.message)
      }

      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  if (error) {
    toast.error('Failed to load goals', {
      description: error.message,
    })
  }

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

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-400 text-gray-900',
      medium: 'bg-blue-400 text-blue-900',
      high: 'bg-orange-400 text-orange-900',
      critical: 'bg-red-500 text-white',
    }
    return colors[priority] || 'bg-gray-400 text-gray-900'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Goals & OKRs</h2>
          <p className="text-muted-foreground">
            Manage and track your objectives and key results
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/goals/new">
            <Plus className="mr-2 h-4 w-4" />
            New Goal
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
                placeholder="Search goals..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.period || 'all'}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  period: value === 'all' ? undefined : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
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

      {/* Goals List */}
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
          {data.data.map((goal: Goal) => (
            <Link key={goal.id} href={`/dashboard/goals/${goal.id}`}>
              <Card className="cursor-pointer transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-xl">{goal.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {goal.description || 'No description'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge className={getStatusColor(goal.status)}>
                        {goal.status}
                      </Badge>
                      <Badge className={getPriorityColor(goal.priority || 'medium')}>
                        {goal.priority || 'medium'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="capitalize">{goal.period}</span>
                      <span>
                        {new Date(goal.start_date).toLocaleDateString()} -{' '}
                        {new Date(goal.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${goal.progress_percentage || 0}%` }}
                        />
                      </div>
                      <span className="font-medium">{goal.progress_percentage || 0}%</span>
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
            <p className="text-lg font-medium text-muted-foreground mb-4">
              No goals found
            </p>
            <Button asChild>
              <Link href="/dashboard/goals/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Goal
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
