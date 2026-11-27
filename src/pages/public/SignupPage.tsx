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
import { Label, FieldError, FieldHint } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { signupSchema, type SignupFormValues } from '@/lib/validators';

export default function SignupPage() {
  const { signUp, session, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const planSlug = params.get('plan');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      consent: false,
    },
  });

  useEffect(() => {
    if (!loading && session && !form.formState.isSubmitting) {
      navigate(roleHome(session.user.role), { replace: true });
    }
  }, [loading, session, navigate, form.formState.isSubmitting]);

  async function onSubmit(values: SignupFormValues) {
    setAuthError(null);
    try {
      const next = await signUp({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
      toast.success(`Welcome to Happy Paw, ${next.user.fullName.split(' ')[0]}`, {
        description: planSlug
          ? 'Next step: add your dog and confirm the portion.'
          : 'Your account is ready. Add your first dog to build a plan.',
      });
      navigate(roleHome(next.user.role), { replace: true });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Could not create your account.');
    }
  }

  return (
    <>
      <SEO
        title="Create your account"
        description="Create a Happy Paw account to build a fresh meal plan for your dog."
        path="/signup"
        noIndex
      />
      <AuthShell
        title="Let's build your dog's plan"
        subtitle="Two minutes now, a portion card in every delivery. No payment is taken in this demo."
        footer={
          <>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-grape-700 underline decoration-teal-400 underline-offset-4">
              Sign in
            </Link>
          </>
        }
      >
        {planSlug && (
          <div className="mb-4 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-[12.5px] text-grape-700">
            You selected the <strong className="font-semibold">{planSlug.replace(/-/g, ' ')}</strong>{' '}
            plan. Create an account and we will confirm your dog's portion before checkout.
          </div>
        )}

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
            <Label htmlFor="signup-name">Full name</Label>
            <Input
              id="signup-name"
              autoComplete="name"
              className="mt-1.5"
              placeholder="Priya Reddy"
              aria-invalid={Boolean(form.formState.errors.fullName) || undefined}
              {...form.register('fullName')}
            />
            <FieldError>{form.formState.errors.fullName?.message}</FieldError>
          </div>

          <div>
            <Label htmlFor="signup-email">Email address</Label>
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              className="mt-1.5"
              placeholder="you@example.com"
              aria-invalid={Boolean(form.formState.errors.email) || undefined}
              {...form.register('email')}
            />
            <FieldError>{form.formState.errors.email?.message}</FieldError>
          </div>

          <div>
            <Label htmlFor="signup-phone">Mobile number</Label>
            <Input
              id="signup-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className="mt-1.5"
              placeholder="+91 98765 43210"
              aria-invalid={Boolean(form.formState.errors.phone) || undefined}
              aria-describedby="signup-phone-hint"
              {...form.register('phone')}
            />
            <FieldHint id="signup-phone-hint">
              Indian mobile (+91, starting 6–9). Used for delivery updates only.
            </FieldHint>
            <FieldError>{form.formState.errors.phone?.message}</FieldError>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="pr-10"
                  placeholder="8+ characters"
                  aria-invalid={Boolean(form.formState.errors.password) || undefined}
                  {...form.register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-grape-800-500 hover:bg-grape-700/[0.06]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FieldError>{form.formState.errors.password?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="signup-confirm">Confirm password</Label>
              <Input
                id="signup-confirm"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="mt-1.5"
                aria-invalid={Boolean(form.formState.errors.confirmPassword) || undefined}
                {...form.register('confirmPassword')}
              />
              <FieldError>{form.formState.errors.confirmPassword?.message}</FieldError>
            </div>
          </div>

          <div className="flex items-start gap-2.5 pt-1">
            <Checkbox
              id="signup-consent"
              aria-invalid={Boolean(form.formState.errors.consent) || undefined}
              onCheckedChange={(checked) =>
                form.setValue('consent', checked === true, { shouldValidate: true })
              }
            />
            <div>
              <Label htmlFor="signup-consent" className="text-[12.5px] font-normal leading-snug text-grape-800-600">
                I agree to the{' '}
                <Link to="/legal/terms" className="font-medium text-grape-700 underline decoration-teal-400 underline-offset-2">
                  Terms
                </Link>{' '}
                and{' '}
                <Link to="/legal/privacy" className="font-medium text-grape-700 underline decoration-teal-400 underline-offset-2">
                  Privacy Policy
                </Link>
                , and I understand that Happy Paw meals are not a substitute for veterinary advice.
              </Label>
              <FieldError>{form.formState.errors.consent?.message}</FieldError>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Creating account…
              </>
            ) : (
              <>
                Create account <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </Button>
          <p className="text-center text-[10.5px] leading-relaxed text-grape-800-400">
            Creating an account is free. Card details are collected later, at checkout.
          </p>
        </form>
      </AuthShell>
    </>
  );
}
