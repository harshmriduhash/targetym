'use client';

import { useState, useEffect, useMemo } from 'react';
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
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  FileText,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ScheduleInterviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: any | null;
  onInterviewScheduled?: (candidateId: string, interview: any) => void;
}

// Durées recommandées par type d'entretien (meilleures pratiques)
const RECOMMENDED_DURATIONS = {
  phone: 30,
  technical: 90,
  behavioral: 60,
  final: 45,
  case_study: 120,
  panel: 90
};

// Template de questions par type d'entretien
const INTERVIEW_TEMPLATES = {
  phone: {
    name: 'Entretien téléphonique',
    description: 'Premier contact, évaluation rapide',
    duration: 30,
    questions: [
      'Expérience et parcours professionnel',
      'Motivation et disponibilité',
      'Prétentions salariales',
      'Questions du candidat'
    ]
  },
  technical: {
    name: 'Entretien technique',
    description: 'Évaluation des compétences techniques',
    duration: 90,
    questions: [
      'Tests techniques / Exercices pratiques',
      'Architecture et design patterns',
      'Résolution de problèmes',
      'Revue de code ou projet personnel'
    ]
  },
  behavioral: {
    name: 'Entretien comportemental',
    description: 'Soft skills et culture fit',
    duration: 60,
    questions: [
      'Situations de travail en équipe',
      'Gestion de conflits',
      'Leadership et initiative',
      'Valeurs et adéquation culturelle'
    ]
  },
  final: {
    name: 'Entretien final',
    description: 'Décision finale avec direction',
    duration: 45,
    questions: [
      'Vision et objectifs de carrière',
      'Négociation package complet',
      'Questions ouvertes',
      'Présentation de l\'entreprise'
    ]
  },
  case_study: {
    name: 'Étude de cas',
    description: 'Analyse de problématique business',
    duration: 120,
    questions: [
      'Présentation du cas',
      'Analyse et méthodologie',
      'Présentation des recommandations',
      'Questions et débat'
    ]
  },
  panel: {
    name: 'Entretien collectif',
    description: 'Panel avec plusieurs intervieweurs',
    duration: 90,
    questions: [
      'Tour de table des intervieweurs',
      'Questions techniques et RH',
      'Mise en situation',
      'Synthèse et prochaines étapes'
    ]
  }
};

