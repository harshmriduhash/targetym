'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InterviewCard, type Interview } from './InterviewCard';
import { Calendar, ListFilter } from 'lucide-react';
import { useState } from 'react';

interface InterviewsListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interviews: Interview[];
  onEdit?: (interview: Interview) => void;
  onCancel?: (id: string) => void;
}

export function InterviewsListModal({
  open,
  onOpenChange,
  interviews,
  onEdit,
  onCancel
}: InterviewsListModalProps) {
  const [typeFilter, setTypeFilter] = useState<'all' | 'phone' | 'technical' | 'behavioral' | 'final'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');

  const filteredInterviews = interviews.filter(interview => {
    if (typeFilter !== 'all' && interview.type !== typeFilter) return false;
    if (statusFilter !== 'all' && interview.status !== statusFilter) return false;
    return true;
  }).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Entretiens planifiés ({interviews.length})
          </DialogTitle>
          <DialogDescription>
            Gérez tous vos entretiens programmés
          </DialogDescription>
        </DialogHeader>

        {/* Filtres */}
        <div className="space-y-3 pb-4 border-b">
          <div className="flex items-center gap-2">
            <ListFilter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtrer par type:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={typeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('all')}
            >
              Tous ({interviews.length})
            </Button>
            <Button
              variant={typeFilter === 'phone' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('phone')}
            >
              Téléphoniques ({interviews.filter(i => i.type === 'phone').length})
            </Button>
            <Button
              variant={typeFilter === 'technical' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('technical')}
            >
              Techniques ({interviews.filter(i => i.type === 'technical').length})
            </Button>
            <Button
              variant={typeFilter === 'behavioral' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('behavioral')}
            >
              Comportementaux ({interviews.filter(i => i.type === 'behavioral').length})
            </Button>
            <Button
              variant={typeFilter === 'final' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('final')}
            >
              Finaux ({interviews.filter(i => i.type === 'final').length})
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filtrer par statut:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              Tous
            </Button>
            <Button
              variant={statusFilter === 'scheduled' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('scheduled')}
            >
              Planifiés ({interviews.filter(i => i.status === 'scheduled').length})
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('completed')}
            >
              Terminés ({interviews.filter(i => i.status === 'completed').length})
            </Button>
            <Button
              variant={statusFilter === 'cancelled' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('cancelled')}
            >
              Annulés ({interviews.filter(i => i.status === 'cancelled').length})
            </Button>
          </div>
        </div>

        {/* Liste des entretiens */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {filteredInterviews.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aucun entretien trouvé avec ces filtres
              </p>
            </div>
          ) : (
            filteredInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onEdit={onEdit}
                onCancel={onCancel}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
