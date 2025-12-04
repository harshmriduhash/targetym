'use client';

import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Target } from 'lucide-react';

interface CreateGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalCreated?: (goal: any) => void;
}

export function CreateGoalModal({ open, onOpenChange, onGoalCreated }: CreateGoalModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'performance' | 'development' | 'project' | 'personal'>('performance');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'not_started' | 'in_progress' | 'completed' | 'cancelled'>('not_started');
  const [kpis, setKpis] = useState('');
  const [resources, setResources] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const goalData = {
      id: Date.now().toString(),
      title,
      description,
      category,
      priority,
      startDate,
      dueDate,
      progress,
      status,
      kpis,
      resources,
      createdAt: new Date().toISOString(),
    };

    // Sauvegarder dans localStorage
    const existingGoals = JSON.parse(localStorage.getItem('performanceGoals') || '[]');
    existingGoals.push(goalData);
    localStorage.setItem('performanceGoals', JSON.stringify(existingGoals));

    if (onGoalCreated) {
      onGoalCreated(goalData);
    }

    onOpenChange(false);

    // Reset form
    setTitle('');
    setDescription('');
    setCategory('performance');
    setPriority('medium');
    setStartDate('');
    setDueDate('');
    setProgress(0);
    setStatus('not_started');
    setKpis('');
    setResources('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Définir un Objectif SMART
          </DialogTitle>
          <DialogDescription>
            Créer un objectif Spécifique, Mesurable, Atteignable, Réaliste et Temporellement défini
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Titre de l'objectif <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ex: Améliorer la satisfaction client de 20%"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description détaillée <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Décrivez l'objectif en détail..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <select
                  id="category"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                >
                  <option value="performance">Performance</option>
                  <option value="development">Développement</option>
                  <option value="project">Projet</option>
                  <option value="personal">Personnel</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priorité</Label>
                <select
                  id="priority"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                  <option value="critical">Critique</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Date de début <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">
                  Date d'échéance <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <select
                  id="status"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="not_started">Pas commencé</option>
                  <option value="in_progress">En cours</option>
                  <option value="completed">Complété</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="progress">Progression ({progress}%)</Label>
                <input
                  id="progress"
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Mesurabilité */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <h3 className="font-semibold text-sm">Indicateurs de performance (KPIs)</h3>
            <div className="space-y-2">
              <Label htmlFor="kpis">
                Comment mesurer le succès ?
              </Label>
              <Textarea
                id="kpis"
                placeholder="Ex: Atteindre un score NPS de 70+, Réduire le temps de réponse à 2h maximum..."
                rows={3}
                value={kpis}
                onChange={(e) => setKpis(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resources">Ressources nécessaires</Label>
              <Textarea
                id="resources"
                placeholder="Ex: Formation CRM, Budget marketing de 5000€, Support de l'équipe technique..."
                rows={3}
                value={resources}
                onChange={(e) => setResources(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Créer l'objectif
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
