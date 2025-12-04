'use client';

import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Book, Award, FileCheck, AlertTriangle } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  status: string;
  progress: number;
  deadline?: string;
}

interface Certification {
  id: string;
  title: string;
  issueDate: string;
  expiryDate?: string;
  renewalRequired: boolean;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
}

interface LearningAnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses?: Course[];
  certifications?: Certification[];
  skills?: Skill[];
}

export default function LearningAnalyticsModal({
  open,
  onOpenChange,
  courses = [],
  certifications = [],
  skills = []
}: LearningAnalyticsModalProps) {
  const learningAnalytics = useMemo(() => {
    const now = new Date();
    
    const courseStats = {
      total: courses.length,
      notStarted: courses.filter(c => c.status === 'not_started').length,
      inProgress: courses.filter(c => c.status === 'in_progress').length,
      completed: courses.filter(c => c.status === 'completed').length,
      completionRate: courses.length > 0 
        ? (courses.filter(c => c.status === 'completed').length / courses.length) * 100 
        : 0,
      lateCoursesCount: courses.filter(c => {
        if (c.deadline && c.status !== 'completed') {
          return new Date(c.deadline) < now;
        }
        return false;
      }).length,
    };

    const certificationStats = {
      total: certifications.length,
      active: certifications.filter(cert => 
        !cert.expiryDate || new Date(cert.expiryDate) > now
      ).length,
      expiring: certifications.filter(cert => {
        if (!cert.expiryDate) return false;
        const expiryDate = new Date(cert.expiryDate);
        const daysUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
        return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
      }).length,
      expired: certifications.filter(cert => 
        cert.expiryDate && new Date(cert.expiryDate) < now
      ).length,
      renewalRequired: certifications.filter(cert => 
        cert.renewalRequired && (!cert.expiryDate || new Date(cert.expiryDate) < now)
      ).length,
    };

    const skillsStats = {
      total: skills.length,
      categories: [...new Set(skills.map(skill => skill.category))],
      averageLevel: skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length || 0,
      categoryStats: {},
    };

    skillsStats.categories.forEach(category => {
      const categorySkills = skills.filter(skill => skill.category === category);
      skillsStats.categoryStats[category] = {
        total: categorySkills.length,
        averageLevel: categorySkills.reduce((sum, skill) => sum + skill.level, 0) / categorySkills.length || 0,
      };
    });

    return { courseStats, certificationStats, skillsStats };
  }, [courses, certifications, skills]);

  const { courseStats, certificationStats, skillsStats } = learningAnalytics;

  const renderAlerts = () => (
    <div className="space-y-2 mb-4">
      {courseStats.lateCoursesCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {courseStats.lateCoursesCount} formation(s) en retard
          </AlertDescription>
        </Alert>
      )}
      {certificationStats.expiring > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {certificationStats.expiring} certification(s) expire(nt) dans les 90 jours
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  const renderOverview = () => (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <Book className="h-5 w-5 text-blue-600" />
          <Badge>{courseStats.total}</Badge>
        </div>
        <h3 className="font-semibold mb-1">Formations</h3>
        <Progress value={courseStats.completionRate} className="mb-2" />
        <p className="text-sm text-muted-foreground">
          {courseStats.completionRate.toFixed(0)}% complétées
        </p>
      </div>

      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <Award className="h-5 w-5 text-yellow-600" />
          <Badge>{certificationStats.total}</Badge>
        </div>
        <h3 className="font-semibold mb-1">Certifications</h3>
        <p className="text-sm text-muted-foreground">
          {certificationStats.active} actives
        </p>
      </div>

      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <FileCheck className="h-5 w-5 text-green-600" />
          <Badge>{skillsStats.total}</Badge>
        </div>
        <h3 className="font-semibold mb-1">Compétences</h3>
        <p className="text-sm text-muted-foreground">
          Niveau moyen: {skillsStats.averageLevel.toFixed(1)}/5
        </p>
      </div>
    </div>
  );

  const renderFormationsDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">Non commencées</h4>
          <p className="text-2xl font-bold">{courseStats.notStarted}</p>
        </div>
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">En cours</h4>
          <p className="text-2xl font-bold">{courseStats.inProgress}</p>
        </div>
      </div>
    </div>
  );

  const renderCertificationsDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">Actives</h4>
          <p className="text-2xl font-bold">{certificationStats.active}</p>
        </div>
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">Expirées</h4>
          <p className="text-2xl font-bold">{certificationStats.expired}</p>
        </div>
      </div>
    </div>
  );

  const renderSkillsDetails = () => (
    <div className="space-y-4">
      {skillsStats.categories.map(category => (
        <div key={category} className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">{category}</h4>
          <p className="text-sm text-muted-foreground">
            {skillsStats.categoryStats[category]?.total || 0} compétences
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <BarChart className="mr-2" /> Analytiques de formation
          </DialogTitle>
          <DialogDescription>
            Vue d'ensemble détaillée de votre parcours d'apprentissage
          </DialogDescription>
        </DialogHeader>

        {renderAlerts()}

        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="formations">Formations</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
            <TabsTrigger value="skills">Compétences</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {renderOverview()}
          </TabsContent>

          <TabsContent value="formations">
            {renderFormationsDetails()}
          </TabsContent>

          <TabsContent value="certifications">
            {renderCertificationsDetails()}
          </TabsContent>

          <TabsContent value="skills">
            {renderSkillsDetails()}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
