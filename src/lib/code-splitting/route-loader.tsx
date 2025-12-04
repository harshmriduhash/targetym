import dynamic from 'next/dynamic'
import { LoadingFallback } from './dynamic-imports'

/**
 * Configuration du code splitting au niveau des routes
 * Chaque module principal est chargé dynamiquement
 */

// ============================================================================
// Pages Modules
// ============================================================================

export const GoalsPage = dynamic(
  () => import('@/src/app/(dashboard)/goals/page'),
  {
    loading: () => <LoadingFallback message="Chargement des objectifs..." />,
  }
)

export const RecruitmentPage = dynamic(
  () => import('@/src/app/(dashboard)/recruitment/page'),
  {
    loading: () => <LoadingFallback message="Chargement du recrutement..." />,
  }
)

export const PerformancePage = dynamic(
  () => import('@/src/app/(dashboard)/performance/page'),
  {
    loading: () => <LoadingFallback message="Chargement des évaluations..." />,
  }
)

export const AnalyticsPage = dynamic(
  () => import('@/src/app/(dashboard)/analytics/page'),
  {
    loading: () => <LoadingFallback message="Chargement des analytics..." />,
  }
)

// ============================================================================
// Route Groups pour le lazy loading par feature
// ============================================================================

/**
 * Précharge les composants critiques d'une route
 * Utilisé pour améliorer les performances de navigation
 */
export function preloadRoute(routeName: 'goals' | 'recruitment' | 'performance' | 'analytics') {
  switch (routeName) {
    case 'goals':
      return import('@/src/app/(dashboard)/goals/page')
    case 'recruitment':
      return import('@/src/app/(dashboard)/recruitment/page')
    case 'performance':
      return import('@/src/app/(dashboard)/performance/page')
    case 'analytics':
      return import('@/src/app/(dashboard)/analytics/page')
  }
}

/**
 * Hook pour précharger une route au survol d'un lien
 */
export function usePrefetchRoute() {
  return (routeName: 'goals' | 'recruitment' | 'performance' | 'analytics') => {
    preloadRoute(routeName)
  }
}
