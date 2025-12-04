/**
 * Feature Flags Content Component
 *
 * Client component for feature flags management with interactivity
 */

'use client'

import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FeatureFlagToggle } from '@/src/components/admin/feature-flags/feature-flag-toggle'
import { UserOverrideForm } from '@/src/components/admin/feature-flags/user-override-form'
import { listFeatureFlags } from '@/src/actions/admin/feature-flags/list-flags'
import { toggleFeatureFlag } from '@/src/actions/admin/feature-flags/toggle-flag'
import { updateFeatureFlag } from '@/src/actions/admin/feature-flags/update-flag'
import { listFeatureFlagOverrides } from '@/src/actions/admin/feature-flags/list-overrides'
import { removeFeatureFlagOverride } from '@/src/actions/admin/feature-flags/remove-override'
import type { Database } from '@/src/types/database.types'
import { Trash2, UserPlus } from 'lucide-react'

type FeatureFlag = Database['public']['Tables']['feature_flags']['Row']
type FeatureFlagOverride =
  Database['public']['Tables']['feature_flag_overrides']['Row']

interface FlagWithStats extends FeatureFlag {
  stats?: {
    enabledCount: number
    totalOverrides: number
  }
}

export function FeatureFlagsContent() {
  const [flags, setFlags] = useState<FlagWithStats[]>([])
  const [overrides, setOverrides] = useState<FeatureFlagOverride[]>([])
  const [selectedFlag, setSelectedFlag] = useState<string | null>(null)
  const [showOverridesDialog, setShowOverridesDialog] = useState(false)
  const [showAddOverrideForm, setShowAddOverrideForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    loadFlags()
  }, [])

  const loadFlags = async () => {
    setIsLoading(true)
    const result = await listFeatureFlags()

    if (result.success) {
      // Load stats for each flag
      const overridesResult = await listFeatureFlagOverrides()
      const allOverrides = overridesResult.success ? overridesResult.data : []

      const flagsWithStats = result.data.map((flag) => {
        const flagOverrides = allOverrides.filter(
          (o: any) => o.flag_name === flag.name
        )
        const enabledCount = flagOverrides.filter((o: any) => o.enabled).length

        return {
          ...flag,
          stats: {
            enabledCount,
            totalOverrides: flagOverrides.length,
          },
        }
      })

      setFlags(flagsWithStats)
    } else {
      toast.error(result.error)
    }
    setIsLoading(false)
  }

  const loadOverrides = async (flagName: string) => {
    const result = await listFeatureFlagOverrides(flagName)
    if (result.success) {
      setOverrides(result.data)
    } else {
      toast.error(result.error)
    }
  }

  const handleToggle = (flagName: string) => {
    startTransition(async () => {
      const result = await toggleFeatureFlag({ flagName })

      if (result.success) {
        toast.success('Feature flag updated')
        loadFlags()
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleUpdateRollout = (flagName: string, percentage: number) => {
    startTransition(async () => {
      const result = await updateFeatureFlag({
        flagName,
        rolloutPercentage: percentage,
      })

      if (result.success) {
        toast.success('Rollout percentage updated')
        loadFlags()
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleManageOverrides = async (flagName: string) => {
    setSelectedFlag(flagName)
    await loadOverrides(flagName)
    setShowOverridesDialog(true)
  }

  const handleRemoveOverride = (overrideId: string) => {
    startTransition(async () => {
      const result = await removeFeatureFlagOverride({ overrideId })

      if (result.success) {
        toast.success('Override removed')
        if (selectedFlag) {
          await loadOverrides(selectedFlag)
        }
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleAddOverride = () => {
    setShowAddOverrideForm(true)
  }

  const handleOverrideSuccess = async () => {
    if (selectedFlag) {
      await loadOverrides(selectedFlag)
      await loadFlags()
    }
  }

  const stats = {
    total: flags.length,
    enabled: flags.filter((f) => f.enabled).length,
    disabled: flags.filter((f) => !f.enabled).length,
    withOverrides: flags.filter((f) => (f.stats?.totalOverrides || 0) > 0)
      .length,
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.enabled}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disabled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {stats.disabled}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Overrides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withOverrides}</div>
          </CardContent>
        </Card>
      </div>

      {/* Flags Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {flags.map((flag) => (
          <FeatureFlagToggle
            key={flag.name}
            flag={flag}
            stats={flag.stats}
            onToggle={handleToggle}
            onUpdateRollout={handleUpdateRollout}
            onManageOverrides={handleManageOverrides}
          />
        ))}
      </div>

      {/* Overrides Dialog */}
      <Dialog open={showOverridesDialog} onOpenChange={setShowOverridesDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>User Overrides - {selectedFlag}</DialogTitle>
            <DialogDescription>
              Manage user-specific overrides for this feature flag
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Button onClick={handleAddOverride} className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Override
            </Button>

            {overrides.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No overrides configured
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overrides.map((override: any) => (
                    <TableRow key={override.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {override.profiles?.email || 'Unknown'}
                          </div>
                          <div className="text-sm text-muted-foreground font-mono">
                            {override.user_id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={override.enabled ? 'default' : 'secondary'}
                        >
                          {override.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {override.reason || 'No reason provided'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOverride(override.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Override Form */}
      {selectedFlag && (
        <UserOverrideForm
          flagName={selectedFlag}
          open={showAddOverrideForm}
          onOpenChange={setShowAddOverrideForm}
          onSuccess={handleOverrideSuccess}
        />
      )}
    </div>
  )
}
