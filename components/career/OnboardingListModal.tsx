'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Calendar, User } from 'lucide-react';

interface OnboardingListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: any[];
}

export default function OnboardingListModal({ open, onOpenChange, plans }: OnboardingListModalProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Badge className="bg-amber-600">En cours</Badge>;
      case 'completed':
        return <Badge className="bg-green-600">Terminé</Badge>;
      case 'pending':
        return <Badge variant="outline">En attente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Tous les plans d'onboarding</DialogTitle>
          <DialogDescription>
            {plans.length} plans d'intégration en cours ou terminés
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
          {plans.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucun plan d'onboarding créé</p>
          ) : (
            plans.map((plan) => (
              <div key={plan.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <UserPlus className="h-4 w-4 text-amber-600" />
                      <h3 className="font-semibold">{plan.employeeName}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plan.position} • {plan.department}
                    </p>
                  </div>
                  {getStatusBadge(plan.status)}
                </div>

                <div className="grid md:grid-cols-3 gap-3 mb-3 text-sm">
                  {plan.startDate && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Début: {new Date(plan.startDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                  {plan.manager && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>Manager: {plan.manager}</span>
                    </div>
                  )}
                  {plan.buddy && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>Buddy: {plan.buddy}</span>
                    </div>
                  )}
                </div>

                {plan.tasks && plan.tasks.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Tâches d'intégration ({plan.tasks.length})
                    </p>
                    <ul className="space-y-1">
                      {plan.tasks.slice(0, 3).map((task: string, idx: number) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-amber-600 mt-1">•</span>
                          <span className="line-clamp-1">{task}</span>
                        </li>
                      ))}
                      {plan.tasks.length > 3 && (
                        <li className="text-xs text-muted-foreground ml-4">
                          +{plan.tasks.length - 3} autres tâches
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {plan.objectives && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Objectifs</p>
                    <p className="text-sm line-clamp-2">{plan.objectives}</p>
                  </div>
                )}

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-muted-foreground">
                      Progression ({plan.duration} jours)
                    </span>
                    <span className="font-semibold">{plan.progress || 0}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-600 rounded-full transition-all"
                      style={{ width: `${plan.progress || 0}%` }}
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
