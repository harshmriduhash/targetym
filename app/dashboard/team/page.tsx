'use client';

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Network, BarChart3, List } from "lucide-react";
import { TeamMember } from "@/components/team/TeamMemberCard";
import AddTeamMemberModal from "@/components/team/AddTeamMemberModal";
import TeamStructureModal from "@/components/team/TeamStructureModal";
import TeamAnalyticsModal from "@/components/team/TeamAnalyticsModal";
import TeamMembersListModal from "@/components/team/TeamMembersListModal";
import ModuleHeader from "@/components/common/layouts/ModuleHeader";
import StatCard from "@/components/common/stats/StatCard";
import SearchFilter from "@/components/common/filters/SearchFilter";
import FilterBar from "@/components/common/filters/FilterBar";
import FilterSelect from "@/components/common/filters/FilterSelect";
import FilterLayout from "@/components/common/filters/FilterLayout";
import EmptyState from "@/components/common/layouts/EmptyState";
import QuickActions, { QuickAction } from "@/components/common/layouts/QuickActions";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useFilters } from "@/hooks/use-filters";
import { useStats } from "@/hooks/use-stats";
import { DEPARTMENT_LABELS } from "@/lib/constants/departments";
import { STATUS_CONFIG } from "@/lib/constants/team-status";

export default function TeamPage() {
  const [members, setMembers] = useLocalStorage<TeamMember[]>('teamMembers', []);

  const [showAddMember, setShowAddMember] = useState(false);
  const [showStructure, setShowStructure] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showMembersList, setShowMembersList] = useState(false);

  // Use filters hook
  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    resetFilters,
    filteredItems: filteredMembers,
    activeFiltersCount,
  } = useFilters<TeamMember>(members, {
    searchFields: ['name', 'email', 'position'],
  });

  // Use stats hook
  const stats = useStats(members, [
    {
      label: 'Total membres',
      calculate: (items) => items.length,
      icon: Users,
      iconColor: 'text-blue-600',
      description: () => 'Dans l\'organisation',
    },
    {
      label: 'Membres actifs',
      calculate: (items) => items.filter(m => m.status === 'active').length,
      icon: Users,
      iconColor: 'text-green-600',
      description: (value) => {
        const total = members.length;
        const percentage = total > 0 ? Math.round((Number(value) / total) * 100) : 0;
        return `${percentage}% du total`;
      },
    },
    {
      label: 'Départements',
      calculate: (items) => new Set(items.map(m => m.department)).size,
      icon: Network,
      iconColor: 'text-purple-600',
      description: () => 'Départements actifs',
    },
    {
      label: 'Performance moy.',
      calculate: (items) => {
        if (items.length === 0) return 0;
        return Math.round(items.reduce((sum, m) => sum + (m.performanceScore || 0), 0) / items.length);
      },
      icon: BarChart3,
      iconColor: 'text-amber-600',
      description: () => 'Score sur 100',
    },
  ]);

  // Quick actions configuration
  const quickActions: QuickAction[] = [
    {
      label: 'Ajouter un membre',
      icon: UserPlus,
      onClick: () => setShowAddMember(true),
      variant: 'default',
      description: 'Ajouter un nouveau membre à l\'équipe',
    },
    {
      label: 'Structure d\'équipe',
      icon: Network,
      onClick: () => setShowStructure(true),
      variant: 'outline',
      description: 'Voir l\'organigramme de l\'équipe',
    },
    {
      label: 'Analytiques',
      icon: BarChart3,
      onClick: () => setShowAnalytics(true),
      variant: 'outline',
      description: 'Analyser les performances de l\'équipe',
    },
  ];

  const handleAddMember = (newMember: TeamMember) => {
    setMembers([...members, newMember]);
  };

  // Prepare filter options with counts
  const departmentOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach(member => {
      counts[member.department] = (counts[member.department] || 0) + 1;
    });

    return [
      { value: 'all', label: 'Tous les départements', count: members.length },
      ...Object.entries(DEPARTMENT_LABELS).map(([key, label]) => ({
        value: key,
        label,
        count: counts[key] || 0,
      })).filter(opt => opt.count > 0 || opt.value === 'all'),
    ];
  }, [members]);

  const statusOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach(member => {
      counts[member.status] = (counts[member.status] || 0) + 1;
    });

    return [
      { value: 'all', label: 'Tous les statuts', count: members.length },
      ...Object.entries(STATUS_CONFIG).map(([key, config]) => ({
        value: key,
        label: config.label,
        count: counts[key] || 0,
      })).filter(opt => opt.count > 0 || opt.value === 'all'),
    ];
  }, [members]);

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <ModuleHeader
        title="Gestion d'équipe"
        description="Vue d'ensemble et gestion des membres de votre équipe"
        icon={Users}
        badgeText="Module"
        badgeVariant="default"
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.label}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            iconColor={stat.iconColor}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <QuickActions
        title="Actions rapides"
        description="Gérez votre équipe efficacement"
        actions={quickActions}
      />

      {/* Filters */}
      <FilterBar
        title="Filtrer les membres"
        activeFiltersCount={activeFiltersCount}
        onReset={resetFilters}
        collapsible={true}
        defaultCollapsed={false}
      >
        <FilterLayout
          search={
            <SearchFilter
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Rechercher par nom, email, poste..."
            />
          }
          filters={[
            <FilterSelect
              key="department"
              value={filters.department || 'all'}
              onChange={(value) => setFilter('department', value)}
              options={departmentOptions}
              placeholder="Tous les départements"
              label="Département"
              showCount={true}
            />,
            <FilterSelect
              key="status"
              value={filters.status || 'all'}
              onChange={(value) => setFilter('status', value)}
              options={statusOptions}
              placeholder="Tous les statuts"
              label="Statut"
              showCount={true}
            />
          ]}
        />
      </FilterBar>

      {/* Team Members Summary */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Membres de l&apos;équipe ({filteredMembers.length})
          </h2>
          {filteredMembers.length > 0 && (
            <Button
              onClick={() => setShowMembersList(true)}
              variant="outline"
              className="gap-2"
            >
              <List className="h-4 w-4" />
              Voir la liste complète
            </Button>
          )}
        </div>

        {filteredMembers.length === 0 ? (
          members.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Aucun membre dans l'équipe"
              description="Commencez par ajouter des membres à votre équipe"
              actionLabel="Ajouter un membre"
              onAction={() => setShowAddMember(true)}
            />
          ) : (
            <EmptyState
              icon={Users}
              title="Aucun résultat"
              description="Essayez de modifier vos critères de recherche"
              variant="search"
            />
          )
        ) : null}
      </div>

      {/* Modals */}
      <AddTeamMemberModal
        open={showAddMember}
        onOpenChange={setShowAddMember}
        onSave={handleAddMember}
      />
      <TeamMembersListModal
        open={showMembersList}
        onOpenChange={setShowMembersList}
        members={filteredMembers}
        title="Membres de l'équipe"
        description={
          activeFiltersCount > 0
            ? `${filteredMembers.length} membre${filteredMembers.length > 1 ? 's' : ''} (filtré${filteredMembers.length > 1 ? 's' : ''})`
            : `${filteredMembers.length} membre${filteredMembers.length > 1 ? 's' : ''} au total`
        }
        onMemberClick={(member) => console.log('View member details:', member)}
      />
      <TeamStructureModal
        open={showStructure}
        onOpenChange={setShowStructure}
        members={members}
      />
      <TeamAnalyticsModal
        open={showAnalytics}
        onOpenChange={setShowAnalytics}
        members={members}
      />
    </div>
  );
}
