'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../query-client'
import type { JobPosting, Candidate } from '@/src/types/modules.types'

/**
 * Hook pour récupérer les job postings
 */
export function useJobPostings(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.recruitment.jobPostings.list(filters),
    queryFn: async () => {
      const response = await fetch('/api/recruitment/jobs?' + new URLSearchParams(filters as Record<string, string>))
      if (!response.ok) throw new Error('Failed to fetch job postings')
      return response.json() as Promise<JobPosting[]>
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook pour récupérer un job posting spécifique
 */
export function useJobPosting(jobId: string | null) {
  return useQuery({
    queryKey: queryKeys.recruitment.jobPostings.detail(jobId || ''),
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID is required')
      const response = await fetch(`/api/recruitment/jobs/${jobId}`)
      if (!response.ok) throw new Error('Failed to fetch job posting')
      return response.json() as Promise<JobPosting>
    },
    enabled: !!jobId,
    staleTime: 3 * 60 * 1000,
  })
}

/**
 * Hook pour récupérer les candidates
 */
export function useCandidates(jobId?: string) {
  return useQuery({
    queryKey: queryKeys.recruitment.candidates.list(jobId),
    queryFn: async () => {
      const url = jobId
        ? `/api/recruitment/candidates?jobId=${jobId}`
        : '/api/recruitment/candidates'
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch candidates')
      return response.json() as Promise<Candidate[]>
    },
    staleTime: 3 * 60 * 1000,
  })
}

/**
 * Hook pour récupérer un candidate spécifique
 */
export function useCandidate(candidateId: string | null) {
  return useQuery({
    queryKey: queryKeys.recruitment.candidates.detail(candidateId || ''),
    queryFn: async () => {
      if (!candidateId) throw new Error('Candidate ID is required')
      const response = await fetch(`/api/recruitment/candidates/${candidateId}`)
      if (!response.ok) throw new Error('Failed to fetch candidate')
      return response.json() as Promise<Candidate>
    },
    enabled: !!candidateId,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook pour créer un job posting
 */
export function useCreateJobPosting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<JobPosting>) => {
      const response = await fetch('/api/recruitment/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create job posting')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruitment.jobPostings.all() })
    },
  })
}

/**
 * Hook pour mettre à jour le statut d'un candidate
 */
export function useUpdateCandidateStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      candidateId,
      status
    }: {
      candidateId: string
      status: string
    }) => {
      const response = await fetch(`/api/recruitment/candidates/${candidateId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error('Failed to update candidate status')
      return response.json()
    },
    onMutate: async ({ candidateId, status }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.recruitment.candidates.detail(candidateId)
      })

      const previousCandidate = queryClient.getQueryData(
        queryKeys.recruitment.candidates.detail(candidateId)
      )

      queryClient.setQueryData(
        queryKeys.recruitment.candidates.detail(candidateId),
        (old: Candidate) => ({
          ...old,
          status,
        })
      )

      return { previousCandidate }
    },
    onError: (err, { candidateId }, context) => {
      if (context?.previousCandidate) {
        queryClient.setQueryData(
          queryKeys.recruitment.candidates.detail(candidateId),
          context.previousCandidate
        )
      }
    },
    onSettled: (data, error, { candidateId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.recruitment.candidates.detail(candidateId)
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.recruitment.candidates.all()
      })
    },
  })
}
