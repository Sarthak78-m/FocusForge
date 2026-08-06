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
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-error-200 bg-error-50 p-6 text-center dark:border-error-900/40 dark:bg-error-950/20">
          <div className="mb-3 text-3xl">⚠️</div>
          <h3 className="mb-1 text-sm font-semibold text-error-800 dark:text-error-300">
            Something went wrong
          </h3>
          <p className="mb-4 text-xs text-error-600 dark:text-error-400">
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <button
            className="rounded-xl bg-primary-500 px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:bg-primary-600 hover:shadow-md"
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
