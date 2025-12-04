'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, TrendingUp, UserPlus, Plus, List, BarChart3 } from "lucide-react";
import CreateCareerPathModal from "@/components/career/CreateCareerPathModal";
import CreateInternalJobModal from "@/components/career/CreateInternalJobModal";
import CreateSuccessionPlanModal from "@/components/career/CreateSuccessionPlanModal";
import CreateOnboardingModal from "@/components/career/CreateOnboardingModal";
import CareerPathsListModal from "@/components/career/CareerPathsListModal";
import InternalJobsListModal from "@/components/career/InternalJobsListModal";
import SuccessionPlansListModal from "@/components/career/SuccessionPlansListModal";
import OnboardingListModal from "@/components/career/OnboardingListModal";
import CareerAnalyticsModal from "@/components/career/CareerAnalyticsModal";

export default function CareerPage() {
  const [careerPaths, setCareerPaths] = useState<any[]>([]);
  const [internalJobs, setInternalJobs] = useState<any[]>([]);
  const [successionPlans, setSuccessionPlans] = useState<any[]>([]);
  const [onboardingPlans, setOnboardingPlans] = useState<any[]>([]);

  const [showCreateCareerPath, setShowCreateCareerPath] = useState(false);
  const [showCreateInternalJob, setShowCreateInternalJob] = useState(false);
  const [showCreateSuccession, setShowCreateSuccession] = useState(false);
  const [showCreateOnboarding, setShowCreateOnboarding] = useState(false);

  const [showCareerPathsList, setShowCareerPathsList] = useState(false);
  const [showInternalJobsList, setShowInternalJobsList] = useState(false);
  const [showSuccessionList, setShowSuccessionList] = useState(false);
  const [showOnboardingList, setShowOnboardingList] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    const paths = JSON.parse(localStorage.getItem('careerPaths') || '[]');
    const jobs = JSON.parse(localStorage.getItem('internalJobs') || '[]');
    const plans = JSON.parse(localStorage.getItem('successionPlans') || '[]');
    const onboarding = JSON.parse(localStorage.getItem('onboardingPlans') || '[]');

    setCareerPaths(paths);
    setInternalJobs(jobs);
    setSuccessionPlans(plans);
    setOnboardingPlans(onboarding);
  }, []);

  const stats = {
    activeCareerPaths: careerPaths.filter(p => p.status === 'active').length,
    openPositions: internalJobs.filter(j => j.status === 'open').length,
    successionPlansActive: successionPlans.filter(p => p.readiness === 'ready' || p.readiness === 'developing').length,
    onboardingInProgress: onboardingPlans.filter(o => o.status === 'in_progress').length,
    totalCareerPaths: careerPaths.length,
    totalApplications: internalJobs.reduce((acc, job) => acc + (job.applications || 0), 0),
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          Carrière & Gestion des Talents
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">Module</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Gérez les parcours de carrière, mobilité interne et plans de succession
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parcours actifs</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.activeCareerPaths}</div>
            <p className="text-xs text-muted-foreground">Sur {stats.totalCareerPaths} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Postes ouverts</CardTitle>
            <Briefcase className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.openPositions}</div>
            <p className="text-xs text-muted-foreground">{stats.totalApplications} candidatures</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plans de succession</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.successionPlansActive}</div>
            <p className="text-xs text-muted-foreground">Successeurs identifiés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onboarding en cours</CardTitle>
            <UserPlus className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.onboardingInProgress}</div>
            <p className="text-xs text-muted-foreground">Nouveaux employés</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>Gérez rapidement vos activités de carrière et talents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button onClick={() => setShowCreateCareerPath(true)} className="h-auto flex flex-col gap-2 py-4">
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs">Nouveau parcours</span>
            </Button>
            <Button onClick={() => setShowCreateInternalJob(true)} variant="outline" className="h-auto flex flex-col gap-2 py-4">
              <Briefcase className="h-5 w-5" />
              <span className="text-xs">Publier poste</span>
            </Button>
            <Button onClick={() => setShowCreateSuccession(true)} variant="outline" className="h-auto flex flex-col gap-2 py-4">
              <Users className="h-5 w-5" />
              <span className="text-xs">Plan succession</span>
            </Button>
            <Button onClick={() => setShowCreateOnboarding(true)} variant="outline" className="h-auto flex flex-col gap-2 py-4">
              <UserPlus className="h-5 w-5" />
              <span className="text-xs">Onboarding</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Parcours de carrière */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Parcours de carrière</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => setShowCareerPathsList(true)}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {careerPaths.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Aucun parcours créé</p>
              ) : (
                careerPaths.slice(0, 3).map((path) => (
                  <div key={path.id} className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{path.employeeName}</h4>
                        <p className="text-xs text-muted-foreground">{path.currentRole} → {path.targetRole}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all"
                              style={{ width: `${path.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{path.progress || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mobilité interne */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Mobilité interne</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => setShowInternalJobsList(true)}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {internalJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Aucun poste publié</p>
              ) : (
                internalJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{job.title}</h4>
                        <p className="text-xs text-muted-foreground">{job.department}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            job.status === 'open'
                              ? 'bg-green-100 text-green-700'
                              : job.status === 'filled'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {job.status === 'open' ? 'Ouvert' : job.status === 'filled' ? 'Pourvu' : 'Fermé'}
                          </span>
                          <span className="text-xs text-muted-foreground">{job.applications || 0} candidatures</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Plans de succession */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Plans de succession</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => setShowSuccessionList(true)}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {successionPlans.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Aucun plan créé</p>
              ) : (
                successionPlans.slice(0, 3).map((plan) => (
                  <div key={plan.id} className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{plan.criticalRole}</h4>
                        <p className="text-xs text-muted-foreground">Successeur: {plan.successorName}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            plan.readiness === 'ready'
                              ? 'bg-green-100 text-green-700'
                              : plan.readiness === 'developing'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {plan.readiness === 'ready' ? 'Prêt' : plan.readiness === 'developing' ? 'En cours' : 'Non prêt'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Programme d'intégration (Onboarding)</CardTitle>
              <CardDescription>Suivez l'intégration des nouveaux employés</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => setShowOnboardingList(true)}>
              <List className="h-4 w-4 mr-2" />
              Voir tout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {onboardingPlans.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-full text-center py-8">Aucun onboarding en cours</p>
            ) : (
              onboardingPlans.slice(0, 3).map((plan) => (
                <div key={plan.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <UserPlus className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{plan.employeeName}</h4>
                      <p className="text-xs text-muted-foreground">{plan.position}</p>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progression</span>
                          <span className="font-medium">{plan.progress || 0}%</span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-600 rounded-full transition-all"
                            style={{ width: `${plan.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowAnalytics(true)} variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          Voir les analytiques
        </Button>
      </div>

      {/* Modals */}
      <CreateCareerPathModal
        open={showCreateCareerPath}
        onOpenChange={setShowCreateCareerPath}
        onSave={() => {
          const paths = JSON.parse(localStorage.getItem('careerPaths') || '[]');
          setCareerPaths(paths);
        }}
      />
      <CreateInternalJobModal
        open={showCreateInternalJob}
        onOpenChange={setShowCreateInternalJob}
        onSave={() => {
          const jobs = JSON.parse(localStorage.getItem('internalJobs') || '[]');
          setInternalJobs(jobs);
        }}
      />
      <CreateSuccessionPlanModal
        open={showCreateSuccession}
        onOpenChange={setShowCreateSuccession}
        onSave={() => {
          const plans = JSON.parse(localStorage.getItem('successionPlans') || '[]');
          setSuccessionPlans(plans);
        }}
      />
      <CreateOnboardingModal
        open={showCreateOnboarding}
        onOpenChange={setShowCreateOnboarding}
        onSave={() => {
          const plans = JSON.parse(localStorage.getItem('onboardingPlans') || '[]');
          setOnboardingPlans(plans);
        }}
      />

      <CareerPathsListModal
        open={showCareerPathsList}
        onOpenChange={setShowCareerPathsList}
        careerPaths={careerPaths}
      />
      <InternalJobsListModal
        open={showInternalJobsList}
        onOpenChange={setShowInternalJobsList}
        jobs={internalJobs}
      />
      <SuccessionPlansListModal
        open={showSuccessionList}
        onOpenChange={setShowSuccessionList}
        plans={successionPlans}
      />
      <OnboardingListModal
        open={showOnboardingList}
        onOpenChange={setShowOnboardingList}
        plans={onboardingPlans}
      />
      <CareerAnalyticsModal
        open={showAnalytics}
        onOpenChange={setShowAnalytics}
        careerPaths={careerPaths}
        internalJobs={internalJobs}
        successionPlans={successionPlans}
        onboardingPlans={onboardingPlans}
      />
    </div>
  );
}
