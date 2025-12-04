'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Plus, CheckCircle2, XCircle, Clock, Plane, Heart, Briefcase, AlertCircle, Users, TrendingUp } from "lucide-react"
import { Badge } from '@/components/ui/badge';

interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  type: 'vacation' | 'sick' | 'personal' | 'unpaid' | 'parental';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface LeaveBalance {
  type: string;
  label: string;
  total: number;
  used: number;
  remaining: number;
  icon: any;
  color: string;
}

export default function LeavesPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Charger les données depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem('leaveRequests');
    if (stored) {
      setLeaveRequests(JSON.parse(stored));
    }
  }, []);

  // Balances de congés (mock data)
  const leaveBalances: LeaveBalance[] = [
    { type: 'vacation', label: 'Congés payés', total: 25, used: 10, remaining: 15, icon: Plane, color: 'blue' },
    { type: 'sick', label: 'Congés maladie', total: 10, used: 3, remaining: 7, icon: Heart, color: 'red' },
    { type: 'personal', label: 'Congés personnels', total: 5, used: 2, remaining: 3, icon: Briefcase, color: 'purple' },
  ];

  // Fonction pour créer une demande de congé (simplifié)
  const handleCreateLeave = () => {
    const newRequest: LeaveRequest = {
      id: crypto.randomUUID(),
      userId: 'current-user',
      userName: 'Utilisateur Courant',
      type: 'vacation',
      startDate: '2025-10-30',
      endDate: '2025-11-05',
      days: 5,
      reason: 'Vacances familiales',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const updated = [...leaveRequests, newRequest];
    setLeaveRequests(updated);
    localStorage.setItem('leaveRequests', JSON.stringify(updated));
  };

  // Calculer les statistiques
  const stats = {
    totalRequests: leaveRequests.length,
    pendingRequests: leaveRequests.filter(r => r.status === 'pending').length,
    approvedRequests: leaveRequests.filter(r => r.status === 'approved').length,
    rejectedRequests: leaveRequests.filter(r => r.status === 'rejected').length,
    daysUsedThisYear: leaveRequests
      .filter(r => r.status === 'approved' && new Date(r.startDate).getFullYear() === new Date().getFullYear())
      .reduce((sum, r) => sum + r.days, 0),
    daysRemainingTotal: leaveBalances.reduce((sum, b) => sum + b.remaining, 0)
  };

  // Demandes récentes
  const recentRequests = leaveRequests
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: LeaveRequest['status']) => {
    const variants = {
      pending: { label: 'En attente', variant: 'secondary' as const, icon: Clock },
      approved: { label: 'Approuvé', variant: 'default' as const, icon: CheckCircle2 },
      rejected: { label: 'Refusé', variant: 'destructive' as const, icon: XCircle }
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="text-xs">
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getTypeIcon = (type: LeaveRequest['type']) => {
    const icons = {
      vacation: Plane,
      sick: Heart,
      personal: Briefcase,
      unpaid: XCircle,
      parental: Users
    };
    return icons[type];
  };

  const getTypeLabel = (type: LeaveRequest['type']) => {
    const labels = {
      vacation: 'Congés payés',
      sick: 'Maladie',
      personal: 'Personnel',
      unpaid: 'Sans solde',
      parental: 'Parental'
    };
    return labels[type];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Congés</h1>
          <p className="text-muted-foreground mt-1">
            Demandes de congés et suivi des soldes
          </p>
        </div>
        <Button onClick={handleCreateLeave} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle demande
        </Button>
      </div>

      {/* Soldes de congés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {leaveBalances.map((balance) => {
          const Icon = balance.icon;
          const percentage = (balance.used / balance.total) * 100;

          return (
            <Card key={balance.type} className="bg-white dark:bg-slate-900">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-${balance.color}-500 to-${balance.color}-600`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{balance.label}</CardTitle>
                      <CardDescription className="text-xs">{balance.total} jours/an</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Utilisé</span>
                    <span className="font-bold">{balance.used} jours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Restant</span>
                    <span className="font-bold text-green-600">{balance.remaining} jours</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div
                      className={`bg-gradient-to-r from-${balance.color}-500 to-${balance.color}-600 h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Demandes</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">Total</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En attente</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">À traiter</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approuvées</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approvedRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">Validées</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Refusées</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600">
              <XCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejectedRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">Non validées</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Jours pris</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.daysUsedThisYear}</div>
            <p className="text-xs text-muted-foreground mt-1">Cette année</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Jours restants</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600">
              <Plane className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{stats.daysRemainingTotal}</div>
            <p className="text-xs text-muted-foreground mt-1">Disponibles</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Demandes de congés - 2 columns */}
        <Card className="lg:col-span-2 bg-white dark:bg-slate-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Demandes de congés</CardTitle>
            </div>
            <CardDescription>Historique et statuts de vos demandes</CardDescription>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-muted">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Aucune demande de congé</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Créez votre première demande de congé
                </p>
                <Button onClick={handleCreateLeave} className="bg-gradient-to-r from-blue-500 to-purple-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle demande
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRequests.map((request) => {
                  const TypeIcon = getTypeIcon(request.type);

                  return (
                    <div key={request.id} className="p-4 border rounded-lg hover:bg-muted/20 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                              <TypeIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{getTypeLabel(request.type)}</p>
                              <p className="text-xs text-muted-foreground">{request.userName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(request.startDate).toLocaleDateString('fr-FR')} - {new Date(request.endDate).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <span className="font-semibold">{request.days} jour{request.days > 1 ? 's' : ''}</span>
                          </div>
                          <p className="text-xs text-muted-foreground italic">{request.reason}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(request.status)}
                          <p className="text-xs text-muted-foreground">
                            {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions rapides & Info */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base">Actions rapides</CardTitle>
              <CardDescription>Gestion des congés</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-accent"
                onClick={handleCreateLeave}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle demande
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-accent"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Calendrier équipe
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-accent"
              >
                <Users className="mr-2 h-4 w-4" />
                Absences en cours
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-accent"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Rapports
              </Button>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-white text-base">Gestion des congés</CardTitle>
                  <CardDescription className="text-blue-100 text-xs">Fonctionnalités</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-50">Workflow d'approbation automatique</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-50">Calcul automatique des soldes</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-50">Calendrier partagé de l'équipe</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-50">Notifications email et push</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
