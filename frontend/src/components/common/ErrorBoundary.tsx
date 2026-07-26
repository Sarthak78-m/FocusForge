import React, { Component, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

/**
 * ErrorBoundary
 *
 * Catches unhandled rendering errors in any child component tree and
 * renders a fallback UI instead of crashing the entire page.
 *
 * Usage:
 *   <ErrorBoundary componentName="ChatWidget">
 *     <ChatProvider>...</ChatProvider>
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log error details (swap with real error reporting in production)
    console.error(`[ErrorBoundary] Error in ${this.props.componentName ?? 'component'}:`, error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/40 dark:bg-red-950/20">
          <div className="mb-3 text-3xl">⚠️</div>
          <h3 className="mb-1 text-sm font-semibold text-red-800 dark:text-red-300">
            Something went wrong
          </h3>
          <p className="mb-4 text-xs text-red-600 dark:text-red-400">
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <button
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
