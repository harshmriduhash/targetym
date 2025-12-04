/**
 * A/B Testing Test Page
 *
 * Interactive test page to verify A/B testing functionality:
 * - View assigned variant for current user
 * - Test feature flags
 * - Simulate multiple user assignments
 * - View distribution statistics
 */

import { ABTestingService, INTEGRATION_EXPERIMENTS } from '@/src/lib/analytics/ab-testing'
import { createClient } from '@/src/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface VariantInfo {
  experimentId: string
  experimentName: string
  variant: {
    id: string
    name: string
    description: string
    config: Record<string, unknown>
  }
}

interface FeatureFlagInfo {
  name: string
  enabled: boolean
  description: string
}

interface DistributionStats {
  experimentId: string
  totalUsers: number
  distribution: Record<string, number>
  percentages: Record<string, number>
}

export default async function ABTestingTestPage() {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view A/B testing status</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Test experiments for current user
  const experiments = [
    {
      id: INTEGRATION_EXPERIMENTS.OAUTH_FLOW_OPTIMIZATION,
      name: 'OAuth Flow Optimization',
    },
    {
      id: INTEGRATION_EXPERIMENTS.PROVIDER_ONBOARDING_UX,
      name: 'Provider Onboarding UX',
    },
  ]

  const variantAssignments: VariantInfo[] = []

  for (const exp of experiments) {
    try {
      const variant = await ABTestingService.getVariant(user.id, exp.id)
      variantAssignments.push({
        experimentId: exp.id,
        experimentName: exp.name,
        variant,
      })

      // Track exposure
      await ABTestingService.trackExposure(user.id, exp.id, variant.id)
    } catch (error) {
      console.error(`Failed to get variant for ${exp.id}:`, error)
    }
  }

  // Test feature flags
  const featureFlags = [
    {
      name: 'integration_slack_enabled',
      description: 'Slack integration (100% rollout)',
    },
    {
      name: 'integration_auto_sync',
      description: 'Auto-sync feature (50% rollout)',
    },
    {
      name: 'integration_advanced_webhooks',
      description: 'Advanced webhooks (testing)',
    },
  ]

  const featureFlagStatus: FeatureFlagInfo[] = []

  for (const flag of featureFlags) {
    try {
      const enabled = await ABTestingService.isFeatureEnabled(user.id, flag.name)
      featureFlagStatus.push({
        name: flag.name,
        enabled,
        description: flag.description,
      })
    } catch (error) {
      console.error(`Failed to check feature flag ${flag.name}:`, error)
    }
  }

  // Get distribution statistics from database
  const distributionStats: DistributionStats[] = []

  for (const exp of experiments) {
    try {
      const { data: assignments } = await supabase
        .from('ab_test_assignments')
        .select('variant_id')
        .eq('experiment_id', exp.id)

      if (assignments) {
        const distribution: Record<string, number> = {}
        for (const assignment of assignments) {
          distribution[assignment.variant_id] = (distribution[assignment.variant_id] || 0) + 1
        }

        const totalUsers = assignments.length
        const percentages: Record<string, number> = {}
        for (const [variantId, count] of Object.entries(distribution)) {
          percentages[variantId] = totalUsers > 0 ? (count / totalUsers) * 100 : 0
        }

        distributionStats.push({
          experimentId: exp.id,
          totalUsers,
          distribution,
          percentages,
        })
      }
    } catch (error) {
      console.error(`Failed to get distribution for ${exp.id}:`, error)
    }
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">A/B Testing Verification</h1>
        <p className="text-muted-foreground">
          Interactive test page to verify A/B testing functionality
        </p>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current User</CardTitle>
          <CardDescription>Authenticated user information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">User ID:</span>
              <code className="text-sm bg-muted px-2 py-1 rounded">{user.id}</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Email:</span>
              <span>{user.email}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variant Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Experiment Assignments</CardTitle>
          <CardDescription>
            Your assigned variants (consistent across page refreshes)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {variantAssignments.map((assignment) => (
              <div key={assignment.experimentId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{assignment.experimentName}</h3>
                    <code className="text-xs text-muted-foreground">
                      {assignment.experimentId}
                    </code>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {assignment.variant.name}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {assignment.variant.description}
                </div>
                <div className="bg-muted/50 p-3 rounded-md">
                  <code className="text-xs">
                    {JSON.stringify(assignment.variant.config, null, 2)}
                  </code>
                </div>
                <Separator />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>
            Feature flag status for current user (based on rollout percentage)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {featureFlagStatus.map((flag) => (
              <div
                key={flag.name}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-medium">{flag.name}</code>
                    {flag.enabled ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{flag.description}</p>
                </div>
                <Badge variant={flag.enabled ? 'default' : 'secondary'}>
                  {flag.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distribution Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution Statistics</CardTitle>
          <CardDescription>
            Current variant distribution across all users in database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {distributionStats.length > 0 ? (
              distributionStats.map((stats) => (
                <div key={stats.experimentId} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">
                      {experiments.find((e) => e.id === stats.experimentId)?.name}
                    </h3>
                    <Badge variant="outline">{stats.totalUsers} users</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(stats.distribution).map(([variantId, count]) => (
                      <div key={variantId} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{variantId}</span>
                          <span className="text-2xl font-bold">{count}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all"
                            style={{ width: `${stats.percentages[variantId]}%` }}
                          />
                        </div>
                        <div className="text-sm text-muted-foreground text-right">
                          {stats.percentages[variantId].toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator />
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-5 w-5" />
                <p>No distribution data available yet. Start using the experiments!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
          <CardDescription>How to verify A/B testing functionality</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Consistency Test</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Refresh this page multiple times</li>
                <li>Verify your assigned variants remain the same</li>
                <li>Check that feature flags stay consistent</li>
              </ol>
            </div>
            <Separator />
            <div className="space-y-2">
              <h3 className="font-medium">Distribution Test</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Create multiple test users</li>
                <li>Visit this page with each user</li>
                <li>Observe distribution statistics approaching 50/50 split</li>
              </ol>
            </div>
            <Separator />
            <div className="space-y-2">
              <h3 className="font-medium">Automated Tests</h3>
              <div className="bg-muted/50 p-3 rounded-md">
                <code className="text-sm">npm test ab-testing-verification</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Run automated tests to verify distribution and consistency
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
