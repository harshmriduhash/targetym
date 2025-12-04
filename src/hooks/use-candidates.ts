'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createCandidate } from '@/src/actions/recruitment/create-candidate';
import { updateCandidateStatus } from '@/src/actions/recruitment/update-candidate-status';
import { toast } from 'sonner';
import type { CreateCandidateInput } from '@/src/lib/validations/recruitment.schemas';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  job_posting_id: string;
  status?: string;
  current_stage?: string;
  cv_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  cover_letter?: string;
  source?: string;
  created_at?: string;
  updated_at?: string;
}

export function useCandidates(organizationId?: string) {
  const queryClient = useQueryClient();

  // Fetch candidates
  const { data: candidates = [], isLoading, error, refetch } = useQuery({
    queryKey: ['candidates', organizationId],
    queryFn: async () => {
      // This would call a Server Action or API route to fetch candidates
      // For now, return empty array
      return [] as Candidate[];
    },
    enabled: !!organizationId,
  });

  // Create candidate mutation
  const createMutation = useMutation({
    mutationFn: async (input: CreateCandidateInput) => {
      const result = await createCandidate(input);

      if (!result.success) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidat créé avec succès');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la création du candidat');
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      candidateId,
      status,
      notes
    }: {
      candidateId: string;
      status: string;
      notes?: string;
    }) => {
      const result = await updateCandidateStatus({
        candidate_id: candidateId,
        status: status as any,
        notes,
      });

      if (!result.success) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Statut du candidat mis à jour');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour du statut');
    },
  });

  return {
    candidates,
    isLoading,
    error,
    refetch,
    createCandidate: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateStatus: updateStatusMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
}
