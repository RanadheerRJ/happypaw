import { Skeleton } from '@/components/ui/skeleton';
import { PawMark } from '@/components/shared/Logo';

/** Shown while a route bundle loads — skeleton, never a spinner. */
export function RouteFallback() {
  return (
    <div className="container-x py-16" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading page…</span>
      <div className="flex items-center gap-2.5">
        <PawMark className="h-9 w-9 opacity-70" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="mt-8 h-10 w-3/4 max-w-xl" />
      <Skeleton className="mt-3 h-4 w-2/3 max-w-md" />
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-56 rounded-3xl" />
        <Skeleton className="h-56 rounded-3xl" />
        <Skeleton className="h-56 rounded-3xl" />
      </div>
    </div>
  );
}
