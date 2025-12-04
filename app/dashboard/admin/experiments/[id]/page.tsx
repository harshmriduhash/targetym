/**
 * Experiment Details Page
 *
 * Detailed view of a single A/B test experiment
 */

import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ExperimentDetailsContent } from './experiment-details-content'

interface ExperimentDetailsPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params,
}: ExperimentDetailsPageProps) {
  return {
    title: `Experiment ${params.id} | Admin Dashboard`,
    description: 'View detailed statistics and manage experiment variants',
  }
}

export default function ExperimentDetailsPage({
  params,
}: ExperimentDetailsPageProps) {
  if (!params.id) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/admin/experiments">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Experiments
          </Link>
        </Button>
      </div>

      {/* Content */}
      <Suspense fallback={<ExperimentDetailsLoadingSkeleton />}>
        <ExperimentDetailsContent experimentId={params.id} />
      </Suspense>
    </div>
  )
}

function ExperimentDetailsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}
