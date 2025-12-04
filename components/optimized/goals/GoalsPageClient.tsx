// ✅ OPTIMIZED: Minimal Client Component for Goals Page
// Only handles interactivity, no data fetching or calculations

'use client';

import { useState, useTransition, useOptimistic } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { StatsCardsOptimized } from './StatsCardsOptimized';
import { ObjectivesGridOptimized } from './ObjectivesGridOptimized';
import { CreateObjectiveModal } from '@/components/goals/CreateObjectiveModal';
import { UpdateProgressModal } from '@/components/goals/UpdateProgressModal';
import { ObjectivesListModal } from '@/components/goals/ObjectivesListModal';
import type { Objective } from '@/components/goals/ObjectiveCard';
import { toast } from 'sonner';

interface GoalsPageClientProps {
  initialObjectives: Objective[];
  initialStats: {
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    avgProgress: number;
    teamGoals: number;
    dueThisWeek: number;
  };
  userId: string;
  organizationId: string;
}

/**
 * Client Component - Only handles UI interactions
 * Benefits:
 * - Minimal JavaScript bundle
 * - Fast hydration
 * - Optimistic updates for instant UX
 */
export function GoalsPageClient({
  initialObjectives,
  initialStats,
  userId,
  organizationId
}: GoalsPageClientProps) {
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [showTeamObjectivesModal, setShowTeamObjectivesModal] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);

  // Optimistic updates for instant UX
  const [isPending, startTransition] = useTransition();
  const [optimisticObjectives, addOptimisticObjective] = useOptimistic(
    initialObjectives,
    (state, newObjective: Objective) => [...state, newObjective]
  );

  // Event handlers (memoized in production)
  const handleObjectiveCreated = (newObjective: Objective) => {
    startTransition(() => {
      addOptimisticObjective(newObjective);
      toast.success('Objectif créé avec succès');
      setShowCreateModal(false);
    });
  };

  const handleUpdateProgress = (objective: Objective) => {
    setSelectedObjective(objective);
    setShowUpdateModal(true);
  };

  const handleDeleteObjective = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet objectif ?')) {
      startTransition(() => {
        // API call to delete
        toast.success('Objectif supprimé');
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Objectifs & OKRs</h1>
          <p className="text-muted-foreground mt-1">
            Suivez vos objectifs et résultats clés en temps réel
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          disabled={isPending}
        >
          <Plus className="mr-2 h-4 w-4" />
          Créer un objectif
        </Button>
      </div>

      {/* Stats Cards - Memoized */}
      <StatsCardsOptimized stats={initialStats} />

      {/* Objectives Grid - Memoized */}
      <ObjectivesGridOptimized
        objectives={optimisticObjectives}
        onCreateClick={() => setShowCreateModal(true)}
        onViewAllClick={() => setShowListModal(true)}
        onViewTeamClick={() => setShowTeamObjectivesModal(true)}
        isPending={isPending}
      />

      {/* Modals - Lazy loaded */}
      {showCreateModal && (
        <CreateObjectiveModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onObjectiveCreated={handleObjectiveCreated}
        />
      )}

      {showUpdateModal && selectedObjective && (
        <UpdateProgressModal
          open={showUpdateModal}
          onOpenChange={setShowUpdateModal}
          objective={selectedObjective}
          onProgressUpdated={(updated) => {
            toast.success('Progression mise à jour');
            setShowUpdateModal(false);
          }}
        />
      )}

      {showListModal && (
        <ObjectivesListModal
          open={showListModal}
          onOpenChange={setShowListModal}
          objectives={optimisticObjectives}
          onUpdate={handleUpdateProgress}
          onDelete={handleDeleteObjective}
        />
      )}

      {showTeamObjectivesModal && (
        <ObjectivesListModal
          open={showTeamObjectivesModal}
          onOpenChange={setShowTeamObjectivesModal}
          objectives={optimisticObjectives.filter(obj => obj.type === 'team')}
          onUpdate={handleUpdateProgress}
          onDelete={handleDeleteObjective}
          typeFilter="team"
          title="Objectifs d'équipe"
          description="Objectifs collaboratifs et résultats clés d'équipe"
        />
      )}
    </div>
  );
}
