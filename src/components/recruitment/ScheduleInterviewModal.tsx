'use client'

import { useState, useMemo, useTransition } from 'react'
import { Calendar, Clock, MapPin, Video, FileText, Bell } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { CandidateSelector } from './CandidateSelector'
import { Badge } from '@/components/ui/badge'
import { scheduleInterview } from '@/src/actions/recruitment/schedule-interview'
import { toast } from 'sonner'
import { logger } from '@/src/lib/monitoring/logger'

interface InterviewFormData {
  type: string
  date: string
  time: string
  duration: number
  location?: string
  meetingUrl?: string
  interviewers: string
  notes?: string
  sendCalendarInvite: boolean
  sendPreparationEmail: boolean
  reminderHours: number
}

const interviewTypes = [
  { value: 'phone', label: 'Entretien téléphonique - Premier contact, évaluation rapide' },
  { value: 'video', label: 'Entretien vidéo - Évaluation approfondie à distance' },
  { value: 'onsite', label: 'Entretien sur site - Rencontre en personne' },
  { value: 'technical', label: 'Entretien technique - Test des compétences techniques' },
  { value: 'behavioral', label: 'Entretien comportemental - Évaluation soft skills' },
  { value: 'panel', label: 'Entretien panel - Plusieurs intervieweurs' },
]

