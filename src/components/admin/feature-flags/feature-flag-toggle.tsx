/**
 * Feature Flag Toggle Component
 *
 * Toggle with rollout percentage slider
 */

'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import type { Database } from '@/src/types/database.types'
import { useState } from 'react'
import { Settings } from 'lucide-react'

type FeatureFlag = Database['public']['Tables']['feature_flags']['Row']

interface FeatureFlagToggleProps {
  flag: FeatureFlag
  stats?: {
    enabledCount: number
    totalOverrides: number
  }
  onToggle?: (flagName: string) => void
  onUpdateRollout?: (flagName: string, percentage: number) => void
  onManageOverrides?: (flagName: string) => void
}

export function FeatureFlagToggle({
  flag,
  stats,
  onToggle,
  onUpdateRollout,
  onManageOverrides,
}: FeatureFlagToggleProps) {
  const [rollout, setRollout] = useState(flag.rollout_percentage || 0)

  const handleRolloutChange = (value: number[]) => {
    setRollout(value[0])
  }

  const handleRolloutCommit = () => {
    if (onUpdateRollout && rollout !== flag.rollout_percentage) {
      onUpdateRollout(flag.name, rollout)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle>{flag.name}</CardTitle>
            <CardDescription>{flag.description}</CardDescription>
          </div>
          <Badge variant={flag.enabled ? 'default' : 'secondary'}>
            {flag.enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor={`toggle-${flag.name}`} className="text-base">
            Enable Flag
          </Label>
          <Switch
            id={`toggle-${flag.name}`}
            checked={flag.enabled}
            onCheckedChange={() => onToggle?.(flag.name)}
          />
        </div>

        {/* Rollout Percentage */}
        {flag.enabled && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Rollout Percentage</Label>
              <span className="text-2xl font-bold">{rollout}%</span>
            </div>
            <Slider
              value={[rollout]}
              onValueChange={handleRolloutChange}
              onValueCommit={handleRolloutCommit}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Feature will be enabled for {rollout}% of users
            </p>
          </div>
        )}

        {/* Stats */}
        {stats && stats.totalOverrides > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">User Overrides</span>
              <span className="font-medium">
                {stats.enabledCount} / {stats.totalOverrides}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        {onManageOverrides && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onManageOverrides(flag.name)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage Overrides
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
