'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CreateSuccessionPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export default function CreateSuccessionPlanModal({ open, onOpenChange, onSave }: CreateSuccessionPlanModalProps) {
  const [criticalRole, setCriticalRole] = useState('');
  const [currentHolder, setCurrentHolder] = useState('');
  const [successorName, setSuccessorName] = useState('');
  const [successorCurrentRole, setSuccessorCurrentRole] = useState('');
  const [readiness, setReadiness] = useState('developing');
  const [developmentPlan, setDevelopmentPlan] = useState('');
  const [timeline, setTimeline] = useState('');
  const [gapsToAddress, setGapsToAddress] = useState('');
  const [riskLevel, setRiskLevel] = useState('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPlan = {
      id: Date.now().toString(),
      criticalRole,
      currentHolder,
      successorName,
      successorCurrentRole,
      readiness,
      developmentPlan,
      timeline,
      gapsToAddress,
      riskLevel,
      createdAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem('successionPlans') || '[]');
    localStorage.setItem('successionPlans', JSON.stringify([...existing, newPlan]));

    resetForm();
    onSave();
    onOpenChange(false);
  };

  const resetForm = () => {
    setCriticalRole('');
    setCurrentHolder('');
    setSuccessorName('');
    setSuccessorCurrentRole('');
    setReadiness('developing');
    setDevelopmentPlan('');
    setTimeline('');
    setGapsToAddress('');
    setRiskLevel('medium');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un plan de succession</DialogTitle>
          <DialogDescription>
            Identifiez et préparez les successeurs pour les postes critiques
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
            <h3 className="font-semibold text-sm text-red-900 dark:text-red-100">Poste critique</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="criticalRole">Poste clé *</Label>
                <Input
                  id="criticalRole"
                  value={criticalRole}
                  onChange={(e) => setCriticalRole(e.target.value)}
                  placeholder="Directeur des Opérations"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentHolder">Titulaire actuel *</Label>
                <Input
                  id="currentHolder"
                  value={currentHolder}
                  onChange={(e) => setCurrentHolder(e.target.value)}
                  placeholder="Marie Martin"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="riskLevel">Niveau de risque *</Label>
              <select
                id="riskLevel"
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                required
              >
                <option value="low">Faible - Successeur prêt</option>
                <option value="medium">Moyen - Successeur en développement</option>
                <option value="high">Élevé - Pas de successeur identifié</option>
                <option value="critical">Critique - Départ imminent</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
            <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100">Successeur identifié</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="successorName">Nom du successeur *</Label>
                <Input
                  id="successorName"
                  value={successorName}
                  onChange={(e) => setSuccessorName(e.target.value)}
                  placeholder="Pierre Dubois"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="successorCurrentRole">Poste actuel *</Label>
                <Input
                  id="successorCurrentRole"
                  value={successorCurrentRole}
                  onChange={(e) => setSuccessorCurrentRole(e.target.value)}
                  placeholder="Manager Opérations"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="readiness">État de préparation *</Label>
                <select
                  id="readiness"
                  value={readiness}
                  onChange={(e) => setReadiness(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  required
                >
                  <option value="ready">Prêt maintenant</option>
                  <option value="developing">En développement (6-12 mois)</option>
                  <option value="emerging">Émergent (12-24 mois)</option>
                  <option value="not-ready">Non prêt (&gt;24 mois)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline">Délai de préparation *</Label>
                <Input
                  id="timeline"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  placeholder="12 mois"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gapsToAddress">Écarts de compétences à combler</Label>
            <Textarea
              id="gapsToAddress"
              value={gapsToAddress}
              onChange={(e) => setGapsToAddress(e.target.value)}
              placeholder="Listez les compétences, expériences ou connaissances manquantes..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="developmentPlan">Plan de développement</Label>
            <Textarea
              id="developmentPlan"
              value={developmentPlan}
              onChange={(e) => setDevelopmentPlan(e.target.value)}
              placeholder="Formations, coaching, projets stratégiques, mentorat..."
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
