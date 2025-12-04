'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Target, TrendingUp, Clock } from 'lucide-react'
import type { Goal, KeyResult } from '@/src/types/database.types'

interface GoalWithKeyResults extends Goal {
  key_results?: KeyResult[]
  progress?: number
}

interface OKRDashboardProps {
  initialGoals?: GoalWithKeyResults[]
}

export function OKRDashboard({ initialGoals = [] }: OKRDashboardProps) {
  const router = useRouter()
  const [goals, setGoals] = useState<GoalWithKeyResults[]>(initialGoals)
  const [activeTab, setActiveTab] = useState('all')

  const filteredGoals = goals.filter((goal) => {
    if (activeTab === 'all') return true
    return goal.status === activeTab
  })

  const stats = {
    total: goals.length,
    active: goals.filter((g) => g.status === 'active').length,
    completed: goals.filter((g) => g.status === 'completed').length,
    avgProgress: goals.length > 0
      ? Math.round(goals.reduce((acc, g) => acc + (g.progress || 0), 0) / goals.length)
      : 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Goals & OKRs</h1>
          <p className="text-muted-foreground">Track and manage your objectives and key results</p>
        </div>
        <Button onClick={() => router.push('/dashboard/goals/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Goal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProgress}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredGoals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No goals found</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === 'all'
                    ? 'Create your first goal to get started'
                    : `No ${activeTab} goals at the moment`}
                </p>
                <Button onClick={() => router.push('/dashboard/goals/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredGoals.map((goal) => (
              <Card
                key={goal.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/dashboard/goals/${goal.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle>{goal.title}</CardTitle>
                      {goal.description && (
                        <CardDescription className="line-clamp-2">
                          {goal.description}
                        </CardDescription>
                      )}
                    </div>
                    <Badge
                      variant={
                        goal.status === 'active'
                          ? 'default'
                          : goal.status === 'completed'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {goal.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{goal.progress || 0}%</span>
                      </div>
                      <Progress value={goal.progress || 0} />
                    </div>

                    {/* Key Results Count */}
                    {goal.key_results && goal.key_results.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="h-4 w-4" />
                        <span>
                          {goal.key_results.length} Key Result
                          {goal.key_results.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    {/* Period Info */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{goal.period}</span>
                      </div>
                      {goal.start_date && goal.end_date && (
                        <span>
                          {new Date(goal.start_date).toLocaleDateString()} -{' '}
                          {new Date(goal.end_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
