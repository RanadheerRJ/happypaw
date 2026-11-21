import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Pause, Play, Plus, Truck } from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { EmptyState, ErrorState } from '@/components/shared/EmptyState';
import { PortalHeader, SubscriptionStatusBadge } from '@/components/app/StatusBadges';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  usePauseSubscription,
  useResumeSubscription,
  useSubscriptions,
} from '@/hooks/usePortal';
import { deliverySchedule } from '@/config/pricing';
import { addDays, toIsoDate } from '@/lib/dates';
import { formatDate, formatINR } from '@/lib/format';

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const subscriptionsQuery = useSubscriptions(user?.id);
  const pause = usePauseSubscription(user?.id);
  const resume = useResumeSubscription(user?.id);

  const subscriptions = subscriptionsQuery.data ?? [];

  return (
    <>
      <SEO title="Subscriptions" path="/app/subscriptions" noIndex />
      <PortalHeader
        eyebrow="Subscription"
        title="Your weekly rhythm"
        description="Pause for a holiday, skip a Sunday or switch plans. Changes apply to the next box if you make them before Thursday 11:59 PM."
        actions={
          <Button asChild variant="accent">
            <Link to="/app/subscribe">
              <Plus className="h-4 w-4" aria-hidden="true" /> New subscription
            </Link>
          </Button>
        }
      />

      {subscriptionsQuery.isLoading ? (
        <div className="space-y-3" aria-busy="true">
          <span className="sr-only">Loading subscriptions…</span>
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
      ) : subscriptionsQuery.isError ? (
        <ErrorState
          title="Could not load subscriptions"
          description="The demo database did not respond."
          onRetry={() => void subscriptionsQuery.refetch()}
        />
      ) : subscriptions.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No subscription yet"
          description={`Start a weekly box and your first delivery lands on a Sunday, ${deliverySchedule.deliveryWindow}.`}
          action={
            <Button asChild>
              <Link to="/app/subscribe">Choose a plan</Link>
            </Button>
          }
          className="bg-white"
        />
      ) : (
        <ul className="space-y-3">
          {subscriptions.map((subscription) => {
            const total =
              subscription.plan.priceInr +
              subscription.addons.reduce((sum, addon) => sum + addon.priceInr, 0);
            return (
              <li key={subscription.id} className="card-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-lg font-bold text-forest">
                        {subscription.plan.name}
                      </h2>
                      <SubscriptionStatusBadge status={subscription.status} />
                    </div>
                    <p className="mt-1 text-sm text-charcoal-600">
                      for <span className="font-medium text-forest">{subscription.dog.name}</span> ·{' '}
                      {formatINR(total)} per box
                    </p>
                  </div>
                  <Button asChild variant="soft" size="sm">
                    <Link to={`/app/subscriptions/${subscription.id}`}>
                      Manage <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>

                <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                  <div className="rounded-xl bg-forest/[0.03] px-3 py-2">
                    <dt className="text-xs text-charcoal-400">
                      {subscription.status === 'cancelled' ? 'Ended' : 'Next delivery'}
                    </dt>
                    <dd className="font-medium text-forest">
                      {subscription.status === 'cancelled'
                        ? formatDate(subscription.nextDeliveryDate)
                        : `${formatDate(subscription.nextDeliveryDate, { weekday: 'long' })}`}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-forest/[0.03] px-3 py-2">
                    <dt className="text-xs text-charcoal-400">Delivery window</dt>
                    <dd className="font-medium text-forest">{deliverySchedule.deliveryWindow}</dd>
                  </div>
                  <div className="rounded-xl bg-forest/[0.03] px-3 py-2">
                    <dt className="text-xs text-charcoal-400">Add-ons</dt>
                    <dd className="flex flex-wrap items-center gap-1 font-medium text-forest">
                      {subscription.addons.length === 0 ? (
                        'None'
                      ) : (
                        subscription.addons.map((addon) => (
                          <Badge
                            key={addon.id}
                            variant="soft"
                            className="normal-case tracking-normal"
                          >
                            {addon.name}
                          </Badge>
                        ))
                      )}
                    </dd>
                  </div>
                </dl>

                {subscription.status === 'active' && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-forest/10 pt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        pause.mutate({
                          id: subscription.id,
                          untilIso: toIsoDate(addDays(new Date(), 14)),
                        })
                      }
                      disabled={pause.isPending}
                    >
                      <Pause className="h-4 w-4" aria-hidden="true" /> Pause 2 weeks
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                      <Link to={`/app/deliveries`}>
                        <Truck className="h-4 w-4" aria-hidden="true" /> Deliveries
                      </Link>
                    </Button>
                  </div>
                )}

                {subscription.status === 'paused' && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-forest/10 pt-3">
                    <span className="text-xs text-charcoal-500">
                      Paused until {subscription.pausedUntil ? formatDate(subscription.pausedUntil) : 'further notice'}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => resume.mutate({ id: subscription.id })}
                      disabled={resume.isPending}
                    >
                      <Play className="h-4 w-4" aria-hidden="true" /> Resume
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
