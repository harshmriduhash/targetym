'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Calendar, AlertCircle, CheckCircle2, Flag } from 'lucide-react';

interface GoalsListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goals: any[];
}

export function GoalsListModal({ open, onOpenChange, goals }: GoalsListModalProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'not_started': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Complété';
      case 'in_progress': return 'En cours';
      case 'not_started': return 'Pas commencé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Critique';
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return priority;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance': return 'bg-blue-100 text-blue-700';
      case 'development': return 'bg-purple-100 text-purple-700';
      case 'project': return 'bg-green-100 text-green-700';
      case 'personal': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'performance': return 'Performance';
      case 'development': return 'Développement';
      case 'project': return 'Projet';
      case 'personal': return 'Personnel';
      default: return category;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Tous les objectifs ({goals.length})
          </DialogTitle>
          <DialogDescription>
            Liste complète de tous les objectifs de performance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Aucun objectif défini</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {goals.map((goal) => {
                const daysUntilDue = Math.floor(
                  (new Date(goal.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                const isOverdue = daysUntilDue < 0 && goal.status !== 'completed';

                return (
                  <div
                    key={goal.id}
                    className={`p-4 border rounded-lg hover:shadow-md transition-shadow bg-card ${
                      isOverdue ? 'border-red-300 bg-red-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{goal.title}</h3>
                          <Badge className={getPriorityColor(goal.priority)}>
                            <Flag className="h-3 w-3 mr-1" />
                            {getPriorityLabel(goal.priority)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge className={getStatusColor(goal.status)}>
                        {getStatusLabel(goal.status)}
                      </Badge>
                      <Badge variant="outline" className={getCategoryColor(goal.category)}>
                        {getCategoryLabel(goal.category)}
                      </Badge>
                      {isOverdue && (
                        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          En retard
                        </Badge>
                      )}
                    </div>

                    {/* Progression */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progression</span>
                        <span className="text-sm font-bold text-primary">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Début</p>
                          <p className="font-medium">
                            {new Date(goal.startDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Échéance</p>
                          <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                            {new Date(goal.dueDate).toLocaleDateString('fr-FR')}
                            {daysUntilDue >= 0 && ` (${daysUntilDue}j)`}
                            {daysUntilDue < 0 && ` (${Math.abs(daysUntilDue)}j de retard)`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* KPIs */}
                    {goal.kpis && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded mb-3">
                        <p className="text-xs font-semibold text-blue-900 mb-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Indicateurs de performance (KPIs)
                        </p>
                        <p className="text-sm text-blue-800">{goal.kpis}</p>
                      </div>
                    )}

                    {/* Ressources */}
                    {goal.resources && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                        <p className="text-xs font-semibold text-purple-900 mb-1">🔧 Ressources nécessaires</p>
                        <p className="text-sm text-purple-800">{goal.resources}</p>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                      Créé le {new Date(goal.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
