'use client';

import React, { memo } from 'react';
import { AlertTriangle, RefreshCcw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ErrorFallbackProps {
  error?: Error;
  reset?: () => void;
  title?: string;
  description?: string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Reusable error fallback UI component
 *
 * @example
 * <ErrorFallback
 *   error={error}
 *   reset={resetError}
 *   title="Erreur de chargement"
 *   description="Impossible de charger les données"
 * />
 */
function ErrorFallback({
  error,
  reset,
  title = 'Une erreur est survenue',
  description = 'Nous avons rencontré un problème. Veuillez réessayer.',
  showDetails = process.env.NODE_ENV === 'development',
  size = 'md',
  className,
}: ErrorFallbackProps) {
  const sizeConfig = {
    sm: {
      icon: 'h-5 w-5',
      title: 'text-base',
      minHeight: 'min-h-[200px]',
      padding: 'p-4',
    },
    md: {
      icon: 'h-6 w-6',
      title: 'text-xl',
      minHeight: 'min-h-[400px]',
      padding: 'p-6',
    },
    lg: {
      icon: 'h-8 w-8',
      title: 'text-2xl',
      minHeight: 'min-h-[500px]',
      padding: 'p-8',
    },
  };

  const config = sizeConfig[size];

  return (
    <div className={cn('flex items-center justify-center', config.minHeight, className)}>
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className={cn(config.icon, 'text-destructive')} />
            </div>
            <CardTitle className={config.title}>{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{description}</p>

          {showDetails && error && (
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-fast transition-colors list-none">
                <span className="flex items-center gap-2">
                  <span className="inline-block transition-transform group-open:rotate-90">
                    ▶
                  </span>
                  Détails de l'erreur
                </span>
              </summary>
              <div className="mt-3 rounded-lg bg-muted p-4 overflow-auto animate-slide-in-from-top">
                <p className="text-sm font-mono text-destructive font-semibold mb-2">
                  {error.name}: {error.message}
                </p>
                {error.stack && (
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono max-h-64 overflow-auto">
                    {error.stack}
                  </pre>
                )}
              </div>
            </details>
          )}

          <div className="flex items-center gap-3 pt-2">
            {reset && (
              <Button onClick={reset} className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Réessayer
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Compact inline error display
 */
export const InlineError = memo(function InlineError({
  error,
  reset,
  className,
}: {
  error?: Error;
  reset?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 p-4 rounded-lg border border-destructive/50 bg-destructive/5',
        className
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            {error?.message || 'Une erreur est survenue'}
          </p>
          {process.env.NODE_ENV === 'development' && error?.stack && (
            <p className="text-xs text-muted-foreground truncate mt-1">
              {error.stack.split('\n')[1]?.trim()}
            </p>
          )}
        </div>
      </div>
      {reset && (
        <Button
          size="sm"
          variant="ghost"
          onClick={reset}
          className="gap-1.5 flex-shrink-0"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Réessayer
        </Button>
      )}
    </div>
  );
});

/**
 * Full-page error display
 */
export const FullPageError = memo(function FullPageError({
  error,
  reset,
}: {
  error?: Error;
  reset?: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-muted/20">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-6 rounded-full bg-destructive/10">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Oups ! Quelque chose s'est mal passé
          </h1>
          <p className="text-muted-foreground">
            {error?.message || 'Nous avons rencontré un problème inattendu.'}
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && error?.stack && (
          <details className="group text-left">
            <summary className="cursor-pointer text-sm font-medium text-center text-muted-foreground hover:text-foreground transition-fast transition-colors">
              Voir les détails techniques
            </summary>
            <div className="mt-3 rounded-lg bg-muted p-4 overflow-auto max-h-64">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                {error.stack}
              </pre>
            </div>
          </details>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {reset && (
            <Button onClick={reset} className="gap-2 w-full sm:w-auto">
              <RefreshCcw className="h-4 w-4" />
              Réessayer
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/')}
            className="gap-2 w-full sm:w-auto"
          >
            <Home className="h-4 w-4" />
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
});

export default memo(ErrorFallback);
