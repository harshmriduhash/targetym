'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardCustomizationModal } from './DashboardCustomizationModal';
import {
  Target,
  Users,
  TrendingUp,
  Calendar,
  BarChart3,
  PieChart,
  Clock,
  Settings,
  RotateCcw
} from 'lucide-react';

// ✅ OPTIMIZED: Dynamic imports for heavy chart components (recharts ~100KB)
// Only load charts when their widgets are displayed
const GoalsProgressChart = dynamic(
  () => import('@/components/charts/GoalsProgressChart').then((mod) => mod.GoalsProgressChart),
  {
    loading: () => <Skeleton className="h-[300px] w-full" />,
    ssr: false,
  }
);

const TeamPerformanceChart = dynamic(
  () => import('@/components/charts/TeamPerformanceChart').then((mod) => mod.TeamPerformanceChart),
  {
    loading: () => <Skeleton className="h-[300px] w-full" />,
    ssr: false,
  }
);

const AnalyticsOverviewChart = dynamic(
  () => import('@/components/charts/AnalyticsOverviewChart').then((mod) => mod.AnalyticsOverviewChart),
  {
    loading: () => <Skeleton className="h-[350px] w-full" />,
    ssr: false,
  }
);

const RecruitmentPipelineChart = dynamic(
  () => import('@/components/charts/RecruitmentPipelineChart').then((mod) => mod.RecruitmentPipelineChart),
  {
    loading: () => <Skeleton className="h-[300px] w-full" />,
    ssr: false,
  }
);

interface DashboardPreferences {
  widgets: string[];
  reports: string[];
  theme: string;
  layout: string;
}

export function CustomizedDashboard() {
  const [preferences, setPreferences] = useState<DashboardPreferences | null>(null);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);

  useEffect(() => {
    // Charger les préférences depuis localStorage
    const stored = localStorage.getItem('dashboard-preferences');
    if (stored) {
      setPreferences(JSON.parse(stored));
      setShowEmptyState(false);
    } else {
      // Pas de préférences = afficher l'écran de configuration
      setShowEmptyState(true);
    }
  }, []);

  const handleResetPreferences = () => {
    localStorage.removeItem('dashboard-preferences');
    window.location.reload();
  };

  // Si pas de préférences, afficher l'écran vide
  if (showEmptyState) {
    const { DashboardEmptyState } = require('./DashboardEmptyState');
    return <DashboardEmptyState />;
  }

  if (!preferences) {
    return <div>Chargement...</div>;
  }

  const layoutClass = {
    grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    list: 'flex flex-col gap-6',
    masonry: 'columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6',
    auto: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'
  }[preferences.layout] || 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

  return (
    <>
      <div className="space-y-8">
        {/* En-tête avec boutons d'action */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord personnalisé</h1>
            <p className="text-muted-foreground mt-1">
              Vue d'ensemble personnalisée selon vos préférences
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCustomization(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Modifier les préférences
            </Button>
            <Button variant="outline" onClick={handleResetPreferences}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Réinitialiser
            </Button>
          </div>
        </div>

      {/* Widgets personnalisés */}
      <div className={layoutClass}>
        {preferences.widgets.includes('goals-overview') && <GoalsOverviewWidget />}
        {preferences.widgets.includes('goals-progress') && <GoalsProgressWidget />}
        {preferences.widgets.includes('team-performance') && <TeamPerformanceWidget />}
        {preferences.widgets.includes('recruitment-pipeline') && <RecruitmentPipelineWidget />}
        {preferences.widgets.includes('analytics-overview') && <AnalyticsOverviewWidget />}
        {preferences.widgets.includes('upcoming-reviews') && <UpcomingReviewsWidget />}
        {preferences.widgets.includes('skills-matrix') && <SkillsMatrixWidget />}
        {preferences.widgets.includes('turnover-risk') && <TurnoverRiskWidget />}
      </div>

      {/* Section des rapports si activée */}
      {preferences.reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rapports programmés</CardTitle>
            <CardDescription>
              Rapports automatiques que vous recevrez par email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {preferences.reports.includes('daily') && (
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Quotidien</p>
                  <p className="text-sm text-muted-foreground">Chaque jour à 9h00</p>
                </div>
              )}
              {preferences.reports.includes('weekly') && (
                <div className="p-3 border rounded-lg bg-primary/5">
                  <p className="font-medium">Hebdomadaire</p>
                  <p className="text-sm text-muted-foreground">Lundi à 9h00</p>
                </div>
              )}
              {preferences.reports.includes('monthly') && (
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Mensuel</p>
                  <p className="text-sm text-muted-foreground">1er du mois</p>
                </div>
              )}
              {preferences.reports.includes('quarterly') && (
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Trimestriel</p>
                  <p className="text-sm text-muted-foreground">Début de trimestre</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      </div>

      {/* Modal de personnalisation */}
      <DashboardCustomizationModal
        open={showCustomization}
        onOpenChange={setShowCustomization}
      />
    </>
  );
}

// Widgets individuels avec données mockées
function GoalsOverviewWidget() {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Vue d'ensemble des objectifs</CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">12 objectifs</div>
        <p className="text-xs text-muted-foreground">+3 depuis le mois dernier</p>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Actifs</span>
            <span className="font-medium">8</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Terminés</span>
            <span className="font-medium text-green-600">4</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GoalsProgressWidget() {
  return (
    <Card className="hover:shadow-lg transition-shadow col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Progression des OKRs</CardTitle>
        <CardDescription>Évolution des objectifs complétés au fil du temps</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <GoalsProgressChart />
        </div>
      </CardContent>
    </Card>
  );
}

function TeamPerformanceWidget() {
  return (
    <Card className="hover:shadow-lg transition-shadow col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Performance d'équipe</CardTitle>
        <CardDescription>Comparaison des indicateurs par équipe</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <TeamPerformanceChart />
        </div>
      </CardContent>
    </Card>
  );
}

function RecruitmentPipelineWidget() {
  return (
    <Card className="hover:shadow-lg transition-shadow col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Pipeline de recrutement</CardTitle>
        <CardDescription>Évolution des candidats dans le processus de recrutement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <RecruitmentPipelineChart />
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsOverviewWidget() {
  return (
    <Card className="hover:shadow-lg transition-shadow col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle>Analyses RH globales</CardTitle>
        <CardDescription>Vue d'ensemble des activités RH sur 6 mois</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <AnalyticsOverviewChart />
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingReviewsWidget() {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Évaluations à venir</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">7 évaluations</div>
        <p className="text-xs text-muted-foreground">Dans les 30 prochains jours</p>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Cette semaine</span>
            <span className="font-medium">3</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Ce mois-ci</span>
            <span className="font-medium">4</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SkillsMatrixWidget() {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Matrice de compétences</CardTitle>
        <PieChart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">45 compétences</div>
        <p className="text-xs text-muted-foreground">Réparties sur l'équipe</p>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Compétences clés</span>
            <span className="font-medium">12</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">À développer</span>
            <span className="font-medium">8</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TurnoverRiskWidget() {
  return (
    <Card className="hover:shadow-lg transition-shadow border-orange-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Risque de turnover</CardTitle>
        <TrendingUp className="h-4 w-4 text-orange-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-orange-600">Faible</div>
        <p className="text-xs text-muted-foreground">8% de risque global</p>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">À surveiller</span>
            <span className="font-medium text-orange-600">3</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Risque élevé</span>
            <span className="font-medium text-red-600">1</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
