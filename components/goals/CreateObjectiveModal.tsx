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
import { Textarea } from '@/components/ui/textarea';
import { Target, Plus, X } from 'lucide-react';

interface CreateObjectiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onObjectiveCreated?: (objective: any) => void;
  editMode?: boolean;
  initialObjective?: any;
}

interface KeyResult {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  status: 'not-started' | 'in-progress' | 'on-hold' | 'postponed' | 'completed';
}

export function CreateObjectiveModal({ open, onOpenChange, onObjectiveCreated, editMode = false, initialObjective }: CreateObjectiveModalProps) {
  const [objectiveTitle, setObjectiveTitle] = useState('');
  const [objectiveDescription, setObjectiveDescription] = useState('');
  const [objectiveType, setObjectiveType] = useState<'individual' | 'team' | 'department' | 'company'>('individual');
  const [objectiveStatus, setObjectiveStatus] = useState<'not-started' | 'in-progress' | 'on-hold' | 'postponed' | 'completed'>('not-started');
  const [objectivePriority, setObjectivePriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [globalProgress, setGlobalProgress] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);
  const [newKrTitle, setNewKrTitle] = useState('');
  const [newKrTarget, setNewKrTarget] = useState('');
  const [newKrUnit, setNewKrUnit] = useState('');

  // Calculer automatiquement la progression globale basée sur les KRs
  useEffect(() => {
    if (keyResults.length > 0) {
      const totalProgress = keyResults.reduce((sum, kr) => {
        const krProgress = kr.target > 0 ? (kr.current / kr.target) * 100 : 0;
        return sum + krProgress;
      }, 0);
      const avgProgress = totalProgress / keyResults.length;
      // Arrondir au palier de 10% le plus proche
      const roundedProgress = Math.round(avgProgress / 10) * 10;
      setGlobalProgress(roundedProgress);
    } else {
      setGlobalProgress(0);
    }
  }, [keyResults]);

  // Charger les données initiales en mode édition
  useEffect(() => {
    if (editMode && initialObjective) {
      setObjectiveTitle(initialObjective.title);
      setObjectiveDescription(initialObjective.description);
      setObjectiveType(initialObjective.type);
      setObjectiveStatus(initialObjective.status || 'not-started');
      setObjectivePriority(initialObjective.priority || 'medium');
      setGlobalProgress(initialObjective.progress || 0);
      setStartDate(initialObjective.startDate);
      setEndDate(initialObjective.endDate);
      setKeyResults(initialObjective.keyResults);
    } else {
      // Reset en mode création
      setObjectiveTitle('');
      setObjectiveDescription('');
      setObjectiveType('individual');
      setObjectiveStatus('not-started');
      setObjectivePriority('medium');
      setGlobalProgress(0);
      setStartDate('');
      setEndDate('');
      setKeyResults([]);
    }
  }, [editMode, initialObjective, open]);

  const handleAddKeyResult = () => {
    if (newKrTitle && newKrTarget) {
      const newKr: KeyResult = {
        id: Date.now().toString(),
        title: newKrTitle,
        target: parseFloat(newKrTarget),
        current: 0,
        unit: newKrUnit || '%',
        status: 'not-started'
      };
      setKeyResults([...keyResults, newKr]);
      setNewKrTitle('');
      setNewKrTarget('');
      setNewKrUnit('');
    }
  };

  const handleRemoveKeyResult = (id: string) => {
    setKeyResults(keyResults.filter(kr => kr.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // En mode édition, conserver l'ID existant
    const objectiveData = editMode && initialObjective
      ? {
          ...initialObjective,
          title: objectiveTitle,
          description: objectiveDescription,
          type: objectiveType,
          status: objectiveStatus,
          priority: objectivePriority,
          startDate,
          endDate,
          progress: globalProgress,
          keyResults
        }
      : {
          id: Date.now().toString(),
          title: objectiveTitle,
          description: objectiveDescription,
          type: objectiveType,
          status: objectiveStatus,
          priority: objectivePriority,
          startDate,
          endDate,
          progress: globalProgress,
          keyResults
        };

    // Appeler le callback pour mettre à jour la page parent
    if (onObjectiveCreated) {
      onObjectiveCreated(objectiveData);
    }

    // Fermer le modal
    onOpenChange(false);

    // Reset form (uniquement en mode création)
    if (!editMode) {
      setObjectiveTitle('');
      setObjectiveDescription('');
      setObjectiveType('individual');
      setObjectiveStatus('not-started');
      setObjectivePriority('medium');
      setStartDate('');
      setEndDate('');
      setKeyResults([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {editMode ? 'Modifier l\'objectif' : 'Créer un nouvel objectif'}
          </DialogTitle>
          <DialogDescription>
            {editMode ? 'Modifiez les détails de votre objectif' : 'Définissez un objectif avec des résultats clés mesurables (OKR)'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titre de l'objectif */}
          <div className="space-y-2">
            <Label htmlFor="objective-title">
              Titre de l'objectif <span className="text-red-500">*</span>
            </Label>
            <Input
              id="objective-title"
              placeholder="Ex: Augmenter la satisfaction client"
              value={objectiveTitle}
              onChange={(e) => setObjectiveTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="objective-description">Description</Label>
            <Textarea
              id="objective-description"
              placeholder="Décrivez l'objectif et son importance..."
              value={objectiveDescription}
              onChange={(e) => setObjectiveDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Type d'objectif, Status et Priorité */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="objective-type">
                Type d'objectif <span className="text-red-500">*</span>
              </Label>
              <select
                id="objective-type"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                value={objectiveType}
                onChange={(e) => setObjectiveType(e.target.value as any)}
                required
              >
                <option value="individual">Individuel</option>
                <option value="team">Équipe</option>
                <option value="department">Département</option>
                <option value="company">Entreprise</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="objective-status">
                Statut <span className="text-red-500">*</span>
              </Label>
              <select
                id="objective-status"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                value={objectiveStatus}
                onChange={(e) => setObjectiveStatus(e.target.value as any)}
                required
              >
                <option value="not-started">Non commencé</option>
                <option value="in-progress">En cours</option>
                <option value="on-hold">En attente</option>
                <option value="postponed">Reporté</option>
                <option value="completed">Terminé</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="objective-priority">
                Priorité <span className="text-red-500">*</span>
              </Label>
              <select
                id="objective-priority"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                value={objectivePriority}
                onChange={(e) => setObjectivePriority(e.target.value as any)}
                required
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
                <option value="critical">Critique</option>
              </select>
            </div>
          </div>

          {/* Dates et Progression globale */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">
                Date de début <span className="text-red-500">*</span>
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">
                Date de fin <span className="text-red-500">*</span>
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="global-progress">
                Progression globale
              </Label>
              <select
                id="global-progress"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                value={globalProgress}
                onChange={(e) => setGlobalProgress(Number(e.target.value))}
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
          </div>

          {/* Résultats clés */}
          <div className="space-y-3">
            <Label>Résultats clés (KR)</Label>
            <p className="text-sm text-muted-foreground">
              Ajoutez 3-5 résultats clés mesurables pour cet objectif
            </p>

            {/* Liste des KRs */}
            {keyResults.length > 0 && (
              <div className="space-y-2">
                {keyResults.map((kr) => {
                  const krProgress = kr.target > 0 ? (kr.current / kr.target) * 100 : 0;
                  return (
                    <div
                      key={kr.id}
                      className="p-3 border rounded-lg bg-muted/50 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{kr.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Cible: {kr.target} {kr.unit}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveKeyResult(kr.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Progression et statut en mode édition */}
                      {editMode && (
                        <div className="space-y-3">
                          {/* Statut du KR */}
                          <div className="space-y-2">
                            <Label htmlFor={`kr-status-${kr.id}`} className="text-xs">
                              Statut
                            </Label>
                            <select
                              id={`kr-status-${kr.id}`}
                              className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
                              value={kr.status || 'not-started'}
                              onChange={(e) => {
                                const newStatus = e.target.value as 'not-started' | 'in-progress' | 'on-hold' | 'postponed' | 'completed';
                                setKeyResults(keyResults.map(k =>
                                  k.id === kr.id ? { ...k, status: newStatus } : k
                                ));
                              }}
                            >
                              <option value="not-started">Non commencé</option>
                              <option value="in-progress">En cours</option>
                              <option value="on-hold">En attente</option>
                              <option value="postponed">Reporté</option>
                              <option value="completed">Terminé</option>
                            </select>
                          </div>

                          {/* Progression actuelle */}
                          <div className="space-y-2">
                            <Label htmlFor={`kr-progress-${kr.id}`} className="text-xs">
                              Progression actuelle (%)
                            </Label>
                            <select
                              id={`kr-progress-${kr.id}`}
                              className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
                              value={Math.round((kr.current / kr.target) * 100)}
                              onChange={(e) => {
                                const percentage = parseInt(e.target.value);
                                const newValue = (percentage / 100) * kr.target;
                                setKeyResults(keyResults.map(k =>
                                  k.id === kr.id ? { ...k, current: newValue } : k
                                  ));
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
                            {/* Barre de progression */}
                            <div className="w-full bg-secondary rounded-full h-2 mt-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(krProgress, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Ajouter un nouveau KR */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
              <div className="space-y-2">
                <Input
                  placeholder="Titre du résultat clé"
                  value={newKrTitle}
                  onChange={(e) => setNewKrTitle(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Valeur cible"
                  value={newKrTarget}
                  onChange={(e) => setNewKrTarget(e.target.value)}
                />
                <Input
                  placeholder="Unité (%, €, clients...)"
                  value={newKrUnit}
                  onChange={(e) => setNewKrUnit(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddKeyResult}
                className="w-full"
                disabled={!newKrTitle || !newKrTarget}
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter ce résultat clé
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={!objectiveTitle || !startDate || !endDate || keyResults.length === 0}>
              Créer l'objectif
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
