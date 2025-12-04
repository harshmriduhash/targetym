'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RefreshCw, TrendingUp } from 'lucide-react';
import type { Objective } from './ObjectiveCard';

interface UpdateProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objective: Objective | null;
  onProgressUpdated?: (objective: Objective) => void;
}

export function UpdateProgressModal({ open, onOpenChange, objective, onProgressUpdated }: UpdateProgressModalProps) {
  const [keyResultValues, setKeyResultValues] = useState<Record<string, number>>({});
  const [keyResultStatuses, setKeyResultStatuses] = useState<Record<string, string>>({});
  const [globalProgress, setGlobalProgress] = useState(0);

  useEffect(() => {
    if (objective) {
      const initialValues: Record<string, number> = {};
      const initialStatuses: Record<string, string> = {};
      objective.keyResults.forEach(kr => {
        initialValues[kr.id] = kr.current;
        initialStatuses[kr.id] = kr.status || 'not-started';
      });
      setKeyResultValues(initialValues);
      setKeyResultStatuses(initialStatuses);
      setGlobalProgress(objective.progress || 0);
    }
  }, [objective]);

  // Calculer automatiquement la progression globale basée sur les KRs
  useEffect(() => {
    if (objective && objective.keyResults.length > 0) {
      const totalProgress = objective.keyResults.reduce((sum, kr) => {
        const currentValue = keyResultValues[kr.id] !== undefined ? keyResultValues[kr.id] : kr.current;
        const krProgress = kr.target > 0 ? (currentValue / kr.target) * 100 : 0;
        return sum + krProgress;
      }, 0);
      const avgProgress = totalProgress / objective.keyResults.length;
      const roundedProgress = Math.round(avgProgress / 10) * 10;
      setGlobalProgress(roundedProgress);
    }
  }, [keyResultValues, objective]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!objective) return;

    // Mettre à jour les résultats clés
    const updatedKeyResults = objective.keyResults.map(kr => ({
      ...kr,
      current: keyResultValues[kr.id] || kr.current,
      status: (keyResultStatuses[kr.id] || kr.status) as 'not-started' | 'in-progress' | 'on-hold' | 'postponed' | 'completed'
    }));

    // Créer l'objectif mis à jour avec la progression globale calculée
    const updatedObjective = {
      ...objective,
      progress: globalProgress,
      keyResults: updatedKeyResults
    };

    // Appeler le callback
    if (onProgressUpdated) {
      onProgressUpdated(updatedObjective);
    }

    // Fermer le modal
    onOpenChange(false);
  };

  const handleValueChange = (krId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setKeyResultValues(prev => ({
      ...prev,
      [krId]: numValue
    }));
  };

  const handleStatusChange = (krId: string, status: string) => {
    setKeyResultStatuses(prev => ({
      ...prev,
      [krId]: status
    }));
  };

  if (!objective) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Mettre à jour la progression
          </DialogTitle>
          <DialogDescription>
            {objective.title}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Liste des résultats clés */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Résultats clés</h3>
            </div>

            {objective.keyResults.map((kr) => {
              const currentValue = keyResultValues[kr.id] ?? kr.current;
              const progress = (currentValue / kr.target) * 100;

              return (
                <div key={kr.id} className="p-4 border rounded-lg bg-muted/20">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`kr-${kr.id}`} className="font-medium">
                        {kr.title}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Objectif: {kr.target} {kr.unit}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`kr-status-${kr.id}`} className="text-xs">
                        Statut
                      </Label>
                      <select
                        id={`kr-status-${kr.id}`}
                        className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
                        value={keyResultStatuses[kr.id] || kr.status || 'not-started'}
                        onChange={(e) => handleStatusChange(kr.id, e.target.value)}
                      >
                        <option value="not-started">Non commencé</option>
                        <option value="in-progress">En cours</option>
                        <option value="on-hold">En attente</option>
                        <option value="postponed">Reporté</option>
                        <option value="completed">Terminé</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`kr-${kr.id}`} className="text-xs">
                        Progression actuelle (%)
                      </Label>
                      <select
                        id={`kr-${kr.id}`}
                        className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
                        value={Math.round(progress / 10) * 10}
                        onChange={(e) => {
                          const percentage = parseInt(e.target.value);
                          const newValue = (percentage / 100) * kr.target;
                          handleValueChange(kr.id, newValue.toString());
                        }}
                      >
                        <option value={0}>0%</option>
                        <option value={10}>10%</option>
                        <option value={20}>20%</option>
                        <option value={30}>30%</option>
                        <option value={40}>40%</option>
                        <option value={50}>50%</option>
                        <option value={60}>60%</option>
                        <option value={70}>70%</option>
                        <option value={80}>80%</option>
                        <option value={90}>90%</option>
                        <option value={100}>100%</option>
                      </select>
                    </div>

                    {/* Barre de progression */}
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progression globale (calculée automatiquement) */}
          <div className="p-4 border rounded-lg bg-primary/5">
            <div className="flex items-center justify-between mb-2">
              <Label className="font-medium">Progression globale de l'objectif</Label>
              <span className="text-2xl font-bold text-primary">{globalProgress}%</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Calculée automatiquement à partir de la moyenne des résultats clés
            </p>
            <div className="w-full bg-secondary rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all"
                style={{ width: `${globalProgress}%` }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
