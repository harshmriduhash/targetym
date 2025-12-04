'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  UserPlus,
  Upload,
  X,
  CheckCircle2,
  Mail,
  Phone,
  Briefcase,
  Loader2,
  FileText,
  Link as LinkIcon
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { createCandidateSchema, type CreateCandidateInput } from '@/src/lib/validations/recruitment.schemas';
import { createCandidate } from '@/src/actions/recruitment/create-candidate';
import { uploadCV } from '@/src/actions/recruitment/upload-cv';
import { toast } from 'sonner';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  job_posting_id: string;
  jobTitle?: string;
  status?: string;
  current_stage?: string;
  cv_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  cover_letter?: string;
  source?: string;
}

interface JobPosting {
  id: string;
  title: string;
  department?: string;
  location?: string;
  status: string;
}

interface CandidateSelectorProps {
  candidates: Candidate[];
  jobs: JobPosting[];
  selectedCandidate: Candidate | null;
  onSelectCandidate: (candidate: Candidate | null) => void;
  onCandidateCreated?: (candidate: Candidate) => void;
}

export function CandidateSelectorEnhanced({
  candidates,
  jobs,
  selectedCandidate,
  onSelectCandidate,
  onCandidateCreated
}: CandidateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('select');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CV upload states
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedCvUrl, setUploadedCvUrl] = useState<string>('');

  // Form with React Hook Form and Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<CreateCandidateInput>({
    resolver: zodResolver(createCandidateSchema),
    defaultValues: {
      job_posting_id: jobs.length > 0 ? jobs[0].id : '',
      name: '',
      email: '',
      phone: '',
      linkedin_url: '',
      portfolio_url: '',
      cover_letter: '',
      source: 'manual',
      cv_url: ''
    }
  });

  const watchedJobId = watch('job_posting_id');

  // Filter candidates based on search
  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form submission
  const onSubmit = async (data: CreateCandidateInput) => {
    try {
      // Add uploaded CV URL if available
      const candidateData = {
        ...data,
        cv_url: uploadedCvUrl || data.cv_url
      };

      const result = await createCandidate(candidateData);

      if (!result.success) {
        toast.error(result.error.message);
        return;
      }

      toast.success('Candidat créé avec succès');

      // Create candidate object to return
      const newCandidate: Candidate = {
        id: result.data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        job_posting_id: data.job_posting_id,
        jobTitle: jobs.find(j => j.id === data.job_posting_id)?.title,
        status: 'new',
        current_stage: 'applied',
        cv_url: candidateData.cv_url,
        linkedin_url: data.linkedin_url,
        portfolio_url: data.portfolio_url,
        cover_letter: data.cover_letter,
        source: data.source
      };

      // Notify parent component
      if (onCandidateCreated) {
        onCandidateCreated(newCandidate);
      }

      // Select the newly created candidate
      onSelectCandidate(newCandidate);

      // Reset form
      reset();
      setCvFile(null);
      setUploadedCvUrl('');
      setActiveTab('select');
    } catch (error) {
      console.error('Error creating candidate:', error);
      toast.error('Erreur lors de la création du candidat');
    }
  };

  // Handle CV upload
  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format de fichier invalide. Seuls PDF, DOC et DOCX sont acceptés.');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Le fichier dépasse la taille maximale de 10MB.');
      return;
    }

    setCvFile(file);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadCV(formData);

      if (!result.success) {
        toast.error(result.error.message);
        return;
      }

      setUploadedCvUrl(result.data.url);
      setValue('cv_url', result.data.url);
      toast.success('CV uploadé avec succès');

      // Switch to create tab to fill in the form
      setActiveTab('create');
    } catch (error) {
      console.error('Error uploading CV:', error);
      toast.error('Erreur lors de l\'upload du CV');
    } finally {
      setIsUploading(false);
    }
  };

  const stageLabels: Record<string, string> = {
    applied: 'Candidature',
    screening: 'Présélection',
    interviewing: 'Entretien',
    offered: 'Offre',
    hired: 'Embauché',
    rejected: 'Refusé',
    new: 'Nouveau'
  };

  const stageColors: Record<string, string> = {
    applied: 'bg-blue-100 text-blue-700',
    screening: 'bg-yellow-100 text-yellow-700',
    interviewing: 'bg-purple-100 text-purple-700',
    offered: 'bg-green-100 text-green-700',
    hired: 'bg-green-500 text-white',
    rejected: 'bg-red-100 text-red-700',
    new: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="space-y-4">
      {/* Selected candidate display */}
      {selectedCandidate && (
        <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold">{selectedCandidate.name}</h4>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    <span>{selectedCandidate.email}</span>
                  </div>
                  {selectedCandidate.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>{selectedCandidate.phone}</span>
                    </div>
                  )}
                  {selectedCandidate.jobTitle && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3 w-3" />
                      <span>{selectedCandidate.jobTitle}</span>
                    </div>
                  )}
                  {selectedCandidate.cv_url && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      <a
                        href={selectedCandidate.cv_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Voir le CV
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onSelectCandidate(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Candidate selection/creation tabs */}
      {!selectedCandidate && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="select">
              <Search className="h-4 w-4 mr-2" />
              Sélectionner
            </TabsTrigger>
            <TabsTrigger value="create">
              <UserPlus className="h-4 w-4 mr-2" />
              Créer
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Importer CV
            </TabsTrigger>
          </TabsList>

          {/* Select existing candidate */}
          <TabsContent value="select" className="space-y-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un candidat par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {filteredCandidates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {searchTerm ? 'Aucun candidat trouvé' : 'Aucun candidat disponible'}
                </p>
              ) : (
                filteredCandidates.map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => onSelectCandidate(candidate)}
                    className="w-full p-3 text-left border rounded-lg hover:bg-accent hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{candidate.name}</h4>
                        <p className="text-sm text-muted-foreground truncate">{candidate.email}</p>
                        {candidate.jobTitle && (
                          <p className="text-xs text-muted-foreground mt-1">{candidate.jobTitle}</p>
                        )}
                      </div>
                      <Badge variant="outline" className={stageColors[candidate.current_stage || 'new']}>
                        {stageLabels[candidate.current_stage || 'new']}
                      </Badge>
                    </div>
                  </button>
                ))
              )}
            </div>
          </TabsContent>

          {/* Create new candidate */}
          <TabsContent value="create" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Uploaded CV indicator */}
              {uploadedCvUrl && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">CV uploadé avec succès</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUploadedCvUrl('');
                      setCvFile(null);
                      setValue('cv_url', '');
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">
                  Nom complet <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ex: Jean Dupont"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job_posting_id">
                  Poste visé <span className="text-red-500">*</span>
                </Label>
                <select
                  id="job_posting_id"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  {...register('job_posting_id')}
                >
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} {job.department ? `- ${job.department}` : ''}
                    </option>
                  ))}
                </select>
                {errors.job_posting_id && (
                  <p className="text-sm text-red-500">{errors.job_posting_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin_url">Profil LinkedIn</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="linkedin_url"
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    className="pl-10"
                    {...register('linkedin_url')}
                  />
                </div>
                {errors.linkedin_url && (
                  <p className="text-sm text-red-500">{errors.linkedin_url.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio_url">Portfolio / Site web</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="portfolio_url"
                    type="url"
                    placeholder="https://..."
                    className="pl-10"
                    {...register('portfolio_url')}
                  />
                </div>
                {errors.portfolio_url && (
                  <p className="text-sm text-red-500">{errors.portfolio_url.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover_letter">Lettre de motivation / Notes</Label>
                <Textarea
                  id="cover_letter"
                  placeholder="Compétences, expérience, remarques..."
                  rows={3}
                  {...register('cover_letter')}
                />
                {errors.cover_letter && (
                  <p className="text-sm text-red-500">{errors.cover_letter.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">Source du candidat</Label>
                <select
                  id="source"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  {...register('source')}
                >
                  <option value="manual">Ajout manuel</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="indeed">Indeed</option>
                  <option value="website">Site web</option>
                  <option value="referral">Recommandation</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Créer et sélectionner
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Upload CV */}
          <TabsContent value="upload" className="space-y-4 mt-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleCVUpload}
                className="hidden"
                disabled={isUploading}
              />
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">
                {isUploading ? 'Upload en cours...' : 'Importer un CV'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Formats acceptés: PDF, DOC, DOCX (max 10MB)
              </p>
              {cvFile && (
                <p className="text-sm font-medium mb-4 text-primary">
                  📄 {cvFile.name}
                </p>
              )}
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Upload en cours...
                  </>
                ) : (
                  'Choisir un fichier'
                )}
              </Button>
              {uploadedCvUrl && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-left">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-700">
                        CV uploadé avec succès !
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Passez à l&apos;onglet &quot;Créer&quot; pour compléter les informations du candidat.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
