'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CreateInternalJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export default function CreateInternalJobModal({ open, onOpenChange, onSave }: CreateInternalJobModalProps) {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('full-time');
  const [level, setLevel] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newJob = {
      id: Date.now().toString(),
      title,
      department,
      location,
      type,
      level,
      description,
      requirements,
      benefits,
      deadline,
      status: 'open',
      applications: 0,
      postedDate: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem('internalJobs') || '[]');
    localStorage.setItem('internalJobs', JSON.stringify([...existing, newJob]));

    resetForm();
    onSave();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle('');
    setDepartment('');
    setLocation('');
    setType('full-time');
    setLevel('');
    setDescription('');
    setRequirements('');
    setBenefits('');
    setDeadline('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Publier un poste en mobilité interne</DialogTitle>
          <DialogDescription>
            Créez une opportunité de mobilité interne pour vos employés
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du poste *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Chef de Projet Digital"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Département *</Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="IT & Digital"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Localisation *</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Paris, France"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type de contrat *</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                required
              >
                <option value="full-time">Temps plein</option>
                <option value="part-time">Temps partiel</option>
                <option value="contract">Contrat</option>
                <option value="temporary">Temporaire</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Niveau *</Label>
              <select
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                required
              >
                <option value="">Sélectionner...</option>
                <option value="junior">Junior</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="manager">Manager</option>
                <option value="director">Directeur</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description du poste *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez les responsabilités et missions principales..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Exigences et compétences requises</Label>
            <Textarea
              id="requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Diplômes, expérience, compétences techniques et soft skills..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits">Avantages</Label>
            <Textarea
              id="benefits"
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              placeholder="Avantages sociaux, opportunités de développement..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Date limite de candidature</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Publier le poste
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
