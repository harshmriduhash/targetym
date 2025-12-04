'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';

interface CreateOnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export default function CreateOnboardingModal({ open, onOpenChange, onSave }: CreateOnboardingModalProps) {
  const [employeeName, setEmployeeName] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [buddy, setBuddy] = useState('');
  const [manager, setManager] = useState('');
  const [duration, setDuration] = useState('90');
  const [tasks, setTasks] = useState<string[]>(['']);
  const [objectives, setObjectives] = useState('');

  const handleAddTask = () => {
    setTasks([...tasks, '']);
  };

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleTaskChange = (index: number, value: string) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPlan = {
      id: Date.now().toString(),
      employeeName,
      position,
      department,
      startDate,
      buddy,
      manager,
      duration: parseInt(duration),
      tasks: tasks.filter(t => t.trim() !== ''),
      objectives,
      status: 'in_progress',
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem('onboardingPlans') || '[]');
    localStorage.setItem('onboardingPlans', JSON.stringify([...existing, newPlan]));

    resetForm();
    onSave();
    onOpenChange(false);
  };

  const resetForm = () => {
    setEmployeeName('');
    setPosition('');
    setDepartment('');
    setStartDate('');
    setBuddy('');
    setManager('');
    setDuration('90');
    setTasks(['']);
    setObjectives('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un plan d'onboarding</DialogTitle>
          <DialogDescription>
            Préparez l'intégration d'un nouvel employé
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeName">Nom du nouvel employé *</Label>
              <Input
                id="employeeName"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Sophie Lefebvre"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Poste *</Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="UX Designer"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Département *</Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Design & Produit"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Date de début *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manager">Manager direct *</Label>
              <Input
                id="manager"
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                placeholder="Thomas Bernard"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buddy">Parrain/Buddy</Label>
              <Input
                id="buddy"
                value={buddy}
                onChange={(e) => setBuddy(e.target.value)}
                placeholder="Claire Dupont"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Durée (jours) *</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="90"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Tâches d'intégration</Label>
              <Button type="button" size="sm" variant="outline" onClick={handleAddTask}>
                <Plus className="h-4 w-4 mr-1" />
                Ajouter tâche
              </Button>
            </div>
            <div className="space-y-2">
              {tasks.map((task, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={task}
                    onChange={(e) => handleTaskChange(index, e.target.value)}
                    placeholder={`Tâche ${index + 1}: Ex: Configuration du poste de travail`}
                  />
                  {tasks.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveTask(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Exemples: Configuration équipement, Formation sécurité, Rencontres équipe, Formation outils, etc.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="objectives">Objectifs des 90 premiers jours</Label>
            <Textarea
              id="objectives"
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              placeholder="Définissez les objectifs et attentes pour la période d'intégration..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Créer le plan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
