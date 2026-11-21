import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Receipt } from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { EmptyState, ErrorState } from '@/components/shared/EmptyState';
import { OrderStatusBadge, PortalHeader } from '@/components/app/StatusBadges';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/AuthProvider';
import { useOrders, useSubscriptions } from '@/hooks/usePortal';
import { formatDate, formatINR } from '@/lib/format';
import { invoiceNumber } from '@/lib/portal';
import { cn } from '@/lib/utils';

const filters = ['all', 'upcoming', 'delivered', 'cancelled'] as const;
type Filter = (typeof filters)[number];

export default function OrdersPage() {
  const { user } = useAuth();
  const ordersQuery = useOrders(user?.id);
  const subscriptionsQuery = useSubscriptions(user?.id);
  const [filter, setFilter] = useState<Filter>('all');

  const orders = ordersQuery.data ?? [];
  const subscriptions = subscriptionsQuery.data ?? [];
  const visible = orders.filter((order) => {
    if (filter === 'all') return true;
    if (filter === 'delivered') return order.status === 'delivered';
    if (filter === 'cancelled') return order.status === 'cancelled' || order.status === 'failed';
    return order.status === 'planned' || order.status === 'in_kitchen' || order.status === 'out_for_delivery';
  });

  return (
    <>
      <SEO title="Orders & invoices" path="/app/orders" noIndex />
      <PortalHeader
        eyebrow="Orders"
        title="Orders and invoices"
        description="Every box, with the invoice you can print or save as PDF."
      />

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter orders">
        {filters.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={filter === option}
            onClick={() => setFilter(option)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-[13px] font-medium capitalize transition-colors',
              filter === option
                ? 'border-forest bg-forest text-cream'
                : 'border-forest/20 text-charcoal-600 hover:border-forest/40',
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {ordersQuery.isLoading ? (
        <div className="space-y-3" aria-busy="true">
          <span className="sr-only">Loading orders…</span>
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : ordersQuery.isError ? (
        <ErrorState
          title="Could not load orders"
          description="The demo database did not respond."
          onRetry={() => void ordersQuery.refetch()}
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
          description={
            filter === 'all'
              ? 'Your first invoice appears here the moment checkout completes.'
              : 'Try a different filter to see the rest of your orders.'
          }
          action={
            filter === 'all' ? (
              <Button asChild>
                <Link to="/app/subscribe">Start a subscription</Link>
              </Button>
            ) : undefined
          }
          className="bg-white"
        />
      ) : (
        <ul className="space-y-2">
          {visible.map((order) => {
            const subscription = subscriptions.find((item) => item.id === order.subscriptionId);
            return (
              <li key={order.id}>
                <Link
                  to={`/app/orders/${order.id}`}
                  className="card-surface flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:border-forest/25"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sage-100 text-forest">
                      <Package className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-display text-sm font-bold text-forest">
                        {order.items.find((item) => item.itemType === 'plan')?.nameSnapshot ??
                          'Fresh meals'}
                      </span>
                      <span className="block truncate text-xs text-charcoal-500">
                        {formatDate(order.deliveryDate, { weekday: 'short' })} ·{' '}
                        {subscription?.dog.name ?? 'Your dog'} · {invoiceNumber(order)}
                      </span>
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                    <span className="font-display text-sm font-bold text-forest">
                      {formatINR(order.totalInr)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-charcoal-400" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
