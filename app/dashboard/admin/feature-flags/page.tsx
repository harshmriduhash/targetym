/**
 * Feature Flags Management Page
 *
 * Admin dashboard for managing feature flags and user overrides
 */

import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'
import { FeatureFlagsContent } from './feature-flags-content'

export const metadata = {
  title: 'Feature Flags | Admin Dashboard',
  description: 'Manage feature flags and user-specific overrides',
}

export default function FeatureFlagsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feature Flags</h1>
          <p className="text-muted-foreground mt-2">
            Control feature rollout and manage user-specific overrides
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Flag
        </Button>
      </div>

      {/* Content */}
      <Suspense fallback={<FeatureFlagsLoadingSkeleton />}>
        <FeatureFlagsContent />
      </Suspense>
    </div>
  )
}

function FeatureFlagsLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-64" />
      ))}
    </div>
  )
}
