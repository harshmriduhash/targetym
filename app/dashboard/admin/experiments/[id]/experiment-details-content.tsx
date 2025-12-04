/**
 * Experiment Details Content Component
 *
 * Client component for experiment details with interactivity
 */

'use client'

import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { VariantDistributionChart } from '@/src/components/admin/experiments/variant-distribution-chart'
import { AssignmentsTimeline } from '@/src/components/admin/experiments/assignments-timeline'
import { getExperimentStats } from '@/src/actions/admin/experiments/get-experiment-stats'
import { toggleExperiment } from '@/src/actions/admin/experiments/toggle-experiment'
import { exportExperimentResults } from '@/src/actions/admin/experiments/export-experiment-results'
import { listExperiments } from '@/src/actions/admin/experiments/list-experiments'
import type { ExperimentStats } from '@/src/lib/services/admin/ab-testing-admin.service'
import type { Database } from '@/src/types/database.types'
import { Play, Pause, Download, Calendar, Target } from 'lucide-react'
import { format, parseISO } from 'date-fns'

type ABTestExperiment =
  Database['public']['Tables']['ab_test_experiments']['Row']

interface ExperimentDetailsContentProps {
  experimentId: string
}

export function ExperimentDetailsContent({
  experimentId,
}: ExperimentDetailsContentProps) {
  const [experiment, setExperiment] = useState<ABTestExperiment | null>(null)
  const [stats, setStats] = useState<ExperimentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    loadExperimentData()
  }, [experimentId])

  const loadExperimentData = async () => {
    setIsLoading(true)

    // Load experiment
    const experimentResult = await listExperiments()
    if (experimentResult.success) {
      const exp = experimentResult.data.find((e) => e.id === experimentId)
      setExperiment(exp || null)
    }

    // Load stats
    const statsResult = await getExperimentStats({ experimentId })
    if (statsResult.success) {
      setStats(statsResult.data)
    }

    setIsLoading(false)
  }

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleExperiment({ experimentId })

      if (result.success) {
        toast.success('Experiment status updated')
        loadExperimentData()
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleExport = () => {
    startTransition(async () => {
      const result = await exportExperimentResults({
        experimentId,
        format: 'csv',
      })

      if (result.success) {
        // Download CSV file
        const dataBlob = new Blob([result.data.data], { type: 'text/csv' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `experiment-${experimentId}-results.csv`
        link.click()
        URL.revokeObjectURL(url)

        toast.success('Results exported successfully')
      } else {
        toast.error(result.error)
      }
    })
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!experiment) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">
            Experiment not found
          </p>
        </CardContent>
      </Card>
    )
  }

  const variants = (experiment.variants as any[]) || []
  const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-500' },
    running: { label: 'Running', color: 'bg-green-500' },
    paused: { label: 'Paused', color: 'bg-yellow-500' },
    completed: { label: 'Completed', color: 'bg-blue-500' },
  }
  const status = experiment.status || 'draft'
  const statusInfo = statusConfig[status as keyof typeof statusConfig]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-3xl">{experiment.name}</CardTitle>
                <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
              </div>
              <p className="text-muted-foreground">{experiment.description}</p>
            </div>
            <div className="flex gap-2">
              {status !== 'completed' && (
                <Button
                  variant="outline"
                  onClick={handleToggle}
                  disabled={isPending}
                >
                  {status === 'running' ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={handleExport} disabled={isPending}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">
                  {experiment.start_date
                    ? format(parseISO(experiment.start_date), 'MMM dd, yyyy')
                    : 'Not set'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium">
                  {experiment.end_date
                    ? format(parseISO(experiment.end_date), 'MMM dd, yyyy')
                    : 'Ongoing'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Target Rollout</p>
                <p className="font-medium">{experiment.target_percentage}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.totalAssignments || 0}
            </div>
            <p className="text-xs text-muted-foreground">Users assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Exposures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.totalExposures || 0}
            </div>
            <p className="text-xs text-muted-foreground">User interactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Exposure Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats && stats.totalAssignments > 0
                ? Math.round(
                    (stats.totalExposures / stats.totalAssignments) * 100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Exposures / Assignments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {stats && (
          <>
            <VariantDistributionChart
              distribution={stats.variantDistribution}
            />
            <AssignmentsTimeline data={stats.assignmentsByDay} />
          </>
        )}
      </div>

      {/* Variants Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Variants Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variant ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Configuration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell className="font-mono">{variant.id}</TableCell>
                  <TableCell className="font-medium">{variant.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {variant.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{variant.weight}%</Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {JSON.stringify(variant.config)}
                    </code>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
