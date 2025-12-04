'use client';

import { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  Award,
  Target,
  MessageSquare,
  Star,
  Calendar,
  CheckCircle,
  Activity,
  Users,
  ArrowUp,
  ArrowDown,
  Minus,
  Clock,
  AlertCircle
} from 'lucide-react';

interface AnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviews: any[];
  goals: any[];
  feedback: any[];
}

export function AnalyticsModal({ open, onOpenChange, reviews, goals, feedback }: AnalyticsModalProps) {
  // Calculer les analytics avancées
  const analytics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Évaluations
    const totalReviews = reviews.length;
    const avgRating = reviews.length > 0
      ? parseFloat((reviews.reduce((acc, r) => acc + (r.overallRating || 0), 0) / reviews.length).toFixed(1))
      : 0;
    const completedReviews = reviews.filter(r => r.status === 'completed').length;

    // Évaluations ce mois
    const reviewsThisMonth = reviews.filter(r => {
      const date = new Date(r.createdAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;

    // Évaluations mois dernier
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const reviewsLastMonth = reviews.filter(r => {
      const date = new Date(r.createdAt);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    }).length;

    const reviewsTrend = reviewsLastMonth > 0
      ? ((reviewsThisMonth - reviewsLastMonth) / reviewsLastMonth * 100).toFixed(0)
      : reviewsThisMonth > 0 ? '100' : '0';

    // Compétences moyennes
    const allCompetencies = reviews.map(r => r.competencies).filter(Boolean);
    const avgCompetencies: any = {};

    if (allCompetencies.length > 0) {
      const competencyKeys = Object.keys(allCompetencies[0]);
      competencyKeys.forEach(key => {
        const sum = allCompetencies.reduce((acc, comp) => acc + (comp[key] || 0), 0);
        avgCompetencies[key] = parseFloat((sum / allCompetencies.length).toFixed(1));
      });
    }

    // Distribution des notes
    const ratingDistribution = {
      5: reviews.filter(r => r.overallRating === 5).length,
      4: reviews.filter(r => r.overallRating === 4).length,
      3: reviews.filter(r => r.overallRating === 3).length,
      2: reviews.filter(r => r.overallRating === 2).length,
      1: reviews.filter(r => r.overallRating === 1).length,
    };

    // Objectifs
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const inProgressGoals = goals.filter(g => g.status === 'in_progress').length;
    const avgProgress = goals.length > 0
      ? Math.round(goals.reduce((acc, g) => acc + (g.progress || 0), 0) / goals.length)
      : 0;

    const overdueGoals = goals.filter(g => {
      const daysUntil = Math.floor((new Date(g.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil < 0 && g.status !== 'completed';
    }).length;

    const completionRate = totalGoals > 0
      ? Math.round((completedGoals / totalGoals) * 100)
      : 0;

    // Objectifs par catégorie
    const goalsByCategory = {
      performance: goals.filter(g => g.category === 'performance').length,
      development: goals.filter(g => g.category === 'development').length,
      project: goals.filter(g => g.category === 'project').length,
      personal: goals.filter(g => g.category === 'personal').length,
    };

    // Objectifs par priorité
    const goalsByPriority = {
      critical: goals.filter(g => g.priority === 'critical').length,
      high: goals.filter(g => g.priority === 'high').length,
      medium: goals.filter(g => g.priority === 'medium').length,
      low: goals.filter(g => g.priority === 'low').length,
    };

    // Feedback
    const totalFeedback = feedback.length;
    const feedbackThisMonth = feedback.filter(f => {
      const date = new Date(f.createdAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;

    const feedbackByType = {
      peer: feedback.filter(f => f.type === 'peer').length,
      manager: feedback.filter(f => f.type === 'manager').length,
      subordinate: feedback.filter(f => f.type === 'subordinate').length,
      self: feedback.filter(f => f.type === 'self').length,
    };

    const feedbackByCategory = {
      positive: feedback.filter(f => f.category === 'positive').length,
      constructive: feedback.filter(f => f.category === 'constructive').length,
      developmental: feedback.filter(f => f.category === 'developmental').length,
    };

    return {
      totalReviews,
      avgRating,
      completedReviews,
      reviewsThisMonth,
      reviewsLastMonth,
      reviewsTrend: parseInt(reviewsTrend),
      avgCompetencies,
      ratingDistribution,
      totalGoals,
      completedGoals,
      inProgressGoals,
      avgProgress,
      overdueGoals,
      completionRate,
      goalsByCategory,
      goalsByPriority,
      totalFeedback,
      feedbackThisMonth,
      feedbackByType,
      feedbackByCategory,
    };
  }, [reviews, goals, feedback]);

  const competencyLabels: any = {
    leadership: 'Leadership',
    communication: 'Communication',
    teamwork: 'Travail d\'équipe',
    problemSolving: 'Résolution de problèmes',
    technical: 'Compétences techniques',
    innovation: 'Innovation'
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Analytics de Performance
          </DialogTitle>
          <DialogDescription>
            Vue d'ensemble complète des performances, tendances et statistiques
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="reviews">Évaluations</TabsTrigger>
            <TabsTrigger value="goals">Objectifs</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          {/* VUE D'ENSEMBLE */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPIs Principaux */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-600" />
                    Évaluations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{analytics.totalReviews}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {getTrendIcon(analytics.reviewsTrend)}
                    <p className={`text-xs font-medium ${getTrendColor(analytics.reviewsTrend)}`}>
                      {Math.abs(analytics.reviewsTrend)}% vs mois dernier
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-600" />
                    Note Moyenne
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{analytics.avgRating}/5</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.completedReviews} évaluations complètes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-600" />
                    Taux de Complétion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{analytics.completionRate}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.completedGoals}/{analytics.totalGoals} objectifs
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                    Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{analytics.totalFeedback}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.feedbackThisMonth} ce mois
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Graphiques Principaux */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Compétences Moyennes */}
              {Object.keys(analytics.avgCompetencies).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Compétences Moyennes
                    </CardTitle>
                    <CardDescription>Performance par compétence (sur 5)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(analytics.avgCompetencies)
                        .sort((a: any, b: any) => b[1] - a[1])
                        .map(([key, value]: [string, any]) => (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{competencyLabels[key] || key}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-primary">{value}/5</span>
                              <div className="flex items-center">
                                {Array.from({ length: Math.round(value) }).map((_, i) => (
                                  <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                ))}
                              </div>
                            </div>
                          </div>
                          <Progress value={(value / 5) * 100} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Alertes et Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Alertes & Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analytics.overdueGoals > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-900">
                          {analytics.overdueGoals} objectif{analytics.overdueGoals > 1 ? 's' : ''} en retard
                        </p>
                        <p className="text-xs text-red-700">
                          Action nécessaire pour rattraper le retard
                        </p>
                      </div>
                    </div>
                  )}

                  {analytics.avgRating >= 4 && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-green-900">
                          Excellente performance globale !
                        </p>
                        <p className="text-xs text-green-700">
                          Note moyenne de {analytics.avgRating}/5
                        </p>
                      </div>
                    </div>
                  )}

                  {analytics.inProgressGoals > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">
                          {analytics.inProgressGoals} objectif{analytics.inProgressGoals > 1 ? 's' : ''} en cours
                        </p>
                        <p className="text-xs text-blue-700">
                          Progression moyenne: {analytics.avgProgress}%
                        </p>
                      </div>
                    </div>
                  )}

                  {analytics.feedbackThisMonth > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-purple-900">
                          {analytics.feedbackThisMonth} feedback reçu ce mois
                        </p>
                        <p className="text-xs text-purple-700">
                          Culture de feedback active
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ÉVALUATIONS */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Distribution des Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Distribution des Notes</CardTitle>
                  <CardDescription>Répartition des évaluations par note</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = analytics.ratingDistribution[rating as keyof typeof analytics.ratingDistribution];
                      const percentage = analytics.totalReviews > 0
                        ? Math.round((count / analytics.totalReviews) * 100)
                        : 0;

                      return (
                        <div key={rating}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{rating} étoile{rating > 1 ? 's' : ''}</span>
                              <div className="flex">
                                {Array.from({ length: rating }).map((_, i) => (
                                  <Star key={i} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm font-bold">{count} ({percentage}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Statistiques Complémentaires */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Statistiques Détaillées</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span className="text-sm font-medium">Total évaluations</span>
                    <span className="text-lg font-bold text-primary">{analytics.totalReviews}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span className="text-sm font-medium">Complétées</span>
                    <span className="text-lg font-bold text-green-600">{analytics.completedReviews}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span className="text-sm font-medium">Ce mois</span>
                    <span className="text-lg font-bold text-blue-600">{analytics.reviewsThisMonth}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span className="text-sm font-medium">Mois dernier</span>
                    <span className="text-lg font-bold text-orange-600">{analytics.reviewsLastMonth}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* OBJECTIFS */}
          <TabsContent value="goals" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Par Catégorie */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Objectifs par Catégorie</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(analytics.goalsByCategory).map(([key, value]) => {
                    const labels: any = {
                      performance: { name: 'Performance', color: 'blue' },
                      development: { name: 'Développement', color: 'purple' },
                      project: { name: 'Projet', color: 'green' },
                      personal: { name: 'Personnel', color: 'pink' },
                    };
                    const label = labels[key];
                    const percentage = analytics.totalGoals > 0
                      ? Math.round((Number(value) / analytics.totalGoals) * 100)
                      : 0;

                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{label.name}</span>
                          <span className="text-sm font-bold">{value} ({percentage}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Par Priorité */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Objectifs par Priorité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(analytics.goalsByPriority).map(([key, value]) => {
                    const labels: any = {
                      critical: { name: 'Critique', color: 'bg-red-500' },
                      high: { name: 'Haute', color: 'bg-orange-500' },
                      medium: { name: 'Moyenne', color: 'bg-yellow-500' },
                      low: { name: 'Basse', color: 'bg-green-500' },
                    };
                    const label = labels[key];
                    const percentage = analytics.totalGoals > 0
                      ? Math.round((Number(value) / analytics.totalGoals) * 100)
                      : 0;

                    return (
                      <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${label.color}`} />
                          <span className="text-sm font-medium">{label.name}</span>
                        </div>
                        <span className="text-sm font-bold">{value} ({percentage}%)</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Progression */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Vue d'ensemble de la Progression</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-700">{analytics.completedGoals}</p>
                    <p className="text-xs text-green-600">Complétés</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-700">{analytics.inProgressGoals}</p>
                    <p className="text-xs text-blue-600">En cours</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-700">{analytics.overdueGoals}</p>
                    <p className="text-xs text-red-600">En retard</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progression Moyenne Globale</span>
                    <span className="text-lg font-bold text-primary">{analytics.avgProgress}%</span>
                  </div>
                  <Progress value={analytics.avgProgress} className="h-3" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FEEDBACK */}
          <TabsContent value="feedback" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Par Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Répartition par Type</CardTitle>
                  <CardDescription>Source du feedback</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(analytics.feedbackByType).map(([key, value]) => {
                    const labels: any = {
                      peer: 'Collègues',
                      manager: 'Managers',
                      subordinate: 'Subordonnés',
                      self: 'Auto-évaluation',
                    };
                    const percentage = analytics.totalFeedback > 0
                      ? Math.round((Number(value) / analytics.totalFeedback) * 100)
                      : 0;

                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{labels[key]}</span>
                          <span className="text-sm font-bold">{value} ({percentage}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Par Catégorie */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Répartition par Catégorie</CardTitle>
                  <CardDescription>Type de feedback</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(analytics.feedbackByCategory).map(([key, value]) => {
                    const configs: any = {
                      positive: { name: 'Positif', color: 'text-green-600', bg: 'bg-green-50' },
                      constructive: { name: 'Constructif', color: 'text-orange-600', bg: 'bg-orange-50' },
                      developmental: { name: 'Développement', color: 'text-blue-600', bg: 'bg-blue-50' },
                    };
                    const config = configs[key];
                    const percentage = analytics.totalFeedback > 0
                      ? Math.round((Number(value) / analytics.totalFeedback) * 100)
                      : 0;

                    return (
                      <div key={key} className={`flex items-center justify-between p-3 ${config.bg} rounded-lg`}>
                        <span className={`text-sm font-medium ${config.color}`}>{config.name}</span>
                        <span className={`text-lg font-bold ${config.color}`}>
                          {value} ({percentage}%)
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
