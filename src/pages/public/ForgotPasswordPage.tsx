import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { z } from 'zod';
import { SEO } from '@/components/shared/SEO';
import { AuthShell } from '@/features/auth/AuthShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label, FieldError } from '@/components/ui/label';
import { dataClient } from '@/data';
import { emailSchema } from '@/lib/validators';

type ForgotValues = { email: string };

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<ForgotValues>({
    resolver: zodResolver(z.object({ email: emailSchema })),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotValues) {
    setError(null);
    try {
      await dataClient.auth.resetPassword(values.email);
      setSent(true);
    } catch {
      setError('Could not send a reset link. Please try again.');
    }
  }

  return (
    <>
      <SEO
        title="Reset your password"
        description="Request a password reset link for your Happy Paw account."
        path="/forgot-password"
        noIndex
      />
      <AuthShell
        title="Reset your password"
        subtitle="Enter the email on your account and we'll send a reset link. If the account exists, you'll hear from us."
        footer={
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 font-semibold text-forest underline decoration-sage-400 underline-offset-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to sign in
          </Link>
        }
      >
        {sent ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-3 font-display text-lg font-bold text-emerald-900">Check your inbox</h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-emerald-800">
              If an account exists for that email, a reset link is on its way. For your security we
              never confirm which addresses are registered.
            </p>
            <Button
              variant="outline"
              className="mt-4 bg-white"
              onClick={() => {
                setSent(false);
                form.reset();
              }}
            >
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
            {error && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-800">
                {error}
              </p>
            )}
            <div>
              <Label htmlFor="forgot-email">Email address</Label>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                className="mt-1.5"
                placeholder="you@example.com"
                aria-invalid={Boolean(form.formState.errors.email) || undefined}
                {...form.register('email')}
              />
              <FieldError>{form.formState.errors.email?.message}</FieldError>
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending…
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" aria-hidden="true" /> Send reset link
                </>
              )}
            </Button>
          </form>
        )}
      </AuthShell>
    </>
  );
}
