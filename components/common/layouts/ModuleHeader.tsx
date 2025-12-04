'use client';

import React, { memo } from 'react';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ModuleHeaderProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  badgeText?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  actions?: React.ReactNode;
}

function ModuleHeader({
  title,
  description,
  icon: Icon,
  badgeText = 'Module',
  badgeVariant = 'default',
  actions
}: ModuleHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <h1 className="text-3xl font-bold flex items-center gap-2 flex-wrap">
          {Icon && <Icon className="h-8 w-8" />}
          {title}
          <Badge variant={badgeVariant} className="text-xs">
            {badgeText}
          </Badge>
        </h1>
        <p className="text-muted-foreground mt-2">{description}</p>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export default memo(ModuleHeader);
