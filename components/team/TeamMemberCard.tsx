'use client';

import React, { memo, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Calendar, MapPin } from 'lucide-react';
import { getInitials, getDepartmentLabel } from '@/lib/utils/team';
import { getStatusConfig, type TeamMemberStatus } from '@/lib/constants/team-status';
import { formatJoinDate } from '@/lib/utils/date';
import { ROLE_LABELS } from '@/lib/constants/departments';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  position: string;
  phone?: string;
  location?: string;
  joinDate: string;
  avatar?: string;
  status: TeamMemberStatus;
  performanceScore?: number;
}

interface TeamMemberCardProps {
  member: TeamMember;
  onClick?: (member: TeamMember) => void;
}

// Memoized contact info item component
const ContactInfoItem = memo(({
  icon: Icon,
  children
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <div className="flex items-center text-sm text-muted-foreground">
    <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
    <span className="truncate">{children}</span>
  </div>
));

ContactInfoItem.displayName = 'ContactInfoItem';

function TeamMemberCard({ member, onClick }: TeamMemberCardProps) {
  const statusConfig = useMemo(
    () => getStatusConfig(member.status),
    [member.status]
  );

  const formattedJoinDate = useMemo(
    () => formatJoinDate(member.joinDate),
    [member.joinDate]
  );

  const departmentLabel = useMemo(
    () => getDepartmentLabel(member.department),
    [member.department]
  );

  const roleLabel = useMemo(
    () => ROLE_LABELS[member.role] || member.role,
    [member.role]
  );

  const initials = useMemo(
    () => getInitials(member.name),
    [member.name]
  );

  const handleClick = () => {
    onClick?.(member);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(member);
    }
  };

  return (
    <Card
      className="hover:shadow-lg transition-normal transition-all hover-scale-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? `Voir le profil de ${member.name}` : undefined}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 flex-shrink-0">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback className="text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-lg truncate">{member.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{member.position}</p>
              </div>
              <Badge className={statusConfig.className} variant="secondary">
                {statusConfig.label}
              </Badge>
            </div>

            <div className="space-y-2 mt-3">
              <ContactInfoItem icon={Mail}>
                {member.email}
              </ContactInfoItem>

              {member.phone && (
                <ContactInfoItem icon={Phone}>
                  {member.phone}
                </ContactInfoItem>
              )}

              {member.location && (
                <ContactInfoItem icon={MapPin}>
                  {member.location}
                </ContactInfoItem>
              )}

              <ContactInfoItem icon={Calendar}>
                {formattedJoinDate}
              </ContactInfoItem>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t flex-wrap">
              <Badge variant="outline">{departmentLabel}</Badge>
              <Badge variant="outline">{roleLabel}</Badge>
              {member.performanceScore !== undefined && (
                <Badge variant="outline" className="ml-auto">
                  Performance: {member.performanceScore}/100
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(TeamMemberCard);