export function ScheduleInterviewModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState<InterviewFormData>({
    type: 'phone',
    date: '',
    time: '',
    duration: 30,
    interviewers: '',
    sendCalendarInvite: true,
    sendPreparationEmail: true,
    reminderHours: 24,
  })

  // Validation du formulaire
  const isFormValid = useMemo(() => {
    if (!selectedCandidate) return false
    if (!formData.date || !formData.time) return false
    if (!formData.interviewers.trim()) return false
    if (formData.duration < 15) return false

    // Validation conditionnelle selon le type d'entretien
    if ((formData.type === 'onsite' || formData.type === 'panel') && formData.location && formData.location.trim().length === 0) {
      return false
    }

    return true
  }, [selectedCandidate, formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCandidate || !isFormValid) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    startTransition(async () => {
      try {
        // Combiner date et heure pour créer l'ISO string
        const scheduledAt = new Date(`${formData.date}T${formData.time}`).toISOString()

        const result = await scheduleInterview({
          candidate_id: selectedCandidate.id,
          job_posting_id: selectedCandidate.job_posting_id,
          interview_type: formData.type as any,
          scheduled_at: scheduledAt,
          duration_minutes: formData.duration,
          location: formData.location || '',
          meeting_link: formData.meetingUrl || '',
          interviewers: formData.interviewers,
          notes: formData.notes || '',
          send_calendar_invite: formData.sendCalendarInvite,
          send_preparation_email: formData.sendPreparationEmail,
          reminder_hours: formData.reminderHours,
        })

        if (result.success) {
          toast.success('Entretien planifié avec succès')
          setIsOpen(false)

          // Réinitialiser le formulaire
          setSelectedCandidate(null)
          setFormData({
            type: 'phone',
            date: '',
            time: '',
            duration: 30,
            interviewers: '',
            sendCalendarInvite: true,
            sendPreparationEmail: true,
            reminderHours: 24,
          })
        } else {
          toast.error(result.error.message || 'Erreur lors de la planification')
        }
      } catch (error) {
        logger.error('Error scheduling interview:', error)
        toast.error('Une erreur est survenue')
      }
    })
  }

  const recommendedDuration = {
    phone: 30,
    video: 60,
    onsite: 90,
    technical: 120,
    behavioral: 60,
    panel: 90,
  }[formData.type] || 30

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Planifier un entretien
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Planifier un entretien professionnel</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection du candidat */}
          <div className="space-y-2">
            <Label>Candidat</Label>
            {selectedCandidate ? (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex-1">
                  <p className="font-medium">{selectedCandidate.name}</p>
                  <p className="text-sm text-gray-600">{selectedCandidate.email}</p>
                </div>
                <Badge>{selectedCandidate.status}</Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCandidate(null)}
                >
                  Changer
                </Button>
              </div>
            ) : (
              <CandidateSelector onSelect={setSelectedCandidate} />
            )}
          </div>

          {/* Type d'entretien */}
          <div className="space-y-2">
            <Label htmlFor="type">
              Type d'entretien <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value, duration: recommendedDuration[value as keyof typeof recommendedDuration] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {interviewTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Clock className="h-4 w-4" />
              <span>Durée recommandée : {recommendedDuration} minutes</span>
            </div>
          </div>

          {/* Date et heure */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">
                Date et heure <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="datetime-local"
                required
                value={`${formData.date}T${formData.time}`}
                onChange={(e) => {
                  const [date, time] = e.target.value.split('T')
                  setFormData({ ...formData, date, time })
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">
                Durée (minutes) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="duration"
                type="number"
                required
                min={15}
                max={240}
                step={15}
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: parseInt(e.target.value) })
                }
              />
            </div>
          </div>

          {/* Lieu */}
          {(formData.type === 'onsite' || formData.type === 'panel') && (
            <div className="space-y-2">
              <Label htmlFor="location">
                <MapPin className="inline h-4 w-4 mr-1" />
                Lieu (physique)
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Salle de réunion A, 1er étage"
              />
            </div>
          )}

          {/* Lien de réunion virtuelle */}
          {(formData.type === 'video' || formData.type === 'phone') && (
            <div className="space-y-2">
              <Label htmlFor="meetingUrl">
                <Video className="inline h-4 w-4 mr-1" />
                Lien de réunion virtuelle
              </Label>
              <Input
                id="meetingUrl"
                type="url"
                value={formData.meetingUrl}
                onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                placeholder="https://meet.google.com/..."
              />
              <p className="text-xs text-gray-500">
                Pour les entretiens à distance (Zoom, Meet, Teams, etc.)
              </p>
            </div>
          )}

          {/* Intervieweurs */}
          <div className="space-y-2">
            <Label htmlFor="interviewers">
              Intervieweurs <span className="text-red-500">*</span>
            </Label>
            <Input
              id="interviewers"
              required
              value={formData.interviewers}
              onChange={(e) => setFormData({ ...formData, interviewers: e.target.value })}
              placeholder="Ex: Marie Dubois, Pierre Martin"
            />
            <p className="text-xs text-gray-500">
              Séparez les noms par des virgules. Recommandation : 2-3 intervieweurs maximum
            </p>
          </div>

          {/* Guide d'entretien et notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              <FileText className="inline h-4 w-4 mr-1" />
              Guide d'entretien et notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Points à aborder, compétences à évaluer, questions spécifiques..."
              rows={4}
            />
            <p className="text-xs text-gray-500">
              Auto-rempli avec les questions suggérées selon le type d'entretien
            </p>
          </div>

          {/* Notifications et communications */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-gray-600" />
              <h3 className="font-medium">Notifications et communications</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="calendarInvite"
                  checked={formData.sendCalendarInvite}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, sendCalendarInvite: checked as boolean })
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="calendarInvite"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Envoyer une invitation calendrier (.ics) au candidat
                  </label>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="preparationEmail"
                  checked={formData.sendPreparationEmail}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, sendPreparationEmail: checked as boolean })
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="preparationEmail"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Envoyer un email de préparation avec les détails de l'entretien
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder">Rappel automatique avant l'entretien</Label>
                <Select
                  value={formData.reminderHours.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, reminderHours: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 heure avant</SelectItem>
                    <SelectItem value="2">2 heures avant</SelectItem>
                    <SelectItem value="4">4 heures avant</SelectItem>
                    <SelectItem value="24">24 heures avant</SelectItem>
                    <SelectItem value="48">48 heures avant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!isFormValid || isPending}
            >
              {isPending ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Planification...
                </>
              ) : selectedCandidate ? (
                'Planifier l\'entretien'
              ) : (
                'Sélectionner un candidat'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
