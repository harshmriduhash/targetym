'use client';

import React, { memo } from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
}

interface EmptyStateProps {
  /**
   * Icon to display (Lucide icon component)
   */
  icon?: LucideIcon;

  /**
   * Main title
   */
  title: string;

  /**
   * Description text
   */
  description?: string;

  /**
   * Primary action button
   */
  action?: EmptyStateAction;

  /**
   * Secondary action button
   */
  secondaryAction?: EmptyStateAction;

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Display as card or plain
   */
  variant?: 'card' | 'plain';

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Icon color class
   */
  iconColor?: string;
}

/**
 * EmptyState component for displaying empty/no-data states
 *
 * @example
 * <EmptyState
 *   icon={Inbox}
 *   title="Aucun message"
 *   description="Vous n'avez pas encore reçu de messages"
 *   action={{
 *     label: "Envoyer un message",
 *     onClick: () => handleSendMessage(),
 *     icon: Send
 *   }}
 * />
 */
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  variant = 'plain',
  className,
  iconColor = 'text-muted-foreground',
}: EmptyStateProps) {
  const sizeConfig = {
    sm: {
      icon: 'h-12 w-12',
      title: 'text-base',
      description: 'text-sm',
      spacing: 'space-y-2',
      padding: 'p-6',
    },
    md: {
      icon: 'h-16 w-16',
      title: 'text-lg',
      description: 'text-sm',
      spacing: 'space-y-3',
      padding: 'p-8',
    },
    lg: {
      icon: 'h-20 w-20',
      title: 'text-xl',
      description: 'text-base',
      spacing: 'space-y-4',
      padding: 'p-12',
    },
  };

  const config = sizeConfig[size];

  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        config.spacing,
        config.padding,
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            'rounded-full bg-muted/50 p-4 transition-normal transition-colors',
            'mb-1'
          )}
        >
          <Icon className={cn(config.icon, iconColor, 'transition-fast transition-colors')} />
        </div>
      )}

      <div className={config.spacing}>
        <h3 className={cn('font-semibold text-foreground', config.title)}>
          {title}
        </h3>

        {description && (
          <p className={cn('text-muted-foreground max-w-md', config.description)}>
            {description}
          </p>
        )}
      </div>

      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-2">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              className="gap-2"
            >
              {action.icon && <action.icon className="h-4 w-4" />}
              {action.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant={secondaryAction.variant || 'outline'}
              className="gap-2"
            >
              {secondaryAction.icon && <secondaryAction.icon className="h-4 w-4" />}
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  if (variant === 'card') {
    return (
      <Card className="transition-normal transition-shadow hover:shadow-sm">
        <CardContent className="p-0">{content}</CardContent>
      </Card>
    );
  }

  return content;
}

export default memo(EmptyState);
