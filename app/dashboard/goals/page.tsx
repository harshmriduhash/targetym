'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, Plus, TrendingUp, Users, Clock, Award, AlertCircle } from "lucide-react"
import type { Objective } from '@/components/goals/ObjectiveCard';

// ✅ OPTIMIZED: Dynamic imports for modal components
// Modals are only loaded when user clicks to open them
const CreateObjectiveModal = dynamic(
  () => import('@/components/goals/CreateObjectiveModal').then((mod) => mod.CreateObjectiveModal),
  { ssr: false }
);

const UpdateProgressModal = dynamic(
  () => import('@/components/goals/UpdateProgressModal').then((mod) => mod.UpdateProgressModal),
  { ssr: false }
);

const ObjectivesListModal = dynamic(
  () => import('@/components/goals/ObjectivesListModal').then((mod) => mod.ObjectivesListModal),
  { ssr: false }
);

export default function GoalsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [showTeamObjectivesModal, setShowTeamObjectivesModal] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [objectives, setObjectives] = useState<Objective[]>([]);

  // Charger les objectifs depuis localStorage au montage
  useEffect(() => {
    const stored = localStorage.getItem('objectives');
    if (stored) {
      setObjectives(JSON.parse(stored));
    }
  }, []);

  // Calculer les statistiques dynamiquement
  const stats = {
    totalGoals: objectives.length,
    activeGoals: objectives.filter(obj => obj.status === 'in-progress').length,
    completedGoals: objectives.filter(obj => obj.status === 'completed').length,
    avgProgress: objectives.length > 0
      ? Math.round(objectives.reduce((sum, obj) => {
          const objProgress = obj.keyResults.reduce((krSum, kr) => krSum + (kr.current / kr.target) * 100, 0) / obj.keyResults.length;
          return sum + objProgress;
        }, 0) / objectives.length)
      : 0,
    teamGoals: objectives.filter(obj => obj.type === 'team').length,
    dueThisWeek: objectives.filter(obj => {
      const endDate = new Date(obj.endDate);
      const today = new Date();
      const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysLeft <= 7 && daysLeft > 0;
    }).length
  };

  // Fonction pour ajouter un objectif
  const handleObjectiveCreated = (newObjective: Objective) => {
    const updatedObjectives = [...objectives, newObjective];
    setObjectives(updatedObjectives);
    localStorage.setItem('objectives', JSON.stringify(updatedObjectives));
  };

  // Fonction pour supprimer un objectif
  const handleDeleteObjective = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet objectif ?')) {
      const updatedObjectives = objectives.filter(obj => obj.id !== id);
      setObjectives(updatedObjectives);
      localStorage.setItem('objectives', JSON.stringify(updatedObjectives));
    }
  };

  // Fonction pour mettre à jour la progression
  const handleUpdateProgress = (objective: Objective) => {
    setSelectedObjective(objective);
    setShowUpdateModal(true);
  };

  // Fonction pour modifier un objectif
  const handleEditObjective = (objective: Objective) => {
    setSelectedObjective(objective);
    setShowEditModal(true);
  };

  // Fonction appelée après mise à jour de la progression
  const handleProgressUpdated = (updatedObjective: Objective) => {
    const updatedObjectives = objectives.map(obj =>
      obj.id === updatedObjective.id ? updatedObjective : obj
    );
    setObjectives(updatedObjectives);
    localStorage.setItem('objectives', JSON.stringify(updatedObjectives));
  };

  // Fonction appelée après modification d'un objectif
  const handleObjectiveEdited = (updatedObjective: Objective) => {
    const updatedObjectives = objectives.map(obj =>
      obj.id === updatedObjective.id ? updatedObjective : obj
    );
    setObjectives(updatedObjectives);
    localStorage.setItem('objectives', JSON.stringify(updatedObjectives));
  };

  return (
    <div className="space-y-6">
      {/* Header avec bouton d'action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Objectifs & OKRs</h1>
          <p className="text-muted-foreground mt-1">
            Suivez vos objectifs et résultats clés en temps réel
          </p>
        </div>
        <Button size="lg" onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Créer un objectif
        </Button>
      </div>

      {/* Stats Cards - Style Targetym */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <Target className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGoals}</div>
            <p className="text-xs text-muted-foreground mt-1">Objectifs</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Actifs</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeGoals}</div>
            <p className="text-xs text-muted-foreground mt-1">En cours</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Terminés</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
              <Award className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.completedGoals}</div>
            <p className="text-xs text-muted-foreground mt-1">Atteints</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Progression</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.avgProgress}%</div>
            <p className="text-xs text-muted-foreground mt-1">Moyenne</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Équipe</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{stats.teamGoals}</div>
            <p className="text-xs text-muted-foreground mt-1">Collaboratifs</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Urgents</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.dueThisWeek}</div>
            <p className="text-xs text-muted-foreground mt-1">Cette semaine</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Mes Objectifs - 2 columns */}
        <Card className="lg:col-span-2 bg-white dark:bg-slate-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Mes objectifs</CardTitle>
            </div>
            <CardDescription>Vos objectifs personnels et résultats clés</CardDescription>
          </CardHeader>
          <CardContent>
            {objectives.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-muted">
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Aucun objectif pour le moment</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Créez votre premier objectif pour commencer le suivi
                </p>
                <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-blue-500 to-purple-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer votre premier objectif
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Résumé compact */}
                <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{objectives.length}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {objectives.filter(o => o.status === 'in-progress').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Actifs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {objectives.filter(o => o.status === 'completed').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Terminés</div>
                  </div>
                </div>

                {/* Bouton pour voir tous */}
                <Button
                  onClick={() => setShowListModal(true)}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  <Target className="mr-2 h-5 w-5" />
                  Voir tous mes objectifs ({objectives.length})
                </Button>

                {/* Aperçu des 2 derniers */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">Derniers objectifs créés</p>
                  {objectives.slice(-2).reverse().map((objective) => (
                    <div
                      key={objective.id}
                      className="p-4 border rounded-lg bg-muted/10 hover:bg-muted/20 cursor-pointer transition-all hover:shadow-md"
                      onClick={() => setShowListModal(true)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{objective.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {objective.keyResults.length} résultats clés
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {Math.round(objective.keyResults.reduce((sum, kr) => sum + (kr.current / kr.target) * 100, 0) / objective.keyResults.length)}%
                          </div>
                          <p className="text-xs text-muted-foreground">progression</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions Rapides - 1 column */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base">Actions rapides</CardTitle>
              <CardDescription>Tâches OKR courantes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-accent"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer un objectif
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-accent"
                onClick={() => setShowTeamObjectivesModal(true)}
              >
                <Users className="mr-2 h-4 w-4" />
                Objectifs d'équipe
              </Button>
            </CardContent>
          </Card>

          {/* Info Card - OKR Features */}
          <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-white text-base">Fonctionnalités OKR</CardTitle>
                  <CardDescription className="text-blue-100 text-xs">Système complet</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-50">OKR hiérarchiques alignés sur l'entreprise</p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-50">Suivi en temps réel avec calcul automatique</p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-50">Collaboration d'équipe avec notifications</p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-50">Insights IA et détection de blocages</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <CreateObjectiveModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onObjectiveCreated={handleObjectiveCreated}
      />

      <UpdateProgressModal
        open={showUpdateModal}
        onOpenChange={setShowUpdateModal}
        objective={selectedObjective}
        onProgressUpdated={handleProgressUpdated}
      />

      {selectedObjective && showEditModal && (
        <CreateObjectiveModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onObjectiveCreated={handleObjectiveEdited}
          editMode={true}
          initialObjective={selectedObjective}
        />
      )}

      <ObjectivesListModal
        open={showListModal}
        onOpenChange={setShowListModal}
        objectives={objectives}
        onUpdate={handleUpdateProgress}
        onEdit={handleEditObjective}
        onDelete={handleDeleteObjective}
      />

      <ObjectivesListModal
        open={showTeamObjectivesModal}
        onOpenChange={setShowTeamObjectivesModal}
        objectives={objectives}
        onUpdate={handleUpdateProgress}
        onEdit={handleEditObjective}
        onDelete={handleDeleteObjective}
        typeFilter="team"
        title="Objectifs d'équipe"
        description="Objectifs collaboratifs et résultats clés d'équipe"
      />
    </div>
  );
}
