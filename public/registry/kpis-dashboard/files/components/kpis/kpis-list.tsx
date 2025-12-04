'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getKpis } from '@/src/actions/kpis'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Plus, Search, Filter, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/src/types/database.types'

type Kpi = Database['public']['Tables']['kpis']['Row']

interface KpisListProps {
  initialFilters?: {
    category?: string
    status?: string
    owner_id?: string
    department?: string
    is_active?: boolean
  }
}

export function KpisList({ initialFilters }: KpisListProps) {
  const [filters, setFilters] = useState(initialFilters || {})
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 12

  const { data, isLoading, error } = useQuery({
    queryKey: ['kpis', filters, searchQuery, page, pageSize],
    queryFn: async () => {
      const result = await getKpis({
        filters: {
          ...filters,
          search: searchQuery || undefined,
        },
        pagination: { page, pageSize },
      })

      if (!result.success) {
        throw new Error(result.error.message)
      }

      return result.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (KPIs update frequently)
  })

  if (error) {
    toast.error('Failed to load KPIs', {
      description: error.message,
    })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      on_track: 'bg-green-500',
      at_risk: 'bg-yellow-500',
      below_target: 'bg-orange-500',
      above_target: 'bg-blue-500',
      needs_attention: 'bg-red-500',
    }
    return colors[status] || 'bg-gray-500'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on_track':
        return <TrendingUp className="h-4 w-4" />
      case 'below_target':
      case 'at_risk':
        return <TrendingDown className="h-4 w-4" />
      case 'needs_attention':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Minus className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      revenue: 'bg-green-100 text-green-800 border-green-200',
      customer: 'bg-blue-100 text-blue-800 border-blue-200',
      operational: 'bg-purple-100 text-purple-800 border-purple-200',
      employee: 'bg-orange-100 text-orange-800 border-orange-200',
      quality: 'bg-pink-100 text-pink-800 border-pink-200',
      efficiency: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      custom: 'bg-gray-100 text-gray-800 border-gray-200',
    }
    return colors[category] || colors.custom
  }

  const formatValue = (value: number | null, unit: string | null, metricType: string) => {
    if (value === null) return 'N/A'

    switch (metricType) {
      case 'percentage':
        return `${value.toFixed(1)}%`
      case 'currency':
        return `${unit || '$'}${value.toLocaleString()}`
      case 'ratio':
        return `${value.toFixed(2)}:1`
      default:
        return `${value.toLocaleString()} ${unit || ''}`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">KPIs Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor key performance indicators and track business metrics
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/kpis/new">
            <Plus className="mr-2 h-4 w-4" />
            New KPI
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="flex items-center space-x-2 md:col-span-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search KPIs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>

            <Select
              value={filters.category || 'all'}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  category: value === 'all' ? undefined : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="revenue">💰 Revenue</SelectItem>
                <SelectItem value="customer">👥 Customer</SelectItem>
                <SelectItem value="operational">⚙️ Operational</SelectItem>
                <SelectItem value="employee">👔 Employee</SelectItem>
                <SelectItem value="quality">✨ Quality</SelectItem>
                <SelectItem value="efficiency">⚡ Efficiency</SelectItem>
                <SelectItem value="custom">🔧 Custom</SelectItem>
              </SelectContent>
            </Select>

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
                <SelectItem value="on_track">On Track</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
                <SelectItem value="below_target">Below Target</SelectItem>
                <SelectItem value="above_target">Above Target</SelectItem>
                <SelectItem value="needs_attention">Needs Attention</SelectItem>
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
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.data.map((kpi: any) => {
              const progress = kpi.target_value && kpi.current_value
                ? Math.min(100, (kpi.current_value / kpi.target_value) * 100)
                : 0

              return (
                <Link key={kpi.id} href={`/dashboard/kpis/${kpi.id}`}>
                  <Card className="cursor-pointer transition-all hover:shadow-md h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base line-clamp-1">{kpi.name}</CardTitle>
                          <CardDescription className="line-clamp-1 mt-1">
                            {kpi.description || 'No description'}
                          </CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${getCategoryColor(kpi.category)} border`}
                        >
                          {kpi.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Current Value */}
                      <div className="flex items-baseline justify-between">
                        <div>
                          <p className="text-3xl font-bold">
                            {formatValue(kpi.current_value, kpi.unit, kpi.metric_type)}
                          </p>
                          {kpi.target_value && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Target: {formatValue(kpi.target_value, kpi.unit, kpi.metric_type)}
                            </p>
                          )}
                        </div>
                        <Badge className={`${getStatusColor(kpi.status)} flex items-center gap-1`}>
                          {getStatusIcon(kpi.status)}
                          {kpi.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      {/* Progress Bar */}
                      {kpi.target_value && (
                        <div className="space-y-1">
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                progress >= 100
                                  ? 'bg-green-500'
                                  : progress >= 70
                                  ? 'bg-blue-500'
                                  : progress >= 40
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(100, progress)}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground text-right">
                            {progress.toFixed(0)}% of target
                          </p>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span className="capitalize">{kpi.measurement_frequency}</span>
                        {kpi.department && <span>{kpi.department}</span>}
                        {kpi.priority && (
                          <Badge
                            variant="outline"
                            className={
                              kpi.priority === 'critical'
                                ? 'border-red-500 text-red-600'
                                : kpi.priority === 'high'
                                ? 'border-orange-500 text-orange-600'
                                : ''
                            }
                          >
                            {kpi.priority}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>

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
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-4">
              No KPIs found
            </p>
            <Button asChild>
              <Link href="/dashboard/kpis/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First KPI
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
