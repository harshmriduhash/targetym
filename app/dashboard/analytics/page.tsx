'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Briefcase,
  Award,
  Calendar,
  BarChart3,
  AlertTriangle
} from "lucide-react";
import { useState } from "react";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('month');

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-purple-500/70 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            People Analytics AI
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Insights RH alimentés par l'intelligence artificielle
          </p>
        </div>

        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Cette semaine</SelectItem>
            <SelectItem value="month">Ce mois</SelectItem>
            <SelectItem value="quarter">Ce trimestre</SelectItem>
            <SelectItem value="year">Cette année</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center justify-between">
              <span>Effectif total</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              +12% vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center justify-between">
              <span>Taux de rétention</span>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              +3% vs trimestre dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center justify-between">
              <span>Performance moyenne</span>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2/5</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              +0.3 vs année dernière
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center justify-between">
              <span>Postes ouverts</span>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-orange-600" />
              -4 vs mois dernier
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="border-purple-200 dark:border-purple-900 bg-gradient-to-br from-purple-50 to-background dark:from-purple-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-600 rounded-md">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            AI Insights
          </CardTitle>
          <CardDescription>
            Recommandations générées par l'IA basées sur vos données RH
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-background rounded-lg border border-purple-200 dark:border-purple-900">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-950 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Excellente rétention dans l'équipe Engineering</h4>
                <p className="text-sm text-muted-foreground">
                  Le taux de rétention de 98% dans l'équipe Engineering est supérieur de 6% à la moyenne de l'industrie.
                  Continuez à investir dans la formation technique et les opportunités de croissance.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-background rounded-lg border border-purple-200 dark:border-purple-900">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-950 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Risque de turnover détecté</h4>
                <p className="text-sm text-muted-foreground">
                  3 employés présentent des indicateurs de risque de départ (baisse d'engagement, diminution de performance).
                  Planifier des entretiens 1-on-1 dans les 2 prochaines semaines.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-background rounded-lg border border-purple-200 dark:border-purple-900">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">Opportunités de promotion identifiées</h4>
                <p className="text-sm text-muted-foreground">
                  5 employés ont dépassé leurs objectifs de 20%+ et sont prêts pour une promotion.
                  Prévoir des discussions de carrière avant la fin du trimestre.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Turnover Risk */}
        <Card>
          <CardHeader>
            <CardTitle>Risque de Turnover</CardTitle>
            <CardDescription>Employés à risque de départ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risque élevé</span>
                <span className="text-2xl font-bold text-red-600">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risque moyen</span>
                <span className="text-2xl font-bold text-orange-600">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risque faible</span>
                <span className="text-2xl font-bold text-green-600">109</span>
              </div>
              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground mb-2">Taux global</div>
                <div className="text-3xl font-bold text-green-600">8%</div>
                <p className="text-xs text-muted-foreground mt-1">Objectif: &lt;10%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Inventaire des Compétences</CardTitle>
            <CardDescription>Top compétences de l'organisation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { skill: 'JavaScript/TypeScript', employees: 42, level: 'Expert' },
                { skill: 'Python', employees: 28, level: 'Avancé' },
                { skill: 'React/Next.js', employees: 38, level: 'Expert' },
                { skill: 'Node.js', employees: 32, level: 'Avancé' },
                { skill: 'Cloud (AWS/Azure)', employees: 24, level: 'Intermédiaire' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{item.skill}</div>
                    <div className="text-xs text-muted-foreground">Niveau: {item.level}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{item.employees}</div>
                    <div className="text-xs text-muted-foreground">employés</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution Performance</CardTitle>
            <CardDescription>Répartition des évaluations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { rating: '5 - Exceptionnel', count: 18, percentage: 14.5, color: 'bg-purple-600' },
                { rating: '4 - Dépasse attentes', count: 52, percentage: 42, color: 'bg-blue-600' },
                { rating: '3 - Satisfaisant', count: 48, percentage: 38.7, color: 'bg-green-600' },
                { rating: '2 - À améliorer', count: 6, percentage: 4.8, color: 'bg-orange-600' },
                { rating: '1 - Insatisfaisant', count: 0, percentage: 0, color: 'bg-red-600' },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.rating}</span>
                    <span className="text-muted-foreground">{item.count} ({item.percentage}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} transition-all`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recruitment Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Métriques Recrutement</CardTitle>
            <CardDescription>Performance du pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium">Taux de conversion</div>
                  <div className="text-xs text-muted-foreground">Candidats → Embauches</div>
                </div>
                <div className="text-2xl font-bold text-green-600">7.5%</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium">Délai moyen embauche</div>
                  <div className="text-xs text-muted-foreground">De l'offre au début</div>
                </div>
                <div className="text-2xl font-bold">28j</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium">Coût par embauche</div>
                  <div className="text-xs text-muted-foreground">Moyenne 2025</div>
                </div>
                <div className="text-2xl font-bold">€3,200</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium">Satisfaction candidats</div>
                  <div className="text-xs text-muted-foreground">Score NPS</div>
                </div>
                <div className="text-2xl font-bold text-green-600">8.4/10</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-purple-600 to-purple-500 border-none text-white">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Besoin d'analyses plus approfondies?</h3>
              <p className="text-purple-100">
                Contactez notre équipe pour des rapports personnalisés et des insights AI avancés
              </p>
            </div>
            <Button variant="secondary" className="bg-white text-purple-600 hover:bg-purple-50">
              Demander une démo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
