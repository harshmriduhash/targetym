'use client';

import { useState, useEffect } from 'react';
import { CandidateSelectorEnhanced } from '@/components/recruitment/CandidateSelectorEnhanced';
import { getCandidates } from '@/src/actions/recruitment/get-candidates';
import { getJobPostings } from '@/src/actions/recruitment/get-job-postings';
import { scheduleInterview } from '@/src/actions/recruitment/schedule-interview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
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

export default function ScheduleInterviewPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Interview form state
  const [interviewType, setInterviewType] = useState<'phone_screen' | 'technical' | 'behavioral' | 'cultural_fit' | 'final'>('phone_screen');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [interviewerId, setInterviewerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load candidates and jobs
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [candidatesResult, jobsResult] = await Promise.all([
        getCandidates(),
        getJobPostings({ status: 'active' })
      ]);

      if (candidatesResult.success) {
        setCandidates(candidatesResult.data.items || []);
      }

      if (jobsResult.success) {
        setJobs(jobsResult.data.items || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  }

  const handleCandidateCreated = (newCandidate: Candidate) => {
    setCandidates(prev => [...prev, newCandidate]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCandidate) {
      toast.error('Veuillez sélectionner un candidat');
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      toast.error('Veuillez renseigner la date et l\'heure de l\'entretien');
      return;
    }

    setIsSubmitting(true);

    try {
      const scheduledAt = `${scheduledDate}T${scheduledTime}:00`;

      const result = await scheduleInterview({
        candidate_id: selectedCandidate.id,
        job_posting_id: selectedCandidate.job_posting_id,
        interviewer_id: interviewerId || '', // In a real app, get from auth context
        interview_type: interviewType,
        scheduled_at: scheduledAt,
        duration_minutes: duration,
        location: location || 'Remote',
        meeting_link: meetingLink
      });

      if (!result.success) {
        toast.error(result.error.message);
        return;
      }

      toast.success('Entretien planifié avec succès !');

      // Reset form
      setSelectedCandidate(null);
      setScheduledDate('');
      setScheduledTime('');
      setLocation('');
      setMeetingLink('');
      setInterviewType('phone_screen');
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('Erreur lors de la planification de l\'entretien');
    } finally {
      setIsSubmitting(false);
    }
  };

  const interviewTypes = [
    { value: 'phone_screen', label: 'Entretien téléphonique' },
    { value: 'technical', label: 'Entretien technique' },
    { value: 'behavioral', label: 'Entretien comportemental' },
    { value: 'cultural_fit', label: 'Entretien culturel' },
    { value: 'final', label: 'Entretien final' }
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Planifier un entretien</h1>
        <p className="text-muted-foreground mt-2">
          Sélectionnez ou créez un candidat, puis planifiez un entretien
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Candidate Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Sélection du candidat</CardTitle>
            <CardDescription>
              Choisissez un candidat existant ou créez-en un nouveau
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CandidateSelectorEnhanced
              candidates={candidates}
              jobs={jobs}
              selectedCandidate={selectedCandidate}
              onSelectCandidate={setSelectedCandidate}
              onCandidateCreated={handleCandidateCreated}
            />
          </CardContent>
        </Card>

        {/* Interview Details */}
        <Card>
          <CardHeader>
            <CardTitle>Détails de l&apos;entretien</CardTitle>
            <CardDescription>
              Configurez les informations de l&apos;entretien
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedCandidate ? (
              <div className="flex items-center justify-center h-64 text-center text-muted-foreground">
                <div>
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sélectionnez un candidat pour continuer</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="interview_type">Type d&apos;entretien</Label>
                  <select
                    id="interview_type"
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    {interviewTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="date"
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Heure</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="time"
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Durée (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    max="240"
                    step="15"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Lieu</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="Ex: Bureau Paris, Remote, etc."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting_link">Lien de réunion (optionnel)</Label>
                  <Input
                    id="meeting_link"
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Planification...' : 'Planifier l\'entretien'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
