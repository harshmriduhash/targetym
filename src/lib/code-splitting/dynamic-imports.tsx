import dynamic from 'next/dynamic'
import { ComponentType, Suspense, ReactNode } from 'react'

/**
 * Loading fallback générique
 */
export function LoadingFallback({ message = 'Chargement...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

/**
 * Skeleton pour les cartes
 */
export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 animate-pulse">
      <div className="h-4 bg-muted rounded w-1/3 mb-4" />
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded" />
        <div className="h-3 bg-muted rounded w-5/6" />
      </div>
    </div>
  )
}

/**
 * Helper pour créer des composants avec lazy loading et suspense
 */
export function createLazyComponent<P extends Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: ReactNode
) {
  const DynamicComponent = dynamic(importFn, {
    loading: () => (fallback || <LoadingFallback />) as JSX.Element,
    ssr: false, // Client-side only pour les composants interactifs
  })

  return function LazyWrapper(props: P) {
    return (
      <Suspense fallback={fallback || <LoadingFallback />}>
        <DynamicComponent {...props} />
      </Suspense>
    )
  }
}

// ============================================================================
// Composants lazy-loaded pour Goals Module
// ============================================================================

export const GoalsList = createLazyComponent(
  () => import('@/src/components/goals/goals-list'),
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3].map((i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
)

export const GoalForm = createLazyComponent(
  () => import('@/src/components/goals/goal-form'),
  <LoadingFallback message="Chargement du formulaire..." />
)

export const GoalDetails = createLazyComponent(
  () => import('@/src/components/goals/goal-details'),
  <CardSkeleton />
)

export const GoalProgress = createLazyComponent(
  () => import('@/src/components/goals/goal-progress'),
  <CardSkeleton />
)

// ============================================================================
// Composants lazy-loaded pour Recruitment Module
// ============================================================================

export const JobPostingsList = createLazyComponent(
  () => import('@/src/components/recruitment/job-postings-list'),
  <div className="grid gap-4 md:grid-cols-2">
    {[1, 2].map((i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
)

export const CandidatesList = createLazyComponent(
  () => import('@/src/components/recruitment/candidates-list'),
  <CardSkeleton />
)

export const InterviewScheduler = createLazyComponent(
  () => import('@/src/components/recruitment/interview-scheduler'),
  <LoadingFallback message="Chargement du calendrier..." />
)

export const CVScorer = createLazyComponent(
  () => import('@/src/components/recruitment/cv-scorer'),
  <LoadingFallback message="Chargement de l'analyseur IA..." />
)

// ============================================================================
// Composants lazy-loaded pour Performance Module
// ============================================================================

export const PerformanceReviewList = createLazyComponent(
  () => import('@/src/components/performance/review-list'),
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
)

export const ReviewForm = createLazyComponent(
  () => import('@/src/components/performance/review-form'),
  <LoadingFallback message="Chargement du formulaire..." />
)

export const FeedbackForm = createLazyComponent(
  () => import('@/src/components/performance/feedback-form'),
  <LoadingFallback message="Chargement du formulaire..." />
)

// ============================================================================
// Composants lazy-loaded pour Analytics/Dashboard
// ============================================================================

export const AnalyticsDashboard = createLazyComponent(
  () => import('@/src/components/analytics/dashboard'),
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {[1, 2, 3, 4].map((i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
)

export const GoalsChart = createLazyComponent(
  () => import('@/src/components/analytics/goals-chart'),
  <CardSkeleton />
)

export const RecruitmentChart = createLazyComponent(
  () => import('@/src/components/analytics/recruitment-chart'),
  <CardSkeleton />
)

// ============================================================================
// Composants heavy (charts, editors, etc.)
// ============================================================================

export const RichTextEditor = dynamic(
  () => import('@/src/components/ui/rich-text-editor'),
  {
    loading: () => <LoadingFallback message="Chargement de l'éditeur..." />,
    ssr: false,
  }
)

export const ChartComponent = dynamic(
  () => import('@/src/components/ui/chart'),
  {
    loading: () => <CardSkeleton />,
    ssr: false,
  }
)

export const DataTable = dynamic(
  () => import('@/src/components/ui/data-table'),
  {
    loading: () => <LoadingFallback message="Chargement des données..." />,
    ssr: true, // SSR possible pour les tables
  }
)

// ============================================================================
// Dialogs et Modals (lazy loaded)
// ============================================================================

export const ConfirmDialog = dynamic(
  () => import('@/src/components/ui/confirm-dialog'),
  { ssr: false }
)

export const SettingsDialog = dynamic(
  () => import('@/src/components/settings/settings-dialog'),
  {
    loading: () => <LoadingFallback message="Chargement des paramètres..." />,
    ssr: false,
  }
)
