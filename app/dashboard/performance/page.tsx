'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Award,
  Target,
  MessageSquare,
  TrendingUp,
  Users,
  Plus,
  Calendar,
  BarChart3,
  Star,
  Clock
} from "lucide-react";

// ✅ OPTIMIZED: Dynamic imports for modal components
// Modals are only loaded when user clicks to open them
const CreateReviewModal = dynamic(
  () => import('@/components/performance/CreateReviewModal').then((mod) => mod.CreateReviewModal),
  { ssr: false }
);

const CreateGoalModal = dynamic(
  () => import('@/components/performance/CreateGoalModal').then((mod) => mod.CreateGoalModal),
  { ssr: false }
);

const FeedbackModal = dynamic(
  () => import('@/components/performance/FeedbackModal').then((mod) => mod.FeedbackModal),
  { ssr: false }
);

const ReviewsListModal = dynamic(
  () => import('@/components/performance/ReviewsListModal').then((mod) => mod.ReviewsListModal),
  { ssr: false }
);

const GoalsListModal = dynamic(
  () => import('@/components/performance/GoalsListModal').then((mod) => mod.GoalsListModal),
  { ssr: false }
);

const FeedbackListModal = dynamic(
  () => import('@/components/performance/FeedbackListModal').then((mod) => mod.FeedbackListModal),
  { ssr: false }
);

const AnalyticsModal = dynamic(
  () => import('@/components/performance/AnalyticsModal').then((mod) => mod.AnalyticsModal),
  { ssr: false }
);

