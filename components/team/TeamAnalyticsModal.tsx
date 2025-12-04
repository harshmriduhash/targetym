'use client';

import React, { useMemo, memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Users, Award } from 'lucide-react';
import { getDepartmentLabel } from '@/lib/utils/team';
import { ROLE_LABELS } from '@/lib/constants/departments';

interface TeamMember {
  id: string;
  department: string;
  status: string;
  performanceScore?: number;
  role: string;
}

interface TeamAnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: TeamMember[];
}

// Metrics card component
const MetricCard = memo(({
  icon: Icon,
  label,
  value,
  suffix,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix?: string;
  iconColor: string;
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center">
        <Icon className={`h-4 w-4 ${iconColor} mr-2`} />
        <span className="text-2xl font-bold">{value}</span>
        {suffix && <span className="text-sm text-muted-foreground ml-1">{suffix}</span>}
      </div>
    </CardContent>
  </Card>
));

MetricCard.displayName = 'MetricCard';

// Department performance row
const DepartmentPerformanceRow = memo(({
  department,
  count,
  avgPerformance,
}: {
  department: string;
  count: number;
  avgPerformance: number;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm">
      <span className="font-medium">{getDepartmentLabel(department)}</span>
      <div className="flex items-center gap-2">
        <Badge variant="outline">
          {count} membre{count > 1 ? 's' : ''}
        </Badge>
        <span className="text-muted-foreground">{avgPerformance}/100</span>
      </div>
    </div>
    <Progress value={avgPerformance} className="h-2" />
  </div>
));

DepartmentPerformanceRow.displayName = 'DepartmentPerformanceRow';

// Role distribution card
const RoleDistributionCard = memo(({
  role,
  count,
  percentage,
}: {
  role: string;
  count: number;
  percentage: number;
}) => (
  <div className="flex flex-col items-center p-4 border rounded-lg">
    <span className="text-2xl font-bold text-blue-600">{count}</span>
    <span className="text-sm text-muted-foreground">
      {ROLE_LABELS[role] || role}
    </span>
    <span className="text-xs text-muted-foreground mt-1">{percentage}%</span>
  </div>
));

RoleDistributionCard.displayName = 'RoleDistributionCard';

// Insight item
const InsightItem = memo(({
  icon: Icon,
  title,
  description,
  iconColor,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  iconColor: string;
}) => (
  <div className="flex items-start gap-2">
    <Icon className={`h-5 w-5 ${iconColor} mt-0.5 flex-shrink-0`} />
    <div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </div>
));

InsightItem.displayName = 'InsightItem';

function TeamAnalyticsModal({ open, onOpenChange, members }: TeamAnalyticsModalProps) {
  // Memoize all calculations
  const stats = useMemo(() => {
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'active').length;
    const avgPerformance = totalMembers > 0
      ? Math.round(members.reduce((sum, m) => sum + (m.performanceScore || 0), 0) / totalMembers)
      : 0;
    const departments = new Set(members.map(m => m.department)).size;

    return { totalMembers, activeMembers, avgPerformance, departments };
  }, [members]);

  const departmentStats = useMemo(() => {
    return members.reduce((acc, member) => {
      const dept = member.department;
      if (!acc[dept]) {
        acc[dept] = { count: 0, avgPerformance: 0, totalPerformance: 0 };
      }
      acc[dept].count++;
      acc[dept].totalPerformance += member.performanceScore || 0;
      acc[dept].avgPerformance = Math.round(
        acc[dept].totalPerformance / acc[dept].count
      );
      return acc;
    }, {} as Record<string, { count: number; avgPerformance: number; totalPerformance: number }>);
  }, [members]);

  const roleDistribution = useMemo(() => {
    return members.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [members]);

  const roleDistributionWithPercentage = useMemo(() => {
    return Object.entries(roleDistribution).map(([role, count]) => ({
      role,
      count,
      percentage: Math.round((count / stats.totalMembers) * 100),
    }));
  }, [roleDistribution, stats.totalMembers]);

  const activityRate = useMemo(() => {
    return stats.totalMembers > 0
      ? Math.round((stats.activeMembers / stats.totalMembers) * 100)
      : 0;
  }, [stats.activeMembers, stats.totalMembers]);

  const isEmpty = stats.totalMembers === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <BarChart3 className="mr-2" /> Analytiques de l&apos;équipe
          </DialogTitle>
          <DialogDescription>
            Vue d&apos;ensemble des performances et de la composition de l&apos;équipe
          </DialogDescription>
        </DialogHeader>

        {isEmpty ? (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune donnée analytique disponible</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Métriques globales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                icon={Users}
                label="Total membres"
                value={stats.totalMembers}
                iconColor="text-blue-600"
              />
              <MetricCard
                icon={TrendingUp}
                label="Actifs"
                value={stats.activeMembers}
                iconColor="text-green-600"
              />
              <MetricCard
                icon={Award}
                label="Performance moy."
                value={stats.avgPerformance}
                suffix="/100"
                iconColor="text-purple-600"
              />
              <MetricCard
                icon={BarChart3}
                label="Départements"
                value={stats.departments}
                iconColor="text-amber-600"
              />
            </div>

            {/* Performance par département */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance par département</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(departmentStats).map(([dept, data]) => (
                  <DepartmentPerformanceRow
                    key={dept}
                    department={dept}
                    count={data.count}
                    avgPerformance={data.avgPerformance}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Distribution des rôles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribution des rôles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {roleDistributionWithPercentage.map(({ role, count, percentage }) => (
                    <RoleDistributionCard
                      key={role}
                      role={role}
                      count={count}
                      percentage={percentage}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Insights clés */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Insights clés</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InsightItem
                  icon={TrendingUp}
                  title="Taux d'activité élevé"
                  description={`${activityRate}% des membres sont actifs`}
                  iconColor="text-green-600"
                />
                <InsightItem
                  icon={Award}
                  title="Performance globale"
                  description={`Score moyen de ${stats.avgPerformance}/100 sur l'ensemble de l'équipe`}
                  iconColor="text-purple-600"
                />
                <InsightItem
                  icon={Users}
                  title="Structure organisationnelle"
                  description={`${stats.departments} départements actifs avec une répartition équilibrée`}
                  iconColor="text-blue-600"
                />
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default memo(TeamAnalyticsModal);
