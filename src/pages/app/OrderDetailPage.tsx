import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, MapPin, Printer } from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { ErrorState } from '@/components/shared/EmptyState';
import { OrderStatusBadge, PortalHeader } from '@/components/app/StatusBadges';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrder, useSubscription } from '@/hooks/usePortal';
import { brand } from '@/config/brand';
import { deliverySchedule } from '@/config/pricing';
import { formatDate, formatDateTime, formatINR } from '@/lib/format';
import { invoiceNumber, orderStep, orderTimeline } from '@/lib/portal';
import { cn } from '@/lib/utils';

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const orderQuery = useOrder(orderId);
  const subscriptionQuery = useSubscription(orderQuery.data?.subscriptionId ?? undefined);

  if (orderQuery.isLoading) {
    return (
      <div aria-busy="true" className="space-y-4">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-[420px] rounded-3xl" />
      </div>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <ErrorState
        title="Order not found"
        description="This invoice is not in the demo database."
        onRetry={() => void orderQuery.refetch()}
      />
    );
  }

  const order = orderQuery.data;
  const dogName = subscriptionQuery.data?.dog.name ?? 'your dog';
  const payment = order.payment;
  const step = orderStep(order.status);

  return (
    <>
      <SEO title={`Order ${invoiceNumber(order)}`} path={`/app/orders/${order.id}`} noIndex />

      <Link
        to="/app/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-charcoal-500 hover:text-forest print:hidden"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All orders
      </Link>

      <div className="print:hidden">
        <PortalHeader
          eyebrow={`Invoice ${invoiceNumber(order)}`}
          title={`Delivery ${formatDate(order.deliveryDate, { weekday: 'long' })}`}
          description={`${deliverySchedule.deliveryWindow} · ${dogName}`}
          actions={
            <>
              <OrderStatusBadge status={order.status} />
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="h-4 w-4" aria-hidden="true" /> Print / PDF
              </Button>
            </>
          }
        />
      </div>

      <article className="card-surface mx-auto max-w-3xl p-6 sm:p-8 print:border-0 print:shadow-none">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-forest/10 pb-5">
          <div>
            <p className="font-display text-xl font-extrabold text-forest">{brand.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-charcoal-500">
              Fresh-cooked dog meals · Hyderabad
              <br />
              hello@happypaw.in · happypaw.in
            </p>
          </div>
          <div className="text-right text-sm">
            <p className="font-display text-base font-bold text-forest">Invoice</p>
            <p className="text-charcoal-600">{invoiceNumber(order)}</p>
            <p className="text-charcoal-500">Raised {formatDate(order.createdAt)}</p>
            <Badge variant={payment?.status === 'simulated' ? 'warn' : 'soft'} className="mt-2">
              {payment?.status === 'simulated' ? 'Payment simulated' : 'Payment pending'}
            </Badge>
          </div>
        </header>

        <div className="grid gap-5 border-b border-forest/10 py-5 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-charcoal-400">
              Deliver to
            </p>
            <p className="mt-1.5 flex items-start gap-1.5 text-sm text-forest">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                {order.addressSnapshot.label}
                <br />
                {order.addressSnapshot.line1}
                {order.addressSnapshot.line2 ? (
                  <>
                    <br />
                    {order.addressSnapshot.line2}
                  </>
                ) : null}
                <br />
                {order.addressSnapshot.area}, {order.addressSnapshot.city} —{' '}
                {order.addressSnapshot.pincode}
              </span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-charcoal-400">
              Delivery
            </p>
            <p className="mt-1.5 text-sm text-forest">
              {formatDate(order.deliveryDate, { weekday: 'long' })}
              <br />
              {deliverySchedule.deliveryWindow}
              <br />
              For {dogName}
            </p>
          </div>
        </div>

        <table className="mt-5 w-full text-left text-sm">
          <caption className="sr-only">Items in this order</caption>
          <thead>
            <tr className="border-b border-forest/10 text-[10px] uppercase tracking-[0.14em] text-charcoal-400">
              <th scope="col" className="pb-2 font-semibold">
                Item
              </th>
              <th scope="col" className="pb-2 text-center font-semibold">
                Qty
              </th>
              <th scope="col" className="pb-2 text-right font-semibold">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest/[0.07]">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="py-2.5 text-forest">
                  {item.nameSnapshot}
                  <span className="ml-2 rounded-full bg-forest/[0.06] px-2 py-0.5 text-[10px] uppercase tracking-wide text-charcoal-500">
                    {item.itemType}
                  </span>
                </td>
                <td className="py-2.5 text-center text-charcoal-600">{item.qty}</td>
                <td className="py-2.5 text-right text-forest">
                  {formatINR(item.unitPriceInr * item.qty)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ml-auto mt-4 max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-charcoal-500">Subtotal</dt>
            <dd className="font-medium text-forest">{formatINR(order.subtotalInr)}</dd>
          </div>
          {order.discountInr > 0 && (
            <div className="flex justify-between gap-4 text-emerald-700">
              <dt>Coupon discount</dt>
              <dd className="font-medium">−{formatINR(order.discountInr)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4 border-t border-forest/10 pt-2">
            <dt className="font-semibold text-forest">Total paid</dt>
            <dd className="font-display text-lg font-extrabold text-forest">
              {formatINR(order.totalInr)}
            </dd>
          </div>
        </dl>

        {payment && (
          <div className="mt-5 rounded-xl bg-forest/[0.04] px-4 py-3 text-xs leading-relaxed text-charcoal-600">
            <p className="flex items-center gap-1.5 font-medium text-forest">
              <CreditCard className="h-3.5 w-3.5" aria-hidden="true" /> {payment.method} ·{' '}
              {formatDateTime(payment.createdAt)}
            </p>
            <p className="mt-1">
              Reference {payment.gatewayRef}. This demo records the payment as{' '}
              <strong>simulated</strong> — no Razorpay keys and no money moved.
            </p>
          </div>
        )}

        {order.notes && (
          <p className="mt-4 text-xs leading-relaxed text-charcoal-500">
            <span className="font-medium text-forest">Delivery notes:</span> {order.notes}
          </p>
        )}

        <p className="mt-6 border-t border-forest/10 pt-4 text-[11px] leading-relaxed text-charcoal-400">
          This is a demo invoice for a simulated order. Guidance from Happy Paw&apos;s
          veterinary-nutritionist is nutrition guidance, not veterinary treatment.
        </p>
      </article>

      {order.status !== 'cancelled' && order.status !== 'delivered' && (
        <section aria-labelledby="order-progress" className="mx-auto mt-4 max-w-3xl card-surface p-5 print:hidden">
          <h2 id="order-progress" className="font-display text-base font-bold text-forest">
            Delivery progress
          </h2>
          <ol className="mt-3 grid gap-2 sm:grid-cols-4">
            {orderTimeline.map((status, index) => (
              <li
                key={status}
                className={cn(
                  'rounded-xl border px-3 py-2 text-xs',
                  index <= step
                    ? 'border-forest/25 bg-forest/[0.05] text-forest'
                    : 'border-forest/10 text-charcoal-400',
                )}
              >
                <span className="font-semibold">
                  {status === 'in_kitchen'
                    ? 'In the kitchen'
                    : status === 'out_for_delivery'
                      ? 'Out for delivery'
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <span className="mt-0.5 block">
                  {index < step ? 'Done' : index === step ? 'In progress' : 'Pending'}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
