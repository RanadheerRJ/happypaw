import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '@/components/shared/SEO';
import { AuthShell } from '@/features/auth/AuthShell';
import { roleHome, useAuth } from '@/features/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label, FieldError } from '@/components/ui/label';
import { loginSchema, type LoginFormValues } from '@/lib/validators';

export default function LoginPage() {
  const { signIn, session, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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

  return (
    <>
      <SEO title="Log in" description="Sign in to your Happy Paw account." path="/login" noIndex />
      <AuthShell
        title="Welcome back"
        subtitle="Sign in to manage your dog's plan, deliveries and support tickets."
        footer={
          <>
            New to Happy Paw?{' '}
            <Link to="/signup" className="font-semibold text-grape-700 underline decoration-teal-400 underline-offset-4">
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
                className="text-[12px] font-medium text-grape-700 underline decoration-teal-400 underline-offset-4 hover:decoration-grape"
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
                className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-grape-800-500 transition-colors hover:bg-grape-700/[0.06] hover:text-grape-700"
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
      </AuthShell>
    </>
  );
}
