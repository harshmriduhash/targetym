'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, Plus, Users, TrendingUp, Clock, FileText, Paperclip, Award } from "lucide-react"
import { JobCard } from '@/components/recruitment/JobCard';
import { InterviewCard, type Interview } from '@/components/recruitment/InterviewCard';

// ✅ OPTIMIZED: Dynamic imports for modal components
// Modals are only loaded when user clicks to open them
const CreateJobModal = dynamic(
  () => import('@/components/recruitment/CreateJobModal').then((mod) => mod.CreateJobModal),
  { ssr: false }
);

const JobsListModal = dynamic(
  () => import('@/components/recruitment/JobsListModal').then((mod) => mod.JobsListModal),
  { ssr: false }
);

const CandidatePipelineModal = dynamic(
  () => import('@/components/recruitment/CandidatePipelineModal').then((mod) => mod.CandidatePipelineModal),
  { ssr: false }
);

const AddCandidateModal = dynamic(
  () => import('@/components/recruitment/AddCandidateModal').then((mod) => mod.AddCandidateModal),
  { ssr: false }
);

const ScheduleInterviewModal = dynamic(
  () => import('@/components/recruitment/ScheduleInterviewModal'),
  { ssr: false }
);

const InterviewsListModal = dynamic(
  () => import('@/components/recruitment/InterviewsListModal').then((mod) => mod.InterviewsListModal),
  { ssr: false }
);

