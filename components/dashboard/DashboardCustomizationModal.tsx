'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LayoutDashboard,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Target,
  Palette,
  Eye,
  Calendar
} from 'lucide-react';

interface DashboardCustomizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AVAILABLE_WIDGETS = [
  { id: 'goals-overview', label: 'Vue d\'ensemble des objectifs', icon: Target, category: 'goals' },
  { id: 'goals-progress', label: 'Progression des OKRs', icon: TrendingUp, category: 'goals' },
  { id: 'team-performance', label: 'Performance d\'équipe', icon: Users, category: 'performance' },
  { id: 'recruitment-pipeline', label: 'Pipeline de recrutement', icon: Users, category: 'recruitment' },
  { id: 'analytics-overview', label: 'Analyses RH', icon: BarChart3, category: 'analytics' },
  { id: 'upcoming-reviews', label: 'Évaluations à venir', icon: Calendar, category: 'performance' },
  { id: 'skills-matrix', label: 'Matrice de compétences', icon: PieChart, category: 'learning' },
  { id: 'turnover-risk', label: 'Risque de turnover', icon: TrendingUp, category: 'analytics' },
];

const REPORT_TYPES = [
  { id: 'daily', label: 'Rapport quotidien', description: 'Résumé journalier des activités' },
  { id: 'weekly', label: 'Rapport hebdomadaire', description: 'Synthèse de la semaine' },
  { id: 'monthly', label: 'Rapport mensuel', description: 'Bilan mensuel complet' },
  { id: 'quarterly', label: 'Rapport trimestriel', description: 'Analyse trimestrielle approfondie' },
];

const THEMES = [
  { id: 'default', label: 'Par défaut', description: 'Thème standard' },
  { id: 'compact', label: 'Compact', description: 'Vue condensée avec plus d\'informations' },
  { id: 'spacious', label: 'Spacieux', description: 'Vue aérée et claire' },
  { id: 'minimal', label: 'Minimal', description: 'Interface épurée' },
];

export function DashboardCustomizationModal({ open, onOpenChange }: DashboardCustomizationModalProps) {
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([
    'goals-overview',
    'team-performance',
    'analytics-overview'
  ]);
  const [selectedReports, setSelectedReports] = useState<string[]>(['weekly']);
  const [theme, setTheme] = useState('default');
  const [layout, setLayout] = useState('grid');

  const handleWidgetToggle = (widgetId: string) => {
    setSelectedWidgets(prev =>
      prev.includes(widgetId)
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const handleReportToggle = (reportId: string) => {
    setSelectedReports(prev =>
      prev.includes(reportId)
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Sauvegarder les préférences dans localStorage
    const preferences = {
      widgets: selectedWidgets,
      reports: selectedReports,
      theme,
      layout
    };

    localStorage.setItem('dashboard-preferences', JSON.stringify(preferences));

    console.log('Dashboard preferences saved:', preferences);

    // Recharger la page pour appliquer les changements
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            Personnaliser le tableau de bord
          </DialogTitle>
          <DialogDescription>
            Configurez votre espace de travail selon vos besoins
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="widgets" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="widgets">
                <BarChart3 className="h-4 w-4 mr-2" />
                Widgets
              </TabsTrigger>
              <TabsTrigger value="reports">
                <PieChart className="h-4 w-4 mr-2" />
                Rapports
              </TabsTrigger>
              <TabsTrigger value="appearance">
                <Palette className="h-4 w-4 mr-2" />
                Apparence
              </TabsTrigger>
            </TabsList>

            {/* Widgets Tab */}
            <TabsContent value="widgets" className="space-y-4 mt-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Widgets du tableau de bord</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Sélectionnez les widgets à afficher sur votre tableau de bord
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {AVAILABLE_WIDGETS.map((widget) => {
                    const Icon = widget.icon;
                    const isChecked = selectedWidgets.includes(widget.id);
                    return (
                      <div
                        key={widget.id}
                        className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all ${
                          isChecked
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Checkbox
                          id={`widget-${widget.id}`}
                          checked={isChecked}
                          onCheckedChange={() => handleWidgetToggle(widget.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" />
                            <Label
                              htmlFor={`widget-${widget.id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {widget.label}
                            </Label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-sm text-muted-foreground mt-4">
                  {selectedWidgets.length} widget(s) sélectionné(s)
                </p>
              </div>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-4 mt-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Rapports automatiques</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Choisissez les rapports à recevoir automatiquement par email
                </p>

                <div className="space-y-3">
                  {REPORT_TYPES.map((report) => {
                    const isChecked = selectedReports.includes(report.id);
                    return (
                      <div
                        key={report.id}
                        className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all ${
                          isChecked
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Checkbox
                          id={`report-${report.id}`}
                          checked={isChecked}
                          onCheckedChange={() => handleReportToggle(report.id)}
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={`report-${report.id}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {report.label}
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            {report.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    Thème du tableau de bord
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {THEMES.map((themeOption) => (
                      <div
                        key={themeOption.id}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          theme === themeOption.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setTheme(themeOption.id)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-3 h-3 rounded-full ${
                            theme === themeOption.id ? 'bg-primary' : 'bg-border'
                          }`} />
                          <Label className="font-medium cursor-pointer">
                            {themeOption.label}
                          </Label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {themeOption.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="layout" className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    Disposition des widgets
                  </Label>
                  <Select value={layout} onValueChange={setLayout}>
                    <SelectTrigger id="layout">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grille (2 colonnes)</SelectItem>
                      <SelectItem value="list">Liste (1 colonne)</SelectItem>
                      <SelectItem value="masonry">Maçonnerie (adaptive)</SelectItem>
                      <SelectItem value="auto">Automatique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Enregistrer les préférences
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
