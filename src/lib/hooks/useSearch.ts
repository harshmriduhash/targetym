'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/src/lib/monitoring/logger'
import {
  searchEmployees,
  searchNotices,
  searchPortalResources,
  searchAll,
  getSearchSuggestions,
  logSearch,
  type SearchEmployeesInput,
  type SearchNoticesInput,
  type SearchPortalResourcesInput,
  type SearchAllInput,
  type GetSearchSuggestionsInput,
  type LogSearchInput,
} from '@/src/actions/search'

/**
 * Hook pour rechercher des employés avec Full-Text Search
 */
export function useSearchEmployees(options: SearchEmployeesInput) {
  return useQuery({
    queryKey: ['search', 'employees', options],
    queryFn: async () => {
      const result = await searchEmployees(options)
      if (!result.success) {
        throw new Error(result.error.message)
      }
      return result.data
    },
    enabled: !!options.search_term && options.search_term.trim().length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes (recherche dynamique)
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook pour rechercher des notices avec Full-Text Search
 */
export function useSearchNotices(options: SearchNoticesInput) {
  return useQuery({
    queryKey: ['search', 'notices', options],
    queryFn: async () => {
      const result = await searchNotices(options)
      if (!result.success) {
        throw new Error(result.error.message)
      }
      return result.data
    },
    enabled: !!options.search_term && options.search_term.trim().length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook pour rechercher des ressources du portail avec Full-Text Search
 */
export function useSearchPortalResources(options: SearchPortalResourcesInput) {
  return useQuery({
    queryKey: ['search', 'portal-resources', options],
    queryFn: async () => {
      const result = await searchPortalResources(options)
      if (!result.success) {
        throw new Error(result.error.message)
      }
      return result.data
    },
    enabled: !!options.search_term && options.search_term.trim().length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook pour recherche globale cross-modules
 */
export function useSearchAll(options: SearchAllInput) {
  return useQuery({
    queryKey: ['search', 'all', options],
    queryFn: async () => {
      const result = await searchAll(options)
      if (!result.success) {
        throw new Error(result.error.message)
      }
      return result.data
    },
    enabled: !!options.search_term && options.search_term.trim().length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook pour obtenir des suggestions de recherche (autocomplete)
 */
export function useSearchSuggestions(options: GetSearchSuggestionsInput) {
  return useQuery({
    queryKey: ['search', 'suggestions', options],
    queryFn: async () => {
      const result = await getSearchSuggestions(options)
      if (!result.success) {
        throw new Error(result.error.message)
      }
      return result.data
    },
    enabled: !!options.search_term && options.search_term.trim().length >= 2,
    staleTime: 1 * 60 * 1000, // 1 minute (très dynamique)
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook pour logger les recherches (analytics)
 * Retourne une mutation pour logger les recherches en arrière-plan
 */
export function useLogSearch() {
  return useMutation({
    mutationFn: async (data: LogSearchInput) => {
      const result = await logSearch(data)
      if (!result.success) {
        throw new Error(result.error.message)
      }
      return result.data
    },
    // Pas de notification toast pour les logs
    onError: (error: Error) => {
      logger.error('Failed to log search:', error)
    },
  })
}

/**
 * Hook combiné pour recherche avec logging automatique
 * Utilise searchAll et log automatiquement les recherches
 */
export function useGlobalSearch(searchTerm: string, limit?: number) {
  const logSearchMutation = useLogSearch()

  const searchQuery = useSearchAll({
    search_term: searchTerm,
    limit,
  })

  // Logger la recherche quand les résultats sont disponibles
  if (searchQuery.isSuccess && searchQuery.data && !searchQuery.isFetching) {
    const { results } = searchQuery.data

    // Fire and forget
    logSearchMutation.mutate({
      search_term: searchTerm,
      module: 'all',
      results_count: results.length,
    })
  }

  return searchQuery
}

/**
 * Types exportés pour utilisation dans les composants
 */
export type SearchEmployeesResult = Awaited<ReturnType<typeof searchEmployees>>['data']
export type SearchNoticesResult = Awaited<ReturnType<typeof searchNotices>>['data']
export type SearchPortalResourcesResult = Awaited<ReturnType<typeof searchPortalResources>>['data']
export type SearchAllResult = Awaited<ReturnType<typeof searchAll>>['data']
export type SearchSuggestionsResult = Awaited<ReturnType<typeof getSearchSuggestions>>['data']
