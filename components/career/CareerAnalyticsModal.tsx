'use client';

import { useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Briefcase, UserPlus, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface CareerAnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  careerPaths: any[];
  internalJobs: any[];
  successionPlans: any[];
  onboardingPlans: any[];
}

export default function CareerAnalyticsModal({
  open,
  onOpenChange,
  careerPaths,
  internalJobs,
  successionPlans,
  onboardingPlans,
}: CareerAnalyticsModalProps) {
  const analytics = useMemo(() => {
    // Career Paths Analytics
    const activePathsCount = careerPaths.filter(p => p.status === 'active').length;
    const avgProgress = careerPaths.length > 0
      ? (careerPaths.reduce((acc, p) => acc + (p.progress || 0), 0) / careerPaths.length).toFixed(0)
      : 0;

    // Internal Jobs Analytics
    const openJobs = internalJobs.filter(j => j.status === 'open').length;
    const filledJobs = internalJobs.filter(j => j.status === 'filled').length;
    const totalApplications = internalJobs.reduce((acc, j) => acc + (j.applications || 0), 0);
    const avgApplicationsPerJob = internalJobs.length > 0
      ? (totalApplications / internalJobs.length).toFixed(1)
      : 0;

    // Succession Plans Analytics
    const readySuccessors = successionPlans.filter(p => p.readiness === 'ready').length;
    const developingSuccessors = successionPlans.filter(p => p.readiness === 'developing').length;
    const criticalRisks = successionPlans.filter(p => p.riskLevel === 'critical' || p.riskLevel === 'high').length;

    const readinessDistribution = {
      ready: successionPlans.filter(p => p.readiness === 'ready').length,
      developing: successionPlans.filter(p => p.readiness === 'developing').length,
      emerging: successionPlans.filter(p => p.readiness === 'emerging').length,
      notReady: successionPlans.filter(p => p.readiness === 'not-ready').length,
    };

    // Onboarding Analytics
    const activeOnboarding = onboardingPlans.filter(p => p.status === 'in_progress').length;
    const completedOnboarding = onboardingPlans.filter(p => p.status === 'completed').length;
    const avgOnboardingProgress = onboardingPlans.length > 0
      ? (onboardingPlans.reduce((acc, p) => acc + (p.progress || 0), 0) / onboardingPlans.length).toFixed(0)
      : 0;

    return {
      careerPaths: {
        total: careerPaths.length,
        active: activePathsCount,
        avgProgress,
      },
      mobility: {
        totalJobs: internalJobs.length,
        openJobs,
        filledJobs,
        totalApplications,
        avgApplicationsPerJob,
      },
      succession: {
        total: successionPlans.length,
        readySuccessors,
        developingSuccessors,
        criticalRisks,
        readinessDistribution,
      },
      onboarding: {
        total: onboardingPlans.length,
        active: activeOnboarding,
        completed: completedOnboarding,
        avgProgress: avgOnboardingProgress,
      },
    };
  }, [careerPaths, internalJobs, successionPlans, onboardingPlans]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Analytiques Carrière & Talents</DialogTitle>
          <DialogDescription>
            Vue d'ensemble des parcours de carrière, mobilité et succession
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="paths">Parcours</TabsTrigger>
            <TabsTrigger value="mobility">Mobilité</TabsTrigger>
            <TabsTrigger value="succession">Succession</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Parcours actifs</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{analytics.careerPaths.active}</div>
                  <p className="text-xs text-muted-foreground">Sur {analytics.careerPaths.total} total</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Postes ouverts</CardTitle>
                    <Briefcase className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{analytics.mobility.openJobs}</div>
                  <p className="text-xs text-muted-foreground">{analytics.mobility.totalApplications} candidatures</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Successeurs prêts</CardTitle>
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{analytics.succession.readySuccessors}</div>
                  <p className="text-xs text-muted-foreground">Sur {analytics.succession.total} plans</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Onboarding actifs</CardTitle>
                    <UserPlus className="h-4 w-4 text-amber-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{analytics.onboarding.active}</div>
                  <p className="text-xs text-muted-foreground">{analytics.onboarding.avgProgress}% progression moy.</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risques de succession</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.succession.criticalRisks > 0 ? (
                  <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded">
                      <Users className="h-5 w-5 text-red-600 dark:text-red-300" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-red-900 dark:text-red-100">
                        {analytics.succession.criticalRisks} postes à risque élevé
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Action requise pour identifier et développer des successeurs
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded">
                      <Users className="h-5 w-5 text-green-600 dark:text-green-300" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-900 dark:text-green-100">
                        Aucun risque critique identifié
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Les plans de succession sont bien couverts
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Career Paths Tab */}
          <TabsContent value="paths" className="space-y-4 max-h-[60vh] overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Statistiques des parcours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total parcours</p>
                    <p className="text-2xl font-bold">{analytics.careerPaths.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Parcours actifs</p>
                    <p className="text-2xl font-bold text-blue-600">{analytics.careerPaths.active}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Progression moyenne</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.careerPaths.avgProgress}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Parcours récents</CardTitle>
              </CardHeader>
              <CardContent>
                {careerPaths.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Aucun parcours créé</p>
                ) : (
                  <div className="space-y-2">
                    {careerPaths.slice(0, 5).map((path) => (
                      <div key={path.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium text-sm">{path.employeeName}</p>
                          <p className="text-xs text-muted-foreground">{path.currentRole} → {path.targetRole}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-blue-600">{path.progress || 0}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mobility Tab */}
          <TabsContent value="mobility" className="space-y-4 max-h-[60vh] overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Statistiques de mobilité interne</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total postes</p>
                    <p className="text-2xl font-bold">{analytics.mobility.totalJobs}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Postes ouverts</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.mobility.openJobs}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Postes pourvus</p>
                    <p className="text-2xl font-bold text-blue-600">{analytics.mobility.filledJobs}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Moy. candidatures</p>
                    <p className="text-2xl font-bold text-purple-600">{analytics.mobility.avgApplicationsPerJob}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Postes récents</CardTitle>
              </CardHeader>
              <CardContent>
                {internalJobs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Aucun poste publié</p>
                ) : (
                  <div className="space-y-2">
                    {internalJobs.slice(0, 5).map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium text-sm">{job.title}</p>
                          <p className="text-xs text-muted-foreground">{job.department}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600">{job.applications || 0} candidatures</p>
                          <p className="text-xs text-muted-foreground">{job.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Succession Tab */}
          <TabsContent value="succession" className="space-y-4 max-h-[60vh] overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">État de préparation des successeurs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-900">
                    <span className="text-sm font-medium">Prêts maintenant</span>
                    <span className="text-lg font-bold text-green-600">{analytics.succession.readinessDistribution.ready}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-900">
                    <span className="text-sm font-medium">En développement</span>
                    <span className="text-lg font-bold text-yellow-600">{analytics.succession.readinessDistribution.developing}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-900">
                    <span className="text-sm font-medium">Émergents</span>
                    <span className="text-lg font-bold text-blue-600">{analytics.succession.readinessDistribution.emerging}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-900">
                    <span className="text-sm font-medium">Non prêts</span>
                    <span className="text-lg font-bold text-red-600">{analytics.succession.readinessDistribution.notReady}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Plans récents</CardTitle>
              </CardHeader>
              <CardContent>
                {successionPlans.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Aucun plan créé</p>
                ) : (
                  <div className="space-y-2">
                    {successionPlans.slice(0, 5).map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium text-sm">{plan.criticalRole}</p>
                          <p className="text-xs text-muted-foreground">Successeur: {plan.successorName}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${
                            plan.readiness === 'ready' ? 'text-green-600' :
                            plan.readiness === 'developing' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {plan.readiness === 'ready' ? 'Prêt' :
                             plan.readiness === 'developing' ? 'En cours' : 'Non prêt'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
