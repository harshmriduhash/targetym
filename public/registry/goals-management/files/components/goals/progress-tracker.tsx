'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface ProgressTrackerProps {
  progress: number
  target: number
  period: string
}

export function ProgressTracker({ progress, target, period }: ProgressTrackerProps) {
  const percentage = Math.round((progress / target) * 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progression</CardTitle>
        <CardDescription>Suivi des objectifs pour {period}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Progression actuelle</span>
          <Badge variant={percentage >= 100 ? 'default' : 'secondary'}>
            {percentage}%
          </Badge>
        </div>
        <Progress value={percentage} className="w-full" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{progress} / {target}</span>
          <span>Objectif: {target}</span>
        </div>
      </CardContent>
    </Card>
  )
}

