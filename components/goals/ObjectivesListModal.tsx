'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ObjectiveCard, type Objective } from './ObjectiveCard';
import { Target, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ObjectivesListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objectives: Objective[];
  onUpdate?: (objective: Objective) => void;
  onEdit?: (objective: Objective) => void;
  onDelete?: (id: string) => void;
  typeFilter?: 'individual' | 'team' | 'department' | 'company';
  title?: string;
  description?: string;
}

export function ObjectivesListModal({
  open,
  onOpenChange,
  objectives,
  onUpdate,
  onEdit,
  onDelete,
  typeFilter,
  title,
  description
}: ObjectivesListModalProps) {
  const [filter, setFilter] = useState<'all' | 'not-started' | 'in-progress' | 'on-hold' | 'postponed' | 'completed'>('all');

  const filteredObjectives = objectives.filter(obj => {
    // Filtrer par type si un typeFilter est défini
    if (typeFilter && obj.type !== typeFilter) return false;
    // Filtrer par statut
    if (filter === 'all') return true;
    return obj.status === filter;
  });

  const statusLabels: Record<string, string> = {
    'not-started': 'Non commencés',
    'in-progress': 'En cours',
    'on-hold': 'En attente',
    'postponed': 'Reportés',
    'completed': 'Terminés'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {title || `Mes objectifs (${typeFilter ? filteredObjectives.length : objectives.length})`}
          </DialogTitle>
          <DialogDescription>
            {description || "Vue d'ensemble de tous vos objectifs et résultats clés"}
          </DialogDescription>
        </DialogHeader>

        {/* Filtres */}
        <div className="flex items-center gap-2 pb-4 border-b flex-wrap">
          <ListFilter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtrer:</span>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Tous ({typeFilter ? objectives.filter(o => o.type === typeFilter).length : objectives.length})
            </Button>
            <Button
              variant={filter === 'not-started' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('not-started')}
            >
              Non commencés ({objectives.filter(o => o.status === 'not-started').length})
            </Button>
            <Button
              variant={filter === 'in-progress' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('in-progress')}
            >
              En cours ({objectives.filter(o => o.status === 'in-progress').length})
            </Button>
            <Button
              variant={filter === 'on-hold' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('on-hold')}
            >
              En attente ({objectives.filter(o => o.status === 'on-hold').length})
            </Button>
            <Button
              variant={filter === 'postponed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('postponed')}
            >
              Reportés ({objectives.filter(o => o.status === 'postponed').length})
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('completed')}
            >
              Terminés ({objectives.filter(o => o.status === 'completed').length})
            </Button>
          </div>
        </div>

        {/* Liste scrollable des objectifs */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {filteredObjectives.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {filter === 'all' ? 'Aucun objectif' : `Aucun objectif ${statusLabels[filter]?.toLowerCase() || ''}`}
              </h3>
              <p className="text-muted-foreground">
                {filter === 'all' ? 'Créez votre premier objectif pour commencer' : 'Changez de filtre pour voir d\'autres objectifs'}
              </p>
            </div>
          ) : (
            filteredObjectives.map((objective) => (
              <ObjectiveCard
                key={objective.id}
                objective={objective}
                onUpdate={onUpdate}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
