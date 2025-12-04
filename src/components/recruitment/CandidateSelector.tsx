'use client'

import { useState, useTransition } from 'react'
import { Search, Plus, User, Briefcase, Mail, Phone } from 'lucide-react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useCandidates, useJobPostings } from '@/src/lib/react-query/hooks/use-recruitment'
import { createCandidate } from '@/src/actions/recruitment/create-candidate'
import { toast } from 'sonner'
import { logger } from '@/src/lib/monitoring/logger'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Candidate {
  id: string
  name: string
  email: string
  phone?: string
  status: string
  job_posting?: {
    title: string
  }
  created_at: string
}

interface CandidateSelectorProps {
  onSelect: (candidate: Candidate) => void
  jobPostingId?: string
}

export function CandidateSelector({ onSelect, jobPostingId }: CandidateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Fetch candidates (avec option de filtrer par job posting)
  const { data: candidatesResponse, isLoading } = useCandidates(
    jobPostingId ? { job_posting_id: jobPostingId } : {}
  )

  const candidates = candidatesResponse?.data || []

  // Filtrer les candidats selon la recherche
  const filteredCandidates = candidates.filter((candidate) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      candidate.name.toLowerCase().includes(searchLower) ||
      candidate.email.toLowerCase().includes(searchLower) ||
      candidate.phone?.toLowerCase().includes(searchLower)
    )
  })

  const handleSelectCandidate = (candidate: Candidate) => {
    onSelect(candidate)
    setIsOpen(false)
    setSearchTerm('')
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      screening: 'bg-yellow-100 text-yellow-800',
      interviewing: 'bg-purple-100 text-purple-800',
      offer: 'bg-green-100 text-green-800',
      hired: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <User className="mr-2 h-4 w-4" />
          Sélectionner un candidat
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {showCreateForm ? 'Créer un nouveau candidat' : 'Sélectionner un candidat'}
          </DialogTitle>
        </DialogHeader>

        {!showCreateForm ? (
          <>
            {/* Barre de recherche et bouton créer */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, email ou téléphone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Créer nouveau
              </Button>
            </div>

            <Separator />

            {/* Liste des candidats */}
            <ScrollArea className="h-[400px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="text-center py-8">
                  <User className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-500">
                    {searchTerm ? 'Aucun candidat trouvé' : 'Aucun candidat dans le système'}
                  </p>
                  <Button
                    variant="link"
                    onClick={() => setShowCreateForm(true)}
                    className="mt-2"
                  >
                    Créer le premier candidat
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      onClick={() => handleSelectCandidate(candidate)}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{candidate.name}</h4>
                            <Badge className={getStatusColor(candidate.status)}>
                              {candidate.status}
                            </Badge>
                          </div>

                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span>{candidate.email}</span>
                            </div>
                            {candidate.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                <span>{candidate.phone}</span>
                              </div>
                            )}
                            {candidate.job_posting && (
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-3 w-3" />
                                <span className="text-gray-500">
                                  {candidate.job_posting.title}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-xs text-gray-400 ml-4">
                          {new Date(candidate.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </>
        ) : (
          <CreateCandidateForm
            onCancel={() => setShowCreateForm(false)}
            onSuccess={(candidate) => {
              handleSelectCandidate(candidate)
              setShowCreateForm(false)
            }}
            jobPostingId={jobPostingId}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

// Formulaire de création rapide
interface CreateCandidateFormProps {
  onCancel: () => void
  onSuccess: (candidate: Candidate) => void
  jobPostingId?: string
}

function CreateCandidateForm({ onCancel, onSuccess, jobPostingId }: CreateCandidateFormProps) {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin_url: '',
    cv_url: '',
    job_posting_id: jobPostingId || '',
  })

  // Récupérer la liste des offres d'emploi si pas de jobPostingId pré-sélectionné
  const { data: jobPostingsResponse } = useJobPostings()
  const jobPostings = jobPostingsResponse?.data || []

  const isFormValid = formData.name.trim() && formData.email.trim() && formData.job_posting_id

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    startTransition(async () => {
      try {
        const result = await createCandidate({
          job_posting_id: formData.job_posting_id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone || '',
          linkedin_url: formData.linkedin_url || '',
          portfolio_url: '',
          cv_url: formData.cv_url || '',
          cover_letter: '',
          source: 'manual',
        })

        if (result.success) {
          toast.success('Candidat créé avec succès')

          // Créer l'objet candidat pour le retour
          const newCandidate: Candidate = {
            id: result.data.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            status: 'new',
            created_at: new Date().toISOString(),
          }

          onSuccess(newCandidate)
        } else {
          toast.error(result.error.message || 'Erreur lors de la création')
        }
      } catch (error) {
        logger.error('Error creating candidate:', error)
        toast.error('Une erreur est survenue')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!jobPostingId && (
        <div className="space-y-2">
          <Label htmlFor="job_posting">
            Offre d'emploi <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.job_posting_id}
            onValueChange={(value) => setFormData({ ...formData, job_posting_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une offre" />
            </SelectTrigger>
            <SelectContent>
              {jobPostings.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title} - {job.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {jobPostings.length === 0 && (
            <p className="text-sm text-amber-600">
              Aucune offre d'emploi disponible. Créez d'abord une offre.
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">
          Nom complet <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Marie Dubois"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="marie.dubois@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+33 6 12 34 56 78"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="linkedin">Profil LinkedIn</Label>
        <Input
          id="linkedin"
          type="url"
          value={formData.linkedin_url}
          onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
          placeholder="https://linkedin.com/in/..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cv">URL du CV</Label>
        <Input
          id="cv"
          type="url"
          value={formData.cv_url}
          onChange={(e) => setFormData({ ...formData, cv_url: e.target.value })}
          placeholder="https://..."
        />
        <p className="text-xs text-gray-500">
          Lien vers le CV hébergé (Google Drive, Dropbox, etc.)
        </p>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
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
              Création...
            </>
          ) : (
            'Créer et sélectionner'
          )}
        </Button>
      </div>
    </form>
  )
}
