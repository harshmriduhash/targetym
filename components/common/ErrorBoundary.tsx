'use client';

import { Component, ErrorInfo, ReactNode, ReactElement } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ErrorBoundaryProps {
  children: ReactNode;
  /**
   * Fallback UI to render when an error occurs
   */
  fallback?: (error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode;
  /**
   * Callback when an error is caught
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /**
   * Custom error message to display
   */
  errorMessage?: string;
  /**
   * Show detailed error info (disable in production)
   */
  showDetails?: boolean;
  /**
   * Component name for logging
   */
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 *
 * @example
 * <ErrorBoundary
 *   componentName="Dashboard"
 *   onError={(error, errorInfo) => logErrorToService(error, errorInfo)}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const {
      children,
      fallback,
      errorMessage,
      showDetails = process.env.NODE_ENV === 'development',
      componentName,
    } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback && errorInfo) {
        return fallback(error, errorInfo, this.resetError);
      }

      // Default error UI
      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="text-xl">
                  {errorMessage || 'Une erreur est survenue'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {componentName
                  ? `Une erreur s'est produite dans le composant ${componentName}.`
                  : "Nous avons rencontré un problème lors du chargement de cette page."}
              </p>

              {showDetails && (
                <div className="space-y-3">
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors list-none">
                      <span className="flex items-center gap-2">
                        <span className="inline-block transition-transform group-open:rotate-90">
                          ▶
                        </span>
                        Détails de l'erreur
                      </span>
                    </summary>
                    <div className="mt-3 space-y-3">
                      <div className="rounded-lg bg-muted p-4 overflow-auto">
                        <p className="text-sm font-mono text-destructive font-semibold mb-2">
                          {error.name}: {error.message}
                        </p>
                        {error.stack && (
                          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                            {error.stack}
                          </pre>
                        )}
                      </div>

                      {errorInfo && errorInfo.componentStack && (
                        <div className="rounded-lg bg-muted p-4 overflow-auto">
                          <p className="text-sm font-semibold mb-2">Component Stack:</p>
                          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button onClick={this.resetError} className="gap-2">
                  <RefreshCcw className="h-4 w-4" />
                  Réessayer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = '/')}
                  className="gap-2"
                >
                  <Home className="h-4 w-4" />
                  Retour à l'accueil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

/**
 * Hook-based error boundary for functional components
 * Note: This is a wrapper around the class-based ErrorBoundary
 */
export function ErrorBoundaryProvider({
  children,
  ...props
}: ErrorBoundaryProps): ReactElement {
  return <ErrorBoundary {...props}>{children}</ErrorBoundary>;
}
