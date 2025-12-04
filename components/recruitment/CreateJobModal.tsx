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
import { Briefcase, X } from 'lucide-react';

interface CreateJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobCreated?: (job: any) => void;
  editMode?: boolean;
  initialJob?: any;
}

export function CreateJobModal({ open, onOpenChange, onJobCreated, editMode = false, initialJob }: CreateJobModalProps) {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState<'full-time' | 'part-time' | 'contract' | 'internship'>('full-time');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [responsibilities, setResponsibilities] = useState<string[]>(['']);
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [status, setStatus] = useState<'draft' | 'active' | 'closed'>('draft');

  // Charger les données initiales en mode édition
  useEffect(() => {
    if (editMode && initialJob) {
      setTitle(initialJob.title);
      setDepartment(initialJob.department);
      setLocation(initialJob.location);
      setEmploymentType(initialJob.employmentType);
      setDescription(initialJob.description);
      setRequirements(initialJob.requirements || ['']);
      setResponsibilities(initialJob.responsibilities || ['']);
      setSalaryMin(initialJob.salaryMin?.toString() || '');
      setSalaryMax(initialJob.salaryMax?.toString() || '');
      setStatus(initialJob.status);
    } else {
      // Reset en mode création
      setTitle('');
      setDepartment('');
      setLocation('');
      setEmploymentType('full-time');
      setDescription('');
      setRequirements(['']);
      setResponsibilities(['']);
      setSalaryMin('');
      setSalaryMax('');
      setStatus('draft');
    }
  }, [editMode, initialJob, open]);

  const handleAddRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleRequirementChange = (index: number, value: string) => {
    const updated = [...requirements];
    updated[index] = value;
    setRequirements(updated);
  };

  const handleAddResponsibility = () => {
    setResponsibilities([...responsibilities, '']);
  };

  const handleRemoveResponsibility = (index: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  const handleResponsibilityChange = (index: number, value: string) => {
    const updated = [...responsibilities];
    updated[index] = value;
    setResponsibilities(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const jobData = editMode && initialJob
      ? {
          ...initialJob,
          title,
          department,
          location,
          employmentType,
          description,
          requirements: requirements.filter(r => r.trim() !== ''),
          responsibilities: responsibilities.filter(r => r.trim() !== ''),
          salaryMin: salaryMin ? parseFloat(salaryMin) : null,
          salaryMax: salaryMax ? parseFloat(salaryMax) : null,
          status
        }
      : {
          id: Date.now().toString(),
          title,
          department,
          location,
          employmentType,
          description,
          requirements: requirements.filter(r => r.trim() !== ''),
          responsibilities: responsibilities.filter(r => r.trim() !== ''),
          salaryMin: salaryMin ? parseFloat(salaryMin) : null,
          salaryMax: salaryMax ? parseFloat(salaryMax) : null,
          status,
          createdAt: new Date().toISOString(),
          candidatesCount: 0
        };

    if (onJobCreated) {
      onJobCreated(jobData);
    }

    onOpenChange(false);

    // Reset form
    if (!editMode) {
      setTitle('');
      setDepartment('');
      setLocation('');
      setEmploymentType('full-time');
      setDescription('');
      setRequirements(['']);
      setResponsibilities(['']);
      setSalaryMin('');
      setSalaryMax('');
      setStatus('draft');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            {editMode ? 'Modifier l\'offre d\'emploi' : 'Créer une nouvelle offre d\'emploi'}
          </DialogTitle>
          <DialogDescription>
            {editMode ? 'Modifiez les détails de l\'offre d\'emploi' : 'Publiez une nouvelle offre pour recruter des talents'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Titre du poste <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ex: Développeur Full Stack Senior"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">
                  Département <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="department"
                  placeholder="Ex: Technologie"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  Localisation <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  placeholder="Ex: Paris, France"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employment-type">
                  Type d'emploi <span className="text-red-500">*</span>
                </Label>
                <select
                  id="employment-type"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as any)}
                  required
                >
                  <option value="full-time">Temps plein</option>
                  <option value="part-time">Temps partiel</option>
                  <option value="contract">Contrat</option>
                  <option value="internship">Stage</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">
                  Statut <span className="text-red-500">*</span>
                </Label>
                <select
                  id="status"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  required
                >
                  <option value="draft">Brouillon</option>
                  <option value="active">Active</option>
                  <option value="closed">Fermée</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description du poste <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Décrivez le poste, l'environnement de travail, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>

          {/* Exigences */}
          <div className="space-y-3">
            <Label>Exigences du poste</Label>
            <p className="text-sm text-muted-foreground">
              Ajoutez les compétences et qualifications requises
            </p>
            {requirements.map((req, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Ex: 5+ années d'expérience en React"
                  value={req}
                  onChange={(e) => handleRequirementChange(index, e.target.value)}
                />
                {requirements.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRequirement(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRequirement}
            >
              + Ajouter une exigence
            </Button>
          </div>

          {/* Responsabilités */}
          <div className="space-y-3">
            <Label>Responsabilités</Label>
            <p className="text-sm text-muted-foreground">
              Ajoutez les principales tâches et missions
            </p>
            {responsibilities.map((resp, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Ex: Développer des fonctionnalités frontend"
                  value={resp}
                  onChange={(e) => handleResponsibilityChange(index, e.target.value)}
                />
                {responsibilities.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveResponsibility(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddResponsibility}
            >
              + Ajouter une responsabilité
            </Button>
          </div>

          {/* Fourchette salariale */}
          <div className="space-y-2">
            <Label>Fourchette salariale (€/an)</Label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Minimum"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Maximum"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              {editMode ? 'Enregistrer les modifications' : 'Créer l\'offre'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