export default function ScheduleInterviewModal({
  open,
  onOpenChange,
  candidate,
  onInterviewScheduled
}: ScheduleInterviewModalProps) {
  const [interviewType, setInterviewType] = useState<keyof typeof INTERVIEW_TEMPLATES>('phone');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState('30');
  const [location, setLocation] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [interviewers, setInterviewers] = useState('');
  const [notes, setNotes] = useState('');
  const [sendCalendarInvite, setSendCalendarInvite] = useState(true);
  const [sendPrepEmail, setSendPrepEmail] = useState(true);
  const [reminderTime, setReminderTime] = useState('24');

  // Auto-ajuster la durée selon le type d'entretien
  useEffect(() => {
    if (interviewType && RECOMMENDED_DURATIONS[interviewType]) {
      setDuration(RECOMMENDED_DURATIONS[interviewType].toString());
    }
  }, [interviewType]);

  // Auto-remplir les questions suggérées
  useEffect(() => {
    if (interviewType && INTERVIEW_TEMPLATES[interviewType]) {
      const template = INTERVIEW_TEMPLATES[interviewType];
      const suggestedNotes = `Points à aborder:\n${template.questions.map(q => `• ${q}`).join('\n')}`;
      if (!notes) {
        setNotes(suggestedNotes);
      }
    }
  }, [interviewType]);

  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setInterviewType('phone');
      setScheduledAt('');
      setDuration('30');
      setLocation('');
      setMeetingUrl('');
      setInterviewers('');
      setNotes('');
      setSendCalendarInvite(true);
      setSendPrepEmail(true);
      setReminderTime('24');
    }
  }, [open]);

  // Validation des horaires (éviter les créneaux non-professionnels)
  const isBusinessHours = useMemo(() => {
    if (!scheduledAt) return true;
    const date = new Date(scheduledAt);
    const hour = date.getHours();
    const day = date.getDay();

    // Éviter week-end et heures non-professionnelles (avant 8h et après 18h)
    if (day === 0 || day === 6) return false;
    if (hour < 8 || hour >= 18) return false;
    return true;
  }, [scheduledAt]);

  // Vérifier si le créneau est dans moins de 24h (délai minimum recommandé)
  const hasMinimumNotice = useMemo(() => {
    if (!scheduledAt) return true;
    const scheduledDate = new Date(scheduledAt);
    const now = new Date();
    const hoursUntil = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntil >= 24;
  }, [scheduledAt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!candidate) return;

    const interview = {
      id: Date.now().toString(),
      type: interviewType,
      scheduledAt,
      duration: parseInt(duration),
      location,
      meetingUrl,
      interviewers: interviewers.split(',').map(i => i.trim()).filter(i => i),
      notes,
      status: 'scheduled' as const,
      createdAt: new Date().toISOString(),
      sendCalendarInvite,
      sendPrepEmail,
      reminderTime: parseInt(reminderTime),
      template: INTERVIEW_TEMPLATES[interviewType]
    };

    if (onInterviewScheduled) {
      onInterviewScheduled(candidate.id, interview);
    }

    onOpenChange(false);
  };

  const selectedTemplate = INTERVIEW_TEMPLATES[interviewType];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Planifier un entretien professionnel
          </DialogTitle>
          <DialogDescription>
            {candidate ? `Planifiez un entretien avec ${candidate.name}` : 'Sélectionnez un candidat'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type d'entretien avec description */}
          <div className="space-y-2">
            <Label htmlFor="interview-type">
              Type d'entretien <span className="text-red-500">*</span>
            </Label>
            <select
              id="interview-type"
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value as any)}
              required
            >
              {Object.entries(INTERVIEW_TEMPLATES).map(([key, template]) => (
                <option key={key} value={key}>
                  {template.name} - {template.description}
                </option>
              ))}
            </select>
            {selectedTemplate && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  <strong>Durée recommandée :</strong> {selectedTemplate.duration} minutes
                </div>
              </div>
            )}
          </div>

          {/* Date, heure et durée */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled-at">
                Date et heure <span className="text-red-500">*</span>
              </Label>
              <Input
                id="scheduled-at"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />
              {/* Alertes de validation */}
              {scheduledAt && !isBusinessHours && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Créneau hors heures ouvrables (8h-18h, Lun-Ven)
                  </AlertDescription>
                </Alert>
              )}
              {scheduledAt && !hasMinimumNotice && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Minimum 24h de préavis recommandé
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">
                Durée (minutes) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="duration"
                type="number"
                min="15"
                step="15"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Lieu et format */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Lieu (physique)
              </Label>
              <Input
                id="location"
                placeholder="Ex: Salle de réunion A, 1er étage"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Lien de réunion virtuelle
              </Label>
              <Input
                id="meeting-url"
                type="url"
                placeholder="https://meet.google.com/..."
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Pour les entretiens à distance (Zoom, Meet, Teams, etc.)
              </p>
            </div>
          </div>

          {/* Intervieweurs */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Intervieweurs <span className="text-red-500">*</span>
            </Label>
            <Input
              id="interviewers"
              placeholder="Ex: Marie Dubois, Pierre Martin"
              value={interviewers}
              onChange={(e) => setInterviewers(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Séparez les noms par des virgules. Recommandation : 2-3 intervieweurs maximum
            </p>
          </div>

          {/* Guide d'entretien */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Guide d'entretien et notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Points à aborder, compétences à évaluer, questions spécifiques..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Auto-rempli avec les questions suggérées selon le type d'entretien
            </p>
          </div>

          {/* Options de communication */}
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Notifications et communications
            </h4>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendCalendarInvite}
                  onChange={(e) => setSendCalendarInvite(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">
                  Envoyer une invitation calendrier (.ics) au candidat
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendPrepEmail}
                  onChange={(e) => setSendPrepEmail(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">
                  Envoyer un email de préparation avec les détails de l'entretien
                </span>
              </label>

              <div className="space-y-2">
                <Label htmlFor="reminder" className="text-sm">
                  Rappel automatique avant l'entretien
                </Label>
                <select
                  id="reminder"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="2">2 heures avant</option>
                  <option value="24">24 heures avant</option>
                  <option value="48">48 heures avant</option>
                </select>
              </div>
            </div>
          </div>

          {/* Récapitulatif amélioré */}
          {candidate && scheduledAt && (
            <div className="p-4 border-2 border-primary/20 rounded-lg bg-primary/5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Récapitulatif de l'entretien
                </h4>
                {isBusinessHours && hasMinimumNotice && (
                  <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Créneau optimal
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Candidat</p>
                  <p className="font-medium">{candidate.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Type d'entretien</p>
                  <p className="font-medium">{selectedTemplate.name}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs">Date et heure</p>
                  <p className="font-medium">{new Date(scheduledAt).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Durée</p>
                  <p className="font-medium">{duration} minutes</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Format</p>
                  <p className="font-medium">
                    {meetingUrl ? '🌐 Virtuel' : location ? '📍 Présentiel' : 'À définir'}
                  </p>
                </div>
                {interviewers && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs">Intervieweurs</p>
                    <p className="font-medium">{interviewers}</p>
                  </div>
                )}
              </div>

              {/* Checklist finale */}
              <div className="pt-3 border-t space-y-1">
                <p className="text-xs font-medium text-muted-foreground">À faire avant l'entretien :</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>✓ Préparer les questions d'évaluation</li>
                  <li>✓ Réviser le CV et la lettre de motivation</li>
                  <li>✓ Configurer le matériel (visio si applicable)</li>
                  <li>✓ Préparer la grille d'évaluation</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!candidate || !isBusinessHours || !hasMinimumNotice}
              className="min-w-[180px]"
            >
              {!candidate ? 'Sélectionner un candidat' :
               !isBusinessHours || !hasMinimumNotice ? 'Créneau invalide' :
               'Planifier l\'entretien'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
