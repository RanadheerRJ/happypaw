import type { LucideIcon } from 'lucide-react';
import { PawPrint } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function EmptyState({
  icon: Icon = PawPrint,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-3xl border border-dashed border-forest/20 bg-white/60 px-6 py-14 text-center',
        className,
      )}
    >
      <span className="relative mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-sage-100 text-forest">
        <span
          aria-hidden="true"
          className="absolute -right-1.5 -top-1.5 h-4 w-4 rounded-full bg-terracotta/70"
        />
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <h3 className="font-display text-lg font-bold text-forest">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-charcoal-600">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this just now. Please try again.',
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50/70 px-6 py-12 text-center',
        className,
      )}
    >
      <h3 className="font-display text-lg font-bold text-red-800">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-red-700/90">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-forest-800"
        >
          Try again
        </button>
      )}
    </div>
  );
}
