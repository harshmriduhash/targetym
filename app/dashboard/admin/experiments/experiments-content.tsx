/**
 * Experiments Content Component
 *
 * Client component for experiments list with interactivity
 */

'use client'

import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { ExperimentCard } from '@/src/components/admin/experiments/experiment-card'
import { listExperiments } from '@/src/actions/admin/experiments/list-experiments'
import { getExperimentStats } from '@/src/actions/admin/experiments/get-experiment-stats'
import { toggleExperiment } from '@/src/actions/admin/experiments/toggle-experiment'
import { exportExperimentResults } from '@/src/actions/admin/experiments/export-experiment-results'
import type { Database } from '@/src/types/database.types'
import type { ExperimentStats } from '@/src/lib/services/admin/ab-testing-admin.service'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

type ABTestExperiment =
  Database['public']['Tables']['ab_test_experiments']['Row']

interface ExperimentWithStats extends ABTestExperiment {
  stats?: ExperimentStats
}

export function ExperimentsContent() {
  const [experiments, setExperiments] = useState<ExperimentWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    loadExperiments()
  }, [])

  const loadExperiments = async () => {
    setIsLoading(true)
    const result = await listExperiments()

    if (result.success) {
      // Load stats for each experiment
      const experimentsWithStats = await Promise.all(
        result.data.map(async (exp) => {
          const statsResult = await getExperimentStats({
            experimentId: exp.id,
          })
          return {
            ...exp,
            stats: statsResult.success ? statsResult.data : undefined,
          }
        })
      )
      setExperiments(experimentsWithStats)
    } else {
      toast.error(result.error)
    }
    setIsLoading(false)
  }

  const handleToggle = (experimentId: string) => {
    startTransition(async () => {
      const result = await toggleExperiment({ experimentId })

      if (result.success) {
        toast.success('Experiment status updated')
        loadExperiments()
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleExport = (experimentId: string) => {
    startTransition(async () => {
      const result = await exportExperimentResults({
        experimentId,
        format: 'json',
      })

      if (result.success) {
        // Download JSON file
        const dataStr = JSON.stringify(result.data.data, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `experiment-${experimentId}-results.json`
        link.click()
        URL.revokeObjectURL(url)

        toast.success('Results exported successfully')
      } else {
        toast.error(result.error)
      }
    })
  }

  const filteredExperiments =
    activeTab === 'all'
      ? experiments
      : experiments.filter((exp) => exp.status === activeTab)

  const stats = {
    total: experiments.length,
    running: experiments.filter((exp) => exp.status === 'running').length,
    paused: experiments.filter((exp) => exp.status === 'paused').length,
    completed: experiments.filter((exp) => exp.status === 'completed').length,
    totalAssignments: experiments.reduce(
      (sum, exp) => sum + (exp.stats?.totalAssignments || 0),
      0
    ),
    totalExposures: experiments.reduce(
      (sum, exp) => sum + (exp.stats?.totalExposures || 0),
      0
    ),
  }

  if (isLoading) {
    return <ExperimentsLoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Experiments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.running} running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Across all experiments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Exposures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExposures}</div>
            <p className="text-xs text-muted-foreground">User interactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Badge className="bg-green-500">{stats.running} Running</Badge>
              <Badge className="bg-yellow-500">{stats.paused} Paused</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Experiments List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="running">Running ({stats.running})</TabsTrigger>
          <TabsTrigger value="paused">Paused ({stats.paused})</TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({stats.completed})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredExperiments.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">
                  No experiments found
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredExperiments.map((experiment) => (
                <ExperimentCard
                  key={experiment.id}
                  experiment={experiment}
                  stats={experiment.stats}
                  onToggle={handleToggle}
                  onExport={handleExport}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ExperimentsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  )
}
