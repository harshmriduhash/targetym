'use client';

import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'search';
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default'
}: EmptyStateProps) {
  return (
    <Card className={variant === 'default' ? 'border-dashed' : ''}>
      <CardContent className="py-12">
        <div className="text-center">
          <Icon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            {description}
          </p>
          {actionLabel && onAction && (
            <Button onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(EmptyState);
