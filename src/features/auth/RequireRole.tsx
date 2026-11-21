import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/AuthProvider';
import type { Role } from '@/data/types';

/**
 * Client-side guard. It decides where to *send* a user; it is never the security
 * boundary — RLS policies enforce data access in Supabase mode.
 */
export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { loading, session } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container-x py-20" aria-busy="true" aria-live="polite">
        <span className="sr-only">Checking your session…</span>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-4 h-4 w-80" />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-36 rounded-3xl" />
          <Skeleton className="h-36 rounded-3xl" />
          <Skeleton className="h-36 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!session) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  if (session.user.role !== role) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
