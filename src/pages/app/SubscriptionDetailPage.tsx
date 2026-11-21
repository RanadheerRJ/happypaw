import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Package,
  Pause,
  Play,
  SkipForward,
  Truck,
  XCircle,
} from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { EmptyState, ErrorState } from '@/components/shared/EmptyState';
import {
  OrderStatusBadge,
  PortalHeader,
  SubscriptionStatusBadge,
} from '@/components/app/StatusBadges';
import { ConfirmDialog } from '@/components/app/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/AuthProvider';
import { useAddons, usePlans } from '@/hooks/useCatalog';
import {
  useAddresses,
  useCancelSubscription,
  useChangePlan,
  useOrders,
  usePauseSubscription,
  useResumeSubscription,
  useSkipNextDelivery,
  useSubscription,
  useUpdateAddons,
  useUpdateSubscriptionAddress,
} from '@/hooks/usePortal';
import { deliverySchedule } from '@/config/pricing';
import { addDays, toIsoDate } from '@/lib/dates';
import { formatDate, formatINR } from '@/lib/format';
import { dailyPortion } from '@/lib/portal';
import { AddressFormDialog } from '@/components/app/AddressFormDialog';

const cancelReasons = [
  'My dog did not like the food',
  'Too expensive right now',
  'Delivery timing does not work',
  'Moving out of Hyderabad',
  'Switching to another brand',
  'Something else',
];

