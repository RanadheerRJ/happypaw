import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { brand } from '@/config/brand';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Catches render-time crashes anywhere in the tree and shows a recoverable
 * fallback. Query/data errors are handled by the pages themselves — this is
 * for unexpected React errors only.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Keep the diagnostic in the console; the UI shows a generic message.
    console.error('[happypaw] Unhandled render error:', error, info.componentStack);
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-6 py-16">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-red-100 text-red-700" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          </svg>
        </span>
        <div className="text-center">
          <h1 className="font-display text-2xl font-extrabold text-forest">
            Something went sideways
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-charcoal-600">
            An unexpected error stopped this page from rendering. Your data is safe — try again, or
            head back to {brand.name}.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => this.setState({ hasError: false, message: '' })}>Try again</Button>
          <Button asChild variant="soft">
            <a href={brand.domain}>Back to {brand.name}</a>
          </Button>
        </div>
      </div>
    );
  }
}
