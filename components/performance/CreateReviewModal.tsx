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
import { Award, Star } from 'lucide-react';

interface CreateReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewCreated?: (review: any) => void;
}

export function CreateReviewModal({ open, onOpenChange, onReviewCreated }: CreateReviewModalProps) {
  const [employeeName, setEmployeeName] = useState('');
  const [employeeRole, setEmployeeRole] = useState('');
  const [reviewDate, setReviewDate] = useState('');
  const [reviewPeriod, setReviewPeriod] = useState('');
  const [periodType, setPeriodType] = useState<'predefined' | 'custom'>('predefined');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [customPeriodStart, setCustomPeriodStart] = useState('');
  const [customPeriodEnd, setCustomPeriodEnd] = useState('');
  const [overallRating, setOverallRating] = useState(0);
  const [strengths, setStrengths] = useState('');
  const [areasForImprovement, setAreasForImprovement] = useState('');
  const [achievements, setAchievements] = useState('');
  const [goals, setGoals] = useState('');
  const [comments, setComments] = useState('');
  const [status, setStatus] = useState<'draft' | 'submitted' | 'completed'>('draft');

  // Compétences à évaluer
  const [competencies, setCompetencies] = useState({
    leadership: 0,
    communication: 0,
    teamwork: 0,
    problemSolving: 0,
    technical: 0,
    innovation: 0
  });

  // Générer les périodes prédéfinies
  const generatePeriods = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);

    const periods = [];

    // Trimestres de l'année en cours
    for (let q = 0; q <= 3; q++) {
      const year = currentYear;
      const quarterLabel = `Q${q + 1} ${year}`;
      const startMonth = q * 3;
      const endMonth = startMonth + 2;
      const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
      const periodText = `${monthNames[startMonth]} - ${monthNames[endMonth]} ${year}`;

      periods.push({
        value: quarterLabel,
        label: quarterLabel,
        text: periodText
      });
    }

    // Trimestres de l'année précédente
    for (let q = 0; q <= 3; q++) {
      const year = currentYear - 1;
      const quarterLabel = `Q${q + 1} ${year}`;
      const startMonth = q * 3;
      const endMonth = startMonth + 2;
      const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
      const periodText = `${monthNames[startMonth]} - ${monthNames[endMonth]} ${year}`;

      periods.push({
        value: quarterLabel,
        label: quarterLabel,
        text: periodText
      });
    }

    // Semestres
    periods.push({
      value: `S1 ${currentYear}`,
      label: `S1 ${currentYear}`,
      text: `Janvier - Juin ${currentYear}`
    });
    periods.push({
      value: `S2 ${currentYear}`,
      label: `S2 ${currentYear}`,
      text: `Juillet - Décembre ${currentYear}`
    });

    // Année complète
    periods.push({
      value: `${currentYear}`,
      label: `Année ${currentYear}`,
      text: `Janvier - Décembre ${currentYear}`
    });
    periods.push({
      value: `${currentYear - 1}`,
      label: `Année ${currentYear - 1}`,
      text: `Janvier - Décembre ${currentYear - 1}`
    });

    return periods;
  };

  const predefinedPeriods = generatePeriods();

  // Mettre à jour reviewPeriod quand selectedPeriod change
  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    const period = predefinedPeriods.find(p => p.value === value);
    if (period) {
      setReviewPeriod(period.text);
    }
  };

  // Mettre à jour reviewPeriod quand les dates custom changent
  const handleCustomPeriodChange = () => {
    if (customPeriodStart && customPeriodEnd) {
      const startDate = new Date(customPeriodStart);
      const endDate = new Date(customPeriodEnd);
      const periodText = `${startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} - ${endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
      setReviewPeriod(periodText);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const reviewData = {
      id: Date.now().toString(),
      employeeName,
      employeeRole,
      reviewDate,
      reviewPeriod,
      overallRating,
      competencies,
      strengths,
      areasForImprovement,
      achievements,
      goals,
      comments,
      status,
      createdAt: new Date().toISOString(),
    };

    // Sauvegarder dans localStorage
    const existingReviews = JSON.parse(localStorage.getItem('performanceReviews') || '[]');
    existingReviews.push(reviewData);
    localStorage.setItem('performanceReviews', JSON.stringify(existingReviews));

    if (onReviewCreated) {
      onReviewCreated(reviewData);
    }

    onOpenChange(false);

    // Reset form
    setEmployeeName('');
    setEmployeeRole('');
    setReviewDate('');
    setReviewPeriod('');
    setPeriodType('predefined');
    setSelectedPeriod('');
    setCustomPeriodStart('');
    setCustomPeriodEnd('');
    setOverallRating(0);
    setCompetencies({
      leadership: 0,
      communication: 0,
      teamwork: 0,
      problemSolving: 0,
      technical: 0,
      innovation: 0
    });
    setStrengths('');
    setAreasForImprovement('');
    setAchievements('');
    setGoals('');
    setComments('');
    setStatus('draft');
  };

  const RatingInput = ({
    label,
    value,
    onChange
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-6 w-6 ${
                rating <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground self-center">
          {value > 0 ? `${value}/5` : 'Non évalué'}
        </span>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Nouvelle Évaluation de Performance
          </DialogTitle>
          <DialogDescription>
            Créer une évaluation complète de la performance d'un employé
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Informations de l'employé</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeName">
                  Nom de l'employé <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="employeeName"
                  placeholder="Ex: Jean Dupont"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeRole">
                  Poste <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="employeeRole"
                  placeholder="Ex: Développeur Senior"
                  value={employeeRole}
                  onChange={(e) => setEmployeeRole(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewDate">
                  Date de l'évaluation <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="reviewDate"
                  type="date"
                  value={reviewDate}
                  onChange={(e) => setReviewDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="reviewPeriod">
                  Période évaluée <span className="text-red-500">*</span>
                </Label>

                <div className="space-y-3">
                  {/* Toggle entre prédéfini et personnalisé */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={periodType === 'predefined' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPeriodType('predefined')}
                      className="flex-1"
                    >
                      Période prédéfinie
                    </Button>
                    <Button
                      type="button"
                      variant={periodType === 'custom' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPeriodType('custom')}
                      className="flex-1"
                    >
                      Période personnalisée
                    </Button>
                  </div>

                  {periodType === 'predefined' ? (
                    <select
                      id="reviewPeriod"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      value={selectedPeriod}
                      onChange={(e) => handlePeriodChange(e.target.value)}
                      required
                    >
                      <option value="">Sélectionnez une période</option>
                      <optgroup label="Trimestres 2025">
                        {predefinedPeriods.filter(p => p.value.includes('2025') && p.value.startsWith('Q')).map(period => (
                          <option key={period.value} value={period.value}>
                            {period.label} ({period.text})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Trimestres 2024">
                        {predefinedPeriods.filter(p => p.value.includes('2024') && p.value.startsWith('Q')).map(period => (
                          <option key={period.value} value={period.value}>
                            {period.label} ({period.text})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Semestres">
                        {predefinedPeriods.filter(p => p.value.startsWith('S')).map(period => (
                          <option key={period.value} value={period.value}>
                            {period.label} ({period.text})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Année complète">
                        {predefinedPeriods.filter(p => !p.value.includes('Q') && !p.value.includes('S')).map(period => (
                          <option key={period.value} value={period.value}>
                            {period.label} ({period.text})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="customPeriodStart" className="text-xs">Date de début</Label>
                        <Input
                          id="customPeriodStart"
                          type="date"
                          value={customPeriodStart}
                          onChange={(e) => {
                            setCustomPeriodStart(e.target.value);
                            if (customPeriodEnd) {
                              setTimeout(handleCustomPeriodChange, 100);
                            }
                          }}
                          required={periodType === 'custom'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customPeriodEnd" className="text-xs">Date de fin</Label>
                        <Input
                          id="customPeriodEnd"
                          type="date"
                          value={customPeriodEnd}
                          onChange={(e) => {
                            setCustomPeriodEnd(e.target.value);
                            if (customPeriodStart) {
                              setTimeout(handleCustomPeriodChange, 100);
                            }
                          }}
                          required={periodType === 'custom'}
                        />
                      </div>
                    </div>
                  )}

                  {/* Affichage de la période formatée */}
                  {reviewPeriod && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-medium text-blue-900 mb-1">Période sélectionnée :</p>
                      <p className="text-sm text-blue-700 font-semibold">{reviewPeriod}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Note globale */}
          <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
            <RatingInput
              label="Note globale de performance"
              value={overallRating}
              onChange={setOverallRating}
            />
          </div>

          {/* Évaluation des compétences */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Évaluation des compétences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              <RatingInput
                label="Leadership"
                value={competencies.leadership}
                onChange={(val) => setCompetencies({ ...competencies, leadership: val })}
              />
              <RatingInput
                label="Communication"
                value={competencies.communication}
                onChange={(val) => setCompetencies({ ...competencies, communication: val })}
              />
              <RatingInput
                label="Travail d'équipe"
                value={competencies.teamwork}
                onChange={(val) => setCompetencies({ ...competencies, teamwork: val })}
              />
              <RatingInput
                label="Résolution de problèmes"
                value={competencies.problemSolving}
                onChange={(val) => setCompetencies({ ...competencies, problemSolving: val })}
              />
              <RatingInput
                label="Compétences techniques"
                value={competencies.technical}
                onChange={(val) => setCompetencies({ ...competencies, technical: val })}
              />
              <RatingInput
                label="Innovation"
                value={competencies.innovation}
                onChange={(val) => setCompetencies({ ...competencies, innovation: val })}
              />
            </div>
          </div>

          {/* Commentaires détaillés */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Évaluation détaillée</h3>

            <div className="space-y-2">
              <Label htmlFor="achievements">Réalisations principales</Label>
              <Textarea
                id="achievements"
                placeholder="Listez les principales réalisations pendant cette période..."
                rows={3}
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="strengths">Points forts</Label>
              <Textarea
                id="strengths"
                placeholder="Décrivez les points forts de l'employé..."
                rows={3}
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="areasForImprovement">Axes d'amélioration</Label>
              <Textarea
                id="areasForImprovement"
                placeholder="Identifiez les domaines nécessitant une amélioration..."
                rows={3}
                value={areasForImprovement}
                onChange={(e) => setAreasForImprovement(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals">Objectifs pour la prochaine période</Label>
              <Textarea
                id="goals"
                placeholder="Définissez les objectifs pour la période suivante..."
                rows={3}
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Commentaires additionnels</Label>
              <Textarea
                id="comments"
                placeholder="Ajoutez tout commentaire supplémentaire..."
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
          </div>

          {/* Statut */}
          <div className="space-y-2">
            <Label htmlFor="status">Statut de l'évaluation</Label>
            <select
              id="status"
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="draft">Brouillon</option>
              <option value="submitted">Soumise</option>
              <option value="completed">Complétée</option>
            </select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Créer l'évaluation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
