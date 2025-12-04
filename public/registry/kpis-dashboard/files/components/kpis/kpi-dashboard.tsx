'use client'

import { useQuery } from '@tanstack/react-query'
import { getKpis } from '@/src/actions/kpis'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, AlertTriangle, Target, BarChart3 } from 'lucide-react'

export function KpiDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['kpis-dashboard'],
    queryFn: async () => {
      const result = await getKpis({
        filters: { is_active: true },
        pagination: { page: 1, pageSize: 100 },
      })
      return result.success ? result.data : null
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  })

  const kpis = data?.data || []

  // Calculate statistics
  const stats = {
    total: kpis.length,
    onTrack: kpis.filter((k: any) => k.status === 'on_track').length,
    atRisk: kpis.filter((k: any) => k.status === 'at_risk' || k.status === 'needs_attention').length,
    belowTarget: kpis.filter((k: any) => k.status === 'below_target').length,
  }

  const byCategory = kpis.reduce((acc: any, kpi: any) => {
    acc[kpi.category] = (acc[kpi.category] || 0) + 1
    return acc
  }, {})

  const categoryIcons: Record<string, any> = {
    revenue: '💰',
    customer: '👥',
    operational: '⚙️',
    employee: '👔',
    quality: '✨',
    efficiency: '⚡',
    custom: '🔧',
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total KPIs</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active metrics being tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Track</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.onTrack}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? Math.round((stats.onTrack / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.atRisk}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? Math.round((stats.atRisk / stats.total) * 100) : 0}% need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Below Target</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.belowTarget}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? Math.round((stats.belowTarget / stats.total) * 100) : 0}% below expectations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            KPIs by Category
          </CardTitle>
          <CardDescription>Distribution of KPIs across different categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(byCategory).map(([category, count]) => (
              <div
                key={category}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{categoryIcons[category] || '📊'}</span>
                  <div>
                    <p className="font-medium capitalize">{category}</p>
                    <p className="text-xs text-muted-foreground">
                      {((count as number) / stats.total * 100).toFixed(0)}% of total
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">{count as number}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critical KPIs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Critical KPIs Requiring Attention
          </CardTitle>
          <CardDescription>
            High-priority metrics that need immediate review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {kpis.filter((k: any) =>
            k.priority === 'critical' || k.priority === 'high' &&
            (k.status === 'at_risk' || k.status === 'below_target' || k.status === 'needs_attention')
          ).length > 0 ? (
            <div className="space-y-3">
              {kpis
                .filter((k: any) =>
                  (k.priority === 'critical' || k.priority === 'high') &&
                  (k.status === 'at_risk' || k.status === 'below_target' || k.status === 'needs_attention')
                )
                .slice(0, 5)
                .map((kpi: any) => (
                  <div
                    key={kpi.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{kpi.name}</p>
                        <Badge
                          variant="outline"
                          className={
                            kpi.priority === 'critical'
                              ? 'border-red-500 text-red-600'
                              : 'border-orange-500 text-orange-600'
                          }
                        >
                          {kpi.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Current: {kpi.current_value} {kpi.unit} • Target: {kpi.target_value} {kpi.unit}
                      </p>
                    </div>
                    <Badge
                      className={
                        kpi.status === 'needs_attention'
                          ? 'bg-red-500'
                          : kpi.status === 'below_target'
                          ? 'bg-orange-500'
                          : 'bg-yellow-500'
                      }
                    >
                      {kpi.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>🎉 All critical KPIs are on track!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
