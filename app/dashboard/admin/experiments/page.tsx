/**
 * Experiments Overview Page
 *
 * Admin dashboard for viewing and managing A/B test experiments
 */

import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Filter } from 'lucide-react'
import { ExperimentsContent } from './experiments-content'

export const metadata = {
  title: 'A/B Testing Experiments | Admin Dashboard',
  description: 'Manage A/B testing experiments and view real-time metrics',
}

export default function ExperimentsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            A/B Testing Experiments
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage feature experiments and analyze variant performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Experiment
          </Button>
        </div>
      </div>

      {/* Content */}
      <Suspense fallback={<ExperimentsLoadingSkeleton />}>
        <ExperimentsContent />
      </Suspense>
    </div>
  )
}

function ExperimentsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  )
}
