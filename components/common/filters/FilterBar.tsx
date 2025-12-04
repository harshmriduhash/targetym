'use client';

import React, { memo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  children: React.ReactNode;
  activeFiltersCount?: number;
  onReset?: () => void;
  title?: string;
  showTitle?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

function FilterBar({
  children,
  activeFiltersCount = 0,
  onReset,
  title = 'Filtrer',
  showTitle = true,
  collapsible = false,
  defaultCollapsed = false,
}: FilterBarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <Card className={cn(
      "transition-normal transition-all",
      hasActiveFilters && "border-primary/50 shadow-sm"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {showTitle && (
            <button
              onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
              className={cn(
                "flex items-center gap-2 group",
                collapsible && "hover:opacity-80 transition-fast transition-opacity cursor-pointer"
              )}
              disabled={!collapsible}
              type="button"
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-normal transition-colors",
                hasActiveFilters
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground group-hover:bg-muted/80"
              )}>
                <Filter className="h-4 w-4" />
              </div>
              <CardTitle className="text-base flex items-center gap-2">
                {title}
                {hasActiveFilters && (
                  <Badge variant="default" className="ml-1 animate-scale-in">
                    {activeFiltersCount}
                  </Badge>
                )}
              </CardTitle>
              {collapsible && (
                isCollapsed ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-fast transition-transform" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-muted-foreground transition-fast transition-transform" />
                )
              )}
            </button>
          )}
          {hasActiveFilters && onReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 gap-1.5 text-muted-foreground hover:text-destructive transition-normal transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Réinitialiser</span>
            </Button>
          )}
        </div>
      </CardHeader>
      {(!collapsible || !isCollapsed) && (
        <CardContent className="pt-0 animate-slide-in-from-top">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

export default memo(FilterBar);
