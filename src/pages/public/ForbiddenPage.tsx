import { Link } from 'react-router-dom';
import { ArrowLeft, LockKeyhole, LogOut, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth, roleHome } from '@/features/auth/AuthProvider';

export default function ForbiddenPage() {
  const { session, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    toast.success('Signed out');
  }

  return (
    <>
      <SEO title="Access denied" description="You do not have access to this area." path="/403" noIndex />
      <section className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-3xl bg-sunset-500-50 text-sunset-600">
          <LockKeyhole className="h-7 w-7" aria-hidden="true" />
        </span>
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-sunset-600">
          Error 403
        </p>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-grape-700 sm:text-3xl">
          This area is not for your account
        </h1>
        <p className="mt-3 max-w-md text-[14px] leading-relaxed text-grape-800-600">
          {session
            ? `You are signed in as ${session.user.fullName}, a ${session.user.role} account. This page is restricted to a different role.`
            : 'You need to be signed in with the right role to view this page.'}
        </p>

        {session && (
          <Badge variant="soft" className="mt-4 gap-1.5 py-1.5 normal-case tracking-normal">
            <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
            Signed in as {session.user.role}
          </Badge>
        )}

        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
          {session ? (
            <>
              <Button asChild size="lg">
                <Link to={roleHome(session.user.role)}>
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Go to my portal
                </Link>
              </Button>
              <Button size="lg" variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
              </Button>
            </>
          ) : (
            <Button asChild size="lg">
              <Link to="/login">Sign in</Link>
            </Button>
          )}
        </div>

        <p className="mt-8 max-w-sm text-[11.5px] leading-relaxed text-grape-800-400">
          Access is enforced with row-level security on every table in production — not just by
          hiding links in the interface.
        </p>
      </section>
    </>
  );
}
