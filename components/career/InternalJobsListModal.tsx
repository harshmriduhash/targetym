'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, Calendar } from 'lucide-react';

interface InternalJobsListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobs: any[];
}

export default function InternalJobsListModal({ open, onOpenChange, jobs }: InternalJobsListModalProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-600">Ouvert</Badge>;
      case 'filled':
        return <Badge className="bg-blue-600">Pourvu</Badge>;
      case 'closed':
        return <Badge variant="secondary">Fermé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, string> = {
      'full-time': 'Temps plein',
      'part-time': 'Temps partiel',
      'contract': 'Contrat',
      'temporary': 'Temporaire',
    };
    return types[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Tous les postes en mobilité interne</DialogTitle>
          <DialogDescription>
            {jobs.length} opportunités de mobilité publiées
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
          {jobs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucun poste publié</p>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="h-4 w-4 text-green-600" />
                      <h3 className="font-semibold">{job.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{job.department}</p>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(job.status)}
                    <Badge variant="outline">{job.level}</Badge>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    <span>{getTypeBadge(job.type)}</span>
                  </div>
                  {job.deadline && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Limite: {new Date(job.deadline).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>

                {job.description && (
                  <p className="text-sm mb-3 line-clamp-2">{job.description}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-xs text-muted-foreground">
                    Publié le {new Date(job.postedDate).toLocaleDateString('fr-FR')}
                  </span>
                  <span className="text-sm font-medium text-blue-600">
                    {job.applications || 0} candidature{job.applications !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