export default function RecruitmentPage() {
  const [jobPostings, setJobPostings] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [showJobsListModal, setShowJobsListModal] = useState(false);
  const [showCandidatePipelineModal, setShowCandidatePipelineModal] = useState(false);
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [showScheduleInterviewModal, setShowScheduleInterviewModal] = useState(false);
  const [showInterviewsListModal, setShowInterviewsListModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // Charger les données depuis localStorage au montage
  useEffect(() => {
    const storedJobs = localStorage.getItem('jobPostings');
    const storedCandidates = localStorage.getItem('candidates');

    if (storedJobs) {
      setJobPostings(JSON.parse(storedJobs));
    }
    if (storedCandidates) {
      setCandidates(JSON.parse(storedCandidates));
    }
  }, []);

  // Fonction pour créer ou mettre à jour une offre
  const handleJobCreated = (newJob: any) => {
    const updatedJobs = [...jobPostings, newJob];
    setJobPostings(updatedJobs);
    localStorage.setItem('jobPostings', JSON.stringify(updatedJobs));
  };

  // Fonction pour modifier une offre
  const handleJobEdited = (updatedJob: any) => {
    const updatedJobs = jobPostings.map(job =>
      job.id === updatedJob.id ? updatedJob : job
    );
    setJobPostings(updatedJobs);
    localStorage.setItem('jobPostings', JSON.stringify(updatedJobs));
  };

  // Fonction pour supprimer une offre
  const handleDeleteJob = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      const updatedJobs = jobPostings.filter(job => job.id !== id);
      setJobPostings(updatedJobs);
      localStorage.setItem('jobPostings', JSON.stringify(updatedJobs));
    }
  };

  // Fonction pour ajouter un candidat
  const handleCandidateAdded = (newCandidate: any) => {
    const updatedCandidates = [...candidates, newCandidate];
    setCandidates(updatedCandidates);
    localStorage.setItem('candidates', JSON.stringify(updatedCandidates));

    // Mettre à jour le compteur de candidats pour l'offre
    const updatedJobs = jobPostings.map(job =>
      job.id === newCandidate.jobId
        ? { ...job, candidatesCount: (job.candidatesCount || 0) + 1 }
        : job
    );
    setJobPostings(updatedJobs);
    localStorage.setItem('jobPostings', JSON.stringify(updatedJobs));
  };

  // Fonction pour mettre à jour l'étape d'un candidat
  const handleUpdateCandidateStage = (candidateId: string, newStage: string) => {
    const updatedCandidates = candidates.map(candidate =>
      candidate.id === candidateId
        ? { ...candidate, stage: newStage }
        : candidate
    );
    setCandidates(updatedCandidates);
    localStorage.setItem('candidates', JSON.stringify(updatedCandidates));
  };

  // Fonction pour planifier un entretien
  const handleInterviewScheduled = (candidateId: string, interview: any) => {
    const updatedCandidates = candidates.map(candidate =>
      candidate.id === candidateId
        ? {
            ...candidate,
            interviews: [...(candidate.interviews || []), interview],
            stage: candidate.stage === 'applied' || candidate.stage === 'screening'
              ? 'interview'
              : candidate.stage
          }
        : candidate
    );
    setCandidates(updatedCandidates);
    localStorage.setItem('candidates', JSON.stringify(updatedCandidates));
  };

  // Fonction pour extraire tous les entretiens
  const getAllInterviews = (): Interview[] => {
    const allInterviews: Interview[] = [];

    candidates.forEach(candidate => {
      if (candidate.interviews && candidate.interviews.length > 0) {
        candidate.interviews.forEach((interview: any) => {
          const job = jobPostings.find(j => j.id === candidate.jobId);
          allInterviews.push({
            ...interview,
            candidateId: candidate.id,
            candidateName: candidate.name,
            jobTitle: job?.title || 'Poste inconnu'
          });
        });
      }
    });

    return allInterviews;
  };

  // Fonction pour annuler un entretien
  const handleCancelInterview = (interviewId: string) => {
    if (confirm('Êtes-vous sûr de vouloir annuler cet entretien ?')) {
      const updatedCandidates = candidates.map(candidate => ({
        ...candidate,
        interviews: (candidate.interviews || []).map((interview: any) =>
          interview.id === interviewId
            ? { ...interview, status: 'cancelled' }
            : interview
        )
      }));
      setCandidates(updatedCandidates);
      localStorage.setItem('candidates', JSON.stringify(updatedCandidates));
    }
  };

  // Extraire et calculer les statistiques des entretiens
  const allInterviews = getAllInterviews();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const interviewStats = {
    total: allInterviews.filter(i => i.status === 'scheduled').length,
    today: allInterviews.filter(i => {
      const interviewDate = new Date(i.scheduledAt);
      const interviewDay = new Date(interviewDate.getFullYear(), interviewDate.getMonth(), interviewDate.getDate());
      return i.status === 'scheduled' && interviewDay.getTime() === today.getTime();
    }).length,
    thisWeek: allInterviews.filter(i => {
      const interviewDate = new Date(i.scheduledAt);
      return i.status === 'scheduled' && interviewDate >= today && interviewDate < nextWeek;
    }).length
  };

  // Calculer les statistiques
  const stats = {
    totalJobs: jobPostings.length,
    activeJobs: jobPostings.filter(job => job.status === 'active').length,
    totalCandidates: candidates.length,
    newCandidates: candidates.filter(c => c.stage === 'applied').length,
    inInterview: candidates.filter(c => c.stage === 'interview').length,
    offersExtended: candidates.filter(c => c.stage === 'offer').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recrutement</h1>
          <p className="text-muted-foreground mt-1">
            Pipeline de candidats et gestion des offres d'emploi
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCandidatePipelineModal(true)}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Pipeline
          </Button>
          <Button onClick={() => setShowCreateJobModal(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle offre
          </Button>
        </div>
      </div>

      {/* Stats Cards - Style Targetym */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Offres</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">Postes ouverts</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Actives</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeJobs}</div>
            <p className="text-xs text-muted-foreground mt-1">En recrutement</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Candidats</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalCandidates}</div>
            <p className="text-xs text-muted-foreground mt-1">Total</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nouveaux</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{stats.newCandidates}</div>
            <p className="text-xs text-muted-foreground mt-1">Candidatures</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Entretiens</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.inInterview}</div>
            <p className="text-xs text-muted-foreground mt-1">En cours</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Offres</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-pink-600">
              <Award className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">{stats.offersExtended}</div>
            <p className="text-xs text-muted-foreground mt-1">Proposées</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card className="bg-white dark:bg-slate-900 border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Actions rapides</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="justify-start hover:bg-accent" onClick={() => setShowCreateJobModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Créer une offre
            </Button>
            <Button variant="outline" className="justify-start hover:bg-accent" onClick={() => setShowAddCandidateModal(true)}>
              <Users className="mr-2 h-4 w-4" />
              Ajouter candidat
            </Button>
            <Button variant="outline" className="justify-start hover:bg-accent" onClick={() => setShowScheduleInterviewModal(true)}>
              <Clock className="mr-2 h-4 w-4" />
              Planifier entretien
            </Button>
            <Button variant="outline" className="justify-start hover:bg-accent" onClick={() => setShowCandidatePipelineModal(true)}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Voir pipeline
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grille principale - 3 colonnes */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Offres d'emploi */}
        <Card className="bg-white dark:bg-slate-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base">Offres d'emploi</CardTitle>
                  <CardDescription className="text-xs">
                    {jobPostings.length} offre{jobPostings.length > 1 ? 's' : ''} • {stats.activeJobs} active{stats.activeJobs > 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
              <Button onClick={() => setShowJobsListModal(true)} variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {jobPostings.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-muted">
                  <Briefcase className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">Aucune offre d'emploi</p>
                <Button onClick={() => setShowCreateJobModal(true)} size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600">
                  <Plus className="mr-2 h-3 w-3" />
                  Créer une offre
                </Button>
              </div>
            ) : (
              <>
                <div className="max-h-[320px] overflow-y-auto space-y-2 pr-2">
                  {jobPostings.map((job) => (
                    <div
                      key={job.id}
                      className="p-3 border rounded-lg hover:bg-muted/30 transition-all hover:shadow-sm cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">{job.title}</p>
                            <div className={`h-2 w-2 rounded-full ${
                              job.status === 'active' ? 'bg-green-500' :
                              job.status === 'draft' ? 'bg-gray-400' : 'bg-red-500'
                            }`} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 truncate">{job.department}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  className="w-full mt-3"
                  size="sm"
                  onClick={() => setShowJobsListModal(true)}
                >
                  Voir toutes les offres ({jobPostings.length})
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Entretiens planifiés */}
        <Card className="bg-white dark:bg-slate-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base">Entretiens</CardTitle>
                  <CardDescription className="text-xs">
                    {interviewStats.total} planifié{interviewStats.total > 1 ? 's' : ''} • {interviewStats.today} aujourd'hui
                  </CardDescription>
                </div>
              </div>
              <Button onClick={() => setShowInterviewsListModal(true)} variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {allInterviews.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-muted">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">Aucun entretien planifié</p>
                <Button onClick={() => setShowScheduleInterviewModal(true)} size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600">
                  <Plus className="mr-2 h-3 w-3" />
                  Planifier un entretien
                </Button>
              </div>
            ) : (
              <>
                <div className="max-h-[320px] overflow-y-auto space-y-2 pr-2">
                  {allInterviews
                    .filter(i => i.status === 'scheduled' && new Date(i.scheduledAt) >= now)
                    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                    .map((interview) => {
                      const interviewDate = new Date(interview.scheduledAt);
                      const isToday = interviewDate.toDateString() === now.toDateString();

                      return (
                        <div
                          key={interview.id}
                          className={`p-3 border rounded-lg hover:bg-muted/30 transition-all hover:shadow-sm ${
                            isToday ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/10' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm truncate">{interview.candidateName}</p>
                                {isToday && (
                                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {interviewDate.toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short'
                                })} • {interviewDate.toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
                <Button
                  variant="ghost"
                  className="w-full mt-3"
                  size="sm"
                  onClick={() => setShowInterviewsListModal(true)}
                >
                  Voir tous les entretiens ({interviewStats.total})
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Candidats */}
        <Card className="bg-white dark:bg-slate-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base">Candidats</CardTitle>
                  <CardDescription className="text-xs">
                    {candidates.length} candidat{candidates.length > 1 ? 's' : ''} • {stats.newCandidates} nouveau{stats.newCandidates > 1 ? 'x' : ''}
                  </CardDescription>
                </div>
              </div>
              <Button onClick={() => setShowAddCandidateModal(true)} variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {candidates.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-muted">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">Aucun candidat</p>
                <Button onClick={() => setShowAddCandidateModal(true)} size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600">
                  <Plus className="mr-2 h-3 w-3" />
                  Ajouter un candidat
                </Button>
              </div>
            ) : (
              <>
                <div className="max-h-[320px] overflow-y-auto space-y-2 pr-2">
                  {candidates.map((candidate) => {
                    const job = jobPostings.find(j => j.id === candidate.jobId);
                    const stageDots = {
                      applied: 'bg-blue-500',
                      screening: 'bg-yellow-500',
                      interview: 'bg-orange-500',
                      offer: 'bg-purple-500',
                      hired: 'bg-green-500',
                      rejected: 'bg-red-500'
                    };

                    return (
                      <div
                        key={candidate.id}
                        className="p-3 border rounded-lg hover:bg-muted/30 transition-all hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${stageDots[candidate.stage as keyof typeof stageDots]}`} />
                              <p className="font-medium text-sm truncate">{candidate.name}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {job?.title || 'Poste inconnu'}
                            </p>
                          </div>
                          {candidate.attachments && candidate.attachments.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Paperclip className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {candidate.attachments.length}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button
                  variant="ghost"
                  className="w-full mt-3"
                  size="sm"
                  onClick={() => setShowCandidatePipelineModal(true)}
                >
                  Voir tous les candidats ({candidates.length})
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CreateJobModal
        open={showCreateJobModal}
        onOpenChange={setShowCreateJobModal}
        onJobCreated={handleJobCreated}
      />

      {selectedJob && showEditJobModal && (
        <CreateJobModal
          open={showEditJobModal}
          onOpenChange={setShowEditJobModal}
          onJobCreated={handleJobEdited}
          editMode={true}
          initialJob={selectedJob}
        />
      )}

      <JobsListModal
        open={showJobsListModal}
        onOpenChange={setShowJobsListModal}
        jobs={jobPostings}
        onEdit={(job) => {
          setSelectedJob(job);
          setShowJobsListModal(false);
          setShowEditJobModal(true);
        }}
        onDelete={handleDeleteJob}
      />

      <CandidatePipelineModal
        open={showCandidatePipelineModal}
        onOpenChange={setShowCandidatePipelineModal}
        candidates={candidates}
        jobs={jobPostings}
        onAddCandidate={() => {
          setShowCandidatePipelineModal(false);
          setShowAddCandidateModal(true);
        }}
        onScheduleInterview={(candidate) => {
          setSelectedCandidate(candidate);
          setShowCandidatePipelineModal(false);
          setShowScheduleInterviewModal(true);
        }}
        onUpdateStage={handleUpdateCandidateStage}
      />

      <AddCandidateModal
        open={showAddCandidateModal}
        onOpenChange={setShowAddCandidateModal}
        jobs={jobPostings}
        onCandidateAdded={handleCandidateAdded}
      />

      <ScheduleInterviewModal
        open={showScheduleInterviewModal}
        onOpenChange={setShowScheduleInterviewModal}
        candidate={selectedCandidate}
        onInterviewScheduled={handleInterviewScheduled}
      />

      <InterviewsListModal
        open={showInterviewsListModal}
        onOpenChange={setShowInterviewsListModal}
        interviews={allInterviews}
        onCancel={handleCancelInterview}
      />
    </div>
  )
}
