import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Dog as DogIcon,
  Loader2,
  MapPin,
  Plus,
  Sparkles,
  Tag,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '@/components/shared/SEO';
import { EmptyState, ErrorState } from '@/components/shared/EmptyState';
import { PortalHeader } from '@/components/app/StatusBadges';
import { AddressFormDialog } from '@/components/app/AddressFormDialog';
import { OnlineCheckoutDialog } from '@/components/app/OnlineCheckoutDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label, FieldError, FieldHint } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/AuthProvider';
import { useAddons, usePlans } from '@/hooks/useCatalog';
import {
  errorMessage,
  useAddresses,
  useCheckout,
  useDogs,
  useValidateCoupon,
} from '@/hooks/usePortal';
import { deliverySchedule } from '@/config/pricing';
import { formatDate, formatINR } from '@/lib/format';
import { addDays, toIsoDate, upcomingDeliveryDate } from '@/lib/dates';
import { dailyPortion, recommendedPlan } from '@/lib/portal';
import type { CheckoutResult, CouponValidation, Plan, Address } from '@/data/types';

const steps = ['Dog', 'Plan', 'Delivery', 'Review'];

export default function SubscribePage() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const preselectedDog = params.get('dog');

  const dogsQuery = useDogs(user?.id);
  const plansQuery = usePlans();
  const addonsQuery = useAddons();
  const addressesQuery = useAddresses(user?.id);
  const checkout = useCheckout(user?.id);
  const validateCoupon = useValidateCoupon();

  const [step, setStep] = useState(0);
  const [dogId, setDogId] = useState<string>('');
  const [planId, setPlanId] = useState<string>('');
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [addressId, setAddressId] = useState<string>('');
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<CouponValidation | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [result, setResult] = useState<CheckoutResult | null>(null);

  const dogs = useMemo(() => dogsQuery.data ?? [], [dogsQuery.data]);
  const plans = useMemo(
    () => (plansQuery.data ?? []).filter((plan) => plan.isActive),
    [plansQuery.data],
  );
  const addons = useMemo(
    () => (addonsQuery.data ?? []).filter((addon) => addon.isActive),
    [addonsQuery.data],
  );
  const addresses = useMemo(() => addressesQuery.data ?? [], [addressesQuery.data]);

  const dog = dogs.find((item) => item.id === dogId) ?? null;
  const plan = plans.find((item) => item.id === planId) ?? null;
  const selectedAddons = addons.filter((addon) => addonIds.includes(addon.id));
  const address = addresses.find((item) => item.id === addressId) ?? null;

  const subtotal = (plan?.priceInr ?? 0) + selectedAddons.reduce((sum, item) => sum + item.priceInr, 0);
  const discount = coupon?.valid ? coupon.discountInr : 0;
  const total = Math.max(0, subtotal - discount);
  const deliveryDate = toIsoDate(upcomingDeliveryDate());

  useEffect(() => {
    if (!dogId && dogs.length > 0) {
      setDogId(preselectedDog && dogs.some((item) => item.id === preselectedDog) ? preselectedDog : dogs[0].id);
    }
  }, [dogs, dogId, preselectedDog]);

  const suggested = useMemo(
    () => (dog ? recommendedPlan(plans, dog) : undefined),
    [dog, plans],
  );

  useEffect(() => {
    if (suggested && !planId) setPlanId(suggested.id);
  }, [suggested, planId]);

  useEffect(() => {
    if (!addressId && addresses.length > 0) {
      setAddressId((addresses.find((item) => item.isDefault) ?? addresses[0]).id);
    }
  }, [addresses, addressId]);

  function resetCoupon() {
    setCoupon(null);
    setCouponInput('');
    setCouponError(null);
  }

  function selectPlan(nextPlanId: string) {
    setPlanId(nextPlanId);
    resetCoupon();
  }

  function toggleAddon(addonId: string) {
    setAddonIds((current) =>
      current.includes(addonId) ? current.filter((id) => id !== addonId) : [...current, addonId],
    );
    resetCoupon();
  }

  async function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError('Enter a coupon code');
      return;
    }
    setCouponError(null);
    try {
      const validation = await validateCoupon.mutateAsync({ code, orderValueInr: subtotal });
      setCoupon(validation);
      if (!validation.valid) setCouponError(validation.message);
      else toast.success(validation.message);
    } catch (error) {
      setCouponError(errorMessage(error));
    }
  }

  function canContinue() {
    if (step === 0) return Boolean(dogId);
    if (step === 1) return Boolean(planId);
    if (step === 2) return Boolean(addressId);
    return true;
  }

  async function pay() {
    if (!user || !dog || !plan || !address) throw new Error('Choose a dog, plan and address first.');
    const next = await checkout.mutateAsync({
      customerId: user.id,
      dogId: dog.id,
      planId: plan.id,
      addonIds,
      addressId: address.id,
      couponCode: coupon?.valid ? coupon.coupon?.code : null,
      notes: notes.trim() || null,
    });
    setResult(next);
    setStep(3);
  }

  if (dogsQuery.isLoading || plansQuery.isLoading || addonsQuery.isLoading) {
    return (
      <div aria-busy="true" className="mx-auto max-w-4xl">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-3 h-4 w-96" />
        <Skeleton className="mt-6 h-80 rounded-3xl" />
      </div>
    );
  }

  if (dogsQuery.isError || plansQuery.isError) {
    return (
      <ErrorState
        title="Checkout is unavailable"
        description="The catalogue did not load. Please try again."
        onRetry={() => {
          void dogsQuery.refetch();
          void plansQuery.refetch();
        }}
      />
    );
  }

  if (result) {
    return <CheckoutSuccess result={result} />;
  }

  return (
    <>
      <SEO title="Start a subscription" path="/app/subscribe" noIndex />
      <PortalHeader
        eyebrow="Checkout"
        title="Build your weekly box"
        description={`${deliverySchedule.summary} The first payment is recorded as pending and confirmed before delivery.`}
      />

      <ol className="mb-6 grid grid-cols-4 gap-2" aria-label="Checkout progress">
        {steps.map((label, index) => {
          const state = index === step ? 'current' : index < step ? 'done' : 'todo';
          return (
            <li key={label}>
              <span
                className={`block h-1.5 rounded-full ${
                  state === 'todo' ? 'bg-forest/10' : 'bg-forest'
                }`}
              />
              <span
                className={`mt-1.5 flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] ${
                  state === 'current' ? 'text-forest' : 'text-charcoal-400'
                }`}
              >
                {state === 'done' && <Check className="h-3 w-3" aria-hidden="true" />}
                {label}
                {state === 'current' && <span className="sr-only">(current step)</span>}
              </span>
            </li>
          );
        })}
      </ol>

      {dogs.length === 0 ? (
        <EmptyState
          icon={DogIcon}
          title="Add a dog first"
          description="We need a weight and activity level before we can price the box."
          action={
            <Button asChild>
              <Link to="/app/dogs/new">Add your dog</Link>
            </Button>
          }
          className="bg-white"
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {step === 0 && (
              <section aria-labelledby="choose-dog" className="card-surface p-5">
                <h2 id="choose-dog" className="font-display text-base font-bold text-forest">
                  Who is this box for?
                </h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {dogs.map((item) => {
                    const portion = dailyPortion(item);
                    const selected = item.id === dogId;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          setDogId(item.id);
                          setPlanId('');
                        }}
                        className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                          selected
                            ? 'border-forest bg-forest/[0.05]'
                            : 'border-forest/15 hover:border-forest/30'
                        }`}
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sage-100 text-forest">
                          <DogIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-display text-sm font-bold text-forest">
                            {item.name}
                          </span>
                          <span className="block text-xs text-charcoal-500">
                            {item.weightKg} kg · {portion.totalG} g/day
                          </span>
                        </span>
                        {selected && <Check className="h-4 w-4 shrink-0 text-forest" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
                <Link
                  to="/app/dogs/new"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-forest underline decoration-sage-400 underline-offset-4"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add another dog
                </Link>
              </section>
            )}

            {step === 1 && (
              <section aria-labelledby="choose-plan" className="card-surface p-5">
                <h2 id="choose-plan" className="font-display text-base font-bold text-forest">
                  Choose a plan
                </h2>
                {suggested && (
                  <p className="mt-1 text-sm text-charcoal-600">
                    Based on {dog?.name}&apos;s {dog?.weightKg} kg, we suggest the{' '}
                    <strong className="text-forest">{suggested.name}</strong>.
                  </p>
                )}
                <div className="mt-4 space-y-2">
                  {plans.map((item) => (
                    <PlanOption
                      key={item.id}
                      plan={item}
                      selected={item.id === planId}
                      recommended={item.id === suggested?.id}
                      onSelect={() => selectPlan(item.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {step === 2 && (
              <>
                <section aria-labelledby="choose-addons" className="card-surface p-5">
                  <h2 id="choose-addons" className="font-display text-base font-bold text-forest">
                    Extras (optional)
                  </h2>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {addons.map((addon) => {
                      const checked = addonIds.includes(addon.id);
                      return (
                        <label
                          key={addon.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-colors ${
                            checked ? 'border-forest bg-forest/[0.05]' : 'border-forest/15'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={checked}
                            onChange={() => toggleAddon(addon.id)}
                          />
                          <span className="min-w-0">
                            <span className="flex items-baseline justify-between gap-2">
                              <span className="font-display text-sm font-bold text-forest">
                                {addon.name}
                              </span>
                              <span className="text-sm font-medium text-forest">
                                {formatINR(addon.priceInr)}
                              </span>
                            </span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-charcoal-500">
                              {addon.description}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>

                <section aria-labelledby="choose-address" className="card-surface p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 id="choose-address" className="font-display text-base font-bold text-forest">
                      Delivery address
                    </h2>
                    <Button variant="outline" size="sm" onClick={() => setAddressDialogOpen(true)}>
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add
                    </Button>
                  </div>

                  {addresses.length === 0 ? (
                    <p className="mt-3 rounded-xl border border-dashed border-forest/20 px-4 py-6 text-center text-sm text-charcoal-500">
                      Add an address so we know where to deliver on Sunday.
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {addresses.map((item) => (
                        <li key={item.id}>
                          <label
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${
                              item.id === addressId
                                ? 'border-forest bg-forest/[0.04]'
                                : 'border-forest/15 hover:border-forest/30'
                            }`}
                          >
                            <input
                              type="radio"
                              name="checkout-address"
                              className="mt-1"
                              checked={item.id === addressId}
                              onChange={() => setAddressId(item.id)}
                            />
                            <span className="min-w-0">
                              <span className="flex items-center gap-2 font-medium text-forest">
                                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                                {item.label}
                                {item.isDefault && (
                                  <Badge variant="sage" className="normal-case tracking-normal">
                                    Default
                                  </Badge>
                                )}
                              </span>
                              <span className="mt-0.5 block text-xs leading-relaxed text-charcoal-500">
                                {[item.line1, item.line2, item.area, item.city, item.pincode]
                                  .filter(Boolean)
                                  .join(', ')}
                              </span>
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section aria-labelledby="coupon-notes" className="card-surface p-5">
                  <h2 id="coupon-notes" className="font-display text-base font-bold text-forest">
                    Coupon and notes
                  </h2>
                  <div className="mt-3 flex flex-wrap items-end gap-2">
                    <div className="min-w-40 flex-1">
                      <Label htmlFor="coupon-code">Coupon code</Label>
                      <Input
                        id="coupon-code"
                        className="mt-1.5 uppercase"
                        placeholder="FIRSTPAW"
                        value={couponInput}
                        onChange={(event) => {
                          setCouponInput(event.target.value);
                          setCouponError(null);
                        }}
                      />
                      <FieldError>{couponError ?? undefined}</FieldError>
                    </div>
                    <Button variant="soft" onClick={() => void applyCoupon()} disabled={validateCoupon.isPending}>
                      {validateCoupon.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Tag className="h-4 w-4" aria-hidden="true" />
                      )}
                      Apply
                    </Button>
                  </div>
                  {coupon?.valid && coupon.coupon && (
                    <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                      {coupon.coupon.code} applied — {formatINR(coupon.discountInr)} off.
                    </p>
                  )}
                  <FieldHint>
                    Try <code className="font-medium">FIRSTBOX</code> for your first box, or{' '}
                    <code className="font-medium">HYDERABAD150</code> on orders over ₹999.
                  </FieldHint>

                  <div className="mt-4">
                    <Label htmlFor="order-notes">Delivery notes (optional)</Label>
                    <Textarea
                      id="order-notes"
                      className="mt-1.5"
                      rows={2}
                      placeholder="Call on arrival, leave with security…"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                    />
                  </div>
                </section>
              </>
            )}

            {step === 3 && plan && address && (
              <section aria-labelledby="review-order" className="card-surface p-5">
                <h2 id="review-order" className="font-display text-base font-bold text-forest">
                  Review
                </h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-charcoal-500">Dog</dt>
                    <dd className="font-medium text-forest">{dog?.name}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-charcoal-500">Plan</dt>
                    <dd className="text-right font-medium text-forest">
                      {plan.name} · {plan.durationDays} days
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-charcoal-500">First delivery</dt>
                    <dd className="text-right font-medium text-forest">
                      {formatDate(deliveryDate, { weekday: 'long' })} · {deliverySchedule.deliveryWindow}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-charcoal-500">Address</dt>
                    <dd className="max-w-[60%] text-right font-medium text-forest">
                      {address.label} — {[address.line1, address.area, address.pincode].join(', ')}
                    </dd>
                  </div>
                  {selectedAddons.length > 0 && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-charcoal-500">Extras</dt>
                      <dd className="text-right font-medium text-forest">
                        {selectedAddons.map((item) => item.name).join(', ')}
                      </dd>
                    </div>
                  )}
                  {notes.trim() && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-charcoal-500">Notes</dt>
                      <dd className="max-w-[60%] text-right font-medium text-forest">{notes}</dd>
                    </div>
                  )}
                </dl>

                <p className="mt-4 flex items-start gap-2 rounded-xl bg-sage-50 px-4 py-3 text-xs leading-relaxed text-forest-700">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  Your first box is cooked fresh on Saturday and delivered Sunday morning. Skip or
                  pause any week before Thursday 11:59 PM.
                </p>

                <Button
                  variant="accent"
                  size="lg"
                  className="mt-5 w-full"
                  onClick={() => setCheckoutOpen(true)}
                >
                  Pay {formatINR(total)} — UPI / Card
                </Button>
              </section>
            )}

            <div className="flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={() => setStep((current) => Math.max(0, current - 1))}
                disabled={step === 0}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
              </Button>
              {step < 3 && (
                <Button onClick={() => setStep((current) => current + 1)} disabled={!canContinue()}>
                  Continue <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>

          <aside aria-label="Order summary" className="lg:sticky lg:top-6 lg:h-fit">
            <div className="card-surface p-5">
              <h2 className="font-display text-base font-bold text-forest">Order summary</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-charcoal-500">Plan</dt>
                  <dd className="font-medium text-forest">
                    {plan ? formatINR(plan.priceInr) : '—'}
                  </dd>
                </div>
                {selectedAddons.map((addon) => (
                  <div key={addon.id} className="flex justify-between gap-3">
                    <dt className="min-w-0 truncate text-charcoal-500">{addon.name}</dt>
                    <dd className="shrink-0 font-medium text-forest">{formatINR(addon.priceInr)}</dd>
                  </div>
                ))}
                {discount > 0 && (
                  <div className="flex justify-between gap-3 text-emerald-700">
                    <dt>Coupon {coupon?.coupon?.code}</dt>
                    <dd className="font-medium">−{formatINR(discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-3 border-t border-forest/10 pt-2">
                  <dt className="font-semibold text-forest">Total</dt>
                  <dd className="font-display text-lg font-extrabold text-forest">
                    {formatINR(total)}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 space-y-2 border-t border-forest/10 pt-3 text-xs text-charcoal-500">
                <p className="flex items-start gap-2">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {formatDate(deliveryDate, { weekday: 'long' })}, {deliverySchedule.deliveryWindow}
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  Skip, pause or cancel from the portal before the cut-off.
                </p>
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-charcoal-400">
              Simulated checkout. Guidance from our veterinary nutritionist is nutrition advice, not
              veterinary treatment.
            </p>
          </aside>
        </div>
      )}

      <AddressFormDialog
        open={addressDialogOpen}
        onOpenChange={setAddressDialogOpen}
        profileId={user?.id}
        onSaved={(saved: Address) => setAddressId(saved.id)}
      />

      <OnlineCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        amountInr={total}
        summary={[
          { label: plan?.name ?? 'Plan', value: plan ? formatINR(plan.priceInr) : '—' },
          ...(selectedAddons.length
            ? [{ label: `${selectedAddons.length} extras`, value: formatINR(selectedAddons.reduce((sum, item) => sum + item.priceInr, 0)) }]
            : []),
          ...(discount > 0 ? [{ label: 'Coupon', value: `−${formatINR(discount)}` }] : []),
        ]}
        onConfirm={pay}
      />
    </>
  );
}

function PlanOption({
  plan,
  selected,
  recommended,
  onSelect,
}: {
  plan: Plan;
  selected: boolean;
  recommended: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border p-3.5 text-left transition-colors ${
        selected ? 'border-forest bg-forest/[0.05]' : 'border-forest/15 hover:border-forest/30'
      }`}
    >
      <span className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-forest/40">
          {selected && <span className="h-2.5 w-2.5 rounded-full bg-forest" />}
        </span>
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-display text-sm font-bold text-forest">{plan.name}</span>
            {recommended && (
              <Badge variant="sage" className="normal-case tracking-normal">
                Recommended
              </Badge>
            )}
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-charcoal-500">
            {plan.description}
          </span>
          <span className="mt-1 block text-[11px] text-charcoal-400">
            {plan.durationDays} days · {plan.features.slice(0, 2).join(' · ')}
          </span>
        </span>
      </span>
      <span className="text-right">
        <span className="block font-display text-lg font-extrabold text-forest">
          {formatINR(plan.priceInr)}
        </span>
        {plan.perDayLabel && (
          <span className="block text-[11px] text-charcoal-400">{plan.perDayLabel}</span>
        )}
      </span>
    </button>
  );
}

function CheckoutSuccess({ result }: { result: CheckoutResult }) {
  const renewal = toIsoDate(addDays(new Date(`${result.order.deliveryDate}T00:00:00`), 7));
  return (
    <>
      <SEO title="Subscription confirmed" path="/app/subscribe" noIndex />
      <div className="mx-auto max-w-2xl">
        <div className="card-surface p-7 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-extrabold text-forest">
            You&apos;re booked in for Sunday
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-charcoal-600">
            {result.subscription.plan.name} for {result.subscription.dog.name}. Payment{' '}
            {formatINR(result.payment.amountInr)} recorded as{' '}
            <span className="font-medium text-forest">pending</span> — the payment will be
            confirmed before your first delivery.
          </p>

          <dl className="mt-6 grid gap-3 text-left text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-forest/[0.04] px-3 py-2.5">
              <dt className="text-xs text-charcoal-400">First delivery</dt>
              <dd className="font-medium text-forest">
                {formatDate(result.order.deliveryDate, { weekday: 'long' })}
              </dd>
            </div>
            <div className="rounded-xl bg-forest/[0.04] px-3 py-2.5">
              <dt className="text-xs text-charcoal-400">Next renewal</dt>
              <dd className="font-medium text-forest">{formatDate(renewal)}</dd>
            </div>
            <div className="rounded-xl bg-forest/[0.04] px-3 py-2.5">
              <dt className="text-xs text-charcoal-400">Order total</dt>
              <dd className="font-medium text-forest">{formatINR(result.order.totalInr)}</dd>
            </div>
            <div className="rounded-xl bg-forest/[0.04] px-3 py-2.5">
              <dt className="text-xs text-charcoal-400">Payment reference</dt>
              <dd className="font-medium text-forest">{result.payment.gatewayRef}</dd>
            </div>
          </dl>

          <p className="mt-4 rounded-xl bg-sage-50 px-4 py-3 text-xs leading-relaxed text-forest-700">
            {deliverySchedule.summary} You can skip or pause any week from the subscription page.
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button asChild className="flex-1">
              <Link to={`/app/orders/${result.order.id}`}>View order</Link>
            </Button>
            <Button asChild variant="soft" className="flex-1">
              <Link to={`/app/subscriptions/${result.subscription.id}`}>Manage subscription</Link>
            </Button>
            <Button asChild variant="ghost" className="flex-1">
              <Link to="/app">Back to dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