export default function PerformancePage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [showCreateReviewModal, setShowCreateReviewModal] = useState(false);
  const [showCreateGoalModal, setShowCreateGoalModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showReviewsListModal, setShowReviewsListModal] = useState(false);
  const [showGoalsListModal, setShowGoalsListModal] = useState(false);
  const [showFeedbackListModal, setShowFeedbackListModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  // Charger les données depuis localStorage
  useEffect(() => {
    const storedReviews = localStorage.getItem('performanceReviews');
    const storedGoals = localStorage.getItem('performanceGoals');
    const storedFeedback = localStorage.getItem('performanceFeedback');

    if (storedReviews) setReviews(JSON.parse(storedReviews));
    if (storedGoals) setGoals(JSON.parse(storedGoals));
    if (storedFeedback) setFeedback(JSON.parse(storedFeedback));
  }, []);

  // Calculer les statistiques
  const stats = {
    totalReviews: reviews.length,
    avgRating: reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.overallRating || 0), 0) / reviews.length).toFixed(1)
      : '0',
    activeGoals: goals.filter(g => g.status === 'in_progress').length,
    completedGoals: goals.filter(g => g.status === 'completed').length,
    feedbackReceived: feedback.length,
    upcomingReviews: reviews.filter(r => {
      const reviewDate = new Date(r.reviewDate);
      const today = new Date();
      const daysUntil = Math.floor((reviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil >= 0 && daysUntil <= 30 && r.status !== 'completed';
    }).length
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Award className="h-6 w-6 text-primary" />
              </div>
              Gestion de la Performance
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Évaluations, objectifs et feedback 360°
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFeedbackModal(true)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Feedback 360°
            </Button>
            <Button size="sm" onClick={() => setShowCreateReviewModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle évaluation
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200">
            <p className="text-xs font-medium text-blue-600">Évaluations</p>
            <p className="text-2xl font-bold text-blue-700">{stats.totalReviews}</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-lg border border-yellow-200">
            <p className="text-xs font-medium text-yellow-600">Note moyenne</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.avgRating}/5</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg border border-green-200">
            <p className="text-xs font-medium text-green-600">Objectifs actifs</p>
            <p className="text-2xl font-bold text-green-700">{stats.activeGoals}</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg border border-purple-200">
            <p className="text-xs font-medium text-purple-600">Objectifs complétés</p>
            <p className="text-2xl font-bold text-purple-700">{stats.completedGoals}</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-lg border border-pink-200">
            <p className="text-xs font-medium text-pink-600">Feedback reçu</p>
            <p className="text-2xl font-bold text-pink-700">{stats.feedbackReceived}</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-lg border border-orange-200">
            <p className="text-xs font-medium text-orange-600">À venir (30j)</p>
            <p className="text-2xl font-bold text-orange-700">{stats.upcomingReviews}</p>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto flex-col py-4 gap-2"
              onClick={() => setShowCreateReviewModal(true)}
            >
              <Award className="h-5 w-5 text-blue-600" />
              <span className="text-xs">Nouvelle évaluation</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col py-4 gap-2"
              onClick={() => setShowCreateGoalModal(true)}
            >
              <Target className="h-5 w-5 text-green-600" />
              <span className="text-xs">Définir objectif</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col py-4 gap-2"
              onClick={() => setShowFeedbackModal(true)}
            >
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <span className="text-xs">Donner feedback</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col py-4 gap-2"
              onClick={() => setShowAnalyticsModal(true)}
            >
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <span className="text-xs">Voir analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grille principale - 3 colonnes */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Évaluations */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded-md">
                  <Award className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Évaluations</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {reviews.length} • {stats.upcomingReviews} à venir
                  </p>
                </div>
              </div>
              <Button onClick={() => setShowCreateReviewModal(true)} variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            {reviews.length === 0 ? (
              <div className="text-center py-6">
                <Award className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-xs text-muted-foreground mb-3">Aucune évaluation</p>
                <Button onClick={() => setShowCreateReviewModal(true)} size="sm" variant="outline">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Créer
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="max-h-[280px] overflow-y-auto space-y-1.5 pr-2">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-2.5 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className="font-medium text-xs truncate">{review.employeeName}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.reviewDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-medium">{review.overallRating}/5</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  className="w-full h-7"
                  size="sm"
                  onClick={() => setShowReviewsListModal(true)}
                >
                  <span className="text-xs">Voir tout ({reviews.length})</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Objectifs */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-50 rounded-md">
                  <Target className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Objectifs</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {goals.length} • {stats.activeGoals} actifs
                  </p>
                </div>
              </div>
              <Button onClick={() => setShowCreateGoalModal(true)} variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            {goals.length === 0 ? (
              <div className="text-center py-6">
                <Target className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-xs text-muted-foreground mb-3">Aucun objectif</p>
                <Button onClick={() => setShowCreateGoalModal(true)} size="sm" variant="outline">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Définir
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="max-h-[280px] overflow-y-auto space-y-1.5 pr-2">
                  {goals.map((goal) => {
                    const statusDots = {
                      not_started: 'bg-gray-500',
                      in_progress: 'bg-blue-500',
                      completed: 'bg-green-500',
                      cancelled: 'bg-red-500'
                    };

                    return (
                      <div
                        key={goal.id}
                        className="p-2.5 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <div className={`h-2 w-2 rounded-full ${statusDots[goal.status as keyof typeof statusDots]}`} />
                              <p className="font-medium text-xs truncate">{goal.title}</p>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              Échéance: {new Date(goal.dueDate).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button
                  variant="ghost"
                  className="w-full h-7"
                  size="sm"
                  onClick={() => setShowGoalsListModal(true)}
                >
                  <span className="text-xs">Voir tout ({goals.length})</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feedback 360° */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-50 rounded-lg">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Feedback 360°</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {feedback.length} reçu
                  </p>
                </div>
              </div>
              <Button onClick={() => setShowFeedbackModal(true)} variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            {feedback.length === 0 ? (
              <div className="text-center py-6">
                <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-xs text-muted-foreground mb-3">Aucun feedback</p>
                <Button onClick={() => setShowFeedbackModal(true)} size="sm" variant="outline">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Ajouter
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="max-h-[280px] overflow-y-auto space-y-1.5 pr-2">
                  {feedback.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className="font-medium text-xs truncate">{item.type}</p>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {item.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  className="w-full h-7"
                  size="sm"
                  onClick={() => setShowFeedbackListModal(true)}
                >
                  <span className="text-xs">Voir tout ({feedback.length})</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CreateReviewModal
        open={showCreateReviewModal}
        onOpenChange={setShowCreateReviewModal}
        onReviewCreated={(review) => {
          setReviews([...reviews, review]);
        }}
      />

      <CreateGoalModal
        open={showCreateGoalModal}
        onOpenChange={setShowCreateGoalModal}
        onGoalCreated={(goal) => {
          setGoals([...goals, goal]);
        }}
      />

      <FeedbackModal
        open={showFeedbackModal}
        onOpenChange={setShowFeedbackModal}
        onFeedbackCreated={(item) => {
          setFeedback([...feedback, item]);
        }}
      />

      <ReviewsListModal
        open={showReviewsListModal}
        onOpenChange={setShowReviewsListModal}
        reviews={reviews}
      />

      <GoalsListModal
        open={showGoalsListModal}
        onOpenChange={setShowGoalsListModal}
        goals={goals}
      />

      <FeedbackListModal
        open={showFeedbackListModal}
        onOpenChange={setShowFeedbackListModal}
        feedback={feedback}
      />

      <AnalyticsModal
        open={showAnalyticsModal}
        onOpenChange={setShowAnalyticsModal}
        reviews={reviews}
        goals={goals}
        feedback={feedback}
      />
    </div>
  );
}
