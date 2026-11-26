import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, MapPin, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label, FieldError } from '@/components/ui/label';
import { useCheckPincode, useJoinWaitlist } from '@/hooks/useCatalog';
import {
  pincodeCheckSchema,
  waitlistSchema,
  type WaitlistFormValues,
} from '@/lib/validators';
import type { PincodeCheckResult } from '@/data/types';
import { cn } from '@/lib/utils';

type CheckValues = { pincode: string };

export function PincodeChecker({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const check = useCheckPincode();
  const waitlist = useJoinWaitlist();
  const [result, setResult] = useState<PincodeCheckResult | null>(null);
  // Unique ids — the component can render more than once on a page.
  const baseId = useId();
  const pincodeId = `${baseId}-pincode`;
  const waitlistEmailId = `${baseId}-waitlist-email`;
  const pincodeErrorId = `${baseId}-pincode-error`;

  const checkForm = useForm<CheckValues>({
    resolver: zodResolver(pincodeCheckSchema),
    defaultValues: { pincode: '' },
  });

  const waitForm = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: { email: '', pincode: '' },
  });

  function onCheck(values: CheckValues) {
    check.mutate(values.pincode, {
      onSuccess: (data) => {
        setResult(data);
        if (!data.served) waitForm.setValue('pincode', data.pincode);
      },
      onError: () => toast.error('Could not check that pincode. Please try again.'),
    });
  }

  function onJoin(values: WaitlistFormValues) {
    waitlist.mutate(values, {
      onSuccess: () => {
        toast.success("You're on the list", {
          description: `We'll email you the moment we reach ${values.pincode}.`,
        });
        setResult(null);
        checkForm.reset();
        waitForm.reset();
      },
      onError: () => toast.error('Could not join the waitlist. Please try again.'),
    });
  }

  const { errors } = checkForm.formState;
  const waitErrors = waitForm.formState.errors;

  return (
    <div
      className={cn(
        'rounded-3xl border border-forest/10 bg-white p-5 shadow-soft sm:p-6',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sage-100 text-forest">
          <MapPin className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-display text-lg font-bold text-forest">Do we deliver to you?</h3>
          <p className="mt-1 text-[13.5px] text-charcoal-600">
            Enter your Hyderabad pincode — we deliver every Sunday, 7 AM – 12 PM.
          </p>
        </div>
      </div>

      <form onSubmit={checkForm.handleSubmit(onCheck)} className="mt-5" noValidate>
        <Label htmlFor={pincodeId}>Pincode</Label>
        <div className="mt-1.5 flex gap-2">
          <Input
            id={pincodeId}
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="e.g. 500081"
            maxLength={6}
            aria-invalid={Boolean(errors.pincode) || undefined}
            aria-describedby={errors.pincode ? pincodeErrorId : undefined}
            className={cn('max-w-[170px] tracking-[0.18em]')}
            {...checkForm.register('pincode')}
          />
          <Button type="submit" disabled={check.isPending} className="shrink-0">
            {check.isPending ? (
              'Checking…'
            ) : (
              <>
                <Search className="h-4 w-4" aria-hidden="true" /> Check
              </>
            )}
          </Button>
        </div>
        <FieldError id={pincodeErrorId}>{errors.pincode?.message}</FieldError>
      </form>

      <div aria-live="polite" className="mt-4">
        {result?.served && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="flex items-center gap-2 font-display text-[15px] font-bold text-emerald-900">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Great news — we deliver to{' '}
              {result.pincode}!
            </p>
            <p className="mt-1.5 text-[13px] text-emerald-800">
              Serving {result.areas.map((area) => area.areaName).join(', ')}. Next delivery:{' '}
              Sunday, 7 AM – 12 PM.
            </p>
            {!compact && (
              <Button asChild size="sm" className="mt-3">
                <Link to="/plans">
                  Start my dog's plan <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </Button>
            )}
          </div>
        )}

        {result && !result.served && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="flex items-center gap-2 font-display text-[15px] font-bold text-amber-900">
              <Sparkles className="h-4 w-4" aria-hidden="true" /> We're not in {result.pincode} yet
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-amber-800">
              We're expanding across {`Hyderabad`} one area at a time. Leave your email and we'll
              reach out when your street is on the route.
            </p>

            {waitlist.isSuccess ? (
              <p className="mt-3 flex items-center gap-2 text-[13px] font-medium text-emerald-800">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> You're on the waitlist.
              </p>
            ) : (
              <form onSubmit={waitForm.handleSubmit(onJoin)} className="mt-3 space-y-2" noValidate>
                <div>
                  <Label htmlFor={waitlistEmailId} className="sr-only">
                    Email address
                  </Label>
                  <Input
                    id={waitlistEmailId}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-invalid={Boolean(waitErrors.email) || undefined}
                    {...waitForm.register('email')}
                  />
                  <FieldError>{waitErrors.email?.message}</FieldError>
                </div>
                <input type="hidden" {...waitForm.register('pincode')} />
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  disabled={waitlist.isPending}
                  className="w-full bg-white"
                >
                  {waitlist.isPending ? 'Joining…' : 'Join the waitlist'}
                </Button>
              </form>
            )}
          </div>
        )}

        {check.isError && (
          <p className="text-[13px] text-red-700">Something went wrong. Please try again.</p>
        )}
      </div>
    </div>
  );
}
