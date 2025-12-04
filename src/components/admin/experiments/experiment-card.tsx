/**
 * Experiment Card Component
 *
 * Displays experiment summary in a card format
 */

'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { Database } from '@/src/types/database.types'
import { formatDistanceToNow } from 'date-fns'
import { Play, Pause, Eye, Download } from 'lucide-react'
import Link from 'next/link'

type ABTestExperiment =
  Database['public']['Tables']['ab_test_experiments']['Row']

interface ExperimentCardProps {
  experiment: ABTestExperiment
  stats?: {
    totalAssignments: number
    totalExposures: number
  }
  onToggle?: (experimentId: string) => void
  onExport?: (experimentId: string) => void
}

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-500' },
  running: { label: 'Running', color: 'bg-green-500' },
  paused: { label: 'Paused', color: 'bg-yellow-500' },
  completed: { label: 'Completed', color: 'bg-blue-500' },
}

export function ExperimentCard({
  experiment,
  stats,
  onToggle,
  onExport,
}: ExperimentCardProps) {
  const status = experiment.status || 'draft'
  const statusInfo = statusConfig[status as keyof typeof statusConfig]

  const variants = (experiment.variants as any[]) || []
  const totalWeight = variants.reduce((sum, v) => sum + (v.weight || 0), 0)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{experiment.name}</CardTitle>
            <CardDescription>{experiment.description}</CardDescription>
          </div>
          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Variants */}
        <div>
          <p className="text-sm font-medium mb-2">
            Variants ({variants.length})
          </p>
          <div className="space-y-2">
            {variants.map((variant) => (
              <div key={variant.id} className="flex items-center gap-2">
                <Badge variant="outline">{variant.name}</Badge>
                <Progress value={(variant.weight / totalWeight) * 100} className="flex-1" />
                <span className="text-sm text-muted-foreground">
                  {variant.weight}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Assignments</p>
              <p className="text-2xl font-bold">{stats.totalAssignments}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Exposures</p>
              <p className="text-2xl font-bold">{stats.totalExposures}</p>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          {experiment.start_date && (
            <div>
              Started{' '}
              {formatDistanceToNow(new Date(experiment.start_date), {
                addSuffix: true,
              })}
            </div>
          )}
          {experiment.end_date && (
            <div>
              Ends{' '}
              {formatDistanceToNow(new Date(experiment.end_date), {
                addSuffix: true,
              })}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/admin/experiments/${experiment.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Link>
        </Button>

        {status !== 'completed' && onToggle && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggle(experiment.id)}
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

        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport(experiment.id)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
