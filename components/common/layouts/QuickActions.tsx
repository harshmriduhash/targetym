'use client';

import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary';
  description?: string;
}

interface QuickActionsProps {
  title?: string;
  description?: string;
  actions: QuickAction[];
}

function QuickActions({
  title = 'Actions rapides',
  description = 'Accédez rapidement aux fonctionnalités principales',
  actions
}: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.variant || (index === 0 ? 'default' : 'outline')}
                className="h-auto flex flex-col gap-2 py-4"
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{action.label}</span>
                {action.description && (
                  <span className="text-[10px] opacity-70 font-normal">
                    {action.description}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(QuickActions);
