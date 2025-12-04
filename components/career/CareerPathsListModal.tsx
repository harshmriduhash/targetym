'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

interface CareerPathsListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  careerPaths: any[];
}

export default function CareerPathsListModal({ open, onOpenChange, careerPaths }: CareerPathsListModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Tous les parcours de carrière</DialogTitle>
          <DialogDescription>
            {careerPaths.length} parcours de carrière enregistrés
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
          {careerPaths.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucun parcours de carrière créé</p>
          ) : (
            careerPaths.map((path) => (
              <div key={path.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <h3 className="font-semibold">{path.employeeName}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {path.currentRole} → {path.targetRole}
                    </p>
                  </div>
                  <Badge variant={path.status === 'active' ? 'default' : 'secondary'}>
                    {path.status === 'active' ? 'Actif' : 'Terminé'}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Délai prévu</p>
                    <p className="text-sm">{path.timeline}</p>
                  </div>
                  {path.skillsRequired && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Compétences requises</p>
                      <p className="text-sm line-clamp-2">{path.skillsRequired}</p>
                    </div>
                  )}
                </div>

                {path.milestones && path.milestones.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Étapes clés</p>
                    <ul className="space-y-1">
                      {path.milestones.map((milestone: string, idx: number) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{milestone}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-muted-foreground">Progression</span>
                    <span className="font-semibold">{path.progress || 0}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${path.progress || 0}%` }}
                    />
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
