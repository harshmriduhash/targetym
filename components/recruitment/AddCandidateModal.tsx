'use client';

import { useState, useEffect, useRef } from 'react';
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
  UserPlus,
  Upload,
  FileText,
  X,
  File,
  Paperclip,
  Plus,
  Briefcase
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AddCandidateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobs: any[];
  onCandidateAdded?: (candidate: any) => void;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export function AddCandidateModal({ open, onOpenChange, jobs, onCandidateAdded }: AddCandidateModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobId, setJobId] = useState('');
  const [cvUrl, setCvUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [stage, setStage] = useState<'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected'>('applied');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvPreview, setCvPreview] = useState<string>('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [extractionError, setExtractionError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [createJobMode, setCreateJobMode] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobDepartment, setNewJobDepartment] = useState('');
  const cvInputRef = useRef<HTMLInputElement>(null);
  const attachmentsInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && jobs.length > 0 && !jobId) {
      setJobId(jobs[0].id);
    }
  }, [open, jobs, jobId]);

  // Gestion de l'upload du CV avec aperçu basique
  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le format du fichier
    const validFormats = ['.pdf', '.docx', '.doc'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!validFormats.some(format => fileExtension === format)) {
      setExtractionError('Format non supporté. Utilisez PDF ou DOCX.');
      return;
    }

    setCvFile(file);
    setExtractionError('');

    // Créer l'URL du fichier
    const fileUrl = URL.createObjectURL(file);
    setCvUrl(fileUrl);

    // Créer un aperçu basique du fichier
    const filePreview = `
📄 CV IMPORTÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nom du fichier : ${file.name}
Taille : ${(file.size / 1024).toFixed(2)} KB
Type : ${file.type || 'Document'}
Date d'import : ${new Date().toLocaleString('fr-FR')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Fichier chargé avec succès

Veuillez remplir les informations du candidat dans le formulaire ci-dessous.
    `.trim();

    setCvPreview(filePreview);

    // Tentative d'extraction basique du nom depuis le nom de fichier
    const fileName = file.name.replace(/\.(pdf|docx|doc)$/i, '');
    const nameParts = fileName.split(/[-_\s]/);

    if (nameParts.length >= 2 && !name) {
      const potentialName = nameParts
        .slice(0, 2)
        .join(' ')
        .replace(/cv|resume/gi, '')
        .trim();

      if (potentialName.length > 3) {
        const formattedName = potentialName
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
        setName(formattedName);
      }
    }
  };

  // Gestion des pièces jointes
  const handleAttachmentsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = Array.from(files).map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString()
    }));

    setAttachments([...attachments, ...newAttachments]);
  };

  // Supprimer une pièce jointe
  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const candidateData = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      jobId,
      cvUrl,
      cvFile: cvFile ? {
        name: cvFile.name,
        type: cvFile.type,
        size: cvFile.size,
        url: cvUrl
      } : null,
      linkedinUrl,
      notes,
      stage,
      appliedAt: new Date().toISOString(),
      aiScore: null, // Sera calculé ultérieurement avec l'IA
      interviews: [],
      attachments
    };

    if (onCandidateAdded) {
      onCandidateAdded(candidateData);
    }

    onOpenChange(false);

    // Reset form
    setName('');
    setEmail('');
    setPhone('');
    setJobId(jobs.length > 0 ? jobs[0].id : '');
    setCvUrl('');
    setCvFile(null);
    setCvPreview('');
    setLinkedinUrl('');
    setNotes('');
    setStage('applied');
    setAttachments([]);
    setExtractionError('');
    setShowPreview(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Ajouter un candidat
          </DialogTitle>
          <DialogDescription>
            Importez un CV pour extraction automatique ou saisissez manuellement les informations
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload CV */}
          <div className="space-y-3 p-4 border-2 border-dashed rounded-lg bg-muted/20">
            <div className="flex items-start justify-between">
              <div>
                <Label className="flex items-center gap-2 text-base">
                  <Upload className="h-4 w-4 text-primary" />
                  Import CV
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Uploadez un CV (PDF, DOCX) - <span className="text-yellow-600 font-medium">Extraction automatique : Coming Soon 🚀</span>
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => cvInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Importer CV
              </Button>
              <input
                ref={cvInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleCvUpload}
              />
            </div>

            {cvFile && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-background rounded border">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm flex-1">{cvFile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(cvFile.size)}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? 'Masquer' : 'Aperçu'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCvFile(null);
                      setCvUrl('');
                      setCvPreview('');
                      setCvExtractedData(null);
                      setShowPreview(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Aperçu du CV */}
                {showPreview && cvPreview && (
                  <div className="border rounded-lg p-4 bg-background max-h-96 overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Aperçu du fichier
                      </h4>
                    </div>

                    {/* Texte brut du CV */}
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-xs font-mono bg-muted/20 p-3 rounded border">
{cvPreview}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {extractionError && (
              <Alert variant="destructive">
                <AlertDescription>{extractionError}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Informations personnelles */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nom complet <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ex: Jean Dupont"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jean.dupont@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Poste et étape */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job">
                Poste visé <span className="text-red-500">*</span>
              </Label>

              {!createJobMode ? (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select
                      id="job"
                      className="w-full px-3 py-2.5 border border-input rounded-md bg-background hover:bg-accent/50 transition-colors cursor-pointer appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={jobId}
                      onChange={(e) => setJobId(e.target.value)}
                      required
                    >
                      {jobs.length === 0 ? (
                        <option value="">Aucune offre disponible</option>
                      ) : (
                        jobs.map((job) => (
                          <option key={job.id} value={job.id}>
                            {job.title} - {job.department}
                          </option>
                        ))
                      )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    onClick={() => setCreateJobMode(true)}
                    title="Créer un nouveau poste"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 p-3 border-2 border-primary/20 rounded-lg bg-primary/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">Création rapide d'un poste</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCreateJobMode(false);
                        setNewJobTitle('');
                        setNewJobDepartment('');
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Titre du poste (ex: Développeur Full Stack)"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    required={createJobMode}
                  />
                  <Input
                    placeholder="Département (ex: Technologie)"
                    value={newJobDepartment}
                    onChange={(e) => setNewJobDepartment(e.target.value)}
                    required={createJobMode}
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      if (newJobTitle && newJobDepartment) {
                        const newJob = {
                          id: Date.now().toString(),
                          title: newJobTitle,
                          department: newJobDepartment,
                          status: 'active',
                          type: 'full-time',
                          location: 'À définir',
                          description: '',
                          requirements: [],
                          createdAt: new Date().toISOString()
                        };

                        // Sauvegarder dans localStorage
                        const existingJobs = JSON.parse(localStorage.getItem('jobPostings') || '[]');
                        existingJobs.push(newJob);
                        localStorage.setItem('jobPostings', JSON.stringify(existingJobs));

                        // Sélectionner le nouveau poste
                        setJobId(newJob.id);
                        setCreateJobMode(false);
                        setNewJobTitle('');
                        setNewJobDepartment('');

                        // Recharger la page pour mettre à jour la liste
                        window.location.reload();
                      }
                    }}
                    disabled={!newJobTitle || !newJobDepartment}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Créer et sélectionner
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stage">
                Étape du processus <span className="text-red-500">*</span>
              </Label>
              <select
                id="stage"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                value={stage}
                onChange={(e) => setStage(e.target.value as any)}
                required
              >
                <option value="applied">Candidature</option>
                <option value="screening">Présélection</option>
                <option value="interview">Entretien</option>
                <option value="offer">Offre</option>
                <option value="hired">Embauché</option>
                <option value="rejected">Refusé</option>
              </select>
            </div>
          </div>

          {/* Profils en ligne */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin">Profil LinkedIn</Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/jeandupont"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>
          </div>

          {/* Pièces jointes additionnelles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Pièces jointes
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => attachmentsInputRef.current?.click()}
              >
                <File className="mr-2 h-4 w-4" />
                Ajouter fichier
              </Button>
              <input
                ref={attachmentsInputRef}
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleAttachmentsUpload}
              />
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-2 p-2 bg-muted/50 rounded border"
                  >
                    <File className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(attachment.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Lettres de recommandation, certificats, portfolio, etc.
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes internes</Label>
            <Textarea
              id="notes"
              placeholder="Ajoutez des notes sur le candidat, compétences particulières, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={jobs.length === 0}>
              <UserPlus className="mr-2 h-4 w-4" />
              Ajouter le candidat
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
