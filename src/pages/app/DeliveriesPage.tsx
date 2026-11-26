import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarCheck,
  ChefHat,
  CheckCircle2,
  Clock,
  PackageCheck,
  Truck,
} from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { EmptyState, ErrorState } from '@/components/shared/EmptyState';
import { OrderStatusBadge, PortalHeader } from '@/components/app/StatusBadges';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/AuthProvider';
import { useOrders, useSubscriptions } from '@/hooks/usePortal';
import { deliverySchedule } from '@/config/pricing';
import { formatDate } from '@/lib/format';
import { relativeDayLabel } from '@/lib/dates';
import { orderStep, orderTimeline } from '@/lib/portal';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/data/types';

const stepIcons = [CalendarCheck, ChefHat, Truck, PackageCheck];

const statusCopy: Record<OrderStatus, string> = {
  planned: 'Locked in for the Sunday route',
  in_kitchen: 'Being cooked and portioned',
  out_for_delivery: 'On the way to you',
  delivered: 'Delivered',
  failed: 'We could not complete this delivery',
  cancelled: 'Cancelled',
};

export default function DeliveriesPage() {
  const { user } = useAuth();
  const ordersQuery = useOrders(user?.id);
  const subscriptionsQuery = useSubscriptions(user?.id);

  const orders = ordersQuery.data ?? [];
  const subscriptions = subscriptionsQuery.data ?? [];
  const upcoming = orders
    .filter((order) => order.status === 'planned' || order.status === 'in_kitchen' || order.status === 'out_for_delivery')
    .sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate));
  const past = orders
    .filter((order) => order.status === 'delivered' || order.status === 'failed' || order.status === 'cancelled')
    .sort((a, b) => b.deliveryDate.localeCompare(a.deliveryDate));

  return (
    <>
      <SEO title="Deliveries" path="/app/deliveries" noIndex />
      <PortalHeader
        eyebrow="Deliveries"
        title="Sunday, sorted"
        description={`${deliverySchedule.summary} Live status for every box, from the kitchen to your door.`}
      />

      {ordersQuery.isLoading ? (
        <div className="space-y-3" aria-busy="true">
          <span className="sr-only">Loading deliveries…</span>
          <Skeleton className="h-44 rounded-3xl" />
          <Skeleton className="h-44 rounded-3xl" />
        </div>
      ) : ordersQuery.isError ? (
        <ErrorState
          title="Could not load deliveries"
          description="We could not load your deliveries. Please try again."
          onRetry={() => void ordersQuery.refetch()}
        />
      ) : (
        <div className="space-y-8">
          <section aria-labelledby="upcoming-deliveries">
            <h2 id="upcoming-deliveries" className="font-display text-lg font-bold text-forest">
              Upcoming
            </h2>
            {upcoming.length === 0 ? (
              <div className="mt-3">
                <EmptyState
                  icon={Truck}
                  title="Nothing on the van"
                  description="No deliveries are scheduled. Start a subscription or resume a paused one."
                  action={
                    <Button asChild size="sm">
                      <Link to="/app/subscribe">Book a box</Link>
                    </Button>
                  }
                  className="bg-white"
                />
              </div>
            ) : (
              <ul className="mt-3 space-y-3">
                {upcoming.map((order) => {
                  const subscription = subscriptions.find((item) => item.id === order.subscriptionId);
                  const step = orderStep(order.status);
                  return (
                    <li key={order.id} className="card-surface p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-terracotta-600">
                            {relativeDayLabel(order.deliveryDate)}
                          </p>
                          <p className="mt-1 font-display text-xl font-extrabold text-forest">
                            {formatDate(order.deliveryDate, { weekday: 'long' })}
                          </p>
                          <p className="text-sm text-charcoal-600">
                            {deliverySchedule.deliveryWindow} · {subscription?.dog.name ?? 'Your dog'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <OrderStatusBadge status={order.status} />
                          <Button asChild size="sm" variant="soft">
                            <Link to={`/app/orders/${order.id}`}>
                              Order <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </Link>
                          </Button>
                        </div>
                      </div>

                      <ol className="mt-4 grid grid-cols-4 gap-2" aria-label="Delivery progress">
                        {orderTimeline.map((status, index) => {
                          const Icon = stepIcons[index];
                          const done = index < step;
                          const current = index === step;
                          return (
                            <li
                              key={status}
                              className={cn(
                                'flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-center text-[10.5px] leading-tight',
                                done
                                  ? 'text-forest'
                                  : current
                                    ? 'bg-forest/[0.06] font-semibold text-forest'
                                    : 'text-charcoal-400',
                              )}
                            >
                              <Icon
                                className={cn('h-4 w-4', current && 'text-terracotta-600')}
                                aria-hidden="true"
                              />
                              {statusCopy[status]}
                            </li>
                          );
                        })}
                      </ol>

                      <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-sage-50 px-3 py-2 text-xs text-forest-700">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        {statusCopy[order.status]}
                        {order.notes ? ` · Notes: ${order.notes}` : ''}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section aria-labelledby="past-deliveries">
            <h2 id="past-deliveries" className="font-display text-lg font-bold text-forest">
              Past deliveries
            </h2>
            {past.length === 0 ? (
              <p className="mt-2 text-sm text-charcoal-600">
                Nothing delivered yet — your first box is on its way.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-forest/10 rounded-2xl border border-forest/10 bg-white px-4">
                {past.map((order) => (
                  <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                    <span className="flex items-center gap-2">
                      {order.status === 'delivered' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                      ) : (
                        <PackageCheck className="h-4 w-4 text-charcoal-400" aria-hidden="true" />
                      )}
                      <span className="text-forest">{formatDate(order.deliveryDate)}</span>
                      <span className="text-xs text-charcoal-500">
                        {subscriptions.find((item) => item.id === order.subscriptionId)?.dog.name ??
                          'Your dog'}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <OrderStatusBadge status={order.status} />
                      <Link
                        to={`/app/orders/${order.id}`}
                        className="text-xs font-semibold text-forest underline decoration-sage-400 underline-offset-4"
                      >
                        Invoice
                      </Link>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  );
}
