'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  FileText,
  Download,
  Calendar,
  Users,
  TrendingUp,
  Award,
  Briefcase,
  Clock,
  Filter
} from "lucide-react";

type ReportType = 'all' | 'performance' | 'recruitment' | 'goals' | 'attendance';
type TimePeriod = 'week' | 'month' | 'quarter' | 'year';

const REPORT_TEMPLATES = [
  {
    id: 'performance-summary',
    title: 'Performance Summary',
    description: 'Comprehensive performance review metrics and trends',
    category: 'performance',
    icon: Award,
    stats: { generated: 45, avgRating: 4.2 },
    lastGenerated: '2 hours ago'
  },
  {
    id: 'recruitment-pipeline',
    title: 'Recruitment Pipeline',
    description: 'Candidate flow, conversion rates, and hiring metrics',
    category: 'recruitment',
    icon: Briefcase,
    stats: { candidates: 156, hired: 12 },
    lastGenerated: '1 day ago'
  },
  {
    id: 'goals-progress',
    title: 'Goals Progress Report',
    description: 'OKRs completion status and team alignment',
    category: 'goals',
    icon: TrendingUp,
    stats: { total: 48, completed: 32 },
    lastGenerated: '3 hours ago'
  },
  {
    id: 'attendance-overview',
    title: 'Attendance Overview',
    description: 'Time tracking, absences, and leave balances',
    category: 'attendance',
    icon: Clock,
    stats: { present: 92, absent: 8 },
    lastGenerated: '5 hours ago'
  },
  {
    id: 'headcount-analysis',
    title: 'Headcount Analysis',
    description: 'Team size, distribution, and growth trends',
    category: 'performance',
    icon: Users,
    stats: { total: 124, growth: '+12%' },
    lastGenerated: '1 week ago'
  },
  {
    id: 'turnover-risk',
    title: 'Turnover Risk Assessment',
    description: 'Employee retention analysis and risk factors',
    category: 'performance',
    icon: TrendingUp,
    stats: { risk: 'Low', atRisk: 5 },
    lastGenerated: '2 days ago'
  },
];

export default function ReportsPage() {
  const [selectedType, setSelectedType] = useState<ReportType>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');

  const filteredReports = selectedType === 'all'
    ? REPORT_TEMPLATES
    : REPORT_TEMPLATES.filter(r => r.category === selectedType);

  const handleDownload = (format: 'pdf' | 'excel', reportId: string) => {
    console.log(`Downloading ${reportId} as ${format}`);
    // TODO: Implement actual download logic
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-blue-600/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              Rapports & Analytics
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Générez et exportez des rapports RH complets
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={selectedType} onValueChange={(value) => setSelectedType(value as ReportType)}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type de rapport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rapports</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="recruitment">Recrutement</SelectItem>
              <SelectItem value="goals">Objectifs</SelectItem>
              <SelectItem value="attendance">Présence</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as TimePeriod)}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Rapports générés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Exports PDF</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">Cette semaine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Rapports programmés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Dernière génération</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h</div>
            <p className="text-xs text-muted-foreground">Il y a</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-6">
        <h2 className="text-xl font-semibold">Modèles de rapports</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => {
            const Icon = report.icon;
            return (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{report.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {report.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="flex gap-4 text-sm">
                    {Object.entries(report.stats).map(([key, value]) => (
                      <div key={key}>
                        <div className="font-semibold">{value}</div>
                        <div className="text-muted-foreground text-xs capitalize">{key}</div>
                      </div>
                    ))}
                  </div>

                  {/* Last Generated */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Généré {report.lastGenerated}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDownload('pdf', report.id)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleDownload('excel', report.id)}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Rapports programmés</CardTitle>
          <CardDescription>
            Rapports automatiques envoyés par email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Performance hebdomadaire', frequency: 'Lundi 9h00', active: true },
              { name: 'Recrutement mensuel', frequency: '1er du mois', active: true },
              { name: 'Objectifs trimestriels', frequency: 'Début de trimestre', active: false },
            ].map((scheduled, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">{scheduled.name}</div>
                    <div className="text-xs text-muted-foreground">{scheduled.frequency}</div>
                  </div>
                </div>
                <Badge variant={scheduled.active ? 'default' : 'secondary'}>
                  {scheduled.active ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
