'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  Circle,
  LayoutDashboard,
  Plus,
  RefreshCw,
  Search,
  Users,
  Calendar,
  ListTodo,
  Link as LinkIcon
} from "lucide-react";

const ASANA_PROJECTS = [
  {
    id: 'proj-1',
    name: 'RH Onboarding 2025',
    status: 'active',
    tasksCompleted: 12,
    tasksTotal: 24,
    teamMembers: 5,
    dueDate: '2025-03-15',
    color: 'blue'
  },
  {
    id: 'proj-2',
    name: 'Performance Review Q1',
    status: 'active',
    tasksCompleted: 8,
    tasksTotal: 15,
    teamMembers: 3,
    dueDate: '2025-02-28',
    color: 'green'
  },
  {
    id: 'proj-3',
    name: 'Recruitment Campaign',
    status: 'completed',
    tasksCompleted: 20,
    tasksTotal: 20,
    teamMembers: 4,
    dueDate: '2025-01-31',
    color: 'purple'
  },
];

const RECENT_TASKS = [
  { id: '1', title: 'Préparer les contrats nouveaux embauchés', project: 'RH Onboarding 2025', status: 'in_progress', assignee: 'Marie Dubois' },
  { id: '2', title: 'Planifier entretiens annuels', project: 'Performance Review Q1', status: 'completed', assignee: 'Jean Martin' },
  { id: '3', title: 'Publier offre Senior Developer', project: 'Recruitment Campaign', status: 'completed', assignee: 'Sophie Laurent' },
  { id: '4', title: 'Réviser politique télétravail', project: 'RH Onboarding 2025', status: 'in_progress', assignee: 'Marie Dubois' },
];

export default function AsanaPage() {
  const [isConnected, setIsConnected] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = ASANA_PROJECTS.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-pink-600/10 rounded-lg">
                <LayoutDashboard className="h-6 w-6 text-pink-600" />
              </div>
              Asana Integration
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gérez vos projets et tâches Asana depuis Targetym
            </p>
          </div>

          {isConnected ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Synchroniser
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau projet
              </Button>
            </div>
          ) : (
            <Button>
              <LinkIcon className="h-4 w-4 mr-2" />
              Connecter Asana
            </Button>
          )}
        </div>

        {/* Connection Status */}
        {isConnected && (
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">Connecté à Asana</p>
                  <p className="text-sm text-green-700 dark:text-green-300">Workspace: Targetym HR - 3 projets synchronisés</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Projets actifs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">En cours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tâches en cours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">20</div>
            <p className="text-xs text-muted-foreground">À compléter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tâches complétées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">40</div>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Membres actifs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Sur les projets</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un projet..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6">
        <h2 className="text-xl font-semibold">Projets Asana</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const progress = (project.tasksCompleted / project.tasksTotal) * 100;
            const isCompleted = project.status === 'completed';

            return (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{project.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {project.tasksCompleted}/{project.tasksTotal} tâches
                      </CardDescription>
                    </div>
                    <Badge variant={isCompleted ? 'default' : 'secondary'}>
                      {isCompleted ? 'Terminé' : 'En cours'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progression</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {project.teamMembers}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(project.dueDate).toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  {/* Action */}
                  <Button variant="outline" size="sm" className="w-full">
                    <ListTodo className="h-3 w-3 mr-2" />
                    Voir les tâches
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Tâches récentes</CardTitle>
          <CardDescription>Dernières activités sur vos projets Asana</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {RECENT_TASKS.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <div className="font-medium text-sm">{task.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {task.project} • Assigné à {task.assignee}
                    </div>
                  </div>
                </div>
                <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                  {task.status === 'completed' ? 'Terminée' : 'En cours'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
