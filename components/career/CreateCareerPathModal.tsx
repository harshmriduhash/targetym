'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';

interface CreateCareerPathModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export default function CreateCareerPathModal({ open, onOpenChange, onSave }: CreateCareerPathModalProps) {
  const [employeeName, setEmployeeName] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [timeline, setTimeline] = useState('');
  const [milestones, setMilestones] = useState<string[]>(['']);
  const [skillsRequired, setSkillsRequired] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddMilestone = () => {
    setMilestones([...milestones, '']);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index: number, value: string) => {
    const newMilestones = [...milestones];
    newMilestones[index] = value;
    setMilestones(newMilestones);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPath = {
      id: Date.now().toString(),
      employeeName,
      currentRole,
      targetRole,
      timeline,
      milestones: milestones.filter(m => m.trim() !== ''),
      skillsRequired,
      notes,
      status: 'active',
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem('careerPaths') || '[]');
    localStorage.setItem('careerPaths', JSON.stringify([...existing, newPath]));

    resetForm();
    onSave();
    onOpenChange(false);
  };

  const resetForm = () => {
    setEmployeeName('');
    setCurrentRole('');
    setTargetRole('');
    setTimeline('');
    setMilestones(['']);
    setSkillsRequired('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un parcours de carrière</DialogTitle>
          <DialogDescription>
            Définissez un plan de développement de carrière pour un employé
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeName">Nom de l'employé *</Label>
              <Input
                id="employeeName"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Jean Dupont"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeline">Délai prévu *</Label>
              <Input
                id="timeline"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="12 mois"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentRole">Poste actuel *</Label>
              <Input
                id="currentRole"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                placeholder="Développeur Junior"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetRole">Poste cible *</Label>
              <Input
                id="targetRole"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Développeur Senior"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Étapes clés du parcours</Label>
              <Button type="button" size="sm" variant="outline" onClick={handleAddMilestone}>
                <Plus className="h-4 w-4 mr-1" />
                Ajouter étape
              </Button>
            </div>
            <div className="space-y-2">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={milestone}
                    onChange={(e) => handleMilestoneChange(index, e.target.value)}
                    placeholder={`Étape ${index + 1}: Ex: Compléter formation React avancé`}
                  />
                  {milestones.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveMilestone(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skillsRequired">Compétences requises</Label>
            <Textarea
              id="skillsRequired"
              value={skillsRequired}
              onChange={(e) => setSkillsRequired(e.target.value)}
              placeholder="Leadership, Gestion de projet, Expertise technique..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes additionnelles</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informations supplémentaires..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Créer le parcours
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
