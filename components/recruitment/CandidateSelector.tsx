'use client';

import { useState, useRef } from 'react';
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
  Briefcase
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  jobId: string;
  jobTitle?: string;
  stage: string;
  cvUrl?: string;
  linkedinUrl?: string;
  notes?: string;
  aiScore?: number;
}

interface CandidateSelectorProps {
  candidates: Candidate[];
  jobs: any[];
  selectedCandidate: Candidate | null;
  onSelectCandidate: (candidate: Candidate) => void;
  onCreateCandidate?: (candidate: Candidate) => void;
}

export function CandidateSelector({
  candidates,
  jobs,
  selectedCandidate,
  onSelectCandidate,
  onCreateCandidate
}: CandidateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('select');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states for new candidate
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobId, setJobId] = useState(jobs.length > 0 ? jobs[0].id : '');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [notes, setNotes] = useState('');

  // CV parsing states
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  // Filter candidates based on search
  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCandidate = () => {
    if (!name || !email || !jobId) return;

    const newCandidate: Candidate = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      jobId,
      jobTitle: jobs.find(j => j.id === jobId)?.title,
      stage: 'applied',
      linkedinUrl,
      notes,
      aiScore: null
    };

    if (onCreateCandidate) {
      onCreateCandidate(newCandidate);
    }
    onSelectCandidate(newCandidate);

    // Reset form
    setName('');
    setEmail('');
    setPhone('');
    setLinkedinUrl('');
    setNotes('');
    setActiveTab('select');
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCvFile(file);
    setIsParsing(true);

    // Simulate CV parsing (à remplacer par une vraie API d'analyse de CV)
    setTimeout(() => {
      const mockParsedData = {
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        phone: '+33 6 12 34 56 78',
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: '5 ans d\'expérience en développement web',
        linkedin: 'https://linkedin.com/in/jeandupont'
      };

      setParsedData(mockParsedData);
      setName(mockParsedData.name);
      setEmail(mockParsedData.email);
      setPhone(mockParsedData.phone);
      setLinkedinUrl(mockParsedData.linkedin);
      setNotes(`Compétences: ${mockParsedData.skills.join(', ')}\n\n${mockParsedData.experience}`);
      setIsParsing(false);
      setActiveTab('create');
    }, 2000);
  };

  const stageLabels: Record<string, string> = {
    applied: 'Candidature',
    screening: 'Présélection',
    interview: 'Entretien',
    offer: 'Offre',
    hired: 'Embauché',
    rejected: 'Refusé'
  };

  const stageColors: Record<string, string> = {
    applied: 'bg-blue-100 text-blue-700',
    screening: 'bg-yellow-100 text-yellow-700',
    interview: 'bg-purple-100 text-purple-700',
    offer: 'bg-green-100 text-green-700',
    hired: 'bg-green-500 text-white',
    rejected: 'bg-red-100 text-red-700'
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
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onSelectCandidate(null as any)}
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
                      <Badge variant="outline" className={stageColors[candidate.stage]}>
                        {stageLabels[candidate.stage]}
                      </Badge>
                    </div>
                  </button>
                ))
              )}
            </div>
          </TabsContent>

          {/* Create new candidate */}
          <TabsContent value="create" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-name">
                  Nom complet <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="new-name"
                  placeholder="Ex: Jean Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="new-email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-phone">Téléphone</Label>
                  <Input
                    id="new-phone"
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-job">
                  Poste visé <span className="text-red-500">*</span>
                </Label>
                <select
                  id="new-job"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                >
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} - {job.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-linkedin">Profil LinkedIn</Label>
                <Input
                  id="new-linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-notes">Notes</Label>
                <Textarea
                  id="new-notes"
                  placeholder="Compétences, expérience, remarques..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                type="button"
                onClick={handleCreateCandidate}
                disabled={!name || !email || !jobId}
                className="w-full"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Créer et sélectionner
              </Button>
            </div>
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
              />
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">
                {isParsing ? 'Analyse du CV en cours...' : 'Importer un CV'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Formats acceptés: PDF, DOC, DOCX (max 10MB)
              </p>
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isParsing}
              >
                {isParsing ? 'Analyse...' : 'Choisir un fichier'}
              </Button>
              {parsedData && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-left">
                  <p className="text-sm text-green-700">
                    ✓ CV analysé avec succès. Les informations ont été pré-remplies dans l&apos;onglet Créer.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}