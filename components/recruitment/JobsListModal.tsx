'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Edit, Trash2, Users, MapPin, Clock, DollarSign } from 'lucide-react';
import { useState } from 'react';

interface JobsListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobs: any[];
  onEdit?: (job: any) => void;
  onDelete?: (id: string) => void;
}

export function JobsListModal({
  open,
  onOpenChange,
  jobs,
  onEdit,
  onDelete
}: JobsListModalProps) {
  const [filter, setFilter] = useState<'all' | 'draft' | 'active' | 'closed'>('all');

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    return job.status === filter;
  });

  const statusLabels: Record<string, string> = {
    'draft': 'Brouillon',
    'active': 'Active',
    'closed': 'Fermée'
  };

  const statusColors: Record<string, string> = {
    'draft': 'bg-gray-100 text-gray-700',
    'active': 'bg-green-100 text-green-700',
    'closed': 'bg-red-100 text-red-700'
  };

  const employmentTypeLabels: Record<string, string> = {
    'full-time': 'Temps plein',
    'part-time': 'Temps partiel',
    'contract': 'Contrat',
    'internship': 'Stage'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Offres d'emploi ({jobs.length})
          </DialogTitle>
          <DialogDescription>
            Gérez toutes vos annonces de recrutement
          </DialogDescription>
        </DialogHeader>

        {/* Filtres */}
        <div className="flex items-center gap-2 pb-4 border-b flex-wrap">
          <span className="text-sm font-medium">Filtrer:</span>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Toutes ({jobs.length})
            </Button>
            <Button
              variant={filter === 'draft' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('draft')}
            >
              Brouillons ({jobs.filter(j => j.status === 'draft').length})
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('active')}
            >
              Actives ({jobs.filter(j => j.status === 'active').length})
            </Button>
            <Button
              variant={filter === 'closed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('closed')}
            >
              Fermées ({jobs.filter(j => j.status === 'closed').length})
            </Button>
          </div>
        </div>

        {/* Liste des offres */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aucune offre d'emploi {filter !== 'all' && `avec le statut "${statusLabels[filter]}"`}
              </p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* En-tête */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">{job.department}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={statusColors[job.status]}>
                          {statusLabels[job.status]}
                        </Badge>
                        <Badge variant="outline">
                          {employmentTypeLabels[job.employmentType]}
                        </Badge>
                      </div>
                    </div>

                    {/* Informations */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{job.candidatesCount || 0} candidats</span>
                      </div>
                      {job.salaryMin && job.salaryMax && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span>{job.salaryMin.toLocaleString()}€ - {job.salaryMax.toLocaleString()}€</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(job.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>

                    {/* Exigences */}
                    {job.requirements && job.requirements.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.slice(0, 3).map((req: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                        {job.requirements.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{job.requirements.length - 3} autres
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit?.(job)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete?.(job.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
