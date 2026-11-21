import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Dog as DogIcon,
  LifeBuoy,
  PawPrint,
  Pause,
  Play,
  Truck,
} from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { EmptyState, ErrorState } from '@/components/shared/EmptyState';
import { PortalHeader, OrderStatusBadge, SubscriptionStatusBadge } from '@/components/app/StatusBadges';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  useDogs,
  useOrders,
  useResumeSubscription,
  usePauseSubscription,
  useSubscriptions,
  useTickets,
} from '@/hooks/usePortal';
import { deliverySchedule } from '@/config/pricing';
import { formatDate, formatINR } from '@/lib/format';
import { relativeDayLabel } from '@/lib/dates';
import { dailyPortion } from '@/lib/portal';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function OverviewPage() {
  const { user } = useAuth();
  const customerId = user?.id;

  const dogsQuery = useDogs(customerId);
  const subscriptionsQuery = useSubscriptions(customerId);
  const ordersQuery = useOrders(customerId);
  const ticketsQuery = useTickets(customerId);

  const pause = usePauseSubscription(customerId);
  const resume = useResumeSubscription(customerId);

  const loading =
    dogsQuery.isLoading || subscriptionsQuery.isLoading || ordersQuery.isLoading;
  const failed =
    dogsQuery.isError || subscriptionsQuery.isError || ordersQuery.isError;

  if (loading) {
    return (
      <div aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading your dashboard…</span>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-3 h-4 w-80" />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-52 rounded-3xl lg:col-span-2" />
          <Skeleton className="h-52 rounded-3xl" />
          <Skeleton className="h-44 rounded-3xl" />
          <Skeleton className="h-44 rounded-3xl" />
          <Skeleton className="h-44 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (failed) {
    return (
      <ErrorState
        title="We could not load your dashboard"
        description="The demo database did not respond. Try again — nothing has been lost."
        onRetry={() => {
          void dogsQuery.refetch();
          void subscriptionsQuery.refetch();
          void ordersQuery.refetch();
        }}
      />
    );
  }

  const dogs = dogsQuery.data ?? [];
  const subscriptions = subscriptionsQuery.data ?? [];
  const orders = ordersQuery.data ?? [];
  const tickets = ticketsQuery.data ?? [];

  const activeSubscription =
    subscriptions.find((subscription) => subscription.status === 'active') ??
    subscriptions.find((subscription) => subscription.status === 'paused') ??
    null;
  const nextOrder = orders
    .filter((order) => order.status !== 'delivered' && order.status !== 'cancelled')
    .sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate))[0];
  const openTickets = tickets.filter(
    (ticket) => ticket.status === 'open' || ticket.status === 'in_progress',
  );
  const firstName = user?.fullName.split(' ')[0] ?? 'there';

  return (
    <>
      <SEO title="Your dashboard" path="/app" noIndex />

      <PortalHeader
        eyebrow="Customer portal"
        title={`${greeting()}, ${firstName}.`}
        description="Your dogs, their portions and the next Sunday delivery — all in one place."
        actions={
          <Button asChild variant="accent">
            <Link to="/app/subscribe">
              Start a subscription <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <section
          aria-labelledby="next-delivery"
          className="relative overflow-hidden rounded-3xl bg-forest p-6 text-cream shadow-lift lg:col-span-2"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sage/20 blur-2xl"
          />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/70">
                <Truck className="h-3.5 w-3.5" aria-hidden="true" /> Next delivery
              </p>
              {nextOrder ? (
                <>
                  <p className="mt-2 font-display text-3xl font-extrabold leading-tight">
                    {formatDate(nextOrder.deliveryDate, { weekday: 'long' })}
                  </p>
                  <p className="mt-1 text-sm text-cream/80">
                    {relativeDayLabel(nextOrder.deliveryDate)} · {deliverySchedule.deliveryWindow}
                  </p>
                  <p className="mt-4 text-sm text-cream/90">
                    {nextOrder.items.find((item) => item.itemType === 'plan')?.nameSnapshot ??
                      'Fresh meals'}{' '}
                    for{' '}
                    {dogs.find((dog) => dog.id === nextOrder.dogId)?.name ?? 'your dog'}
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-2 font-display text-3xl font-extrabold leading-tight">
                    Nothing booked yet
                  </p>
                  <p className="mt-2 max-w-sm text-sm text-cream/80">
                    {deliverySchedule.summary}
                  </p>
                </>
              )}
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              {activeSubscription && <SubscriptionStatusBadge status={activeSubscription.status} />}
              {nextOrder && (
                <Button asChild variant="sage" size="sm">
                  <Link to={`/app/orders/${nextOrder.id}`}>View order</Link>
                </Button>
              )}
            </div>
          </div>

          <div className="relative mt-6 flex flex-wrap gap-2">
            {activeSubscription ? (
              <>
                <Button asChild size="sm" variant="outline" className="border-cream/30 text-cream hover:bg-cream/10">
                  <Link to={`/app/subscriptions/${activeSubscription.id}`}>
                    Manage subscription
                  </Link>
                </Button>
                {activeSubscription.status === 'active' ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-cream hover:bg-cream/10"
                    onClick={() =>
                      pause.mutate({
                        id: activeSubscription.id,
                        untilIso: formatIsoInDays(14),
                      })
                    }
                    disabled={pause.isPending}
                  >
                    <Pause className="h-4 w-4" aria-hidden="true" /> Pause two weeks
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-cream hover:bg-cream/10"
                    onClick={() => resume.mutate({ id: activeSubscription.id })}
                    disabled={resume.isPending}
                  >
                    <Play className="h-4 w-4" aria-hidden="true" /> Resume now
                  </Button>
                )}
              </>
            ) : (
              <Button asChild size="sm" variant="accent">
                <Link to="/app/subscribe">Choose a plan</Link>
              </Button>
            )}
          </div>
        </section>

        <section aria-labelledby="my-dogs" className="card-surface p-5">
          <div className="flex items-center justify-between">
            <h2 id="my-dogs" className="font-display text-base font-bold text-forest">
              My dogs
            </h2>
            <Link
              to="/app/dogs"
              className="text-xs font-semibold text-forest underline decoration-sage-400 underline-offset-4"
            >
              View all
            </Link>
          </div>

          {dogs.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={DogIcon}
                title="Add your first dog"
                description="We need their weight and activity level to work out the daily portion."
                action={
                  <Button asChild size="sm">
                    <Link to="/app/dogs/new">Add a dog</Link>
                  </Button>
                }
                className="border-none bg-transparent px-2 py-6"
              />
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {dogs.slice(0, 3).map((dog) => {
                const portion = dailyPortion(dog);
                return (
                  <li key={dog.id}>
                    <Link
                      to={`/app/dogs/${dog.id}`}
                      className="flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-forest/[0.04]"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sage-100 text-forest">
                        <PawPrint className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-sm font-bold text-forest">
                          {dog.name}
                        </span>
                        <span className="block truncate text-xs text-charcoal-500">
                          {dog.weightKg} kg · {portion.totalG} g/day
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-charcoal-400" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-labelledby="plan-summary" className="card-surface p-5">
          <h2 id="plan-summary" className="font-display text-base font-bold text-forest">
            Your plan
          </h2>
          {activeSubscription ? (
            <>
              <p className="mt-3 font-display text-xl font-extrabold text-forest">
                {activeSubscription.plan.name}
              </p>
              <p className="mt-1 text-sm text-charcoal-600">
                for {activeSubscription.dog.name} · renews every{' '}
                {activeSubscription.plan.durationDays} days
              </p>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-charcoal-500">Next box</dt>
                  <dd className="font-medium text-forest">
                    {formatDate(activeSubscription.nextDeliveryDate)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-charcoal-500">Add-ons</dt>
                  <dd className="font-medium text-forest">
                    {activeSubscription.addons.length || 'None'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-charcoal-500">Per box</dt>
                  <dd className="font-medium text-forest">
                    {formatINR(
                      activeSubscription.plan.priceInr +
                        activeSubscription.addons.reduce((sum, addon) => sum + addon.priceInr, 0),
                    )}
                  </dd>
                </div>
              </dl>
              <Button asChild variant="soft" size="sm" className="mt-4 w-full">
                <Link to={`/app/subscriptions/${activeSubscription.id}`}>Manage plan</Link>
              </Button>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm leading-relaxed text-charcoal-600">
                No active subscription. Pick a plan and we will cook for your dog every week.
              </p>
              <Button asChild size="sm" className="mt-4 w-full">
                <Link to="/app/subscribe">Start a subscription</Link>
              </Button>
            </>
          )}
        </section>

        <section aria-labelledby="recent-orders" className="card-surface p-5">
          <div className="flex items-center justify-between">
            <h2 id="recent-orders" className="font-display text-base font-bold text-forest">
              Recent orders
            </h2>
            <Link
              to="/app/orders"
              className="text-xs font-semibold text-forest underline decoration-sage-400 underline-offset-4"
            >
              All orders
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="mt-4 text-sm text-charcoal-600">
              No orders yet. Your first invoice will appear here after checkout.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-forest/10">
              {orders.slice(0, 3).map((order) => (
                <li key={order.id}>
                  <Link
                    to={`/app/orders/${order.id}`}
                    className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-forest"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-forest">
                        {formatDate(order.deliveryDate)}
                      </span>
                      <span className="block truncate text-xs text-charcoal-500">
                        {order.items.find((item) => item.itemType === 'plan')?.nameSnapshot ??
                          'Fresh meals'}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                      <span className="hidden text-sm font-medium text-forest sm:block">
                        {formatINR(order.totalInr)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="support-summary" className="card-surface flex flex-col p-5">
          <div className="flex items-center justify-between">
            <h2 id="support-summary" className="font-display text-base font-bold text-forest">
              Support
            </h2>
            <LifeBuoy className="h-4 w-4 text-charcoal-400" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-charcoal-600">
            {openTickets.length === 0
              ? 'No open conversations. Ask us anything about portions, delivery or your plan.'
              : `${openTickets.length} open ${
                  openTickets.length === 1 ? 'conversation' : 'conversations'
                } waiting for an update.`}
          </p>
          {openTickets[0] && (
            <Link
              to={`/app/support/${openTickets[0].id}`}
              className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-forest/[0.04] px-3 py-2 text-sm font-medium text-forest"
            >
              <span className="min-w-0 truncate">{openTickets[0].subject}</span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          )}
          <Button asChild variant="soft" size="sm" className="mt-auto w-full">
            <Link to="/app/support">
              <LifeBuoy className="h-4 w-4" aria-hidden="true" /> Get help
            </Link>
          </Button>
        </section>
      </div>
    </>
  );
}

function formatIsoInDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
