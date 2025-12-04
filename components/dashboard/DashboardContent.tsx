import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Target,
  Users,
  TrendingUp,
  Building2,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  Calendar,
  UserPlus,
  GraduationCap,
  BrainCircuit,
  Briefcase,
  Award
} from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  goals: {
    total: number
    active: number
    completed: number
    avgProgress: number
  }
  recruitment: {
    openPositions: number
    candidates: number
    interviewsScheduled: number
  }
  performance: {
    pendingReviews: number
    completedReviews: number
    avgRating: number
  }
  learning: {
    activeEnrollments: number
    completedCourses: number
    certifications: number
    avgCompletionRate: number
  }
  career: {
    onboardingInProgress: number
    internalMobilityOpportunities: number
    careerInterviewsDue: number
  }
  analytics: {
    highRiskEmployees: number
    highPotentialTalents: number
    aiRecommendations: number
  }
}

interface DashboardContentProps {
  stats?: DashboardStats
  organizationName?: string
  hasOrganization?: boolean
}

export function DashboardContent({
  stats,
  organizationName = "Your Organization",
  hasOrganization = false
}: DashboardContentProps) {
  // Default stats if not provided
  const defaultStats: DashboardStats = {
    goals: { total: 0, active: 0, completed: 0, avgProgress: 0 },
    recruitment: { openPositions: 0, candidates: 0, interviewsScheduled: 0 },
    performance: { pendingReviews: 0, completedReviews: 0, avgRating: 0 },
    learning: { activeEnrollments: 0, completedCourses: 0, certifications: 0, avgCompletionRate: 0 },
    career: { onboardingInProgress: 0, internalMobilityOpportunities: 0, careerInterviewsDue: 0 },
    analytics: { highRiskEmployees: 0, highPotentialTalents: 0, aiRecommendations: 0 }
  }

  const dashboardStats = stats || defaultStats

  return (
    <div className="space-y-8">
      {/* Organization Setup Section */}
      {!hasOrganization && (
        <Card className="border-2 border-primary bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Bienvenue sur Targetym ! 🎉</CardTitle>
                <CardDescription className="text-base">
                  Configurons votre organisation pour démarrer la gestion RH
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Ce que vous obtenez :
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground ml-6">
                  <li>• Isolation multi-tenant sécurisée</li>
                  <li>• Contrôle d'accès basé sur les rôles</li>
                  <li>• Suivi des objectifs & OKRs</li>
                  <li>• Pipeline de recrutement</li>
                  <li>• Gestion de la performance</li>
                  <li>• Insights alimentés par l'IA</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Configuration rapide (2 minutes) :
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground ml-6">
                  <li>1. Nom et détails de l'organisation</li>
                  <li>2. Inviter les membres de l'équipe</li>
                  <li>3. Configurer les départements</li>
                  <li>4. Créer votre premier objectif</li>
                </ul>
              </div>
            </div>
            <Button size="lg" className="w-full md:w-auto">
              <Building2 className="mr-2 h-4 w-4" />
              Configurer l'organisation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Overview */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Vue d'ensemble</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Goals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Objectifs actifs</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.goals.active}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.goals.avgProgress}% progression moy.
              </p>
            </CardContent>
          </Card>

          {/* Open Positions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Postes ouverts</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.recruitment.openPositions}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.recruitment.candidates} candidats en pipeline
              </p>
            </CardContent>
          </Card>

          {/* Pending Reviews */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Évaluations en attente</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.performance.pendingReviews}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.performance.completedReviews} complétées ce trimestre
              </p>
            </CardContent>
          </Card>

          {/* Overall Performance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance moy.</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.performance.avgRating > 0
                  ? `${dashboardStats.performance.avgRating}/5`
                  : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">Note moyenne de l'équipe</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* HR Modules */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Modules RH</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Goals & OKRs */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Target className="h-8 w-8 text-blue-600" />
                <Link href="/dashboard/goals">
                  <Button variant="ghost" size="sm">
                    Voir tout <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <CardTitle className="mt-4">Objectifs & OKRs</CardTitle>
              <CardDescription>
                Suivez les objectifs et résultats clés avec progression en temps réel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Objectifs totaux</span>
                  <span className="font-semibold">{dashboardStats.goals.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Actifs</span>
                  <span className="font-semibold text-blue-600">{dashboardStats.goals.active}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Complétés</span>
                  <span className="font-semibold text-green-600">{dashboardStats.goals.completed}</span>
                </div>
              </div>
              <Link href="/dashboard/goals/new">
                <Button className="w-full" variant="outline">
                  <Target className="mr-2 h-4 w-4" />
                  Créer un objectif
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recruitment */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Users className="h-8 w-8 text-purple-600" />
                <Link href="/dashboard/recruitment">
                  <Button variant="ghost" size="sm">
                    Voir tout <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <CardTitle className="mt-4">Recrutement</CardTitle>
              <CardDescription>
                Gérez les candidats et optimisez votre processus de recrutement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Postes ouverts</span>
                  <span className="font-semibold">{dashboardStats.recruitment.openPositions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Candidats</span>
                  <span className="font-semibold text-purple-600">{dashboardStats.recruitment.candidates}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entretiens</span>
                  <span className="font-semibold text-orange-600">{dashboardStats.recruitment.interviewsScheduled}</span>
                </div>
              </div>
              <Link href="/dashboard/recruitment/jobs/new">
                <Button className="w-full" variant="outline">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Publier une offre
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <Link href="/dashboard/performance">
                  <Button variant="ghost" size="sm">
                    Voir tout <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <CardTitle className="mt-4">Performance</CardTitle>
              <CardDescription>
                Gérez les évaluations et suivez la performance des employés
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Évaluations en attente</span>
                  <span className="font-semibold">{dashboardStats.performance.pendingReviews}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Complétées</span>
                  <span className="font-semibold text-green-600">{dashboardStats.performance.completedReviews}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Note moyenne</span>
                  <span className="font-semibold text-blue-600">
                    {dashboardStats.performance.avgRating > 0
                      ? `${dashboardStats.performance.avgRating}/5`
                      : 'N/A'}
                  </span>
                </div>
              </div>
              <Button className="w-full" variant="outline" disabled>
                <Calendar className="mr-2 h-4 w-4" />
                Lancer un cycle d'évaluation
              </Button>
            </CardContent>
          </Card>

          {/* Learning & Development - NEW */}
          <Card className="hover:shadow-lg transition-shadow border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-8 w-8 text-amber-600" />
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">NOUVEAU</span>
                </div>
                <Link href="/dashboard/learning">
                  <Button variant="ghost" size="sm">
                    Voir tout <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <CardTitle className="mt-4">Formation & Développement</CardTitle>
              <CardDescription>
                Suivez les formations, cours et développement des compétences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Inscriptions actives</span>
                  <span className="font-semibold">{dashboardStats.learning.activeEnrollments}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cours complétés</span>
                  <span className="font-semibold text-amber-600">{dashboardStats.learning.completedCourses}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Certifications</span>
                  <span className="font-semibold text-green-600">{dashboardStats.learning.certifications}</span>
                </div>
              </div>
              <Link href="/dashboard/learning/courses">
                <Button className="w-full" variant="outline">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Parcourir les cours
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Career & Talent - NEW */}
          <Card className="hover:shadow-lg transition-shadow border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-8 w-8 text-indigo-600" />
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">NOUVEAU</span>
                </div>
                <Link href="/dashboard/career">
                  <Button variant="ghost" size="sm">
                    Voir tout <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <CardTitle className="mt-4">Carrière & Talents</CardTitle>
              <CardDescription>
                Gérez les parcours professionnels, l'intégration et la planification de succession
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Intégration</span>
                  <span className="font-semibold">{dashboardStats.career.onboardingInProgress}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Opportunités de mobilité</span>
                  <span className="font-semibold text-indigo-600">{dashboardStats.career.internalMobilityOpportunities}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entretiens carrière à venir</span>
                  <span className="font-semibold text-orange-600">{dashboardStats.career.careerInterviewsDue}</span>
                </div>
              </div>
              <Link href="/dashboard/career/paths">
                <Button className="w-full" variant="outline">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Explorer les parcours
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* People Analytics - NEW */}
          <Card className="hover:shadow-lg transition-shadow border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-8 w-8 text-purple-600" />
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">AI</span>
                </div>
                <Link href="/dashboard/analytics">
                  <Button variant="ghost" size="sm">
                    Voir tout <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <CardTitle className="mt-4">People Analytics</CardTitle>
              <CardDescription>
                Insights, prédictions et recommandations par IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Employés à risque</span>
                  <span className="font-semibold text-red-600">{dashboardStats.analytics.highRiskEmployees}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Talents à haut potentiel</span>
                  <span className="font-semibold text-purple-600">{dashboardStats.analytics.highPotentialTalents}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Recommandations IA</span>
                  <span className="font-semibold text-blue-600">{dashboardStats.analytics.aiRecommendations}</span>
                </div>
              </div>
              <Link href="/dashboard/analytics/ai-insights">
                <Button className="w-full" variant="outline">
                  <BrainCircuit className="mr-2 h-4 w-4" />
                  Voir les insights IA
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Features Banner */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle>Insights alimentés par l'IA</CardTitle>
              <CardDescription>
                Obtenez des recommandations intelligentes et analyses automatisées
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">Notation des CV</h4>
              <p className="text-xs text-muted-foreground">
                Évaluation automatique des candidats avec notation 0-100
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">Synthèse de performance</h4>
              <p className="text-xs text-muted-foreground">
                Insights générés par IA à partir de plusieurs évaluations
              </p>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">Recommandations carrière</h4>
              <p className="text-xs text-muted-foreground">
                Suggestions de parcours professionnel personnalisées
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Configurez les fonctionnalités IA dans les paramètres avec votre clé API OpenAI ou Anthropic</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>Tâches courantes pour démarrer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/goals/new">
              <Button variant="outline" className="w-full justify-start">
                <Target className="mr-2 h-4 w-4" />
                Créer un objectif
              </Button>
            </Link>
            <Link href="/dashboard/recruitment/jobs/new">
              <Button variant="outline" className="w-full justify-start">
                <UserPlus className="mr-2 h-4 w-4" />
                Publier une offre
              </Button>
            </Link>
            <Link href="/dashboard/learning/courses">
              <Button variant="outline" className="w-full justify-start">
                <GraduationCap className="mr-2 h-4 w-4" />
                Parcourir les cours
              </Button>
            </Link>
            <Link href="/dashboard/analytics/ai-insights">
              <Button variant="outline" className="w-full justify-start">
                <BrainCircuit className="mr-2 h-4 w-4" />
                Insights IA
              </Button>
            </Link>
            <Link href="/dashboard/performance">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Voir les évaluations
              </Button>
            </Link>
            <Link href="/dashboard/career/onboarding">
              <Button variant="outline" className="w-full justify-start">
                <Briefcase className="mr-2 h-4 w-4" />
                Intégration
              </Button>
            </Link>
            <Link href="/dashboard/career/paths">
              <Button variant="outline" className="w-full justify-start">
                <Award className="mr-2 h-4 w-4" />
                Parcours carrière
              </Button>
            </Link>
            <Link href="/dashboard/learning/skills">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                Matrice de compétences
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
