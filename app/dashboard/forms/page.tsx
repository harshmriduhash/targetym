'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Plus, CheckCircle2, Clock, XCircle, Users, TrendingUp, Calendar, Search, Filter, Eye, Edit } from "lucide-react"
import { Badge } from '@/components/ui/badge';

interface FormEntry {
  id: string;
  formName: string;
  submittedBy: string;
  department: string;
  status: 'submitted' | 'in-review' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  priority: 'high' | 'medium' | 'low';
}

export default function FormsPage() {
  const [formEntries, setFormEntries] = useState<FormEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const stored = localStorage.getItem('formEntries');
    if (stored) {
      setFormEntries(JSON.parse(stored));
    } else {
      const mockEntries: FormEntry[] = [
        {
          id: '1',
          formName: 'Demande de congés annuels',
          submittedBy: 'Jean Dupont',
          department: 'IT',
          status: 'approved',
          submittedAt: '2025-10-20T10:30:00',
          reviewedBy: 'Marie Martin',
          reviewedAt: '2025-10-21T14:00:00',
          priority: 'medium'
        },
        {
          id: '2',
          formName: 'Demande de matériel informatique',
          submittedBy: 'Sophie Bernard',
          department: 'HR',
          status: 'in-review',
          submittedAt: '2025-10-23T09:15:00',
          priority: 'high'
        },
        {
          id: '3',
          formName: 'Formulaire de remboursement',
          submittedBy: 'Pierre Durand',
          department: 'Finance',
          status: 'submitted',
          submittedAt: '2025-10-24T16:45:00',
          priority: 'low'
        },
        {
          id: '4',
          formName: 'Évaluation de performance',
          submittedBy: 'Thomas Petit',
          department: 'IT',
          status: 'approved',
          submittedAt: '2025-10-18T11:00:00',
          reviewedBy: 'Marie Martin',
          reviewedAt: '2025-10-19T15:30:00',
          priority: 'high'
        },
        {
          id: '5',
          formName: 'Demande de formation',
          submittedBy: 'Marie Martin',
          department: 'Management',
          status: 'rejected',
          submittedAt: '2025-10-15T14:20:00',
          reviewedBy: 'Direction',
          reviewedAt: '2025-10-17T10:00:00',
          priority: 'medium'
        }
      ];
      setFormEntries(mockEntries);
      localStorage.setItem('formEntries', JSON.stringify(mockEntries));
    }
  }, []);

  const handleCreateEntry = () => {
    const newEntry: FormEntry = {
      id: crypto.randomUUID(),
      formName: 'Nouveau formulaire',
      submittedBy: 'Utilisateur Courant',
      department: 'IT',
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      priority: 'medium'
    };

    const updated = [newEntry, ...formEntries];
    setFormEntries(updated);
    localStorage.setItem('formEntries', JSON.stringify(updated));
  };

  const filteredEntries = formEntries.filter(entry => {
    const matchesSearch =
      entry.formName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.submittedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: formEntries.length,
    submitted: formEntries.filter(e => e.status === 'submitted').length,
    inReview: formEntries.filter(e => e.status === 'in-review').length,
    approved: formEntries.filter(e => e.status === 'approved').length,
    rejected: formEntries.filter(e => e.status === 'rejected').length,
    thisWeek: formEntries.filter(e => {
      const submitted = new Date(e.submittedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return submitted >= weekAgo;
    }).length
  };

  const getStatusBadge = (status: FormEntry['status']) => {
    const variants = {
      submitted: { label: 'Soumis', variant: 'secondary' as const, icon: FileText },
      'in-review': { label: 'En révision', variant: 'default' as const, icon: Clock },
      approved: { label: 'Approuvé', variant: 'default' as const, icon: CheckCircle2 },
      rejected: { label: 'Rejeté', variant: 'destructive' as const, icon: XCircle }
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

  const getPriorityBadge = (priority: FormEntry['priority']) => {
    const variants = {
      high: { label: 'Haute', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
      medium: { label: 'Moyenne', className: 'bg-orange-100 text-orange-800 hover:bg-orange-100' },
      low: { label: 'Basse', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' }
    };

    const config = variants[priority];

    return (
      <Badge variant="secondary" className={`text-xs ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Formulaires</h1>
          <p className="text-muted-foreground mt-1">
            Gestion des soumissions de formulaires
          </p>
        </div>
        <Button onClick={handleCreateEntry} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau formulaire
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Formulaires</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Soumis</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gray-500 to-gray-600">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.submitted}</div>
            <p className="text-xs text-muted-foreground mt-1">En attente</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En révision</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.inReview}</div>
            <p className="text-xs text-muted-foreground mt-1">En cours</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approuvés</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground mt-1">Validés</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejetés</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600">
              <XCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground mt-1">Refusés</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cette semaine</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.thisWeek}</div>
            <p className="text-xs text-muted-foreground mt-1">Nouveaux</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-slate-900">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un formulaire..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">Tous les statuts</option>
                <option value="submitted">Soumis</option>
                <option value="in-review">En révision</option>
                <option value="approved">Approuvé</option>
                <option value="rejected">Rejeté</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-white dark:bg-slate-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Formulaires ({filteredEntries.length})</CardTitle>
            </div>
            <CardDescription>Soumissions et statuts</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredEntries.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-muted">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Aucun formulaire trouvé</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Créez votre premier formulaire
                </p>
                <Button onClick={handleCreateEntry} className="bg-gradient-to-r from-blue-500 to-purple-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau formulaire
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className="p-4 border rounded-lg hover:bg-muted/20 transition-all">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(entry.status)}
                          {getPriorityBadge(entry.priority)}
                        </div>
                        <h4 className="font-semibold text-base mb-1">{entry.formName}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {entry.submittedBy}
                          </span>
                          <span>•</span>
                          <span>{entry.department}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(entry.submittedAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {entry.reviewedBy && (
                      <div className="text-xs text-muted-foreground border-t pt-2">
                        Révisé par {entry.reviewedBy} le {new Date(entry.reviewedAt!).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base">Actions rapides</CardTitle>
              <CardDescription>Gestion des formulaires</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-accent"
                onClick={handleCreateEntry}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouveau formulaire
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-accent"
              >
                <Clock className="mr-2 h-4 w-4" />
                En attente de révision
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-accent"
              >
                <FileText className="mr-2 h-4 w-4" />
                Modèles de formulaires
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

          <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-white text-base">Gestion des formulaires</CardTitle>
                  <CardDescription className="text-blue-100 text-xs">Fonctionnalités</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-50">Workflow d'approbation</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-50">Modèles personnalisables</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-50">Historique complet</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-50">Notifications automatiques</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
