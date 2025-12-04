'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Target, Calendar, TrendingUp, CheckCircle2, Clock, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export interface Objective {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'team' | 'department' | 'company';
  startDate: string;
  endDate: string;
  status: 'not-started' | 'in-progress' | 'on-hold' | 'postponed' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  keyResults: Array<{
    id: string;
    title: string;
    target: number;
    current: number;
    unit: string;
    status: 'not-started' | 'in-progress' | 'on-hold' | 'postponed' | 'completed';
  }>;
}

interface ObjectiveCardProps {
  objective: Objective;
  onEdit?: (objective: Objective) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (objective: Objective) => void;
}

export function ObjectiveCard({ objective, onEdit, onDelete, onUpdate }: ObjectiveCardProps) {
  const [localObjective, setLocalObjective] = useState(objective);

  // Recalculer la progression globale basée sur les KRs
  const calculateGlobalProgress = () => {
    if (localObjective.keyResults.length === 0) return 0;
    const totalProgress = localObjective.keyResults.reduce((sum, kr) => {
      const krProgress = kr.target > 0 ? (kr.current / kr.target) * 100 : 0;
      return sum + krProgress;
    }, 0);
    const avgProgress = totalProgress / localObjective.keyResults.length;
    return Math.round(avgProgress / 10) * 10; // Arrondir au palier de 10%
  };

  const typeLabels = {
    individual: 'Individuel',
    team: 'Équipe',
    department: 'Département',
    company: 'Entreprise'
  };

  const typeColors = {
    individual: 'bg-blue-100 text-blue-700',
    team: 'bg-purple-100 text-purple-700',
    department: 'bg-orange-100 text-orange-700',
    company: 'bg-green-100 text-green-700'
  };

  const statusLabels = {
    'not-started': 'Non commencé',
    'in-progress': 'En cours',
    'on-hold': 'En attente',
    'postponed': 'Reporté',
    'completed': 'Terminé'
  };

  const statusColors = {
    'not-started': 'bg-gray-500',
    'in-progress': 'bg-blue-500',
    'on-hold': 'bg-yellow-500',
    'postponed': 'bg-orange-500',
    'completed': 'bg-green-500'
  };

  const priorityLabels = {
    low: 'Basse',
    medium: 'Moyenne',
    high: 'Haute',
    critical: 'Critique'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700'
  };

  // Utiliser la progression calculée automatiquement
  const overallProgress = calculateGlobalProgress();

  // Vérifier si l'objectif est proche de l'échéance
  const isNearDeadline = () => {
    const endDate = new Date(objective.endDate);
    const today = new Date();
    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7 && daysLeft > 0;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border-l-4" style={{ borderLeftColor: statusColors[objective.status] }}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{objective.title}</CardTitle>
            </div>
            {objective.description && (
              <p className="text-sm text-muted-foreground mt-1">{objective.description}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className={typeColors[objective.type]}>
              {typeLabels[objective.type]}
            </Badge>
            <Badge variant="outline" className={priorityColors[objective.priority]}>
              Priorité: {priorityLabels[objective.priority]}
            </Badge>
            <Badge variant="outline" className="text-white" style={{ backgroundColor: statusColors[objective.status] }}>
              {statusLabels[objective.status]}
            </Badge>
            {isNearDeadline() && (
              <Badge variant="outline" className="bg-orange-100 text-orange-700">
                <Clock className="h-3 w-3 mr-1" />
                Urgent
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progression globale */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progression globale</span>
            <span className="text-sm font-bold text-primary">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Résultats clés */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Résultats clés ({objective.keyResults.length})</span>
          </div>
          <div className="space-y-2">
            {localObjective.keyResults.map((kr) => {
              const krProgress = (kr.current / kr.target) * 100;
              const krStatusColors = {
                'not-started': 'bg-gray-100 text-gray-700 border-gray-300',
                'in-progress': 'bg-blue-100 text-blue-700 border-blue-300',
                'on-hold': 'bg-yellow-100 text-yellow-700 border-yellow-300',
                'postponed': 'bg-orange-100 text-orange-700 border-orange-300',
                'completed': 'bg-green-100 text-green-700 border-green-300'
              };

              return (
                <div key={kr.id} className="p-3 border rounded-lg bg-muted/20 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium flex-1">{kr.title}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {kr.current} / {kr.target} {kr.unit}
                    </span>
                  </div>

                  {/* Statut du KR avec liste déroulante */}
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`kr-status-${kr.id}`} className="text-xs whitespace-nowrap">
                      Statut:
                    </Label>
                    <select
                      id={`kr-status-${kr.id}`}
                      className={`text-xs px-2 py-1 border rounded-md ${krStatusColors[kr.status || 'not-started']}`}
                      value={kr.status || 'not-started'}
                      onChange={(e) => {
                        const newStatus = e.target.value as 'not-started' | 'in-progress' | 'on-hold' | 'postponed' | 'completed';
                        const updatedKrs = localObjective.keyResults.map(k =>
                          k.id === kr.id ? { ...k, status: newStatus } : k
                        );

                        // Recalculer la progression globale
                        const tempObj = { ...localObjective, keyResults: updatedKrs };
                        const totalProgress = updatedKrs.reduce((sum, k) => {
                          const kProgress = k.target > 0 ? (k.current / k.target) * 100 : 0;
                          return sum + kProgress;
                        }, 0);
                        const avgProgress = updatedKrs.length > 0 ? totalProgress / updatedKrs.length : 0;
                        const roundedProgress = Math.round(avgProgress / 10) * 10;

                        const updatedObjective = { ...tempObj, progress: roundedProgress };
                        setLocalObjective(updatedObjective);
                        // Sauvegarder automatiquement
                        if (onUpdate) {
                          onUpdate(updatedObjective);
                        }
                      }}
                    >
                      <option value="not-started">Non commencé</option>
                      <option value="in-progress">En cours</option>
                      <option value="on-hold">En attente</option>
                      <option value="postponed">Reporté</option>
                      <option value="completed">Terminé</option>
                    </select>
                  </div>

                  <Progress value={krProgress} className="h-1.5" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Début: {new Date(objective.startDate).toLocaleDateString('fr-FR')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Fin: {new Date(objective.endDate).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onUpdate?.(objective)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Mettre à jour
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit?.(objective)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onDelete?.(objective.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
