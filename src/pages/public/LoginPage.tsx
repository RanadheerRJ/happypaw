import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '@/components/shared/SEO';
import { AuthShell } from '@/features/auth/AuthShell';
import { roleHome, useAuth } from '@/features/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label, FieldError } from '@/components/ui/label';
import { loginSchema, type LoginFormValues } from '@/lib/validators';
import { demoAccounts } from '@/data/fixtures/demoUsers';
import { env } from '@/config/env';
import type { Role } from '@/data/types';

const demoRoles: { role: Role; label: string; description: string }[] = [
  { role: 'customer', label: 'Customer', description: 'Priya · 2 dogs' },
  { role: 'vet', label: 'Veterinarian', description: 'Dr. Meera · clinic' },
  { role: 'admin', label: 'Owner', description: 'Rohan · admin' },
];

export default function LoginPage() {
  const { signIn, signInAsDemo, session, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [demoPending, setDemoPending] = useState<Role | null>(null);

  const rawNext = params.get('next');
  const safeNext = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : null;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (!loading && session) {
      navigate(safeNext ?? roleHome(session.user.role), { replace: true });
    }
  }, [loading, session, safeNext, navigate]);

  async function onSubmit(values: LoginFormValues) {
    setAuthError(null);
    try {
      const next = await signIn(values.email, values.password);
      toast.success(`Welcome back, ${next.user.fullName.split(' ')[0]}`);
      navigate(safeNext ?? roleHome(next.user.role), { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not sign you in. Please try again.';
      setAuthError(message);
    }
  }

  async function onDemo(role: Role) {
    setAuthError(null);
    setDemoPending(role);
    try {
      const next = await signInAsDemo(role);
      toast.success(`Signed in as ${next.user.fullName}`, {
        description: `Demo ${role} account`,
      });
      navigate(safeNext ?? roleHome(next.user.role), { replace: true });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Demo sign-in failed.');
    } finally {
      setDemoPending(null);
    }
  }

  return (
    <>
      <SEO title="Log in" description="Sign in to your Happy Paw account." path="/login" noIndex />
      <AuthShell
        title="Welcome back"
        subtitle="Sign in to manage your dog's plan, deliveries and support tickets."
        footer={
          <>
            New to Happy Paw?{' '}
            <Link to="/signup" className="font-semibold text-forest underline decoration-sage-400 underline-offset-4">
              Create an account
            </Link>
          </>
        }
      >
        {authError && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-[12.5px] text-red-800"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {authError}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <Label htmlFor="login-email">Email address</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              className="mt-1.5"
              placeholder="you@example.com"
              aria-invalid={Boolean(form.formState.errors.email) || undefined}
              aria-describedby={form.formState.errors.email ? 'login-email-error' : undefined}
              {...form.register('email')}
            />
            <FieldError id="login-email-error">{form.formState.errors.email?.message}</FieldError>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Password</Label>
              <Link
                to="/forgot-password"
                className="text-[12px] font-medium text-forest underline decoration-sage-400 underline-offset-4 hover:decoration-forest"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative mt-1.5">
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Your password"
                className="pr-11"
                aria-invalid={Boolean(form.formState.errors.password) || undefined}
                aria-describedby={form.formState.errors.password ? 'login-password-error' : undefined}
                {...form.register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-charcoal-500 transition-colors hover:bg-forest/[0.06] hover:text-forest"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FieldError id="login-password-error">{form.formState.errors.password?.message}</FieldError>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Signing in…
              </>
            ) : (
              <>
                Sign in <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </Button>
        </form>

        {env.demoMode && (
          <>
            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-forest/10" />
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-charcoal-400">
                Demo accounts
              </span>
              <span className="h-px flex-1 bg-forest/10" />
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {demoRoles.map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => void onDemo(item.role)}
                  disabled={demoPending !== null}
                  className="rounded-2xl border border-forest/15 bg-white px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-forest/30 hover:shadow-soft disabled:opacity-60"
                >
                  <span className="flex items-center gap-1.5 font-display text-[12.5px] font-bold text-forest">
                    {demoPending === item.role ? (
                      <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                    ) : null}
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-[10.5px] leading-snug text-charcoal-500">
                    {item.description}
                  </span>
                </button>
              ))}
            </div>

            <details className="mt-3 rounded-xl border border-forest/10 bg-cream-50 px-3.5 py-2.5">
              <summary className="cursor-pointer text-[11.5px] font-medium text-charcoal-600">
                Seeded demo credentials
              </summary>
              <ul className="mt-2 space-y-1 text-[11px] text-charcoal-500">
                {Object.entries(demoAccounts)
                  .filter(([key]) => key !== 'customerAlt')
                  .map(([key, account]) => (
                    <li key={key} className="flex flex-wrap items-center gap-x-2">
                      <span className="capitalize">{account.label}:</span>
                      <code className="rounded bg-white px-1.5 py-0.5">{account.email}</code>
                      <span className="text-charcoal-400">/</span>
                      <code className="rounded bg-white px-1.5 py-0.5">{account.password}</code>
                    </li>
                  ))}
              </ul>
            </details>

            <p className="mt-3 flex items-start gap-1.5 text-[10.5px] leading-relaxed text-charcoal-400">
              <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
              Demo data only. Mock sign-in stores a session in your browser — never a real credential.
            </p>
          </>
        )}
      </AuthShell>
    </>
  );
}
