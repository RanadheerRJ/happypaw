import { useEffect, useState } from 'react';
import { CheckCircle2, CreditCard, Loader2, Lock, ShieldCheck, Smartphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatINR } from '@/lib/format';

const methods = [
  { id: 'upi', label: 'UPI', hint: 'priya@okhdfcbank', icon: Smartphone },
  { id: 'card', label: 'Card', hint: '•••• 4242', icon: CreditCard },
  { id: 'netbanking', label: 'Net banking', hint: 'HDFC Bank', icon: Lock },
] as const;

type SimulationState = 'idle' | 'processing' | 'success';

/**
 * Stand-in for the Razorpay modal. It never talks to Razorpay: no SDK, no keys,
 * no network. The adapter records the payment as `status: 'simulated'`.
 */
export function SimulatedCheckoutDialog({
  open,
  onOpenChange,
  amountInr,
  summary,
  onConfirm,
  confirmLabel = 'Pay now',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amountInr: number;
  summary: { label: string; value: string }[];
  onConfirm: () => Promise<void> | void;
  confirmLabel?: string;
}) {
  const [step, setStep] = useState<SimulationState>('idle');
  const [method, setMethod] = useState<(typeof methods)[number]['id']>('upi');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setStep('idle');
      setError(null);
    }
  }, [open]);

  async function handlePay() {
    setStep('processing');
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1400));
      await onConfirm();
      setStep('success');
    } catch (cause) {
      setStep('idle');
      setError(cause instanceof Error ? cause.message : 'Payment could not be completed.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => step !== 'processing' && onOpenChange(next)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <DialogTitle>Complete your payment</DialogTitle>
            <Badge variant="warn" className="shrink-0">
              Simulated
            </Badge>
          </div>
          <DialogDescription>
            Demo checkout only — no Razorpay account, keys or real money are involved. The payment
            is stored with status <span className="font-medium text-forest">simulated</span>.
          </DialogDescription>
        </DialogHeader>

        {step === 'success' ? (
          <div className="py-4 text-center" role="status" aria-live="polite">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
            </span>
            <p className="mt-4 font-display text-lg font-bold text-forest">
              Payment simulated successfully
            </p>
            <p className="mt-1 text-sm text-charcoal-600">{formatINR(amountInr)} received (demo).</p>
            <Button className="mt-5 w-full" onClick={() => onOpenChange(false)}>
              Continue
            </Button>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-forest/10 bg-white p-4">
              <dl className="space-y-2 text-sm">
                {summary.map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-4">
                    <dt className="text-charcoal-600">{row.label}</dt>
                    <dd className="font-medium text-forest">{row.value}</dd>
                  </div>
                ))}
                <div className="flex items-baseline justify-between gap-4 border-t border-forest/10 pt-2">
                  <dt className="font-semibold text-forest">Amount payable</dt>
                  <dd className="font-display text-lg font-extrabold text-forest">
                    {formatINR(amountInr)}
                  </dd>
                </div>
              </dl>
            </div>

            <fieldset className="mt-4">
              <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-charcoal-500">
                Payment method
              </legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {methods.map((option) => {
                  const Icon = option.icon;
                  const selected = method === option.id;
                  return (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                        selected
                          ? 'border-forest bg-forest/[0.05] text-forest'
                          : 'border-forest/15 text-charcoal-600 hover:border-forest/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        value={option.id}
                        checked={selected}
                        onChange={() => setMethod(option.id)}
                        className="sr-only"
                      />
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block font-medium">{option.label}</span>
                        <span className="block truncate text-[11px] text-charcoal-400">
                          {option.hint}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-charcoal-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest/70" aria-hidden="true" />
              This is a simulated gateway. Order, invoice and payment records are created in the
              demo database so the rest of the flow behaves exactly like production.
            </p>

            {error && (
              <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <Button
              className="mt-5 w-full"
              size="lg"
              variant="accent"
              onClick={handlePay}
              disabled={step === 'processing'}
            >
              {step === 'processing' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Processing…
                </>
              ) : (
                `${confirmLabel} ${formatINR(amountInr)}`
              )}
            </Button>
            <p className="mt-3 text-center text-[11px] text-charcoal-400">
              By continuing you agree to the demo terms. Nothing is charged.
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