export default function SubscriptionDetailPage() {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();
  const { user } = useAuth();
  const subscriptionQuery = useSubscription(subscriptionId);
  const plansQuery = usePlans();
  const addonsQuery = useAddons();
  const addressesQuery = useAddresses(user?.id);
  const ordersQuery = useOrders(user?.id);

  const pause = usePauseSubscription(user?.id);
  const resume = useResumeSubscription(user?.id);
  const skip = useSkipNextDelivery(user?.id);
  const cancel = useCancelSubscription(user?.id);
  const changePlan = useChangePlan(user?.id);
  const updateAddons = useUpdateAddons(user?.id);
  const updateAddress = useUpdateSubscriptionAddress(user?.id);

  const [dialog, setDialog] = useState<
    'pause' | 'cancel' | 'plan' | 'addons' | 'address' | 'skip' | null
  >(null);
  const [pauseUntil, setPauseUntil] = useState(toIsoDate(addDays(new Date(), 14)));
  const [cancelReason, setCancelReason] = useState(cancelReasons[0]);
  const [cancelDetails, setCancelDetails] = useState('');
  const [pendingPlanId, setPendingPlanId] = useState('');
  const [pendingAddons, setPendingAddons] = useState<string[]>([]);
  const [pendingAddressId, setPendingAddressId] = useState('');
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);

  if (subscriptionQuery.isLoading) {
    return (
      <div aria-busy="true" className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-3xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (subscriptionQuery.isError || !subscriptionQuery.data) {
    return (
      <ErrorState
        title="Subscription not found"
        description="This subscription is not in the demo database."
        onRetry={() => void subscriptionQuery.refetch()}
      />
    );
  }

  const subscription = subscriptionQuery.data;
  const plans = (plansQuery.data ?? []).filter((plan) => plan.isActive);
  const addons = (addonsQuery.data ?? []).filter((addon) => addon.isActive);
  const addresses = addressesQuery.data ?? [];
  const orders = (ordersQuery.data ?? []).filter(
    (order) => order.subscriptionId === subscription.id,
  );
  const perBox =
    subscription.plan.priceInr + subscription.addons.reduce((sum, addon) => sum + addon.priceInr, 0);
  const portion = dailyPortion(subscription.dog);
  const isActive = subscription.status === 'active';
  const isPaused = subscription.status === 'paused';
  const isCancelled = subscription.status === 'cancelled';

  function openDialog(next: typeof dialog) {
    if (next === 'plan') setPendingPlanId(subscription.planId);
    if (next === 'addons') setPendingAddons(subscription.addonIds);
    if (next === 'address') setPendingAddressId(subscription.addressId);
    setDialog(next);
  }

  async function confirmPause() {
    await pause.mutateAsync({ id: subscription.id, untilIso: pauseUntil });
    setDialog(null);
  }

  async function confirmCancel() {
    const reason = cancelDetails.trim()
      ? `${cancelReason} — ${cancelDetails.trim()}`
      : cancelReason;
    await cancel.mutateAsync({ id: subscription.id, reason });
    setDialog(null);
  }

  async function confirmPlan() {
    await changePlan.mutateAsync({ id: subscription.id, planId: pendingPlanId });
    setDialog(null);
  }

  async function confirmAddons() {
    await updateAddons.mutateAsync({ id: subscription.id, addonIds: pendingAddons });
    setDialog(null);
  }

  async function confirmAddress() {
    if (!pendingAddressId) return;
    await updateAddress.mutateAsync({ id: subscription.id, addressId: pendingAddressId });
    setDialog(null);
  }

  return (
    <>
      <SEO title={subscription.plan.name} path={`/app/subscriptions/${subscription.id}`} noIndex />

      <Link
        to="/app/subscriptions"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-charcoal-500 hover:text-forest"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All subscriptions
      </Link>

      <PortalHeader
        eyebrow={`For ${subscription.dog.name}`}
        title={subscription.plan.name}
        description={`${formatINR(perBox)} per box · ${subscription.plan.durationDays} days · ${dailyPortion(subscription.dog).totalG} g/day for ${subscription.dog.name}.`}
        actions={<SubscriptionStatusBadge status={subscription.status} />}
      />

      {isPaused && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p>
            Paused{subscription.pausedUntil ? ` until ${formatDate(subscription.pausedUntil)}` : ''}.
            The next box is on hold.
          </p>
          <Button
            size="sm"
            onClick={() => resume.mutate({ id: subscription.id })}
            disabled={resume.isPending}
          >
            <Play className="h-4 w-4" aria-hidden="true" /> Resume now
          </Button>
        </div>
      )}

      {isCancelled && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-forest/15 bg-white px-4 py-3 text-sm text-charcoal-600">
          <p>This subscription is cancelled. Planned deliveries have been withdrawn.</p>
          <Button asChild size="sm" variant="accent">
            <Link to="/app/subscribe">Start a new one</Link>
          </Button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <section aria-labelledby="next-delivery" className="card-surface p-5 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 id="next-delivery" className="flex items-center gap-2 font-display text-base font-bold text-forest">
              <Truck className="h-4 w-4" aria-hidden="true" /> Next delivery
            </h2>
            {isActive && (
              <Badge variant="soft" className="normal-case tracking-normal">
                {deliverySchedule.cutoffSummary}
              </Badge>
            )}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-forest/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-charcoal-400">Arriving</p>
              <p className="mt-1 font-display text-xl font-extrabold text-forest">
                {isCancelled ? 'No delivery scheduled' : formatDate(subscription.nextDeliveryDate, { weekday: 'long' })}
              </p>
              {!isCancelled && (
                <p className="text-sm text-charcoal-600">{deliverySchedule.deliveryWindow}</p>
              )}
            </div>
            <div className="rounded-2xl bg-forest/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-charcoal-400">Address</p>
              {subscription.address ? (
                <p className="mt-1 text-sm leading-relaxed text-forest">
                  {subscription.address.label} —{' '}
                  {[
                    subscription.address.line1,
                    subscription.address.line2,
                    subscription.address.area,
                    subscription.address.pincode,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              ) : (
                <p className="mt-1 text-sm text-charcoal-500">No address on file</p>
              )}
              {!isCancelled && (
                <button
                  type="button"
                  className="mt-2 text-xs font-semibold text-forest underline decoration-sage-400 underline-offset-4"
                  onClick={() => openDialog('address')}
                >
                  Change address
                </button>
              )}
            </div>
          </div>

          {!isCancelled && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-forest/10 pt-3">
              {isActive && (
                <>
                  <Button size="sm" variant="outline" onClick={() => openDialog('skip')}>
                    <SkipForward className="h-4 w-4" aria-hidden="true" /> Skip next
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openDialog('pause')}>
                    <Pause className="h-4 w-4" aria-hidden="true" /> Pause
                  </Button>
                </>
              )}
              {isPaused && (
                <Button size="sm" onClick={() => resume.mutate({ id: subscription.id })}>
                  <Play className="h-4 w-4" aria-hidden="true" /> Resume
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => openDialog('plan')}>
                Change plan
              </Button>
              <Button size="sm" variant="ghost" onClick={() => openDialog('addons')}>
                Edit add-ons
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto text-red-700 hover:bg-red-50"
                onClick={() => openDialog('cancel')}
              >
                <XCircle className="h-4 w-4" aria-hidden="true" /> Cancel
              </Button>
            </div>
          )}
        </section>

        <section aria-labelledby="dog-card" className="card-surface p-5">
          <h2 id="dog-card" className="font-display text-base font-bold text-forest">
            {subscription.dog.name}
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-charcoal-500">Weight</dt>
              <dd className="font-medium text-forest">{subscription.dog.weightKg} kg</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-charcoal-500">Portion</dt>
              <dd className="font-medium text-forest">{portion.totalG} g/day</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-charcoal-500">Activity</dt>
              <dd className="font-medium capitalize text-forest">{subscription.dog.activityLevel}</dd>
            </div>
          </dl>
          <Button asChild variant="soft" size="sm" className="mt-4 w-full">
            <Link to={`/app/dogs/${subscription.dog.id}`}>Open dog profile</Link>
          </Button>
        </section>

        <section aria-labelledby="billing-history" className="card-surface p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 id="billing-history" className="flex items-center gap-2 font-display text-base font-bold text-forest">
              <Package className="h-4 w-4" aria-hidden="true" /> Billing history
            </h2>
            <Link
              to="/app/orders"
              className="text-xs font-semibold text-forest underline decoration-sage-400 underline-offset-4"
            >
              All orders
            </Link>
          </div>

          {orders.length === 0 ? (
            <p className="mt-3 text-sm text-charcoal-600">
              No orders on this subscription yet.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-forest/10">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link
                    to={`/app/orders/${order.id}`}
                    className="flex items-center justify-between gap-3 py-3 text-sm transition-colors hover:text-forest"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-forest">
                        {formatDate(order.deliveryDate)}
                      </span>
                      <span className="block text-xs text-charcoal-500">
                        {order.items.find((item) => item.itemType === 'plan')?.nameSnapshot}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                      <span className="font-medium text-forest">{formatINR(order.totalInr)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="plan-details" className="card-surface p-5">
          <h2 id="plan-details" className="font-display text-base font-bold text-forest">
            Plan & extras
          </h2>
          <p className="mt-2 text-sm text-charcoal-600">
            {subscription.plan.name} · {formatINR(subscription.plan.priceInr)}
          </p>
          <ul className="mt-3 space-y-1.5">
            {subscription.addons.length === 0 ? (
              <li className="text-sm text-charcoal-500">No add-ons selected.</li>
            ) : (
              subscription.addons.map((addon) => (
                <li key={addon.id} className="flex justify-between gap-3 text-sm">
                  <span className="text-charcoal-600">{addon.name}</span>
                  <span className="font-medium text-forest">{formatINR(addon.priceInr)}</span>
                </li>
              ))
            )}
          </ul>
          <div className="mt-3 flex justify-between gap-3 border-t border-forest/10 pt-2 text-sm">
            <span className="font-semibold text-forest">Per box</span>
            <span className="font-display text-base font-extrabold text-forest">
              {formatINR(perBox)}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full"
            onClick={() => openDialog('plan')}
            disabled={isCancelled}
          >
            Change plan
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full"
            onClick={() => openDialog('addons')}
            disabled={isCancelled}
          >
            Edit add-ons
          </Button>
        </section>
      </div>

      <ConfirmDialog
        open={dialog === 'skip'}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Skip the next delivery?"
        description={`We will move this box to ${formatDate(
          toIsoDate(addDays(new Date(`${subscription.nextDeliveryDate}T00:00:00`), 7)),
        )}. The plan stays active.`}
        confirmLabel="Skip this Sunday"
        pending={skip.isPending}
        onConfirm={() => {
          skip.mutate(
            { id: subscription.id, nextDeliveryDate: subscription.nextDeliveryDate },
            { onSuccess: () => setDialog(null) },
          );
        }}
      />

      <Dialog open={dialog === 'pause'} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pause this subscription</DialogTitle>
            <DialogDescription>
              We hold every delivery until the resume date. Planned boxes are withdrawn from the
              kitchen list.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="pause-until">Resume on</Label>
              <Input
                id="pause-until"
                type="date"
                className="mt-1.5"
                min={toIsoDate(addDays(new Date(), 1))}
                value={pauseUntil}
                onChange={(event) => setPauseUntil(event.target.value)}
              />
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setDialog(null)}>
                Keep going
              </Button>
              <Button onClick={() => void confirmPause()} disabled={pause.isPending}>
                {pause.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Pause subscription
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'cancel'} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this subscription</DialogTitle>
            <DialogDescription>
              Planned deliveries are cancelled immediately. You can start again any time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="cancel-reason">Why are you leaving?</Label>
              <select
                id="cancel-reason"
                className="mt-1.5 h-11 w-full rounded-xl border border-forest/15 bg-white px-3 text-sm"
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
              >
                {cancelReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="cancel-details">Anything else? (optional)</Label>
              <Textarea
                id="cancel-details"
                className="mt-1.5"
                rows={2}
                value={cancelDetails}
                onChange={(event) => setCancelDetails(event.target.value)}
                placeholder="Portion size, packaging, taste…"
              />
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setDialog(null)}>
                Keep subscription
              </Button>
              <Button
                variant="destructive"
                onClick={() => void confirmCancel()}
                disabled={cancel.isPending}
              >
                {cancel.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Cancel subscription
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'plan'} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change your plan</DialogTitle>
            <DialogDescription>
              The next planned box is re-priced as soon as you save.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {plans.map((plan) => (
              <label
                key={plan.id}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 text-sm ${
                  pendingPlanId === plan.id
                    ? 'border-forest bg-forest/[0.05]'
                    : 'border-forest/15'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="change-plan"
                    checked={pendingPlanId === plan.id}
                    onChange={() => setPendingPlanId(plan.id)}
                  />
                  <span>
                    <span className="block font-medium text-forest">{plan.name}</span>
                    <span className="block text-xs text-charcoal-500">
                      {plan.durationDays} days · {plan.perDayLabel ?? ''}
                    </span>
                  </span>
                </span>
                <span className="font-medium text-forest">{formatINR(plan.priceInr)}</span>
              </label>
            ))}
          </div>
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => void confirmPlan()}
              disabled={changePlan.isPending || pendingPlanId === subscription.planId}
            >
              {changePlan.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Save plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'addons'} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit add-ons</DialogTitle>
            <DialogDescription>
              Add-ons ride along with the same Sunday delivery.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {addons.map((addon) => {
              const checked = pendingAddons.includes(addon.id);
              return (
                <label
                  key={addon.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm ${
                    checked ? 'border-forest bg-forest/[0.05]' : 'border-forest/15'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={checked}
                    onChange={() =>
                      setPendingAddons((current) =>
                        current.includes(addon.id)
                          ? current.filter((id) => id !== addon.id)
                          : [...current, addon.id],
                      )
                    }
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-medium text-forest">{addon.name}</span>
                      <span className="text-charcoal-600">{formatINR(addon.priceInr)}</span>
                    </span>
                    <span className="mt-0.5 block text-xs text-charcoal-500">
                      {addon.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button onClick={() => void confirmAddons()} disabled={updateAddons.isPending}>
              {updateAddons.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Save add-ons
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === 'address'} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delivery address</DialogTitle>
            <DialogDescription>Pick the address for the next box.</DialogDescription>
          </DialogHeader>
          {addresses.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="No addresses saved"
              description="Add one to receive deliveries."
              action={
                <Button size="sm" onClick={() => setAddressDialogOpen(true)}>
                  Add address
                </Button>
              }
              className="border-none bg-transparent px-2 py-6"
            />
          ) : (
            <ul className="space-y-2">
              {addresses.map((item) => (
                <li key={item.id}>
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm ${
                      pendingAddressId === item.id
                        ? 'border-forest bg-forest/[0.05]'
                        : 'border-forest/15'
                    }`}
                  >
                    <input
                      type="radio"
                      name="subscription-address"
                      className="mt-1"
                      checked={pendingAddressId === item.id}
                      onChange={() => setPendingAddressId(item.id)}
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 font-medium text-forest">
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
          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setAddressDialogOpen(true)}
              className="text-xs font-semibold text-forest underline decoration-sage-400 underline-offset-4"
            >
              Add a new address
            </button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setDialog(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => void confirmAddress()}
                disabled={
                  updateAddress.isPending || !pendingAddressId || pendingAddressId === subscription.addressId
                }
              >
                {updateAddress.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                Save address
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddressFormDialog
        open={addressDialogOpen}
        onOpenChange={setAddressDialogOpen}
        profileId={user?.id}
        onSaved={(saved) => {
          setPendingAddressId(saved.id);
          setDialog('address');
        }}
      />
    </>
  );
}
