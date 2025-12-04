'use client';

import React, { useMemo, memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Network } from 'lucide-react';
import { getInitials, getDepartmentLabel, formatMemberCount, formatDirectReports } from '@/lib/utils/team';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  department: string;
  avatar?: string;
  directReports?: number;
}

interface TeamStructureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: TeamMember[];
}

// Memoized department member card component
const DepartmentMemberCard = memo(({ member }: { member: TeamMember }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={member.avatar} alt={member.name} />
          <AvatarFallback className="text-sm">
            {getInitials(member.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{member.name}</h4>
          <p className="text-sm text-muted-foreground truncate">{member.position}</p>
          {member.directReports && member.directReports > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {formatDirectReports(member.directReports)}
            </p>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
));

DepartmentMemberCard.displayName = 'DepartmentMemberCard';

// Memoized department section component
const DepartmentSection = memo(({
  department,
  members
}: {
  department: string;
  members: TeamMember[]
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">{getDepartmentLabel(department)}</h3>
      <Badge variant="outline">{formatMemberCount(members.length)}</Badge>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {members.map((member) => (
        <DepartmentMemberCard key={member.id} member={member} />
      ))}
    </div>
  </div>
));

DepartmentSection.displayName = 'DepartmentSection';

// Empty state component
const EmptyState = memo(() => (
  <div className="text-center py-12 text-muted-foreground">
    <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
    <p>Aucune structure d&apos;équipe disponible</p>
  </div>
));

EmptyState.displayName = 'EmptyState';

function TeamStructureModal({ open, onOpenChange, members }: TeamStructureModalProps) {
  // Memoize department grouping to avoid recalculation on every render
  const departmentGroups = useMemo(() => {
    return members.reduce((acc, member) => {
      const dept = member.department;
      if (!acc[dept]) {
        acc[dept] = [];
      }
      acc[dept].push(member);
      return acc;
    }, {} as Record<string, TeamMember[]>);
  }, [members]);

  const departmentEntries = useMemo(
    () => Object.entries(departmentGroups),
    [departmentGroups]
  );

  const isEmpty = departmentEntries.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Network className="mr-2" /> Structure de l&apos;équipe
          </DialogTitle>
          <DialogDescription>
            Vue hiérarchique de l&apos;organisation par département
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isEmpty ? (
            <EmptyState />
          ) : (
            departmentEntries.map(([dept, deptMembers]) => (
              <DepartmentSection
                key={dept}
                department={dept}
                members={deptMembers}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default memo(TeamStructureModal);
