import { QueryClient, DefaultOptions } from '@tanstack/react-query'

// Default options pour React Query avec stratégie de caching optimisée
const defaultOptions: DefaultOptions = {
  queries: {
    // Stratégie de caching agressive
    staleTime: 5 * 60 * 1000, // 5 minutes - les données restent fraîches
    gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection (anciennement cacheTime)

    // Optimisations réseau
    refetchOnWindowFocus: true, // Revalidation au focus
    refetchOnReconnect: true, // Revalidation à la reconnexion
    refetchOnMount: false, // Ne pas refetch si données fraîches

    // Retry strategy
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Network mode
    networkMode: 'online',
  },
  mutations: {
    // Retry pour les mutations
    retry: 1,
    networkMode: 'online',
  },
}

// Fonction pour créer un nouveau QueryClient
export function createQueryClient() {
  return new QueryClient({
    defaultOptions,
  })
}

// Instance globale pour app router
export const queryClient = createQueryClient()

// Query keys factory pour éviter les duplications
export const queryKeys = {
  // Goals
  goals: {
    all: ['goals'] as const,
    lists: () => [...queryKeys.goals.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.goals.lists(), filters] as const,
    details: () => [...queryKeys.goals.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.goals.details(), id] as const,
    progress: (id: string) => [...queryKeys.goals.detail(id), 'progress'] as const,
  },

  // Recruitment
  recruitment: {
    all: ['recruitment'] as const,
    jobPostings: {
      all: () => [...queryKeys.recruitment.all, 'job-postings'] as const,
      list: (filters?: Record<string, unknown>) =>
        [...queryKeys.recruitment.jobPostings.all(), filters] as const,
      detail: (id: string) =>
        [...queryKeys.recruitment.jobPostings.all(), id] as const,
    },
    candidates: {
      all: () => [...queryKeys.recruitment.all, 'candidates'] as const,
      list: (jobId?: string) =>
        [...queryKeys.recruitment.candidates.all(), jobId] as const,
      detail: (id: string) =>
        [...queryKeys.recruitment.candidates.all(), id] as const,
    },
  },

  // Performance
  performance: {
    all: ['performance'] as const,
    reviews: {
      all: () => [...queryKeys.performance.all, 'reviews'] as const,
      list: (filters?: Record<string, unknown>) =>
        [...queryKeys.performance.reviews.all(), filters] as const,
      detail: (id: string) =>
        [...queryKeys.performance.reviews.all(), id] as const,
    },
    feedback: {
      all: () => [...queryKeys.performance.all, 'feedback'] as const,
      list: (reviewId?: string) =>
        [...queryKeys.performance.feedback.all(), reviewId] as const,
    },
  },

  // Analytics
  analytics: {
    all: ['analytics'] as const,
    dashboard: () => [...queryKeys.analytics.all, 'dashboard'] as const,
    goalsStats: () => [...queryKeys.analytics.all, 'goals-stats'] as const,
    recruitmentStats: () => [...queryKeys.analytics.all, 'recruitment-stats'] as const,
    performanceStats: () => [...queryKeys.analytics.all, 'performance-stats'] as const,
  },

  // User
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    organization: () => [...queryKeys.user.all, 'organization'] as const,
  },
} as const
